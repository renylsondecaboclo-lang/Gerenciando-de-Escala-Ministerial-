
import React, { useState, useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import type { Escala, Servo, Funcao } from '../types';
import { XCircleIcon, WhatsAppIcon } from './icons';

interface ReminderModalProps {
  schedules: Escala[];
  title: string;
  onClose: () => void;
}

interface VolunteerDuty {
    servo: Servo;
    duties: {
        date: string;
        funcao: Funcao;
    }[];
}

const DEFAULT_MESSAGE_TEMPLATE = `Olá, {nome}! Paz! Passando para lembrar da sua escala. Você servirá em {escalas}.\n\nContamos com você!\n\nPara mais detalhes, acesse o aplicativo: {link}`;

const ReminderModal: React.FC<ReminderModalProps> = ({ schedules, title, onClose }) => {
    const { servos, funcoes } = useData();
    const [sentStatus, setSentStatus] = useState<Record<number, boolean>>({});
    const [messageTemplate, setMessageTemplate] = useState(DEFAULT_MESSAGE_TEMPLATE);

    const volunteersWithDuties = useMemo(() => {
        const dutiesMap = new Map<number, VolunteerDuty>();

        schedules.forEach(schedule => {
            schedule.itens.forEach(item => {
                const servo = servos.find(s => s.id === item.servoId);
                const funcao = funcoes.find(f => f.id === item.funcaoId);

                if (servo && funcao) {
                    if (!dutiesMap.has(servo.id)) {
                        dutiesMap.set(servo.id, { servo, duties: [] });
                    }
                    dutiesMap.get(servo.id)!.duties.push({ date: schedule.data, funcao });
                }
            });
        });
        
        return Array.from(dutiesMap.values()).sort((a, b) => a.servo.nome.localeCompare(b.servo.nome));

    }, [schedules, servos, funcoes]);
    
    const formatPhoneNumber = (phone: string) => {
        let cleaned = phone.replace(/\D/g, '');
        if (cleaned.length === 11 && cleaned.startsWith('0')) { // e.g., 0119...
            cleaned = cleaned.substring(1);
        }
        if ((cleaned.length === 10 || cleaned.length === 11) && !cleaned.startsWith('55')) { // Local number without country code
             cleaned = '55' + cleaned;
        }
        return cleaned;
    };
    
    const handleSendReminder = (volunteer: VolunteerDuty) => {
        const dutiesText = volunteer.duties.map(duty => {
            const date = new Date(duty.date + 'T00:00:00');
            const dayOfWeek = date.toLocaleDateString('pt-BR', { weekday: 'long' });
            return `*${duty.funcao.nome}* na ${dayOfWeek} (${date.toLocaleDateString('pt-BR', {day: '2-digit', month: '2-digit'})})`;
        }).join(' e ');

        const firstDutyDate = volunteer.duties[0]?.date;
        const appUrl = `${window.location.origin}${window.location.pathname}?view=escala&date=${firstDutyDate}`;

        const message = messageTemplate
            .replace('{nome}', volunteer.servo.nome)
            .replace('{escalas}', dutiesText)
            .replace('{link}', appUrl);
        
        const formattedPhone = formatPhoneNumber(volunteer.servo.telefone);
        const url = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
        
        window.open(url, '_blank');
        setSentStatus(prev => ({ ...prev, [volunteer.servo.id]: true }));
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-lg shadow-2xl text-black w-full max-w-2xl max-h-[90vh] flex flex-col">
                <header className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-xl font-bold text-bordeaux font-display">{title}</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 transition-colors">
                        <XCircleIcon size={24} className="text-gray-500" />
                    </button>
                </header>
                <main className="p-4 overflow-y-auto flex-grow space-y-4">
                    <div>
                        <label htmlFor="messageTemplate" className="block text-sm font-medium text-gray-700 mb-1">
                            Modelo da Mensagem
                        </label>
                        <textarea
                            id="messageTemplate"
                            rows={5}
                            className="w-full p-2 border border-gray-700 rounded-md bg-black text-white text-sm focus:ring-accent focus:border-accent"
                            value={messageTemplate}
                            onChange={(e) => setMessageTemplate(e.target.value)}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Use as variáveis: <code className="bg-gray-200 px-1 py-0.5 rounded">{'{nome}'}</code>, <code className="bg-gray-200 px-1 py-0.5 rounded">{'{escalas}'}</code>, <code className="bg-gray-200 px-1 py-0.5 rounded">{'{link}'}</code>.
                        </p>
                    </div>

                    <div className="space-y-3 max-h-[45vh] overflow-y-auto pr-2">
                        {volunteersWithDuties.length > 0 ? (
                            volunteersWithDuties.map(volunteer => (
                                <div key={volunteer.servo.id} className="bg-gray-50 p-3 rounded-lg flex items-center space-x-4">
                                    <img src={volunteer.servo.fotoUrl} alt={volunteer.servo.nome} className="w-16 h-16 rounded-full object-cover"/>
                                    <div className="flex-grow">
                                        <p className="font-bold text-gray-800">{volunteer.servo.nome}</p>
                                        <div className="text-sm text-gray-600">
                                            {volunteer.duties.map((duty, index) => (
                                                <p key={index}>
                                                    <span className="font-semibold">{duty.funcao.nome}</span> em {new Date(duty.date + 'T00:00:00').toLocaleDateString('pt-BR', { weekday: 'long' })}
                                                </p>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-center space-y-1">
                                        <button 
                                            onClick={() => handleSendReminder(volunteer)}
                                            className="bg-[#25D366] text-white px-3 py-2 rounded-lg font-bold flex items-center space-x-2 text-sm hover:bg-opacity-90 transition-colors"
                                        >
                                            <WhatsAppIcon className="w-5 h-5" />
                                            <span>Lembrar</span>
                                        </button>
                                        {sentStatus[volunteer.servo.id] && (
                                            <span className="text-xs text-green-600 font-semibold">✓ Enviado</span>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-gray-500 py-8">Nenhum servo escalado para este período.</p>
                        )}
                    </div>
                </main>
                 <footer className="p-4 border-t flex justify-end">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">Fechar</button>
                </footer>
            </div>
        </div>
    );
};

export default ReminderModal;