# Documentacao Completa de Telas e Funcoes do App

Atualizado em: 2026-04-04 13:25:59
Base: codigo fonte atual da pasta `lib/` (analise estatica dos arquivos Dart).

## 1) Arquitetura e Ciclo de Inicializacao
- `main.dart` prepara ambiente (`dotenv`, formatacao PT-BR, Supabase e notificacoes locais).
- A injecao de dependencias acontece em `MultiProvider`, com providers de dominio e operacao diaria.
- O `AuthProvider` controla o gate inicial: `SplashScreen` (estado inicial), `LoginScreen` (nao autenticado) ou `DashboardScreen` (autenticado).
- A classe `_AppHome` executa preload paralelo dos modulos persistidos (entregas, notas, formularios, procedimentos, cafe, escala, ocorrencias, checklist, passagem de turno e guia rapido).
- O tema global usa Material 3 e centraliza tokens visuais em `core/constants`.

## 2) Mapa de Estado (Providers Ativos)
- `alocacao_provider`
- `auth_provider`
- `cafe_provider`
- `caixa_provider`
- `checklist_provider`
- `colaborador_provider`
- `entrega_provider`
- `escala_provider`
- `evento_turno_provider`
- `fiscal_provider`
- `formulario_provider`
- `guia_rapido_provider`
- `nota_provider`
- `notificacao_provider`
- `ocorrencia_provider`
- `outro_setor_provider`
- `pacote_plantao_provider`
- `passagem_turno_provider`
- `procedimento_provider`
- `registro_ponto_provider`

## 3) Leitura Funcional Aprofundada por Modulo

### Autenticacao e Sessao
- Fluxo de entrada e criacao de conta com Supabase Auth.
- Controle de erro de credencial, reset de senha e persistencia de sessao.

### Dashboard Operacional
- Consolida status de colaboradores, caixas, pausas, entregas e pendencias do turno.
- Serve como hub de navegacao para todos os modulos operacionais e de registro.
- Dispara briefing/inicio de turno e acompanha indicadores em tempo real.

### Operacao de Frente de Caixa (Mapa, Caixas, Alocacao, Cafe)
- `Mapa de Caixas` mostra ocupacao por status/tipo e abre acoes taticas por colaborador.
- `Caixas` permite CRUD e manutencao de estrutura fisica/logica de postos.
- `Alocacao` executa distribuicao de pessoas em caixas, liberacao e excecoes operacionais.
- `Cafe/Intervalos` controla pausas, evita duplicidade e registra eventos de turno.

### Equipe e Jornada (Colaboradores, Registro de Ponto, Escala, Folga)
- Cadastro completo de colaborador, historico de ponto e visao de status atual.
- Escala semanal com detalhamento por dia/turno e importacao de registros.
- Tela de folga funciona como apoio para planejamento e consulta rapida de cobertura.

### Registro Operacional (Ocorrencias, Entregas, Checklist, Passagem de Turno, Timeline, Relatorios)
- Modulos focados em memoria operacional do turno e rastreabilidade.
- Cada evento relevante pode alimentar historico, comunicacao e auditoria interna.
- `Timeline` e `Relatorios` consolidam visao executiva e historica do dia.

### Conhecimento e Produtividade (Procedimentos, Formularios, Notas, Guia Rapido)
- `Procedimentos` e `Guia Rapido` preservam conhecimento operacional padronizado.
- `Formularios` estruturam coleta de dados (templates, respostas e analise).
- `Notas` cobre tarefas, lembretes e anexos com notificacao local.

### Modulo Pizzaria
- Dominio separado com cadastro de pizzas, gestao de pedidos, cupom e impressao web.
- Fluxo de pedido inclui selecao de itens, meio-a-meio, quantidade, status e emissao de cupom.

## 4) Inventario Completo de Telas e Funcoes (Tela por Tela)

### Modulo: `alocacao`

#### `lib/presentation/screens/alocacao/alocacao_screen.dart`
- Classes: AlocacaoScreen (StatefulWidget), _AlocacaoScreenState (State<AlocacaoScreen>), _TempoAlocadoBadge (StatefulWidget), _TempoAlocadoBadgeState (State<_TempoAlocadoBadge>), _IntervaloBanner (StatelessWidget), _Header (StatelessWidget), _HeaderToggle (StatelessWidget), _CardDisponivel (StatelessWidget), _CardAlocado (StatefulWidget), _CardAlocadoState (State<_CardAlocado>), _CardAChegar (StatelessWidget), _CardFolga (StatelessWidget), _CardOutroSetor (StatelessWidget), _Empty (StatelessWidget)
- Titulos de AppBar: Alocar Colaborador
- Providers usados na tela: AuthProvider, AlocacaoProvider, EscalaProvider, CaixaProvider, PacotePlantaoProvider, OutroSetorProvider, ColaboradorProvider, EventoTurnoProvider, CafeProvider
- Servicos usados diretamente: N/A
- Metodos/funcoes locais: initState, dispose, _reload, _minutos, _estaDisponivel, _abrirSeletorCaixa, _alocarComoEmpacotador, _confirmarAlocacao, _alocarComExcecao, _confirmarTroca, _abrirOpcoesAlocado, _confirmarLiberacao, _abrirOutroSetor, _registrarOutroSetor, build, matchSearch, _cap, _tempo, _chegaEm, acoes, _buildAcoes, _buildIntervaloBar, _buildChip, _buildBotao
- Leitura tecnica do fluxo:
  - Inicializa estado local e dispara carregamento inicial quando necessario.
  - Inclui rotinas de leitura/sincronizacao de dados para montar a tela.
  - Executa mutacoes de dados com validacao e feedback ao usuario.
  - Possui mecanismos de filtro/busca para acelerar operacao no turno.
  - Renderiza UI reativa orientada pelo estado atual dos providers/controladores.

### Modulo: `auth`

#### `lib/presentation/screens/auth/login_screen.dart`
- Classes: LoginScreen (StatefulWidget), _LoginScreenState (State<LoginScreen>)
- Titulos de AppBar: N/A
- Providers usados na tela: AuthProvider
- Servicos usados diretamente: N/A
- Metodos/funcoes locais: dispose, _handleLogin, _navigateToRegister, build
- Leitura tecnica do fluxo:
  - Renderiza UI reativa orientada pelo estado atual dos providers/controladores.

#### `lib/presentation/screens/auth/register_screen.dart`
- Classes: RegisterScreen (StatefulWidget), _RegisterScreenState (State<RegisterScreen>)
- Titulos de AppBar: Criar conta
- Providers usados na tela: AuthProvider
- Servicos usados diretamente: N/A
- Metodos/funcoes locais: dispose, _handleRegister, build
- Leitura tecnica do fluxo:
  - Renderiza UI reativa orientada pelo estado atual dos providers/controladores.

### Modulo: `cafe`

#### `lib/presentation/screens/cafe/cafe_screen.dart`
- Classes: CafeScreen (StatefulWidget), _CafeScreenState (State<CafeScreen>), _TabDisponiveis (StatelessWidget), _TabEmIntervalo (StatelessWidget), _TabHistorico (StatelessWidget), _PausaAtivaCard (StatelessWidget), _PausaHistoricoCard (StatelessWidget), _SeletorRapidoSheet (StatelessWidget), _ColaboradorIntervaloSheet (StatefulWidget), _ColaboradorIntervaloSheetState (State<_ColaboradorIntervaloSheet>), _InfoRow (StatelessWidget), _SeletorPausaSheet (StatefulWidget), _SeletorPausaSheetState (State<_SeletorPausaSheet>)
- Titulos de AppBar: Café / Intervalos
- Providers usados na tela: CafeProvider, ColaboradorProvider, EscalaProvider, AlocacaoProvider, EventoTurnoProvider, CaixaProvider, AuthProvider, OcorrenciaProvider
- Servicos usados diretamente: N/A
- Metodos/funcoes locais: initState, dispose, build, _confirmarLimpar, _mostrarSeletorPausa, itemBuilder, _abrirSeletorRapido, _abrirDetalheIntervalo, _finalizarComRegras, _carregarPonto, _parseHorario, _escolherDuracaoIntervaloSemEscala, _enviarParaIntervalo, _perguntarSeFezTempoCompleto, _perguntarMotivoIncompleto, _marcarIntervaloJaFeito, _buildPontoInfo, _duracaoCafePadrao
- Leitura tecnica do fluxo:
  - Inicializa estado local e dispara carregamento inicial quando necessario.
  - Inclui rotinas de leitura/sincronizacao de dados para montar a tela.
  - Renderiza UI reativa orientada pelo estado atual dos providers/controladores.

### Modulo: `caixas`

#### `lib/presentation/screens/caixas/caixa_form_screen.dart`
- Classes: CaixaFormScreen (StatefulWidget), _CaixaFormScreenState (State<CaixaFormScreen>), _TipoCard (StatelessWidget)
- Titulos de AppBar: N/A
- Providers usados na tela: AuthProvider, CaixaProvider
- Servicos usados diretamente: N/A
- Metodos/funcoes locais: initState, dispose, _salvar, build
- Leitura tecnica do fluxo:
  - Inicializa estado local e dispara carregamento inicial quando necessario.
  - Executa mutacoes de dados com validacao e feedback ao usuario.
  - Renderiza UI reativa orientada pelo estado atual dos providers/controladores.

#### `lib/presentation/screens/caixas/caixas_list_screen.dart`
- Classes: CaixasListScreen (StatefulWidget), _CaixasListScreenState (State<CaixasListScreen>)
- Titulos de AppBar: Caixas
- Providers usados na tela: AuthProvider, CaixaProvider
- Servicos usados diretamente: N/A
- Metodos/funcoes locais: initState, _loadCaixas, build, _buildStatsBar, _buildStatItem, _buildFilterBar
- Leitura tecnica do fluxo:
  - Inicializa estado local e dispara carregamento inicial quando necessario.
  - Inclui rotinas de leitura/sincronizacao de dados para montar a tela.
  - Renderiza UI reativa orientada pelo estado atual dos providers/controladores.

### Modulo: `checklist`

#### `lib/presentation/screens/checklist/checklist_execucao_screen.dart`
- Classes: ChecklistExecucaoScreen (StatelessWidget)
- Titulos de AppBar: N/A
- Providers usados na tela: ChecklistProvider, EventoTurnoProvider, AuthProvider
- Servicos usados diretamente: N/A
- Metodos/funcoes locais: build
- Leitura tecnica do fluxo:
  - Renderiza UI reativa orientada pelo estado atual dos providers/controladores.

#### `lib/presentation/screens/checklist/checklist_screen.dart`
- Classes: ChecklistScreen (StatelessWidget)
- Titulos de AppBar: Checklist de Turno
- Providers usados na tela: ChecklistProvider
- Servicos usados diretamente: N/A
- Metodos/funcoes locais: _formatTime, _buildCard, _onMenu, build
- Leitura tecnica do fluxo:
  - Renderiza UI reativa orientada pelo estado atual dos providers/controladores.

#### `lib/presentation/screens/checklist/checklist_template_form_screen.dart`
- Classes: ChecklistTemplateFormScreen (StatefulWidget), _ChecklistTemplateFormScreenState (State<ChecklistTemplateFormScreen>)
- Titulos de AppBar: N/A
- Providers usados na tela: ChecklistProvider
- Servicos usados diretamente: N/A
- Metodos/funcoes locais: initState, _syncControllers, dispose, _addItem, _removeItem, _salvar, build
- Leitura tecnica do fluxo:
  - Inicializa estado local e dispara carregamento inicial quando necessario.
  - Executa mutacoes de dados com validacao e feedback ao usuario.
  - Renderiza UI reativa orientada pelo estado atual dos providers/controladores.

### Modulo: `colaboradores`

#### `lib/presentation/screens/colaboradores/colaborador_detail_screen.dart`
- Classes: ColaboradorDetailScreen (StatefulWidget), _ColaboradorDetailScreenState (State<ColaboradorDetailScreen>)
- Titulos de AppBar: N/A
- Providers usados na tela: AlocacaoProvider, RegistroPontoProvider
- Servicos usados diretamente: N/A
- Metodos/funcoes locais: initState, _loadData, build, _buildMenuCard, _buildSheetHandle, _showInfoSheet, _showAlocacoesSheet, _showRegistrosSheet, _showEstatisticasSheet, _buildRegistrosPonto, _buildRegistroRow, _confirmDelete, _horarioBadge, _buildStatusChip, _buildInfoRow, _buildStatRow, _buildHistoricoHoje, _formatDate, _formatTime
- Leitura tecnica do fluxo:
  - Inicializa estado local e dispara carregamento inicial quando necessario.
  - Inclui rotinas de leitura/sincronizacao de dados para montar a tela.
  - Tem fluxo de exclusao/remocao com confirmacao para reduzir risco operacional.
  - Renderiza UI reativa orientada pelo estado atual dos providers/controladores.

#### `lib/presentation/screens/colaboradores/colaborador_form_screen.dart`
- Classes: ColaboradorFormScreen (StatefulWidget), _ColaboradorFormScreenState (State<ColaboradorFormScreen>)
- Titulos de AppBar: N/A
- Providers usados na tela: ColaboradorProvider, AuthProvider
- Servicos usados diretamente: N/A
- Metodos/funcoes locais: initState, dispose, _loadColaborador, _handleSave, _createColaborador, _updateColaborador, _showError, build, _buildStatusCard, _buildDepartamentoSelector
- Leitura tecnica do fluxo:
  - Inicializa estado local e dispara carregamento inicial quando necessario.
  - Inclui rotinas de leitura/sincronizacao de dados para montar a tela.
  - Executa mutacoes de dados com validacao e feedback ao usuario.
  - Renderiza UI reativa orientada pelo estado atual dos providers/controladores.

#### `lib/presentation/screens/colaboradores/colaboradores_list_screen.dart`
- Classes: ColaboradoresListScreen (StatefulWidget), _ColaboradoresListScreenState (State<ColaboradoresListScreen>), _CardDisponivel (StatelessWidget), _CardEmCaixa (StatelessWidget), _EmptyStatus (StatelessWidget)
- Titulos de AppBar: Colaboradores
- Providers usados na tela: AuthProvider, ColaboradorProvider, CaixaProvider, AlocacaoProvider
- Servicos usados diretamente: N/A
- Metodos/funcoes locais: initState, dispose, _loadData, _navigateToDetail, build, _buildListaTab, _buildStatusTab, _buildFilterChips, _chip, _deleteColaborador
- Leitura tecnica do fluxo:
  - Inicializa estado local e dispara carregamento inicial quando necessario.
  - Inclui rotinas de leitura/sincronizacao de dados para montar a tela.
  - Tem fluxo de exclusao/remocao com confirmacao para reduzir risco operacional.
  - Renderiza UI reativa orientada pelo estado atual dos providers/controladores.

#### `lib/presentation/screens/colaboradores/registro_ponto_form_screen.dart`
- Classes: RegistroPontoFormScreen (StatefulWidget), _RegistroPontoFormScreenState (State<RegistroPontoFormScreen>)
- Titulos de AppBar: N/A
- Providers usados na tela: RegistroPontoProvider
- Servicos usados diretamente: N/A
- Metodos/funcoes locais: initState, dispose, _pickDate, _pickTime, _buildObservacao, _handleSave, build, _buildTipoSelector, _buildTimeTile, _formatDate
- Leitura tecnica do fluxo:
  - Inicializa estado local e dispara carregamento inicial quando necessario.
  - Executa mutacoes de dados com validacao e feedback ao usuario.
  - Renderiza UI reativa orientada pelo estado atual dos providers/controladores.

### Modulo: `configuracoes`

#### `lib/presentation/screens/configuracoes/configuracoes_screen.dart`
- Classes: ConfiguracoesScreen (StatelessWidget), _InfoRow (StatelessWidget)
- Titulos de AppBar: Configurações
- Providers usados na tela: FiscalProvider
- Servicos usados diretamente: N/A
- Metodos/funcoes locais: build
- Leitura tecnica do fluxo:
  - Renderiza UI reativa orientada pelo estado atual dos providers/controladores.

#### `lib/presentation/screens/configuracoes/cupom_config_screen.dart`
- Classes: CupomConfigScreen (StatefulWidget), _CupomConfigScreenState (State<CupomConfigScreen>)
- Titulos de AppBar: Dados do Cupom
- Providers usados na tela: N/A
- Servicos usados diretamente: cupom_config_service
- Metodos/funcoes locais: initState, dispose, _carregar, _aplicarConfig, _salvar, _restaurarPadrao, _duasCasas, _centralizar, _linhaRegua, _preview, writeCabecalho, _secao, _campo, Function, _switchTile, _statusChip, _resumoConfig, _configuracaoVisual, _mensagensRegras, _previewCard, _acoesRodape, _buildFormularioSecoes, build
- Leitura tecnica do fluxo:
  - Inicializa estado local e dispara carregamento inicial quando necessario.
  - Inclui rotinas de leitura/sincronizacao de dados para montar a tela.
  - Executa mutacoes de dados com validacao e feedback ao usuario.
  - Renderiza UI reativa orientada pelo estado atual dos providers/controladores.

### Modulo: `dashboard`

#### `lib/presentation/screens/dashboard/dashboard_screen.dart`
- Classes: DashboardScreen (StatefulWidget), _DashboardScreenState (State<DashboardScreen>), _MonitorTempoReal (StatelessWidget), _GridAcoes (StatelessWidget), _AlertCard (StatelessWidget), _StatItem (StatelessWidget), _StatDivider (StatelessWidget), _BannerSaudeTurno (StatelessWidget), _OcupacaoBar (StatelessWidget), _ComecaTurnoButton (StatelessWidget), _BriefingTurnoSheet (StatelessWidget), _BriefingSection (StatefulWidget), _BriefingSectionState (State<_BriefingSection>), _BriefingColabTile (StatelessWidget)
- Titulos de AppBar: N/A
- Providers usados na tela: AuthProvider, FiscalProvider, ColaboradorProvider, CaixaProvider, AlocacaoProvider, CafeProvider, EntregaProvider, NotaProvider, FormularioProvider, ProcedimentoProvider, OcorrenciaProvider, ChecklistProvider, PassagemTurnoProvider, EventoTurnoProvider, EscalaProvider
- Servicos usados diretamente: seed_data_service
- Metodos/funcoes locais: initState, dispose, _abrirBriefingTurno, _abrirDestinoBannerSaude, _loadData, build, _getSaudacao, _finalizarPausaDoMonitor, _escolherRetornoIntervalo, _buildStatRow, _confirmarInicio
- Leitura tecnica do fluxo:
  - Inicializa estado local e dispara carregamento inicial quando necessario.
  - Inclui rotinas de leitura/sincronizacao de dados para montar a tela.
  - Renderiza UI reativa orientada pelo estado atual dos providers/controladores.

### Modulo: `entregas`

#### `lib/presentation/screens/entregas/entrega_detail_screen.dart`
- Classes: EntregaDetailScreen (StatelessWidget)
- Titulos de AppBar: N/A
- Providers usados na tela: EntregaProvider, EventoTurnoProvider, AuthProvider
- Servicos usados diretamente: N/A
- Metodos/funcoes locais: _getStatusLabel, _marcarEmRota, _marcarEntregue, _cancelarEntrega, _excluirEntrega, _editarEntrega, _formatDateTime, _formatTime, build, _buildInfoRow, _buildTimelineItem, _buildTimelineConnector
- Leitura tecnica do fluxo:
  - Tem fluxo de exclusao/remocao com confirmacao para reduzir risco operacional.
  - Renderiza UI reativa orientada pelo estado atual dos providers/controladores.

#### `lib/presentation/screens/entregas/entrega_form_screen.dart`
- Classes: EntregaFormScreen (StatefulWidget), _EntregaFormScreenState (State<EntregaFormScreen>)
- Titulos de AppBar: N/A
- Providers usados na tela: EntregaProvider, EventoTurnoProvider, AuthProvider
- Servicos usados diretamente: N/A
- Metodos/funcoes locais: initState, dispose, _selecionarHorario, _abrirSheetCsv, _aplicarCsv, _salvar, _formatHorario, build
- Leitura tecnica do fluxo:
  - Inicializa estado local e dispara carregamento inicial quando necessario.
  - Executa mutacoes de dados com validacao e feedback ao usuario.
  - Renderiza UI reativa orientada pelo estado atual dos providers/controladores.

#### `lib/presentation/screens/entregas/entregas_screen.dart`
- Classes: EntregasScreen (StatefulWidget), _EntregasScreenState (State<EntregasScreen>)
- Titulos de AppBar: Entregas
- Providers usados na tela: EntregaProvider
- Servicos usados diretamente: N/A
- Metodos/funcoes locais: _getCidades, _aplicarFiltros, build, _buildStatsCard, _getStatusLabel
- Leitura tecnica do fluxo:
  - Possui mecanismos de filtro/busca para acelerar operacao no turno.
  - Renderiza UI reativa orientada pelo estado atual dos providers/controladores.

### Modulo: `escala`

#### `lib/presentation/screens/escala/escala_dia_screen.dart`
- Classes: EscalaDiaScreen (StatelessWidget)
- Titulos de AppBar: N/A
- Providers usados na tela: EscalaProvider
- Servicos usados diretamente: N/A
- Metodos/funcoes locais: build, entradaOrd, _buildSecaoHeader, _buildTurnoCard, _abrirFormulario, _confirmarLimparDia, _capitalizar
- Leitura tecnica do fluxo:
  - Renderiza UI reativa orientada pelo estado atual dos providers/controladores.

#### `lib/presentation/screens/escala/escala_screen.dart`
- Classes: EscalaScreen (StatefulWidget), _EscalaScreenState (State<EscalaScreen>), _StatChip (StatelessWidget), _DeptBadge (StatelessWidget)
- Titulos de AppBar: Escala Semanal
- Providers usados na tela: ColaboradorProvider, EscalaProvider
- Servicos usados diretamente: N/A
- Metodos/funcoes locais: _toMin, _minToHHmm, _ehHoje, _semanaAnterior, _semanaSeguinte, _semanaAtual, didChangeDependencies, _validarCobertura, flush, _mostrarRelatorioCobertura, _gerarEscala, build, _capitalizar
- Leitura tecnica do fluxo:
  - Inicializa estado local e dispara carregamento inicial quando necessario.
  - Renderiza UI reativa orientada pelo estado atual dos providers/controladores.

#### `lib/presentation/screens/escala/escala_turno_form_screen.dart`
- Classes: EscalaTurnoFormScreen (StatefulWidget), _EscalaTurnoFormScreenState (State<EscalaTurnoFormScreen>)
- Titulos de AppBar: N/A
- Providers usados na tela: RegistroPontoProvider, ColaboradorProvider, EscalaProvider
- Servicos usados diretamente: N/A
- Metodos/funcoes locais: initState, dispose, _onColaboradorChanged, _preencherHorariosDoRegistro, build, _buildTipoChip, _buildHorarioField, _buildAtalhosHorarios, _selecionarHorario, _salvar, _capitalizar
- Leitura tecnica do fluxo:
  - Inicializa estado local e dispara carregamento inicial quando necessario.
  - Executa mutacoes de dados com validacao e feedback ao usuario.
  - Renderiza UI reativa orientada pelo estado atual dos providers/controladores.

#### `lib/presentation/screens/escala/importar_escala_screen.dart`
- Classes: ImportarEscalaScreen (StatefulWidget), _ImportarEscalaScreenState (State<ImportarEscalaScreen>), _LinhaCard (StatelessWidget), _Tag (StatelessWidget)
- Titulos de AppBar: Importar Registros
- Providers usados na tela: ColaboradorProvider, RegistroPontoProvider
- Servicos usados diretamente: N/A
- Metodos/funcoes locais: _isTime, _normalizeNome, dispose, _pickDate, _analisar, _importar, build, _formatDate
- Leitura tecnica do fluxo:
  - Renderiza UI reativa orientada pelo estado atual dos providers/controladores.

### Modulo: `folga`

#### `lib/presentation/screens/folga/folga_screen.dart`
- Classes: FolgaScreen (StatelessWidget)
- Titulos de AppBar: N/A
- Providers usados na tela: FiscalProvider
- Servicos usados diretamente: N/A
- Metodos/funcoes locais: build, _calcularProximoTurno
- Leitura tecnica do fluxo:
  - Renderiza UI reativa orientada pelo estado atual dos providers/controladores.

### Modulo: `formularios`

#### `lib/presentation/screens/formularios/formulario_editor_screen.dart`
- Classes: FormularioEditorScreen (StatefulWidget), _FormularioEditorScreenState (State<FormularioEditorScreen>)
- Titulos de AppBar: N/A
- Providers usados na tela: FormularioProvider
- Servicos usados diretamente: N/A
- Metodos/funcoes locais: dispose, initState, _adicionarCampo, _removerCampo, _onReorder, _salvar, _selecionarTipo, _tipoDescricao, build, _buildCampoItem
- Leitura tecnica do fluxo:
  - Inicializa estado local e dispara carregamento inicial quando necessario.
  - Executa mutacoes de dados com validacao e feedback ao usuario.
  - Tem fluxo de exclusao/remocao com confirmacao para reduzir risco operacional.
  - Renderiza UI reativa orientada pelo estado atual dos providers/controladores.

#### `lib/presentation/screens/formularios/formulario_preenchimento_screen.dart`
- Classes: FormularioPreenchimentoScreen (StatefulWidget), _FormularioPreenchimentoScreenState (State<FormularioPreenchimentoScreen>), _SimNaoButton (StatelessWidget)
- Titulos de AppBar: N/A
- Providers usados na tela: FormularioProvider, EventoTurnoProvider, AuthProvider
- Servicos usados diretamente: N/A
- Metodos/funcoes locais: initState, dispose, _limpar, _enviar, build, _buildCampo, _formatDateTime
- Leitura tecnica do fluxo:
  - Inicializa estado local e dispara carregamento inicial quando necessario.
  - Renderiza UI reativa orientada pelo estado atual dos providers/controladores.

#### `lib/presentation/screens/formularios/formulario_respostas_screen.dart`
- Classes: FormularioRespostasScreen (StatelessWidget)
- Titulos de AppBar: N/A
- Providers usados na tela: FormularioProvider
- Servicos usados diretamente: N/A
- Metodos/funcoes locais: _formatDateTime, _respostaParaTexto, _confirmarDelete, build, _mostrarDetalhes
- Leitura tecnica do fluxo:
  - Tem fluxo de exclusao/remocao com confirmacao para reduzir risco operacional.
  - Renderiza UI reativa orientada pelo estado atual dos providers/controladores.

#### `lib/presentation/screens/formularios/formularios_screen.dart`
- Classes: FormulariosScreen (StatefulWidget), _FormulariosScreenState (State<FormulariosScreen>)
- Titulos de AppBar: Formulários
- Providers usados na tela: FormularioProvider
- Servicos usados diretamente: N/A
- Metodos/funcoes locais: initState, dispose, _filtrar, build, _buildLista, _buildTodasRespostas, _fmtDt, _confirmarDeleteResposta, _mostrarDetalhesResposta, _onMenuSelected
- Leitura tecnica do fluxo:
  - Inicializa estado local e dispara carregamento inicial quando necessario.
  - Tem fluxo de exclusao/remocao com confirmacao para reduzir risco operacional.
  - Possui mecanismos de filtro/busca para acelerar operacao no turno.
  - Renderiza UI reativa orientada pelo estado atual dos providers/controladores.

### Modulo: `gestao`

#### `lib/presentation/screens/gestao/gargalo_calculator.dart`
- Classes: N/A
- Titulos de AppBar: N/A
- Providers usados na tela: N/A
- Servicos usados diretamente: N/A
- Metodos/funcoes locais: calcularPorSetor, _capacidadeMinima, _parseTurnoTime
- Leitura tecnica do fluxo:
  - Tela/utilitario com responsabilidade focada em exibicao e navegacao.

#### `lib/presentation/screens/gestao/gestao_screen.dart`
- Classes: GestaoScreen (StatefulWidget), _GestaoScreenState (State<GestaoScreen>)
- Titulos de AppBar: N/A
- Providers usados na tela: AuthProvider, CafeProvider, EscalaProvider, AlocacaoProvider
- Servicos usados diretamente: N/A
- Metodos/funcoes locais: initState, build
- Leitura tecnica do fluxo:
  - Inicializa estado local e dispara carregamento inicial quando necessario.
  - Renderiza UI reativa orientada pelo estado atual dos providers/controladores.

#### `lib/presentation/screens/gestao/visao_gargalo_screen.dart`
- Classes: VisaoGargaloScreen (StatefulWidget), _VisaoGargaloScreenState (State<VisaoGargaloScreen>), _SectionHeader (StatelessWidget), _CoberturaChart (StatelessWidget), _Legend (StatelessWidget), _GargaloCard (StatelessWidget), _EventRow (StatelessWidget), _ProximasMovimentacoes (StatelessWidget), _EventoItem (StatelessWidget)
- Titulos de AppBar: Visão de Gargalo
- Providers usados na tela: EscalaProvider, AlocacaoProvider, CafeProvider
- Servicos usados diretamente: N/A
- Metodos/funcoes locais: _floorToSlot, _formatTime, contarGargalosHoje, initState, dispose, build, _buildEmpty, _buildBody, _sugestao
- Leitura tecnica do fluxo:
  - Inicializa estado local e dispara carregamento inicial quando necessario.
  - Renderiza UI reativa orientada pelo estado atual dos providers/controladores.

### Modulo: `guia_rapido`

#### `lib/presentation/screens/guia_rapido/guia_rapido_form_screen.dart`
- Classes: GuiaRapidoFormScreen (StatefulWidget), _GuiaRapidoFormScreenState (State<GuiaRapidoFormScreen>)
- Titulos de AppBar: N/A
- Providers usados na tela: GuiaRapidoProvider
- Servicos usados diretamente: N/A
- Metodos/funcoes locais: initState, dispose, _adicionarPasso, _removerPasso, _salvar, build
- Leitura tecnica do fluxo:
  - Inicializa estado local e dispara carregamento inicial quando necessario.
  - Executa mutacoes de dados com validacao e feedback ao usuario.
  - Tem fluxo de exclusao/remocao com confirmacao para reduzir risco operacional.
  - Renderiza UI reativa orientada pelo estado atual dos providers/controladores.

#### `lib/presentation/screens/guia_rapido/guia_rapido_screen.dart`
- Classes: GuiaRapidoScreen (StatefulWidget), _GuiaRapidoScreenState (State<GuiaRapidoScreen>)
- Titulos de AppBar: Guia Rápido
- Providers usados na tela: GuiaRapidoProvider
- Servicos usados diretamente: N/A
- Metodos/funcoes locais: dispose, _filtrar, _confirmarDelete, build
- Leitura tecnica do fluxo:
  - Tem fluxo de exclusao/remocao com confirmacao para reduzir risco operacional.
  - Possui mecanismos de filtro/busca para acelerar operacao no turno.
  - Renderiza UI reativa orientada pelo estado atual dos providers/controladores.

### Modulo: `mapa`

#### `lib/presentation/screens/mapa/mapa_caixas_screen.dart`
- Classes: MapaCaixasScreen (StatefulWidget), _MapaCaixasScreenState (State<MapaCaixasScreen>), _CaixasBody (StatelessWidget), _StatsBar (StatelessWidget), _StatItem (StatelessWidget), _FilterBar (StatelessWidget), _SectionHeader (StatelessWidget), _MiniDashboard (StatelessWidget), _DashItem (StatelessWidget), _DashDivider (StatelessWidget), _OcupadosSheet (StatelessWidget)
- Titulos de AppBar: Mapa de Caixas
- Providers usados na tela: EscalaProvider, PacotePlantaoProvider, AuthProvider, CaixaProvider, AlocacaoProvider, ColaboradorProvider, OutroSetorProvider, CafeProvider
- Servicos usados diretamente: N/A
- Metodos/funcoes locais: initState, dispose, _iniciarTimerSaidas, _verificarSaidasAutomaticas, _loadData, build, _buildLegendItem, abrirDetalheOcupados, _mostrarAcoes, _confirmarLiberar, _confirmarFinalizarPausa, _escolherRetornoIntervalo
- Leitura tecnica do fluxo:
  - Inicializa estado local e dispara carregamento inicial quando necessario.
  - Inclui rotinas de leitura/sincronizacao de dados para montar a tela.
  - Executa mutacoes de dados com validacao e feedback ao usuario.
  - Renderiza UI reativa orientada pelo estado atual dos providers/controladores.

### Modulo: `notas`

#### `lib/presentation/screens/notas/nota_detail_screen.dart`
- Classes: NotaDetailScreen (StatelessWidget)
- Titulos de AppBar: Detalhes da Nota
- Providers usados na tela: NotaProvider
- Servicos usados diretamente: N/A
- Metodos/funcoes locais: _formatDateTime, _copiar, build
- Leitura tecnica do fluxo:
  - Oferece saida textual/compartilhamento para comunicacao e auditoria.
  - Renderiza UI reativa orientada pelo estado atual dos providers/controladores.

#### `lib/presentation/screens/notas/nota_form_screen.dart`
- Classes: NotaFormScreen (StatefulWidget), _NotaFormScreenState (State<NotaFormScreen>)
- Titulos de AppBar: N/A
- Providers usados na tela: NotaProvider, AuthProvider, EventoTurnoProvider
- Servicos usados diretamente: anexo_upload_service
- Metodos/funcoes locais: initState, dispose, _selecionarDataHora, _selecionarFoto, _selecionarArquivo, _removerFoto, _removerArquivo, _salvar, _formatDataLembrete, build
- Leitura tecnica do fluxo:
  - Inicializa estado local e dispara carregamento inicial quando necessario.
  - Executa mutacoes de dados com validacao e feedback ao usuario.
  - Tem fluxo de exclusao/remocao com confirmacao para reduzir risco operacional.
  - Renderiza UI reativa orientada pelo estado atual dos providers/controladores.

#### `lib/presentation/screens/notas/notas_screen.dart`
- Classes: NotasScreen (StatefulWidget), _NotasScreenState (State<NotasScreen>), _StatCard (StatelessWidget)
- Titulos de AppBar: Anotações e Lembretes
- Providers usados na tela: NotaProvider
- Servicos usados diretamente: N/A
- Metodos/funcoes locais: dispose, _filtroAtivo, _mostrarMenuCriar, _abrirMenuFiltro, _confirmarDelete, _buildListItems, _sectionHeader, _buildNotaCard, _onMenuSelected, _compartilharNota, _formatData, _buildTipoChip, build
- Leitura tecnica do fluxo:
  - Tem fluxo de exclusao/remocao com confirmacao para reduzir risco operacional.
  - Possui mecanismos de filtro/busca para acelerar operacao no turno.
  - Oferece saida textual/compartilhamento para comunicacao e auditoria.
  - Renderiza UI reativa orientada pelo estado atual dos providers/controladores.

### Modulo: `notificacoes`

#### `lib/presentation/screens/notificacoes/notificacoes_screen.dart`
- Classes: NotificacoesScreen (StatelessWidget)
- Titulos de AppBar: Notificações
- Providers usados na tela: NotificacaoProvider
- Servicos usados diretamente: N/A
- Metodos/funcoes locais: build
- Leitura tecnica do fluxo:
  - Renderiza UI reativa orientada pelo estado atual dos providers/controladores.

### Modulo: `ocorrencias`

#### `lib/presentation/screens/ocorrencias/ocorrencia_detail_screen.dart`
- Classes: OcorrenciaDetailScreen (StatelessWidget)
- Titulos de AppBar: Detalhes da Ocorrencia
- Providers usados na tela: OcorrenciaProvider, EventoTurnoProvider, AuthProvider
- Servicos usados diretamente: N/A
- Metodos/funcoes locais: _formatDateTime, _copiar, _marcarComoResolvida, build
- Leitura tecnica do fluxo:
  - Oferece saida textual/compartilhamento para comunicacao e auditoria.
  - Renderiza UI reativa orientada pelo estado atual dos providers/controladores.

#### `lib/presentation/screens/ocorrencias/ocorrencia_form_screen.dart`
- Classes: OcorrenciaFormScreen (StatefulWidget), _OcorrenciaFormScreenState (State<OcorrenciaFormScreen>)
- Titulos de AppBar: N/A
- Providers usados na tela: AuthProvider, OcorrenciaProvider, EventoTurnoProvider
- Servicos usados diretamente: anexo_upload_service
- Metodos/funcoes locais: initState, dispose, _selecionarFoto, _selecionarArquivo, _removerFoto, _removerArquivo, _salvar, build
- Leitura tecnica do fluxo:
  - Inicializa estado local e dispara carregamento inicial quando necessario.
  - Executa mutacoes de dados com validacao e feedback ao usuario.
  - Tem fluxo de exclusao/remocao com confirmacao para reduzir risco operacional.
  - Renderiza UI reativa orientada pelo estado atual dos providers/controladores.

#### `lib/presentation/screens/ocorrencias/ocorrencias_screen.dart`
- Classes: OcorrenciasScreen (StatefulWidget), _OcorrenciasScreenState (State<OcorrenciasScreen>)
- Titulos de AppBar: Ocorrências
- Providers usados na tela: EventoTurnoProvider, AuthProvider, OcorrenciaProvider
- Servicos usados diretamente: N/A
- Metodos/funcoes locais: initState, dispose, _compartilharOcorrencia, _formatDateTime, _confirmarDelete, _buildLista, build
- Leitura tecnica do fluxo:
  - Inicializa estado local e dispara carregamento inicial quando necessario.
  - Tem fluxo de exclusao/remocao com confirmacao para reduzir risco operacional.
  - Oferece saida textual/compartilhamento para comunicacao e auditoria.
  - Renderiza UI reativa orientada pelo estado atual dos providers/controladores.

### Modulo: `passagem_turno`

#### `lib/presentation/screens/passagem_turno/passagem_turno_screen.dart`
- Classes: PassagemTurnoScreen (StatefulWidget), _PassagemTurnoScreenState (State<PassagemTurnoScreen>)
- Titulos de AppBar: Passagem de Turno
- Providers usados na tela: PassagemTurnoProvider
- Servicos usados diretamente: N/A
- Metodos/funcoes locais: dispose, _formatDateTime, _salvar, _copiar, _confirmarDelete, _buildForm, _buildRegistro, _buildSection, build
- Leitura tecnica do fluxo:
  - Executa mutacoes de dados com validacao e feedback ao usuario.
  - Tem fluxo de exclusao/remocao com confirmacao para reduzir risco operacional.
  - Oferece saida textual/compartilhamento para comunicacao e auditoria.
  - Renderiza UI reativa orientada pelo estado atual dos providers/controladores.

### Modulo: `pizzaria`

#### `lib/presentation/screens/pizzaria/cupom_widget.dart`
- Classes: CupomWidget (StatefulWidget), _CupomWidgetState (State<CupomWidget>)
- Titulos de AppBar: N/A
- Providers usados na tela: N/A
- Servicos usados diretamente: cupom_config_service
- Metodos/funcoes locais: initState, _carregarConfig, _center, _writeIfNotEmpty, _writeLabeledIfHasValue, _linhaDestaque, _textoOuPadrao, _gerarTexto, _buildAcoes, build
- Leitura tecnica do fluxo:
  - Inicializa estado local e dispara carregamento inicial quando necessario.
  - Inclui rotinas de leitura/sincronizacao de dados para montar a tela.
  - Oferece saida textual/compartilhamento para comunicacao e auditoria.
  - Renderiza UI reativa orientada pelo estado atual dos providers/controladores.

#### `lib/presentation/screens/pizzaria/novo_pedido_screen.dart`
- Classes: NovoPedidoScreen (StatefulWidget), _NovoPedidoScreenState (State<NovoPedidoScreen>), _SeletorPizzaScreen (StatefulWidget), _SeletorPizzaScreenState (State<_SeletorPizzaScreen>), _Secao (StatelessWidget)
- Titulos de AppBar: Adicionar Pizza
- Providers usados na tela: N/A
- Servicos usados diretamente: N/A
- Metodos/funcoes locais: initState, dispose, _formatarHora, _carregarPizzas, _escolherData, _escolherHora, _adicionarItem, _opcional, _salvar, build, _limparSelecaoAtual, _adicionarNaSessao, _concluirSelecao, _pizzaCard, _pizzaGrid, _categoriaExpansivel
- Leitura tecnica do fluxo:
  - Inicializa estado local e dispara carregamento inicial quando necessario.
  - Inclui rotinas de leitura/sincronizacao de dados para montar a tela.
  - Executa mutacoes de dados com validacao e feedback ao usuario.
  - Renderiza UI reativa orientada pelo estado atual dos providers/controladores.

#### `lib/presentation/screens/pizzaria/pedidos_list_screen.dart`
- Classes: PedidosListScreen (StatefulWidget), _PedidosListScreenState (State<PedidosListScreen>), _CardPedido (StatelessWidget), _DetalhesPedidoSheet (StatelessWidget), _ChipFiltro (StatelessWidget)
- Titulos de AppBar: Pedidos de Pizza
- Providers usados na tela: N/A
- Servicos usados diretamente: N/A
- Metodos/funcoes locais: initState, _carregar, _mudarStatus, _verCupom, _editarPedido, _excluirPedido, _abrirDetalhes, build, _textoPedido, _statusLabel
- Leitura tecnica do fluxo:
  - Inicializa estado local e dispara carregamento inicial quando necessario.
  - Inclui rotinas de leitura/sincronizacao de dados para montar a tela.
  - Tem fluxo de exclusao/remocao com confirmacao para reduzir risco operacional.
  - Renderiza UI reativa orientada pelo estado atual dos providers/controladores.

#### `lib/presentation/screens/pizzaria/pizza_models.dart`
- Classes: N/A
- Titulos de AppBar: N/A
- Providers usados na tela: N/A
- Servicos usados diretamente: N/A
- Metodos/funcoes locais: toMap, _textoObrigatorio, _textoOpcional, _erroColunaInexistente, _payloadPedido, listarPizzas, salvarPizza, atualizarPizza, toggleAtivaPizza, deletarPizza, listarPedidos, _buscarItens, criarPedido, atualizarPedido, atualizarStatus, excluirPedido
- Leitura tecnica do fluxo:
  - Inclui rotinas de leitura/sincronizacao de dados para montar a tela.
  - Executa mutacoes de dados com validacao e feedback ao usuario.
  - Tem fluxo de exclusao/remocao com confirmacao para reduzir risco operacional.

#### `lib/presentation/screens/pizzaria/pizza_module_screen.dart`
- Classes: PizzaModuleScreen (StatefulWidget), _PizzaModuleScreenState (State<PizzaModuleScreen>)
- Titulos de AppBar: N/A
- Providers usados na tela: N/A
- Servicos usados diretamente: N/A
- Metodos/funcoes locais: build
- Leitura tecnica do fluxo:
  - Renderiza UI reativa orientada pelo estado atual dos providers/controladores.

#### `lib/presentation/screens/pizzaria/pizzas_cadastro_screen.dart`
- Classes: PizzasCadastroScreen (StatefulWidget), _PizzasCadastroScreenState (State<PizzasCadastroScreen>), _FormPizza (StatefulWidget), _FormPizzaState (State<_FormPizza>)
- Titulos de AppBar: Cardápio de Pizzas
- Providers usados na tela: N/A
- Servicos usados diretamente: N/A
- Metodos/funcoes locais: initState, _carregar, _abrirFormulario, _confirmarDelete, build, _secao, dispose, _salvar
- Leitura tecnica do fluxo:
  - Inicializa estado local e dispara carregamento inicial quando necessario.
  - Inclui rotinas de leitura/sincronizacao de dados para montar a tela.
  - Executa mutacoes de dados com validacao e feedback ao usuario.
  - Tem fluxo de exclusao/remocao com confirmacao para reduzir risco operacional.
  - Renderiza UI reativa orientada pelo estado atual dos providers/controladores.

### Modulo: `procedimentos`

#### `lib/presentation/screens/procedimentos/procedimento_detail_screen.dart`
- Classes: ProcedimentoDetailScreen (StatefulWidget), _ProcedimentoDetailScreenState (State<ProcedimentoDetailScreen>)
- Titulos de AppBar: N/A
- Providers usados na tela: ProcedimentoProvider
- Servicos usados diretamente: N/A
- Metodos/funcoes locais: _copiar, build
- Leitura tecnica do fluxo:
  - Oferece saida textual/compartilhamento para comunicacao e auditoria.
  - Renderiza UI reativa orientada pelo estado atual dos providers/controladores.

#### `lib/presentation/screens/procedimentos/procedimento_form_screen.dart`
- Classes: ProcedimentoFormScreen (StatefulWidget), _ProcedimentoFormScreenState (State<ProcedimentoFormScreen>)
- Titulos de AppBar: N/A
- Providers usados na tela: ProcedimentoProvider
- Servicos usados diretamente: N/A
- Metodos/funcoes locais: dispose, initState, _adicionarPasso, _removerPasso, _onReorder, _salvar, build
- Leitura tecnica do fluxo:
  - Inicializa estado local e dispara carregamento inicial quando necessario.
  - Executa mutacoes de dados com validacao e feedback ao usuario.
  - Tem fluxo de exclusao/remocao com confirmacao para reduzir risco operacional.
  - Renderiza UI reativa orientada pelo estado atual dos providers/controladores.

#### `lib/presentation/screens/procedimentos/procedimentos_screen.dart`
- Classes: ProcedimentosScreen (StatefulWidget), _ProcedimentosScreenState (State<ProcedimentosScreen>)
- Titulos de AppBar: Procedimentos
- Providers usados na tela: ProcedimentoProvider
- Servicos usados diretamente: N/A
- Metodos/funcoes locais: dispose, _confirmarDelete, _onMenuSelected, _copiarProcedimento, _buildCard, build
- Leitura tecnica do fluxo:
  - Tem fluxo de exclusao/remocao com confirmacao para reduzir risco operacional.
  - Oferece saida textual/compartilhamento para comunicacao e auditoria.
  - Renderiza UI reativa orientada pelo estado atual dos providers/controladores.

### Modulo: `profile`

#### `lib/presentation/screens/profile/profile_screen.dart`
- Classes: ProfileScreen (StatefulWidget), _ProfileScreenState (State<ProfileScreen>)
- Titulos de AppBar: N/A
- Providers usados na tela: FiscalProvider
- Servicos usados diretamente: N/A
- Metodos/funcoes locais: initState, _loadProfileData, dispose, _salvarPerfil, _alterarSenha, build, _formatDate
- Leitura tecnica do fluxo:
  - Inicializa estado local e dispara carregamento inicial quando necessario.
  - Inclui rotinas de leitura/sincronizacao de dados para montar a tela.
  - Executa mutacoes de dados com validacao e feedback ao usuario.
  - Renderiza UI reativa orientada pelo estado atual dos providers/controladores.

### Modulo: `relatorio`

#### `lib/presentation/screens/relatorio/relatorio_diario_screen.dart`
- Classes: RelatorioDiarioScreen (StatelessWidget)
- Titulos de AppBar: N/A
- Providers usados na tela: N/A
- Servicos usados diretamente: N/A
- Metodos/funcoes locais: build
- Leitura tecnica do fluxo:
  - Renderiza UI reativa orientada pelo estado atual dos providers/controladores.

### Modulo: `relatorios`

#### `lib/presentation/screens/relatorios/relatorios_dia_screen.dart`
- Classes: RelatoriosDiaScreen (StatelessWidget), _RelatorioCard (StatelessWidget), _Stat (StatelessWidget), _RelatorioDetalheScreen (StatelessWidget), _InfoLinha (StatelessWidget)
- Titulos de AppBar: Relatório do Dia, Relatório — ${dateFmt.format(relatorio.turnoIniciadoEm)}
- Providers usados na tela: EventoTurnoProvider
- Servicos usados diretamente: N/A
- Metodos/funcoes locais: build, _buildVazio, _confirmarExclusao, _compartilhar, _gerarTexto, _verDetalhes, _fmtDuracao
- Leitura tecnica do fluxo:
  - Oferece saida textual/compartilhamento para comunicacao e auditoria.
  - Renderiza UI reativa orientada pelo estado atual dos providers/controladores.

### Modulo: `splash`

#### `lib/presentation/screens/splash/splash_screen.dart`
- Classes: SplashScreen (StatefulWidget), _SplashScreenState (State<SplashScreen>)
- Titulos de AppBar: N/A
- Providers usados na tela: N/A
- Servicos usados diretamente: N/A
- Metodos/funcoes locais: initState, _checkAuth, build
- Leitura tecnica do fluxo:
  - Inicializa estado local e dispara carregamento inicial quando necessario.
  - Inclui rotinas de leitura/sincronizacao de dados para montar a tela.
  - Renderiza UI reativa orientada pelo estado atual dos providers/controladores.

### Modulo: `timeline`

#### `lib/presentation/screens/timeline/timeline_screen.dart`
- Classes: TimelineScreen (StatelessWidget), _EventoCard (StatelessWidget)
- Titulos de AppBar: Timeline de Hoje
- Providers usados na tela: EventoTurnoProvider, AuthProvider
- Servicos usados diretamente: N/A
- Metodos/funcoes locais: build, _buildVazia, _buildLista, _confirmarFinalTurno, _exportarTimeline
- Leitura tecnica do fluxo:
  - Oferece saida textual/compartilhamento para comunicacao e auditoria.
  - Renderiza UI reativa orientada pelo estado atual dos providers/controladores.

## 5) Funcoes de Negocio por Provider

### `lib/presentation/providers/alocacao_provider.dart`
- Classe(s): AlocacaoProvider
- API publica/local mapeada: isIntervaloMarcado, isAguardandoIntervalo, isAguardandoRealocacaoPosIntervalo, marcarAguardandoIntervalo, desmarcarAguardandoIntervalo, marcarAguardandoRealocacaoPosIntervalo, desmarcarAguardandoRealocacaoPosIntervalo, vincularEscala, _iniciarTimerSaidas, _verificarSaidasAutomaticas, marcarIntervaloFeito, loadAlocacoes, watchAlocacoes, alocarColaborador, fecharDialogExcecao, liberarAlocacao, retornarDeCafe, realocarPosIntervalo, getAlocacoesCaixa, getAlocacoesAtivas, getAlocacoesLiberadas, dispose

### `lib/presentation/providers/auth_provider.dart`
- Classe(s): AuthProvider
- API publica/local mapeada: _initializeAuth, signInWithEmail, signUpWithEmail, signOut, resetPassword, clearError

### `lib/presentation/providers/cafe_provider.dart`
- Classe(s): CafeProvider
- API publica/local mapeada: toMap, dispose, colaboradorEmPausa, colaboradorJaFezIntervaloHoje, load, _verificarAlertasEAtualizar, iniciarPausa, finalizarPausa, finalizarPausaComRegra, removerRegistro, limparHistorico

### `lib/presentation/providers/caixa_provider.dart`
- Classe(s): CaixaProvider
- API publica/local mapeada: loadCaixas, watchCaixas, toggleStatus, toggleManutencao, toggleFiltroAtivos, _applyFilters, upsertCaixa, deleteCaixa, clearError

### `lib/presentation/providers/checklist_provider.dart`
- Classe(s): ChecklistProvider
- API publica/local mapeada: toMap, foiConcluidoHoje, estaNoJanela, deveNotificarAgora, load, _loadTemplates, _loadExecucoes, adicionarTemplate, atualizarTemplate, deletarTemplate, _upsertTemplate, iniciar, toggleItem, concluir, _upsert, _seedTemplates, _buildDefaults

### `lib/presentation/providers/colaborador_provider.dart`
- Classe(s): ColaboradorProvider
- API publica/local mapeada: loadColaboradores, watchColaboradores, createColaborador, updateColaborador, deleteColaborador, setFiltro, setSearchQuery, _applyFilters, clearFilters, clearError

### `lib/presentation/providers/entrega_provider.dart`
- Classe(s): EntregaProvider
- API publica/local mapeada: toMap, load, adicionarEntrega, atualizarEntrega, atualizarStatus, removerEntrega, _upsert

### `lib/presentation/providers/escala_provider.dart`
- Classe(s): EscalaProvider
- API publica/local mapeada: toMap, load, getTurnosByData, adicionarOuAtualizarTurno, removerTurno, _dateKey, _parseTime, gerarEscalaDaSemana, limparDia

### `lib/presentation/providers/evento_turno_provider.dart`
- Classe(s): EventoTurnoProvider
- API publica/local mapeada: load, registrar, encerrarTurno, removerRelatorio

### `lib/presentation/providers/fiscal_provider.dart`
- Classe(s): FiscalProvider
- API publica/local mapeada: loadProfile, watchProfile, updateProfile, clearError, clear

### `lib/presentation/providers/formulario_provider.dart`
- Classe(s): FormularioProvider
- API publica/local mapeada: respostasPorFormulario, totalRespostasPorFormulario, respostasHoje, load, adicionarFormulario, atualizarFormulario, deletarFormulario, duplicarTemplate, toggleAtivo, adicionarResposta, deletarResposta, _upsertF, _tmplUuid, _seedTemplates, _buildTemplates

### `lib/presentation/providers/guia_rapido_provider.dart`
- Classe(s): GuiaRapidoProvider
- API publica/local mapeada: toMap, load, adicionar, atualizar, deletar

### `lib/presentation/providers/nota_provider.dart`
- Classe(s): NotaProvider
- API publica/local mapeada: setFiltroTipo, setMostrarApenasPendentes, setSearchQuery, setOrdenacao, limparFiltros, load, adicionarNota, atualizarNota, toggleConcluida, toggleImportante, toggleLembreteAtivo, deletarNota, _notifId, _agendarNotificacao, _upsert, _toMap

### `lib/presentation/providers/notificacao_provider.dart`
- Classe(s): NotificacaoProvider
- API publica/local mapeada: adicionarNotificacao, marcarComoLida, marcarTodasComoLidas, removerNotificacao, limparNotificacoes

### `lib/presentation/providers/ocorrencia_provider.dart`
- Classe(s): OcorrenciaProvider
- API publica/local mapeada: load, registrar, atualizar, resolver, deletar, _upsert

### `lib/presentation/providers/outro_setor_provider.dart`
- Classe(s): OutroSetorProvider
- API publica/local mapeada: isNaLista, load, adicionar, remover

### `lib/presentation/providers/pacote_plantao_provider.dart`
- Classe(s): PacotePlantaoProvider
- API publica/local mapeada: isNaLista, load, adicionar, remover

### `lib/presentation/providers/passagem_turno_provider.dart`
- Classe(s): PassagemTurnoProvider
- API publica/local mapeada: load, registrar, deletar, _upsert

### `lib/presentation/providers/procedimento_provider.dart`
- Classe(s): ProcedimentoProvider
- API publica/local mapeada: countByCategoria, setSearchQuery, setFiltroCategoria, load, adicionarProcedimento, toggleFavorito, editarProcedimento, removerProcedimento, _upsert, _seedProcedimentos, _buildTemplates

### `lib/presentation/providers/registro_ponto_provider.dart`
- Classe(s): RegistroPontoProvider
- API publica/local mapeada: loadRegistros, createRegistroPonto, updateRegistroPonto, deleteRegistroPonto, importarBatch, clear

## 6) Funcoes de Infra e Servicos

### `lib/data/services/anexo_upload_service.dart`
- Classe(s): AnexoSelecionado, AnexoUploadService
- Funcoes/methods: selecionarFoto, selecionarArquivo, upload, _sanitizarNome, _contentType

### `lib/data/services/cupom_config_service.dart`
- Classe(s): CupomDadosConfig, CupomConfigService
- Funcoes/methods: toMap, _asDouble, carregar, salvar, restaurarPadrao

### `lib/data/services/notification_service.dart`
- Classe(s): NotificationService
- Funcoes/methods: initialize, showImmediateAlert, scheduleAlert, cancel, cancelAll

### `lib/data/services/seed_data_service.dart`
- Classe(s): SeedDataService
- Funcoes/methods: seedCaixas

## 7) Matriz de Dependencia (Provider x Telas)

### `AlocacaoProvider`
- `lib/presentation/screens/alocacao/alocacao_screen.dart`
- `lib/presentation/screens/cafe/cafe_screen.dart`
- `lib/presentation/screens/colaboradores/colaborador_detail_screen.dart`
- `lib/presentation/screens/colaboradores/colaboradores_list_screen.dart`
- `lib/presentation/screens/dashboard/dashboard_screen.dart`
- `lib/presentation/screens/gestao/gestao_screen.dart`
- `lib/presentation/screens/gestao/visao_gargalo_screen.dart`
- `lib/presentation/screens/mapa/mapa_caixas_screen.dart`

### `AuthProvider`
- `lib/presentation/screens/alocacao/alocacao_screen.dart`
- `lib/presentation/screens/auth/login_screen.dart`
- `lib/presentation/screens/auth/register_screen.dart`
- `lib/presentation/screens/cafe/cafe_screen.dart`
- `lib/presentation/screens/caixas/caixa_form_screen.dart`
- `lib/presentation/screens/caixas/caixas_list_screen.dart`
- `lib/presentation/screens/checklist/checklist_execucao_screen.dart`
- `lib/presentation/screens/colaboradores/colaborador_form_screen.dart`
- `lib/presentation/screens/colaboradores/colaboradores_list_screen.dart`
- `lib/presentation/screens/dashboard/dashboard_screen.dart`
- `lib/presentation/screens/entregas/entrega_detail_screen.dart`
- `lib/presentation/screens/entregas/entrega_form_screen.dart`
- `lib/presentation/screens/formularios/formulario_preenchimento_screen.dart`
- `lib/presentation/screens/gestao/gestao_screen.dart`
- `lib/presentation/screens/mapa/mapa_caixas_screen.dart`
- `lib/presentation/screens/notas/nota_form_screen.dart`
- `lib/presentation/screens/ocorrencias/ocorrencia_detail_screen.dart`
- `lib/presentation/screens/ocorrencias/ocorrencia_form_screen.dart`
- `lib/presentation/screens/ocorrencias/ocorrencias_screen.dart`
- `lib/presentation/screens/timeline/timeline_screen.dart`

### `CafeProvider`
- `lib/presentation/screens/alocacao/alocacao_screen.dart`
- `lib/presentation/screens/cafe/cafe_screen.dart`
- `lib/presentation/screens/dashboard/dashboard_screen.dart`
- `lib/presentation/screens/gestao/gestao_screen.dart`
- `lib/presentation/screens/gestao/visao_gargalo_screen.dart`
- `lib/presentation/screens/mapa/mapa_caixas_screen.dart`

### `CaixaProvider`
- `lib/presentation/screens/alocacao/alocacao_screen.dart`
- `lib/presentation/screens/cafe/cafe_screen.dart`
- `lib/presentation/screens/caixas/caixa_form_screen.dart`
- `lib/presentation/screens/caixas/caixas_list_screen.dart`
- `lib/presentation/screens/colaboradores/colaboradores_list_screen.dart`
- `lib/presentation/screens/dashboard/dashboard_screen.dart`
- `lib/presentation/screens/mapa/mapa_caixas_screen.dart`

### `ChecklistProvider`
- `lib/presentation/screens/checklist/checklist_execucao_screen.dart`
- `lib/presentation/screens/checklist/checklist_screen.dart`
- `lib/presentation/screens/checklist/checklist_template_form_screen.dart`
- `lib/presentation/screens/dashboard/dashboard_screen.dart`

### `ColaboradorProvider`
- `lib/presentation/screens/alocacao/alocacao_screen.dart`
- `lib/presentation/screens/cafe/cafe_screen.dart`
- `lib/presentation/screens/colaboradores/colaborador_form_screen.dart`
- `lib/presentation/screens/colaboradores/colaboradores_list_screen.dart`
- `lib/presentation/screens/dashboard/dashboard_screen.dart`
- `lib/presentation/screens/escala/escala_screen.dart`
- `lib/presentation/screens/escala/escala_turno_form_screen.dart`
- `lib/presentation/screens/escala/importar_escala_screen.dart`
- `lib/presentation/screens/mapa/mapa_caixas_screen.dart`

### `EntregaProvider`
- `lib/presentation/screens/dashboard/dashboard_screen.dart`
- `lib/presentation/screens/entregas/entrega_detail_screen.dart`
- `lib/presentation/screens/entregas/entrega_form_screen.dart`
- `lib/presentation/screens/entregas/entregas_screen.dart`

### `EscalaProvider`
- `lib/presentation/screens/alocacao/alocacao_screen.dart`
- `lib/presentation/screens/cafe/cafe_screen.dart`
- `lib/presentation/screens/dashboard/dashboard_screen.dart`
- `lib/presentation/screens/escala/escala_dia_screen.dart`
- `lib/presentation/screens/escala/escala_screen.dart`
- `lib/presentation/screens/escala/escala_turno_form_screen.dart`
- `lib/presentation/screens/gestao/gestao_screen.dart`
- `lib/presentation/screens/gestao/visao_gargalo_screen.dart`
- `lib/presentation/screens/mapa/mapa_caixas_screen.dart`

### `EventoTurnoProvider`
- `lib/presentation/screens/alocacao/alocacao_screen.dart`
- `lib/presentation/screens/cafe/cafe_screen.dart`
- `lib/presentation/screens/checklist/checklist_execucao_screen.dart`
- `lib/presentation/screens/dashboard/dashboard_screen.dart`
- `lib/presentation/screens/entregas/entrega_detail_screen.dart`
- `lib/presentation/screens/entregas/entrega_form_screen.dart`
- `lib/presentation/screens/formularios/formulario_preenchimento_screen.dart`
- `lib/presentation/screens/notas/nota_form_screen.dart`
- `lib/presentation/screens/ocorrencias/ocorrencia_detail_screen.dart`
- `lib/presentation/screens/ocorrencias/ocorrencia_form_screen.dart`
- `lib/presentation/screens/ocorrencias/ocorrencias_screen.dart`
- `lib/presentation/screens/relatorios/relatorios_dia_screen.dart`
- `lib/presentation/screens/timeline/timeline_screen.dart`

### `FiscalProvider`
- `lib/presentation/screens/configuracoes/configuracoes_screen.dart`
- `lib/presentation/screens/dashboard/dashboard_screen.dart`
- `lib/presentation/screens/folga/folga_screen.dart`
- `lib/presentation/screens/profile/profile_screen.dart`

### `FormularioProvider`
- `lib/presentation/screens/dashboard/dashboard_screen.dart`
- `lib/presentation/screens/formularios/formulario_editor_screen.dart`
- `lib/presentation/screens/formularios/formulario_preenchimento_screen.dart`
- `lib/presentation/screens/formularios/formulario_respostas_screen.dart`
- `lib/presentation/screens/formularios/formularios_screen.dart`

### `GuiaRapidoProvider`
- `lib/presentation/screens/guia_rapido/guia_rapido_form_screen.dart`
- `lib/presentation/screens/guia_rapido/guia_rapido_screen.dart`

### `NotaProvider`
- `lib/presentation/screens/dashboard/dashboard_screen.dart`
- `lib/presentation/screens/notas/nota_detail_screen.dart`
- `lib/presentation/screens/notas/nota_form_screen.dart`
- `lib/presentation/screens/notas/notas_screen.dart`

### `NotificacaoProvider`
- `lib/presentation/screens/notificacoes/notificacoes_screen.dart`

### `OcorrenciaProvider`
- `lib/presentation/screens/cafe/cafe_screen.dart`
- `lib/presentation/screens/dashboard/dashboard_screen.dart`
- `lib/presentation/screens/ocorrencias/ocorrencia_detail_screen.dart`
- `lib/presentation/screens/ocorrencias/ocorrencia_form_screen.dart`
- `lib/presentation/screens/ocorrencias/ocorrencias_screen.dart`

### `OutroSetorProvider`
- `lib/presentation/screens/alocacao/alocacao_screen.dart`
- `lib/presentation/screens/mapa/mapa_caixas_screen.dart`

### `PacotePlantaoProvider`
- `lib/presentation/screens/alocacao/alocacao_screen.dart`
- `lib/presentation/screens/mapa/mapa_caixas_screen.dart`

### `PassagemTurnoProvider`
- `lib/presentation/screens/dashboard/dashboard_screen.dart`
- `lib/presentation/screens/passagem_turno/passagem_turno_screen.dart`

### `ProcedimentoProvider`
- `lib/presentation/screens/dashboard/dashboard_screen.dart`
- `lib/presentation/screens/procedimentos/procedimento_detail_screen.dart`
- `lib/presentation/screens/procedimentos/procedimento_form_screen.dart`
- `lib/presentation/screens/procedimentos/procedimentos_screen.dart`

### `RegistroPontoProvider`
- `lib/presentation/screens/colaboradores/colaborador_detail_screen.dart`
- `lib/presentation/screens/colaboradores/registro_ponto_form_screen.dart`
- `lib/presentation/screens/escala/escala_turno_form_screen.dart`
- `lib/presentation/screens/escala/importar_escala_screen.dart`

## 8) Observacoes de Escopo
- Este documento descreve o que esta implementado no codigo atual.
- Metodos privados de apoio visual (helpers de widget) tambem foram listados para manter rastreabilidade tecnica completa.
- Pastas de `widgets` foram deixadas fora da secao tela-a-tela para manter foco em telas/fluxos principais; os widgets internos definidos nos mesmos arquivos de tela continuam cobertos.

