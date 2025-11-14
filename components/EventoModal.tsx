
import React, { useState, useEffect } from 'react';
import { useData } from '../contexts/DataContext';
import type { Evento } from '../types';
import { XCircleIcon } from './icons';

interface EventoModalProps {
  eventoToEdit: Evento | null;
  onClose: () => void;
}

const DEFAULT_EVENTO_STATE: Omit<Evento, 'id' | 'escalas'> = {
    titulo: '',
    dataInicio: new Date().toISOString().split('T')[0],
    dataFim: new Date().toISOString().split('T')[0],
    local: '',
};

const EventoModal: React.FC<EventoModalProps> = ({ eventoToEdit, onClose }) => {
    const { addEvento, updateEvento } = useData();
    const [eventoData, setEventoData] = useState<Omit<Evento, 'id' | 'escalas'> & { id?: number }>(DEFAULT_EVENTO_STATE);

    useEffect(() => {
        if (eventoToEdit) {
            setEventoData(eventoToEdit);
        } else {
            setEventoData(DEFAULT_EVENTO_STATE);
        }
    }, [eventoToEdit]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setEventoData(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (new Date(eventoData.dataFim) < new Date(eventoData.dataInicio)) {
            alert('A data final não pode ser anterior à data inicial.');
            return;
        }

        if (eventoData.id) {
            const originalEvent = eventoToEdit;
            const updatedEvent: Evento = {
                ...(originalEvent as Evento),
                ...eventoData,
            }
            updateEvento(updatedEvent);
        } else {
            addEvento(eventoData);
        }
        onClose();
    };

    const inputClasses = "block w-full rounded-md border-0 py-2.5 px-3 bg-black text-white shadow-sm ring-1 ring-inset ring-gray-700 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-accent sm:text-sm";

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-lg shadow-2xl text-black w-full max-w-md max-h-[90vh] flex flex-col">
                <header className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-xl font-bold text-bordeaux font-display">
                        {eventoToEdit ? 'Editar Evento' : 'Criar Novo Evento'}
                    </h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 transition-colors">
                        <XCircleIcon size={24} className="text-gray-500" />
                    </button>
                </header>

                <form id="evento-form" onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-grow space-y-6">
                    <div className="relative">
                        <label htmlFor="titulo" className="absolute -top-2 left-2 inline-block bg-white px-1 text-xs font-medium text-gray-900">Título do Evento</label>
                        <input type="text" name="titulo" id="titulo" value={eventoData.titulo} onChange={handleChange} required className={inputClasses} />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="relative">
                            <label htmlFor="dataInicio" className="absolute -top-2 left-2 inline-block bg-white px-1 text-xs font-medium text-gray-900">Data de Início</label>
                            <input type="date" name="dataInicio" id="dataInicio" value={eventoData.dataInicio} onChange={handleChange} required className={inputClasses} />
                        </div>
                        <div className="relative">
                             <label htmlFor="dataFim" className="absolute -top-2 left-2 inline-block bg-white px-1 text-xs font-medium text-gray-900">Data Final</label>
                            <input type="date" name="dataFim" id="dataFim" value={eventoData.dataFim} onChange={handleChange} required className={inputClasses} />
                        </div>
                    </div>
                    
                    <div className="relative">
                        <label htmlFor="local" className="absolute -top-2 left-2 inline-block bg-white px-1 text-xs font-medium text-gray-900">Local do Evento</label>
                        <input type="text" name="local" id="local" value={eventoData.local} onChange={handleChange} required className={inputClasses} />
                    </div>
                </form>

                <footer className="p-4 border-t flex justify-end items-center space-x-4">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">Cancelar</button>
                    <button type="submit" form="evento-form" className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">Salvar Evento</button>
                </footer>
            </div>
        </div>
    );
};

export default EventoModal;