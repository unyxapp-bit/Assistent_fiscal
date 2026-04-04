# Matriz de Paridade Flutter (Legado) x Web (Atual)

Atualizado em: 2026-04-04
Base legado: `DOCUMENTACAO_TELAS_E_FUNCOES_COMPLETA.md`
Base atual: codigo de `src/` e rotas em `src/app/App.tsx`

## Legenda de Status
- `OK`: tela/funcao reescrita com paridade funcional alta.
- `PARCIAL`: existe equivalente, mas com simplificacao, fusao de telas ou ausencia de partes do fluxo antigo.
- `FALTANDO`: sem equivalente funcional claro no app web atual.

## Matriz de Telas (56 telas legadas)

| Modulo legado | Tela Flutter | Equivalente web atual | Status | Observacoes de paridade |
|---|---|---|---|---|
| alocacao | alocacao_screen | `AlocacaoPage` (`/alocacao`) | PARCIAL | Fluxo com alocar/liberar + troca rapida, excecao com justificativa e retorno pos-intervalo; ainda sem 100% dos fluxos secundarios do legado. |
| auth | login_screen | `LoginPage` (`/login`) | OK | Fluxo de login com Supabase implementado. |
| auth | register_screen | `RegisterPage` (`/register`) | OK | Fluxo de cadastro implementado. |
| cafe | cafe_screen | `CafePage` (`/cafe`) | PARCIAL | Iniciar/finalizar pausa com regra de intervalo extra, finalizacao antecipada auditada e limpeza de historico; ainda sem paridade total dos dialogs antigos. |
| caixas | caixa_form_screen | `CaixasPage` (`/caixas`) | PARCIAL | Formulario foi incorporado na tela unica. |
| caixas | caixas_list_screen | `CaixasPage` (`/caixas`) | PARCIAL | Lista/filtros/status/manutencao/delete implementados em tela unica. |
| checklist | checklist_execucao_screen | `ChecklistExecucaoPage` (`/checklists/execucao/:execId`) | OK | Execucao com progresso e conclusao implementada. |
| checklist | checklist_screen | `ChecklistPage` (`/checklists`) | OK | Lista de templates e execucoes implementada. |
| checklist | checklist_template_form_screen | `ChecklistTemplateFormPage` (`/checklists/novo`, `/checklists/:id/editar`) | OK | Criar/editar template implementado. |
| colaboradores | colaborador_detail_screen | `ColaboradorDetailPage` (`/colaboradores/:id`) | PARCIAL | Detalhe existe, mas sem o mesmo conjunto completo de consultas/acoes do legado. |
| colaboradores | colaborador_form_screen | `ColaboradoresPage` (`/colaboradores`) | PARCIAL | Formulario foi embutido na lista; sem tela separada de form. |
| colaboradores | colaboradores_list_screen | `ColaboradoresPage` (`/colaboradores`) | PARCIAL | Lista/filtros/status/delete implementados em tela unica. |
| colaboradores | registro_ponto_form_screen | `EscalaDiaPage` e area de registro rapido em `ColaboradorDetailPage` | PARCIAL | Registro de ponto existe, mas fluxo/tela nao sao equivalentes 1:1. |
| configuracoes | configuracoes_screen | `ConfiguracoesPage` (`/configuracoes`) | PARCIAL | Configs principais existem, mas com escopo menor. |
| configuracoes | cupom_config_screen | `CupomConfigPage` (`/cupom`) | PARCIAL | Configuracao existe, porem preview/regras ricas do legado foram simplificadas. |
| dashboard | dashboard_screen | `DashboardHome` (`/`) | PARCIAL | Dashboard existe; briefing/inicio de turno do legado nao tem paridade completa. |
| entregas | entrega_detail_screen | `EntregaDetailPage` (`/entregas/:id`) | PARCIAL | Detalhe e transicoes de status existem; fluxo completo antigo nao e 1:1. |
| entregas | entrega_form_screen | `EntregaFormPage` (`/entregas/nova`) | PARCIAL | Criacao existe; importacao CSV citada no legado nao foi portada. |
| entregas | entregas_screen | `EntregasPage` (`/entregas`) | PARCIAL | Listagem/filtros/status existem, com simplificacoes. |
| escala | escala_dia_screen | `EscalaDiaPage` (`/escala/dia/:data`) | PARCIAL | Gestao por dia existe, com simplificacoes de fluxo. |
| escala | escala_screen | `EscalaPage` (`/escala`) | PARCIAL | Visao semanal com validacao de cobertura por periodo e geracao automatica basica; ainda sem equivalencia total da tela dedicada de turno do legado. |
| escala | escala_turno_form_screen | `EscalaDiaPage` | PARCIAL | Funcao absorvida na tela do dia, sem tela dedicada equivalente. |
| escala | importar_escala_screen | `ImportarEscalaPage` (`/escala/importar`) | OK | Importacao textual com previa implementada. |
| folga | folga_screen | `FolgaPage` (`/folga`) | PARCIAL | Tela existe, mas com indicacao de integracao ainda em andamento. |
| formularios | formulario_editor_screen | `FormularioEditorPage` (`/formularios/novo`, `/formularios/:id/editar`) | OK | Editor de formulario implementado. |
| formularios | formulario_preenchimento_screen | `FormularioPreenchimentoPage` (`/formularios/:id/preencher`) | OK | Preenchimento implementado. |
| formularios | formulario_respostas_screen | `FormularioRespostasPage` (`/formularios/:id/respostas`) | OK | Respostas e exclusao implementadas. |
| formularios | formularios_screen | `FormulariosPage` (`/formularios`) | PARCIAL | Lista/CRUD base existem; capacidades avancadas do provider legado (ex.: duplicacao/toggle) nao estao equivalentes. |
| gestao | gargalo_calculator | `GargaloCalculatorPage` (`/gestao/gargalo-calculadora`) | OK | Utilitario dedicado implementado no web com calculo por setor e risco de gargalo. |
| gestao | gestao_screen | `GestaoPage` (`/gestao`) | PARCIAL | Painel existe, mas arquitetura e escopo foram simplificados. |
| gestao | visao_gargalo_screen | aba "Visao" em `GestaoPage` | PARCIAL | Existe visao de risco simplificada, sem paridade total com a tela antiga. |
| guia_rapido | guia_rapido_form_screen | `GuiaRapidoFormPage` (`/guia-rapido/novo`, `/guia-rapido/:id/editar`) | PARCIAL | Fluxo existe, mas acoplado a `procedimentos` (categoria `guia_rapido`). |
| guia_rapido | guia_rapido_screen | `GuiaRapidoPage` (`/guia-rapido`) | PARCIAL | Visao existe, porem com composicao diferente do legado. |
| mapa | mapa_caixas_screen | `MapaCaixasPage` (`/mapa`) | PARCIAL | Mapa existe com plantao/outro setor; parte das acoes antigas foi simplificada. |
| notas | nota_detail_screen | `NotaDetailPage` (`/notas/:id`) | PARCIAL | Detalhe e edicao existem; fluxo de compartilhamento/saida textual nao e equivalente total. |
| notas | nota_form_screen | `NotaFormPage` (`/notas/nova`) | PARCIAL | Formulario com upload de foto/arquivo implementado; paridade geral ainda parcial. |
| notas | notas_screen | `NotasPage` (`/notas`) | PARCIAL | Lista/filtros/status existem; paridade incompleta com funcoes antigas. |
| notificacoes | notificacoes_screen | `NotificacoesPage` (`/notificacoes`) | PARCIAL | Feed com estado local por fiscal (lida/nao lida, remover e limpar) implementado; ainda sem sincronizacao cross-device. |
| ocorrencias | ocorrencia_detail_screen | `OcorrenciaDetailPage` (`/ocorrencias/:id`) | PARCIAL | Detalhe com exibicao de anexos implementado; paridade geral ainda parcial. |
| ocorrencias | ocorrencia_form_screen | `OcorrenciaFormPage` (`/ocorrencias/nova`) | PARCIAL | Registro com upload de foto/arquivo implementado; paridade geral ainda parcial. |
| ocorrencias | ocorrencias_screen | `OcorrenciasPage` (`/ocorrencias`) | PARCIAL | Lista/filtros/resolucao existem, com simplificacoes. |
| passagem_turno | passagem_turno_screen | `PassagemTurnoPage` (`/passagem-turno`) | OK | Registro/lista/copia/exclusao implementados. |
| pizzaria | cupom_widget | `CupomPedidoPage` (`/pizzaria/cupom/:id`) | PARCIAL | Cupom com copia/impressao e exibicao de itens estruturados implementado; ainda sem todos os atalhos do legado. |
| pizzaria | novo_pedido_screen | `NovoPedidoPage` (`/pizzaria/novo`) | PARCIAL | Criacao com composicao de itens por cardapio/quantidade/obs implementada; ainda sem editor avancado completo do legado. |
| pizzaria | pedidos_list_screen | `PedidosPage` (`/pizzaria/pedidos`) | PARCIAL | Lista/status/cupom/excluir e preview de itens implementados; ainda sem fluxo completo de edicao detalhada legado. |
| pizzaria | pizza_models | `pizzaria/api.ts` | PARCIAL | Camada de dados com CRUD principal e serializacao de itens em `observacoes`; sem modelo dedicado de itens no backend. |
| pizzaria | pizza_module_screen | `PizzariaHub` (`/pizzaria`) | OK | Hub de entrada da pizzaria existe. |
| pizzaria | pizzas_cadastro_screen | `PizzasCadastroPage` (`/pizzaria/pizzas`) | PARCIAL | Cadastro/lista/ativacao existem; sem delete equivalente explicito. |
| procedimentos | procedimento_detail_screen | `ProcedimentoDetailPage` (`/procedimentos/:id`) | PARCIAL | Detalhe existe com progresso local; funcoes de saida textual do legado nao estao completas. |
| procedimentos | procedimento_form_screen | `ProcedimentoFormPage` (`/procedimentos/novo`, `/procedimentos/:id/editar`) | OK | Criar/editar implementado. |
| procedimentos | procedimentos_screen | `ProcedimentosPage` (`/procedimentos`) | PARCIAL | Lista/filtros/favorito existem; algumas acoes antigas foram simplificadas. |
| profile | profile_screen | `ProfilePage` (`/perfil`) | PARCIAL | Perfil existe; parte das acoes foi deslocada para `ConfiguracoesPage`. |
| relatorio | relatorio_diario_screen | `RelatoriosPage` (`/relatorio-diario`) | PARCIAL | Funcao existe em tela unificada. |
| relatorios | relatorios_dia_screen | `RelatoriosPage` (`/relatorios`) | PARCIAL | Funcao existe em tela unificada/simplificada. |
| splash | splash_screen | `SplashScreen` + `SplashGate` | OK | Gate inicial e tela de splash implementados. |
| timeline | timeline_screen | `TimelinePage` (`/timeline`) | PARCIAL | Timeline/export/encerrar turno existem; paridade completa do ciclo de eventos antigos nao e total. |

## Resumo de Telas
- `OK`: 13
- `PARCIAL`: 43
- `FALTANDO`: 0
- Total legado analisado: 56 telas

## Matriz de Funcoes por Modulo (visao executiva)

| Modulo legado | Funcoes chave no legado | Situacao no web atual | Status |
|---|---|---|---|
| auth/splash | login, cadastro, reset, gate inicial | Fluxo completo com Supabase Auth e splash gate | OK |
| dashboard | painel + briefing/inicio de turno + indicadores | Painel e indicadores implementados; briefing/inicio de turno sem paridade completa | PARCIAL |
| alocacao | alocar, liberar, trocar, excecao, realocar pos-intervalo | Alocar/liberar/trocar/excecao/retorno pos-intervalo implementados; ainda restam ajustes finos de fluxos secundarios | PARCIAL |
| cafe | iniciar/finalizar pausa com regras operacionais | Fluxo com regras operacionais (intervalo extra, finalizacao com motivo, historico) implementado; paridade completa ainda parcial | PARCIAL |
| caixas | CRUD + manutencao + filtros | Criar/editar/status/manutencao/delete implementados | PARCIAL |
| colaboradores | CRUD + historico + ponto | Criar/editar/listar/detalhe/delete implementados; ainda sem separacao de telas original | PARCIAL |
| escala | semanal, dia, importar, gerar cobertura | Semanal/dia/importar + validacao de cobertura e geracao semanal basica implementadas; ainda sem paridade total das rotinas antigas | PARCIAL |
| mapa | ocupacao, plantao, outro setor, acoes taticas | Mapa + plantao/outro setor implementados; parte das acoes antigas simplificada | PARCIAL |
| entregas | CRUD + status + filtros + importacao | CRUD/status/filtros implementados; sem importacao CSV equivalente | PARCIAL |
| ocorrencias | CRUD + resolucao + anexos | CRUD/resolucao/anexos implementados; paridade geral ainda parcial | PARCIAL |
| notas | CRUD + lembretes + anexos + notificacao local | CRUD/lembretes/anexos implementados; ainda sem notificacao local equivalente | PARCIAL |
| checklists | templates, execucao, conclusao, periodicidade | Fluxo principal implementado | OK |
| formularios | templates, respostas, editor, preenchimento | Fluxo principal implementado; recursos avancados do legado estao reduzidos | PARCIAL |
| procedimentos | CRUD, favorito, detalhamento | Fluxo principal implementado com progresso local | PARCIAL |
| guia rapido | CRUD de guias operacionais | Implementado via categoria de procedimentos, nao em modulo totalmente isolado | PARCIAL |
| passagem de turno | registrar, listar, copiar, excluir | Implementado | OK |
| pizzaria | cardapio, pedidos, cupom/impressao, fluxo rico de itens | Cardapio/pedidos/cupom com composicao estruturada de itens implementados; ainda faltam fluxos avancados de edicao legado | PARCIAL |
| notificacoes | caixa de notificacoes com estado (lida, limpar) | Estado de leitura/remocao/limpeza implementado na tela (persistencia local por fiscal) | PARCIAL |
| timeline/relatorios | timeline + encerramento + relatorios dia/detalhe | Fluxo base implementado e unificado; detalhes do ciclo antigo simplificados | PARCIAL |
| configuracoes/profile/cupom | dados do fiscal, perfil e cupom | Implementado com escopo reduzido em relacao ao legado | PARCIAL |
| folga | planejamento/consulta de proximo turno | Tela existe, mas ainda com integracao indicada como pendente | PARCIAL |
| gestao/visao gargalo | analise de gargalos e utilitarios | Painel e utilitario dedicado implementados; ainda com simplificacao de escopo | PARCIAL |

## Conclusao objetiva
- O app web reescreveu a maior parte das telas/modulos legados em nivel de navegacao e fluxo base.
- Nao ha paridade funcional total com o Flutter antigo.
- Principais gaps atuais: fluxo avancado de edicao detalhada da pizzaria, sincronizacao cross-device das notificacoes e demais modulos ainda parciais.




