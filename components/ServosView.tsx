
import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { UserIcon, PhoneIcon, EditIcon, PlusCircleIcon, CheckCircleIcon, XCircleIcon } from './icons';
import { MINISTERIOS } from '../constants';
import type { MinisterioID, Servo } from '../types';
import ServoModal from './ServoModal';

const ServosView: React.FC = () => {
    const { servos, funcoes, hasPermission } = useData();
    const [filterMinisterio, setFilterMinisterio] = useState<MinisterioID | ''>('');
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingServo, setEditingServo] = useState<Servo | null>(null);

    const canManageServos = hasPermission('manageServos');

    const handleOpenModal = (servo: Servo | null) => {
        if (!canManageServos && servo !== null) return; // Disallow opening edit if cannot manage
        if (!canManageServos && servo === null) return; // Disallow opening new if cannot manage
        setEditingServo(servo);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setEditingServo(null);
        setIsModalOpen(false);
    };

    const filteredServos = servos.filter(servo => {
        const nameMatch = servo.nome.toLowerCase().includes(searchTerm.toLowerCase());
        if (!filterMinisterio) return nameMatch;
        const funcoesDoMinisterio = funcoes.filter(f => f.ministerioId === filterMinisterio).map(f => f.id);
        const hasFuncaoNoMinisterio = servo.funcoes.some(sf => funcoesDoMinisterio.includes(sf));
        return nameMatch && hasFuncaoNoMinisterio;
    });

    const inputStyle = "w-full p-2 rounded bg-black text-white placeholder-white/70 border border-gray-600 focus:border-accent focus:ring-accent focus:ring-1";

    return (
        <>
            <div className="space-y-4 animate-fade-in-up">
                {/* Filters */}
                <div className="bg-white/10 p-4 rounded-lg flex flex-col sm:flex-row gap-4">
                    <input
                        type="text"
                        placeholder="Buscar por nome..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={`${inputStyle} sm:w-1/2`}
                    />
                    <select
                        value={filterMinisterio}
                        onChange={(e) => setFilterMinisterio(e.target.value ? Number(e.target.value) as MinisterioID : '')}
                        className={`${inputStyle} sm:w-1/2`}
                    >
                        <option value="">Todos os Ministérios</option>
                        {MINISTERIOS.map(m => (
                            <option key={m.id} value={m.id}>{m.nome}</option>
                        ))}
                    </select>
                    {canManageServos && (
                        <button onClick={() => handleOpenModal(null)} className="bg-servo-yellow text-black px-4 py-2 rounded-lg font-bold flex items-center justify-center space-x-2 whitespace-nowrap">
                            <PlusCircleIcon size={20} />
                            <span>Novo Servo</span>
                        </button>
                    )}
                </div>

                {/* Servos List */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredServos.map(servo => (
                        <div key={servo.id} className="bg-white rounded-lg shadow-lg text-gray-800 p-4 flex flex-col space-y-3">
                            <div className="flex items-center space-x-4">
                               <img src={servo.fotoUrl || `https://picsum.photos/seed/${servo.id}/100/100`} alt={servo.nome} className="w-20 h-20 rounded-full object-cover border-4 border-bordeaux-light"/>
                               <div className="flex-grow">
                                    <h3 className="font-bold text-lg text-bordeaux">{servo.nome}</h3>
                                    <p className="text-sm text-gray-600 flex items-center space-x-1"><PhoneIcon size={14}/> <span>{servo.telefone}</span></p>
                                    <div className="flex items-center space-x-2 mt-1">
                                        {servo.ativo ? 
                                            <span className="text-xs font-semibold inline-flex items-center px-2.5 py-0.5 rounded-full bg-green-100 text-green-800"><CheckCircleIcon size={12} className="mr-1"/>Ativo</span> : 
                                            <span className="text-xs font-semibold inline-flex items-center px-2.5 py-0.5 rounded-full bg-red-100 text-red-800"><XCircleIcon size={12} className="mr-1"/>Inativo</span>
                                        }
                                    </div>
                               </div>
                               {canManageServos && (
                                   <button onClick={() => handleOpenModal(servo)} className="text-gray-500 hover:text-bordeaux"><EditIcon size={20}/></button>
                               )}
                            </div>
                            <div>
                                <h4 className="text-sm font-semibold text-gray-500 mb-1">Funções:</h4>
                                <div className="flex flex-wrap gap-2">
                                    {servo.funcoes.map(funcaoId => {
                                        const funcao = funcoes.find(f => f.id === funcaoId);
                                        return <span key={funcaoId} className="text-xs bg-gray-200 text-gray-800 px-2 py-1 rounded-full">{funcao?.nome}</span>;
                                    })}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            {isModalOpen && <ServoModal servoToEdit={editingServo} onClose={handleCloseModal} />}
        </>
    );
};

export default ServosView;