
import React, { useState, useEffect } from 'react';
import { useData } from '../contexts/DataContext';
import type { Escala, EscalaItem, MinisterioID } from '../types';
import { MINISTERIOS, FUNCOES, TURNOS } from '../constants';
import { PlusCircleIcon, TrashIcon, XCircleIcon } from './icons';

interface ScheduleModalProps {
  date: Date;
  onClose: () => void;
  canEdit: boolean;
}

const ScheduleModal: React.FC<ScheduleModalProps> = ({ date, onClose, canEdit }) => {
  const { getEscalaPorData, updateEscala, addEscala, servos } = useData();
  const dateString = date.toISOString().split('T')[0];
  const [schedule, setSchedule] = useState<Escala | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedMinisterio, setSelectedMinisterio] = useState<MinisterioID | ''>('');

  useEffect(() => {
    const existingSchedule = getEscalaPorData(dateString);
    if (existingSchedule) {
      setSchedule(existingSchedule);
      setIsEditing(true);
    } else {
      setSchedule({
        data: dateString,
        itens: [],
        publicado: false,
        observacoes: ''
      });
      setIsEditing(false);
    }
  }, [dateString, getEscalaPorData]);

  if (!schedule) return null;

  const handleAddItem = () => {
    if (!selectedMinisterio) return;
    const firstFuncao = FUNCOES.find(f => f.ministerioId === selectedMinisterio);
    if (!firstFuncao) return;

    const newItem: EscalaItem = {
      id: Date.now(),
      funcaoId: firstFuncao.id,
      servoId: 0,
      turnoId: TURNOS[0].id
    };
    setSchedule({ ...schedule, itens: [...schedule.itens, newItem] });
  };
  
  const handleItemChange = <K extends keyof EscalaItem>(index: number, field: K, value: EscalaItem[K]) => {
      const newItems = [...schedule.itens];
      newItems[index] = { ...newItems[index], [field]: value };
      setSchedule({ ...schedule, itens: newItems });
  };
  
  const handleRemoveItem = (id: number) => {
      setSchedule({ ...schedule, itens: schedule.itens.filter(item => item.id !== id) });
  };
  
  const handleSave = () => {
      if (!canEdit) return;
      if (isEditing) {
          updateEscala(schedule);
      } else {
          addEscala(schedule);
      }
      onClose();
  }

  const funcoesDoMinisterio = (ministerioId: MinisterioID) => FUNCOES.filter(f => f.ministerioId === ministerioId);
  const servosParaFuncao = (funcaoId: number) => servos.filter(s => s.ativo && s.funcoes.includes(funcaoId));
  const inputStyle = "p-2 border border-gray-700 rounded bg-black text-white disabled:opacity-70 disabled:bg-gray-800";


  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-lg shadow-2xl text-black w-full max-w-2xl max-h-[90vh] flex flex-col">
        <header className="p-4 border-b flex justify-between items-center">
            <h2 className="text-xl font-bold text-bordeaux font-display">
                Escala para {date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
            </h2>
            <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 transition-colors">
                <XCircleIcon size={24} className="text-gray-500" />
            </button>
        </header>

        <main className="p-4 overflow-y-auto flex-grow">
          <div className="space-y-4">
            {schedule.itens.map((item, index) => {
              const funcaoAtual = FUNCOES.find(f => f.id === item.funcaoId);
              const ministerioAtual = MINISTERIOS.find(m => m.id === funcaoAtual?.ministerioId);
              const funcoesDisponiveis = ministerioAtual ? funcoesDoMinisterio(ministerioAtual.id) : [];
              const servosDisponiveis = servosParaFuncao(item.funcaoId);
              
              return (
                  <div key={item.id} className="grid grid-cols-1 md:grid-cols-4 gap-2 items-center p-2 border rounded-md">
                      <select
                          value={ministerioAtual?.id || ''}
                          onChange={(e) => {
                              const newMinisterioId = Number(e.target.value) as MinisterioID;
                              const firstFuncao = FUNCOES.find(f => f.ministerioId === newMinisterioId);
                              handleItemChange(index, 'funcaoId', firstFuncao?.id || 0);
                          }}
                          className={`${inputStyle} col-span-1 md:col-span-1`}
                          disabled={!canEdit}
                      >
                           <option value="" disabled>Ministério</option>
                           {MINISTERIOS.map(m => <option key={m.id} value={m.id}>{m.nome}</option>)}
                      </select>
                       <select
                          value={item.funcaoId}
                          onChange={(e) => handleItemChange(index, 'funcaoId', Number(e.target.value))}
                          className={`${inputStyle} col-span-1 md:col-span-1`}
                          disabled={!ministerioAtual || !canEdit}
                      >
                           {funcoesDisponiveis.map(f => <option key={f.id} value={f.id}>{f.nome}</option>)}
                      </select>
                      <select
                          value={item.servoId}
                          onChange={(e) => handleItemChange(index, 'servoId', Number(e.target.value))}
                          className={`${inputStyle} col-span-1 md:col-span-1`}
                          disabled={!funcaoAtual || !canEdit}
                      >
                           <option value={0}>Selecione o servo</option>
                           {servosDisponiveis.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}
                      </select>
                      <div className="flex items-center gap-2 col-span-1 md:col-span-1">
                        <select
                           value={item.turnoId}
                           onChange={(e) => handleItemChange(index, 'turnoId', Number(e.target.value))}
                           className={`${inputStyle} flex-grow`}
                           disabled={!canEdit}
                        >
                          {TURNOS.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
                        </select>
                        {canEdit && (
                            <button onClick={() => handleRemoveItem(item.id)} className="text-red-500 p-2 hover:bg-red-100 rounded-full">
                               <TrashIcon size={18} />
                            </button>
                        )}
                      </div>
                  </div>
              );
            })}
          </div>
        {canEdit && (
            <>
              <div className="mt-4 flex items-center space-x-2">
                <select
                    value={selectedMinisterio}
                    onChange={(e) => setSelectedMinisterio(Number(e.target.value) as MinisterioID)}
                    className={`${inputStyle} flex-grow`}
                >
                    <option value="">Selecione um ministério para adicionar</option>
                    {MINISTERIOS.map(m => <option key={m.id} value={m.id}>{m.nome}</option>)}
                </select>
                <button
                    onClick={handleAddItem}
                    disabled={!selectedMinisterio}
                    className="flex items-center space-x-2 bg-bordeaux text-white px-4 py-2 rounded-lg hover:bg-bordeaux-light transition-colors disabled:bg-gray-400"
                >
                    <PlusCircleIcon size={20} />
                    <span>Adicionar</span>
                </button>
              </div>
              
               <div className="mt-4">
                  <label htmlFor="observacoes" className="block text-sm font-medium text-gray-700">Observações</label>
                  <textarea
                    id="observacoes"
                    rows={3}
                    className={`mt-1 block w-full shadow-sm sm:text-sm ${inputStyle}`}
                    value={schedule.observacoes}
                    onChange={(e) => setSchedule({...schedule, observacoes: e.target.value})}
                    disabled={!canEdit}
                  ></textarea>
                </div>
            </>
        )}
        </main>

        <footer className="p-4 border-t flex justify-end items-center space-x-4">
            {canEdit && (
                <label className="flex items-center space-x-2 text-sm">
                    <input
                        type="checkbox"
                        checked={schedule.publicado}
                        onChange={(e) => setSchedule({...schedule, publicado: e.target.checked})}
                        className="rounded text-bordeaux focus:ring-bordeaux"
                    />
                    <span>Publicar</span>
                </label>
            )}
            <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">Cancelar</button>
            {canEdit && (
                <button onClick={handleSave} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">Salvar Escala</button>
            )}
        </footer>
      </div>
    </div>
  );
};

export default ScheduleModal;