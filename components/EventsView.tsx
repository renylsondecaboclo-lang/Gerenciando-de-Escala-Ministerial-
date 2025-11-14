
import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { EventIcon, EditIcon, TrashIcon } from './icons';
import EventoModal from './EventoModal';
import type { Evento } from '../types';

interface EventsViewProps {
    onViewSchedule: (date: string) => void;
}

const EventsView: React.FC<EventsViewProps> = ({ onViewSchedule }) => {
    const { eventos, hasPermission, deleteEvento } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingEvento, setEditingEvento] = useState<Evento | null>(null);

    const canManageEvents = hasPermission('manageEventos');

    const handleOpenModal = (evento: Evento | null) => {
        setEditingEvento(evento);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setEditingEvento(null);
        setIsModalOpen(false);
    };

    const handleDelete = (eventoId: number) => {
        if (window.confirm('Tem certeza que deseja excluir este evento? Todas as escalas associadas serão perdidas.')) {
            deleteEvento(eventoId);
        }
    };

    const formatDateRange = (start: string, end: string) => {
        const startDate = new Date(start + 'T00:00:00');
        const endDate = new Date(end + 'T00:00:00');
        const startStr = startDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
        if (start === end) return startStr;
        const endStr = endDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
        return `${startStr} - ${endStr}`;
    };

    return (
        <>
            <div className="space-y-6 animate-fade-in-up">
                <div className="text-center">
                    <h2 className="text-3xl font-bold font-display text-white">Próximos Eventos</h2>
                    <p className="text-white/80">Planeje e organize as escalas para eventos especiais.</p>
                </div>
                
                <div className="bg-blue-600 p-6 rounded-lg shadow-2xl">
                    <div className="space-y-4">
                        {eventos.map(evento => (
                            <div key={evento.id} className="bg-white/90 text-bordeaux p-4 rounded-lg shadow-md flex items-start space-x-4 hover:shadow-lg transition-shadow">
                                <div className="bg-bordeaux text-white rounded-lg p-3 flex flex-col items-center justify-center">
                                    <span className="text-sm font-bold">{new Date(evento.dataInicio + 'T00:00:00').toLocaleString('pt-BR', { month: 'short' })}</span>
                                    <span className="text-2xl font-bold">{new Date(evento.dataInicio + 'T00:00:00').getDate()}</span>
                                </div>
                                <div className="flex-grow">
                                    <h3 className="font-bold text-xl">{evento.titulo}</h3>
                                    <p className="text-sm text-gray-600">{evento.local}</p>
                                    <p className="text-sm font-semibold text-bordeaux mt-1">{formatDateRange(evento.dataInicio, evento.dataFim)}</p>
                                </div>
                                <div className="flex flex-col items-end space-y-2">
                                    <button 
                                      onClick={() => onViewSchedule(evento.dataInicio)}
                                      className="bg-accent text-white px-3 py-1 rounded-full text-sm font-semibold hover:bg-opacity-80"
                                    >
                                        Ver Escala
                                    </button>
                                     {canManageEvents && (
                                        <div className="flex items-center space-x-2">
                                            <button onClick={() => handleOpenModal(evento)} className="text-gray-500 hover:text-bordeaux p-1"><EditIcon size={18}/></button>
                                            <button onClick={() => handleDelete(evento.id)} className="text-gray-500 hover:text-red-500 p-1"><TrashIcon size={18}/></button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {canManageEvents && (
                        <button onClick={() => handleOpenModal(null)} className="mt-6 w-full bg-black text-white py-3 rounded-lg font-bold text-lg flex items-center justify-center space-x-2 hover:bg-gray-800 transition-colors">
                            <EventIcon size={22} />
                            <span>Criar Novo Evento</span>
                        </button>
                    )}
                </div>
            </div>
            {isModalOpen && <EventoModal eventoToEdit={editingEvento} onClose={handleCloseModal} />}
        </>
    );
};

export default EventsView;
