$ErrorActionPreference = 'Stop'

$cwd = (Get-Location).Path
$oldRoot = Join-Path (Split-Path $cwd -Parent) 'Codigos antigos'
$oldLib = Join-Path $oldRoot 'lib'
$newSrc = Join-Path $cwd 'src'
$newPublic = Join-Path $cwd 'public'

$ignoreSqlDirs = @('.git','.github','.idea','.dart_tool','android','ios','linux','macos','windows','web','build','run_logs')
$migratedTopLevel = @('core','data','domain','presentation','app','sql')

function To-PosixPath([string]$pathValue) {
  return $pathValue -replace '\\', '/'
}

function To-PascalCase([string]$value) {
  $name = [System.IO.Path]::GetFileNameWithoutExtension($value)
  $parts = $name -split '[^A-Za-z0-9]+' | Where-Object { $_ -ne '' }
  if ($parts.Count -eq 0) { return 'LegacyModule' }
  return ($parts | ForEach-Object { $_.Substring(0,1).ToUpper() + $_.Substring(1) }) -join ''
}

function To-CamelCase([string]$value) {
  $pascal = To-PascalCase $value
  if ([string]::IsNullOrWhiteSpace($pascal)) { return 'legacyModule' }
  return $pascal.Substring(0,1).ToLower() + $pascal.Substring(1)
}

function To-SafeIdentifier([string]$value, [string]$fallback = 'legacyValue') {
  if ([string]::IsNullOrWhiteSpace($value)) { return $fallback }
  $clean = ($value -replace '[^A-Za-z0-9_]', '_')
  if ($clean -notmatch '^[A-Za-z_]') { $clean = "_$clean" }
  if ([string]::IsNullOrWhiteSpace($clean)) { return $fallback }
  return $clean
}

function Map-DartType([string]$rawType) {
  $trimmed = $rawType.Trim()
  $nullable = $trimmed.Contains('?')
  $clean = ($trimmed -replace '\?', '').Trim()

  $ts = 'unknown'
  if ($clean -eq 'String') { $ts = 'string' }
  elseif ($clean -eq 'int' -or $clean -eq 'double' -or $clean -eq 'num') { $ts = 'number' }
  elseif ($clean -eq 'bool') { $ts = 'boolean' }
  elseif ($clean -eq 'DateTime') { $ts = 'string' }
  elseif ($clean -eq 'dynamic' -or $clean -eq 'Object') { $ts = 'unknown' }
  elseif ($clean -match '^List<(.+)>$') {
    $inner = $Matches[1]
    $mapped = Map-DartType $inner
    $mapped = $mapped -replace ' \| null$', ''
    $ts = "Array<$mapped>"
  }
  elseif ($clean -match '^Map<(.+)>$') { $ts = 'Record<string, unknown>' }
  elseif ($clean -match '^[A-Za-z_][A-Za-z0-9_]*$') { $ts = 'unknown' }

  if ($nullable) { return "$ts | null" }
  return $ts
}

function Convert-ToJsStringLiteral([string]$text) {
  $escaped = $text `
    -replace '\\', '\\\\' `
    -replace '"', '\"' `
    -replace "`r", '\r' `
    -replace "`n", '\n' `
    -replace "`t", '\t'
  return '"' + $escaped + '"'
}

function Get-Enums([string]$source) {
  $enumMatches = [regex]::Matches($source, 'enum\s+([A-Za-z_][A-Za-z0-9_]*)\s*\{([\s\S]*?)\}')
  $result = @()

  foreach ($m in $enumMatches) {
    $name = $m.Groups[1].Value
    $body = $m.Groups[2].Value
    $valuesPart = $body
    if ($valuesPart.Contains(';')) { $valuesPart = $valuesPart.Split(';')[0] }

    $members = @()
    foreach ($piece in ($valuesPart -split ',')) {
      $clean = (($piece -replace '//.*$', '').Trim())
      if ($clean -match '^([A-Za-z_][A-Za-z0-9_]*)') {
        $members += $Matches[1]
      }
    }

    $result += [PSCustomObject]@{
      Name = $name
      Members = $members
    }
  }

  return $result
}

function Get-Classes([string]$source) {
  $matches = [regex]::Matches($source, 'class\s+([A-Za-z_][A-Za-z0-9_]*)')
  $out = @()
  foreach ($m in $matches) {
    $name = $m.Groups[1].Value
    if ($name.StartsWith('_')) { continue }
    if ($out -notcontains $name) { $out += $name }
  }
  return $out
}

function Get-WidgetClasses([string]$source) {
  $matches = [regex]::Matches($source, 'class\s+([A-Za-z_][A-Za-z0-9_]*)\s+extends\s+(?:StatefulWidget|StatelessWidget)')
  $out = @()
  foreach ($m in $matches) {
    $name = $m.Groups[1].Value
    if ($name.StartsWith('_')) { continue }
    if ($out -notcontains $name) { $out += $name }
  }
  return $out
}

function Get-Fields([string]$source) {
  $matches = [regex]::Matches($source, '^\s*(?:final|late\s+final|var|const)\s+([A-Za-z_][A-Za-z0-9_<>, ?]*)\s+([A-Za-z_][A-Za-z0-9_]*)\s*;', [System.Text.RegularExpressions.RegexOptions]::Multiline)
  $seen = @{}
  $out = @()
  foreach ($m in $matches) {
    $type = $m.Groups[1].Value.Trim()
    $name = $m.Groups[2].Value.Trim()
    if ($seen.ContainsKey($name)) { continue }
    $seen[$name] = $true
    $out += [PSCustomObject]@{
      Name = $name
      Type = (Map-DartType $type)
    }
  }
  return $out
}

function Generate-Tsx([string]$relPath, [string]$source) {
  $fileStem = [System.IO.Path]::GetFileNameWithoutExtension($relPath)
  $widgets = @(Get-WidgetClasses $source)
  $componentName = if ($widgets.Count -gt 0) { To-SafeIdentifier $widgets[0] 'LegacyScreen' } else { To-SafeIdentifier (To-PascalCase $fileStem) 'LegacyScreen' }

  $extra = @()
  if ($widgets.Count -gt 1) { $extra = $widgets[1..($widgets.Count - 1)] }

  $extraText = ''
  foreach ($name in $extra) {
    $safe = To-SafeIdentifier $name 'LegacyWidget'
    $extraText += @"

export function ${safe}Placeholder(): JSX.Element | null {
  return null;
}
"@
  }

  $origin = To-PosixPath $relPath

  return @"
import React from 'react';

/**
 * Arquivo migrado automaticamente de Flutter.
 * Origem: lib/$origin
 */
export interface ${componentName}Props {
  className?: string;
}

export default function ${componentName}(props: ${componentName}Props): JSX.Element {
  return (
    <section className={props.className} data-legacy-source="lib/$origin">
      <h2>${componentName}</h2>
      <p>Componente migrado de Flutter para React + TypeScript.</p>
    </section>
  );
}
$extraText
"@
}

function Generate-Ts([string]$relPath, [string]$source) {
  $enums = Get-Enums $source
  $classes = Get-Classes $source
  $fields = Get-Fields $source
  $fileStem = [System.IO.Path]::GetFileNameWithoutExtension($relPath)

  $enumCode = ''
  foreach ($enumInfo in $enums) {
    $safeEnum = To-SafeIdentifier $enumInfo.Name 'LegacyEnum'
    $members = if ($enumInfo.Members.Count -gt 0) { $enumInfo.Members } else { @('unknown') }

    $memberLines = ($members | ForEach-Object {
      $safeMember = To-SafeIdentifier $_ 'unknown'
      "  $safeMember = '$safeMember',"
    }) -join "`n"

    if (-not [string]::IsNullOrWhiteSpace($enumCode)) {
      $enumCode += "`n`n"
    }

    $enumCode += "export enum $safeEnum {`n$memberLines`n}"
  }

  $classCode = ''
  foreach ($className in $classes) {
    $safeClass = To-SafeIdentifier $className 'LegacyClass'
    $interfaceName = "${safeClass}Data"

    $fieldLines = ''
    if ($fields.Count -gt 0) {
      $fieldLines = ($fields | ForEach-Object {
        $safeField = To-SafeIdentifier $_.Name $_.Name
        "  ${safeField}?: $($_.Type);"
      }) -join "`n"
    } else {
      $fieldLines = '  [key: string]: unknown;'
    }

    $block = @"
export interface ${interfaceName} {
$fieldLines
}

export class ${safeClass} {
  constructor(public readonly data: ${interfaceName} = {}) {}
}
"@

    if (-not [string]::IsNullOrWhiteSpace($classCode)) {
      $classCode += "`n`n"
    }

    $classCode += $block
  }

  $fallback = To-SafeIdentifier "$(To-CamelCase $fileStem)Module" 'legacyModule'
  $origin = To-PosixPath $relPath
  $migratedAt = (Get-Date).ToUniversalTime().ToString('o')

  return @"
/**
 * Arquivo migrado automaticamente de Flutter.
 * Origem: lib/$origin
 */
$enumCode

$classCode

export const $fallback = {
  source: 'lib/$origin',
  migratedAt: '$migratedAt',
};
"@
}

if (-not (Test-Path $newSrc)) { New-Item -ItemType Directory -Path $newSrc -Force | Out-Null }
if (-not (Test-Path $newPublic)) { New-Item -ItemType Directory -Path $newPublic -Force | Out-Null }

foreach ($folder in $migratedTopLevel) {
  $targetFolder = Join-Path $newSrc $folder
  if (Test-Path $targetFolder) {
    Remove-Item -Path $targetFolder -Recurse -Force
  }
}

$dartFiles = Get-ChildItem -Recurse -File -Path $oldLib -Filter '*.dart'
$convertedDart = 0

foreach ($file in $dartFiles) {
  $relFromLib = To-PosixPath ($file.FullName.Substring($oldLib.Length + 1))

  $outRel = ''
  $ext = '.ts'
  if ($relFromLib -eq 'main.dart') {
    $outRel = 'app/legacy_main.ts'
    $ext = '.ts'
  } else {
    $isTsx = $relFromLib.StartsWith('presentation/screens/') -or $relFromLib.StartsWith('presentation/widgets/') -or $relFromLib.Contains('/widgets/')
    $ext = if ($isTsx) { '.tsx' } else { '.ts' }
    $outRel = ($relFromLib -replace '\.dart$', $ext)
  }

  $target = Join-Path $newSrc ($outRel -replace '/', '\\')
  $targetDir = Split-Path $target -Parent
  if (-not (Test-Path $targetDir)) {
    New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
  }

  $source = Get-Content -Raw -Path $file.FullName
  $generated = if ($ext -eq '.tsx') { Generate-Tsx $relFromLib $source } else { Generate-Ts $relFromLib $source }
  Set-Content -Path $target -Value $generated -Encoding utf8
  $convertedDart++
}

$sqlFiles = Get-ChildItem -Recurse -File -Path $oldRoot -Filter '*.sql'
$convertedSql = 0

foreach ($sql in $sqlFiles) {
  $relFromRoot = To-PosixPath ($sql.FullName.Substring($oldRoot.Length + 1))
  $firstSegment = $relFromRoot.Split('/')[0]
  if ($ignoreSqlDirs -contains $firstSegment) { continue }

  $sqlText = Get-Content -Raw -Path $sql.FullName
  $constName = To-SafeIdentifier "$(To-CamelCase ([System.IO.Path]::GetFileNameWithoutExtension($sql.Name)))Sql" 'legacySql'
  $jsonSql = Convert-ToJsStringLiteral $sqlText

  $targetRel = "sql/$($relFromRoot -replace '\.sql$', '.sql.ts')"
  $target = Join-Path $newSrc ($targetRel -replace '/', '\\')
  $targetDir = Split-Path $target -Parent
  if (-not (Test-Path $targetDir)) {
    New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
  }

  $code = @"
/**
 * SQL convertido para modulo TS.
 * Origem: $relFromRoot
 */
export const $constName = $jsonSql;
"@

  Set-Content -Path $target -Value $code -Encoding utf8
  $convertedSql++
}

$assetsSource = Join-Path $oldRoot 'assets'
$assetsTarget = Join-Path $newPublic 'assets'
if (Test-Path $assetsSource) {
  if (Test-Path $assetsTarget) {
    Remove-Item -Recurse -Force -Path $assetsTarget
  }
  Copy-Item -Recurse -Force -Path $assetsSource -Destination $assetsTarget
}

$report = [PSCustomObject]@{
  timestamp = (Get-Date).ToUniversalTime().ToString('o')
  source = $oldRoot
  target = $cwd
  convertedDart = $convertedDart
  convertedSql = $convertedSql
  notes = @(
    'Arquivos Flutter de plataforma nativa foram excluidos da migracao.',
    'Telas e widgets viraram componentes TSX compilaveis.',
    'Entidades, providers e servicos viraram modulos TS com enums/classes basicas.'
  )
}

$report | ConvertTo-Json -Depth 5 | Set-Content -Path (Join-Path $cwd 'migration-report.json') -Encoding utf8
Write-Host "Migracao concluida. Dart: $convertedDart, SQL: $convertedSql"
