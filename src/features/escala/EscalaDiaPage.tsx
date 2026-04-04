import React, { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Card } from '../../shared/ui/Card';
import { Button } from '../../shared/ui/Button';
import { formatDate, formatTime, todayIsoDate } from '../../shared/lib/dates';
import { useEscala } from './useEscala';
import { getTurnoEscalaDate } from './api';

export default function EscalaDiaPage() {
  const { data: dataParam } = useParams();
  const navigate = useNavigate();
  const data = dataParam ?? todayIsoDate();

  const {
    colaboradores,
    registros,
    turnos,
    createRegistro,
    updateRegistro,
    deleteRegistro,
    deleteEscalaDia,
    creating,
    deletingDia,
  } = useEscala();

  const registrosDia = registros.filter((r) => r.data === data);
  const turnosDia = turnos.filter((turno) => getTurnoEscalaDate(turno) === data);

  const colaboradorMap = useMemo(
    () => new Map(colaboradores.map((c) => [c.id, c.nome])),
    [colaboradores]
  );

  const [colaboradorId, setColaboradorId] = useState('');
  const [entrada, setEntrada] = useState('');
  const [intervaloSaida, setIntervaloSaida] = useState('');
  const [intervaloRetorno, setIntervaloRetorno] = useState('');
  const [saida, setSaida] = useState('');
  const [observacao, setObservacao] = useState('');

  const [editId, setEditId] = useState<string | null>(null);
  const [editEntrada, setEditEntrada] = useState('');
  const [editIntervaloSaida, setEditIntervaloSaida] = useState('');
  const [editIntervaloRetorno, setEditIntervaloRetorno] = useState('');
  const [editSaida, setEditSaida] = useState('');
  const [editObservacao, setEditObservacao] = useState('');

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!colaboradorId) return;
    await createRegistro({
      colaborador_id: colaboradorId,
      data,
      entrada: entrada || null,
      intervalo_saida: intervaloSaida || null,
      intervalo_retorno: intervaloRetorno || null,
      saida: saida || null,
      observacao: observacao || null,
    });
    setEntrada('');
    setIntervaloSaida('');
    setIntervaloRetorno('');
    setSaida('');
    setObservacao('');
  };

  const startEdit = (registro: (typeof registrosDia)[number]) => {
    setEditId(registro.id);
    setEditEntrada(registro.entrada ?? '');
    setEditIntervaloSaida(registro.intervalo_saida ?? '');
    setEditIntervaloRetorno(registro.intervalo_retorno ?? '');
    setEditSaida(registro.saida ?? '');
    setEditObservacao(registro.observacao ?? '');
  };

  const saveEdit = async () => {
    if (!editId) return;
    await updateRegistro({
      id: editId,
      patch: {
        entrada: editEntrada || null,
        intervalo_saida: editIntervaloSaida || null,
        intervalo_retorno: editIntervaloRetorno || null,
        saida: editSaida || null,
        observacao: editObservacao || null,
      },
    });
    setEditId(null);
  };

  const handleExcluirDia = async () => {
    const registroIds = registrosDia.map((registro) => registro.id);
    const turnoIds = turnosDia.map((turno) => turno.id);
    const total = registroIds.length + turnoIds.length;

    if (total === 0) {
      window.alert('Nao ha escala cadastrada nesse dia para excluir.');
      return;
    }

    const confirmou = window.confirm(
      `Excluir escala do dia ${formatDate(data)}? Essa acao remove ${turnoIds.length} turno(s) e ${registroIds.length} registro(s) de ponto.`
    );
    if (!confirmou) return;

    await deleteEscalaDia({ registroIds, turnoIds });
    navigate('/escala');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-muted">Gestao</p>
          <h1 className="font-display text-3xl text-primary">Escala do dia</h1>
          <p className="text-sm text-muted mt-2">{formatDate(data)}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={() => void handleExcluirDia()} disabled={deletingDia}>
            Excluir dia
          </Button>
          <Link to="/escala">
            <Button variant="outline">Voltar</Button>
          </Link>
        </div>
      </div>

      <Card>
        <form className="grid grid-cols-1 md:grid-cols-6 gap-3" onSubmit={handleCreate}>
          <select
            value={colaboradorId}
            onChange={(e) => setColaboradorId(e.target.value)}
            className="rounded-xl border border-cloud px-4 py-2 md:col-span-2"
          >
            <option value="">Selecione colaborador</option>
            {colaboradores.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </select>
          <input
            type="time"
            value={entrada}
            onChange={(e) => setEntrada(e.target.value)}
            className="rounded-xl border border-cloud px-4 py-2"
          />
          <input
            type="time"
            value={intervaloSaida}
            onChange={(e) => setIntervaloSaida(e.target.value)}
            className="rounded-xl border border-cloud px-4 py-2"
            placeholder="Intervalo saida"
          />
          <input
            type="time"
            value={intervaloRetorno}
            onChange={(e) => setIntervaloRetorno(e.target.value)}
            className="rounded-xl border border-cloud px-4 py-2"
            placeholder="Intervalo retorno"
          />
          <input
            type="time"
            value={saida}
            onChange={(e) => setSaida(e.target.value)}
            className="rounded-xl border border-cloud px-4 py-2"
            placeholder="Saida"
          />
          <input
            value={observacao}
            onChange={(e) => setObservacao(e.target.value)}
            placeholder="Observacoes"
            className="rounded-xl border border-cloud px-4 py-2 md:col-span-4"
          />
          <Button type="submit" disabled={creating} className="md:col-span-2">
            Registrar ponto
          </Button>
        </form>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {registrosDia.length === 0 ? (
          <Card>Nenhum registro de ponto para este dia.</Card>
        ) : (
          registrosDia.map((registro) => (
            <Card key={registro.id} className="flex flex-col gap-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-display text-lg">
                    {colaboradorMap.get(registro.colaborador_id) ?? 'Colaborador'}
                  </h3>
                  <p className="text-sm text-muted">{formatDate(registro.data)}</p>
                </div>
                <Button size="sm" variant="ghost" onClick={() => deleteRegistro(registro.id)}>
                  Remover
                </Button>
              </div>

              {editId === registro.id ? (
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <input
                    type="time"
                    value={editEntrada}
                    onChange={(e) => setEditEntrada(e.target.value)}
                    className="rounded-xl border border-cloud px-3 py-2"
                  />
                  <input
                    type="time"
                    value={editSaida}
                    onChange={(e) => setEditSaida(e.target.value)}
                    className="rounded-xl border border-cloud px-3 py-2"
                  />
                  <input
                    type="time"
                    value={editIntervaloSaida}
                    onChange={(e) => setEditIntervaloSaida(e.target.value)}
                    className="rounded-xl border border-cloud px-3 py-2"
                  />
                  <input
                    type="time"
                    value={editIntervaloRetorno}
                    onChange={(e) => setEditIntervaloRetorno(e.target.value)}
                    className="rounded-xl border border-cloud px-3 py-2"
                  />
                  <input
                    value={editObservacao}
                    onChange={(e) => setEditObservacao(e.target.value)}
                    placeholder="Observacoes"
                    className="rounded-xl border border-cloud px-3 py-2 col-span-2"
                  />
                  <div className="flex gap-2 col-span-2">
                    <Button size="sm" variant="outline" onClick={saveEdit}>
                      Salvar
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditId(null)}>
                      Cancelar
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>Entrada: {formatTime(registro.entrada)}</div>
                  <div>Saida: {formatTime(registro.saida)}</div>
                  <div>Intervalo saida: {formatTime(registro.intervalo_saida)}</div>
                  <div>Intervalo retorno: {formatTime(registro.intervalo_retorno)}</div>
                  {registro.observacao ? (
                    <div className="text-xs text-muted col-span-2">Obs: {registro.observacao}</div>
                  ) : null}
                  <Button size="sm" variant="outline" onClick={() => startEdit(registro)}>
                    Editar
                  </Button>
                </div>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
