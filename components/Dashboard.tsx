
import React, { useState } from 'react';
import type { View, Escala, Ministerio, Servo, Funcao } from '../types';
import { useData } from '../contexts/DataContext';
import { CalendarIcon, UsersIcon, EventIcon, WhatsAppIcon } from './icons';
import ReminderModal from './ReminderModal';

interface DashboardProps {
    setActiveView: (view: View) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ setActiveView }) => {
  const { escalas, servos, ministerios, funcoes, hasPermission } = useData();
  const [reminderModalConfig, setReminderModalConfig] = useState<{schedules: Escala[], title: string} | null>(null);

  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);

  const formatToYYYYMMDD = (date: Date) => date.toISOString().split('T')[0];

  const weeklySchedules = escalas.filter(escala => {
    const escalaDate = new Date(escala.data + 'T00:00:00');
    return escalaDate >= startOfWeek && escalaDate <= endOfWeek;
  }).sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime());

  // --- Logic for Weekend Schedule ---
  const upcomingSaturday = new Date(today);
  // Finds the next Saturday (or today if it is Saturday)
  upcomingSaturday.setDate(today.getDate() + (6 - today.getDay() + 7) % 7);

  const upcomingSunday = new Date(upcomingSaturday);
  upcomingSunday.setDate(upcomingSaturday.getDate() + 1);

  const saturdayString = formatToYYYYMMDD(upcomingSaturday);
  const sundayString = formatToYYYYMMDD(upcomingSunday);

  const weekendSchedules = escalas.filter(escala => 
    escala.data === saturdayString || escala.data === sundayString
  ).sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime());
  // --- End of Weekend Logic ---

  const getDayName = (dateString: string) => {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('pt-BR', { weekday: 'long' });
  };
  
  const getSimpleDate = (dateString: string) => {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  };

  // Reusable component for displaying a schedule card
  const ScheduleCard: React.FC<{ escala: Escala }> = ({ escala }) => {
    // Group items by ministry
    // FIX: Explicitly type the accumulator in the reduce callback to avoid the "Untyped function calls may not accept type arguments" error.
    const groupedItems = escala.itens.reduce((acc: Record<number, { ministerioInfo: Ministerio, servos: { servo: Servo, funcao: Funcao }[] }>, item) => {
        const funcao = funcoes.find(f => f.id === item.funcaoId);
        const ministerio = ministerios.find(m => m.id === funcao?.ministerioId);
        
        if (!ministerio) return acc;

        if (!acc[ministerio.id]) {
            acc[ministerio.id] = {
                ministerioInfo: ministerio,
                servos: []
            };
        }

        const servo = servos.find(s => s.id === item.servoId);
        if(servo && funcao) {
             acc[ministerio.id].servos.push({ servo, funcao });
        }

        return acc;
    }, {});

    return (
        <div className="bg-white rounded-lg p-4 shadow-md text-gray-800">
            <h3 className="font-bold text-lg text-bordeaux capitalize">{getDayName(escala.data)} - {getSimpleDate(escala.data)}</h3>
            <div className="mt-3 space-y-4">
                {Object.values(groupedItems).map(({ ministerioInfo, servos: servosDoMinisterio }) => (
                    <div key={ministerioInfo.id}>
                        <div className="flex items-center mb-2 border-b border-gray-200 pb-1">
                            <div className={`w-3 h-3 rounded-full ${ministerioInfo.cor} mr-2`}></div>
                            <h4 className="font-bold text-md text-gray-700">{ministerioInfo.nome}</h4>
                        </div>
                        <div className="pl-5 grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1 text-sm">
                            {servosDoMinisterio.map(({ servo, funcao }) => (
                                <div key={`${servo.id}-${funcao.id}`}>
                                    <p className="font-semibold">{servo.nome}</p>
                                    <p className="text-gray-600">{funcao.nome}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
  };

  return (
    <>
      <div className="space-y-6 animate-fade-in">
        {/* Quick Actions */}
        <section>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {hasPermission('viewEscala') && (
                    <button onClick={() => setActiveView('escala')} className="bg-white text-black p-4 rounded-lg shadow-lg hover:bg-gray-200 transition-colors flex flex-col items-center justify-center text-center">
                        <CalendarIcon size={32} className="mb-2 text-bordeaux"/>
                        <span className="font-bold text-lg">Escala</span>
                    </button>
                )}
                {hasPermission('viewServos') && (
                     <button onClick={() => setActiveView('servos')} className="bg-servo-yellow text-black p-4 rounded-lg shadow-lg hover:bg-yellow-300 transition-colors flex flex-col items-center justify-center text-center">
                        <UsersIcon size={32} className="mb-2 text-bordeaux"/>
                        <span className="font-bold text-lg">Servos</span>
                    </button>
                )}
                {hasPermission('viewEventos') && (
                     <button onClick={() => setActiveView('eventos')} className="bg-event-brown text-white p-4 rounded-lg shadow-lg hover:bg-opacity-80 transition-colors flex flex-col items-center justify-center text-center">
                        <EventIcon size={32} className="mb-2"/>
                        <span className="font-bold text-lg">Eventos</span>
                    </button>
                )}
            </div>
        </section>

      {/* Weekend Schedule Preview */}
      <section>
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold font-display">Próximo Final de Semana</h2>
            {weekendSchedules.length > 0 && hasPermission('manageEscala') && (
                <button 
                    onClick={() => setReminderModalConfig({ schedules: weekendSchedules, title: 'Lembretes do Final de Semana' })}
                    className="flex items-center space-x-2 bg-[#25D366] text-white px-3 py-1.5 rounded-full text-sm font-semibold hover:bg-opacity-90 transition-colors"
                >
                    <WhatsAppIcon className="w-5 h-5" />
                    <span>Lembrar Servos</span>
                </button>
            )}
        </div>
        <div className="bg-white/10 p-4 rounded-lg shadow-lg space-y-4">
          {weekendSchedules.length > 0 ? (
            weekendSchedules.map(escala => (
              <ScheduleCard key={escala.data} escala={escala} />
            ))
          ) : (
            <p className="text-center text-white/80 p-4">Nenhuma escala agendada para o próximo final de semana.</p>
          )}
        </div>
      </section>

      {/* Weekly Schedule Preview */}
      <section>
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold font-display">Escala da Semana</h2>
             {weeklySchedules.length > 0 && hasPermission('manageEscala') && (
                 <button 
                    onClick={() => setReminderModalConfig({ schedules: weeklySchedules, title: 'Lembretes da Semana' })}
                    className="flex items-center space-x-2 bg-[#25D366] text-white px-3 py-1.5 rounded-full text-sm font-semibold hover:bg-opacity-90 transition-colors"
                >
                    <WhatsAppIcon className="w-5 h-5" />
                    <span>Lembrar Servos</span>
                </button>
            )}
        </div>
        <div className="bg-white/10 p-4 rounded-lg shadow-lg space-y-4">
          {weeklySchedules.length > 0 ? (
            weeklySchedules.map(escala => (
              <ScheduleCard key={escala.data} escala={escala} />
            ))
          ) : (
            <p className="text-center text-white/80 p-4">Nenhuma escala para esta semana.</p>
          )}
        </div>
      </section>

      {/* Quick List of Servants */}
        <section>
            <h2 className="text-2xl font-bold font-display mb-4">Servos Ativos</h2>
            <div className="bg-white/10 p-4 rounded-lg shadow-lg">
                <div className="flex flex-wrap gap-4 justify-center">
                    {servos.filter(s => s.ativo).slice(0, 8).map(servo => (
                        <div key={servo.id} className="flex flex-col items-center">
                            <img src={servo.fotoUrl} alt={servo.nome} className="w-16 h-16 rounded-full object-cover border-2 border-accent"/>
                            <span className="text-xs mt-1 text-white">{servo.nome.split(' ')[0]}</span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    </div>
      {reminderModalConfig && (
          <ReminderModal 
              schedules={reminderModalConfig.schedules}
              title={reminderModalConfig.title}
              onClose={() => setReminderModalConfig(null)} 
          />
      )}
    </>
  );
};

export default Dashboard;
