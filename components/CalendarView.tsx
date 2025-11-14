
import React, { useState, useMemo, useEffect } from 'react';
import { useData } from '../contexts/DataContext';
import { ChevronLeftIcon, ChevronRightIcon } from './icons';
import ScheduleModal from './ScheduleModal';

interface CalendarViewProps {
  initialDate?: Date | null;
  onClearInitialDate?: () => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({ initialDate, onClearInitialDate }) => {
  const { escalas, ministerios, funcoes, hasPermission } = useData();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const canEditSchedules = hasPermission('manageEscala');

  // Handle deep link date selection from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const dateStr = params.get('date');
    if (dateStr) {
        // Validate date string format YYYY-MM-DD
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
            const date = new Date(dateStr + 'T00:00:00');
            if (!isNaN(date.getTime())) {
                setCurrentDate(date); // This sets the month view
                setSelectedDate(date); // This opens the modal for the specific day
            }
        }
    }
  }, []); // Run only on mount

  // Handle programmatic navigation via props
  useEffect(() => {
    if (initialDate && onClearInitialDate) {
        setCurrentDate(initialDate);
        setSelectedDate(initialDate);
        onClearInitialDate();
    }
  }, [initialDate, onClearInitialDate]);

  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

  const daysInMonth = useMemo(() => {
    const days = [];
    for (let day = 1; day <= lastDayOfMonth.getDate(); day++) {
      days.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), day));
    }
    return days;
  }, [currentDate, lastDayOfMonth]);

  const startingDayIndex = firstDayOfMonth.getDay();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };
  
  const handleDateClick = (date: Date) => {
      setSelectedDate(date);
  }

  const getMinistryColor = (funcaoId: number) => {
    const funcao = funcoes.find(f => f.id === funcaoId);
    if (!funcao) return 'bg-gray-400';
    const ministerio = ministerios.find(m => m.id === funcao.ministerioId);
    return ministerio?.cor || 'bg-gray-400';
  }

  return (
    <>
      <div className="bg-white text-black rounded-lg shadow-2xl p-4 animate-fade-in-up">
        <div className="flex justify-between items-center mb-4">
          <button onClick={handlePrevMonth} className="p-2 rounded-full hover:bg-gray-200 transition-colors">
            <ChevronLeftIcon size={24} />
          </button>
          <h2 className="text-xl font-bold font-display text-bordeaux">
            {currentDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}
          </h2>
          <button onClick={handleNextMonth} className="p-2 rounded-full hover:bg-gray-200 transition-colors">
            <ChevronRightIcon size={24} />
          </button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center font-semibold text-sm text-gray-500">
          {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
            <div key={day} className="py-2">{day}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: startingDayIndex }).map((_, index) => (
            <div key={`empty-${index}`} className="border-t border-gray-200"></div>
          ))}
          {daysInMonth.map(day => {
            const dateString = day.toISOString().split('T')[0];
            const schedule = escalas.find(e => e.data === dateString);
            const isToday = day.toDateString() === new Date().toDateString();
            return (
              <div 
                key={day.toString()} 
                className="border-t border-gray-200 h-24 md:h-32 p-1 flex flex-col cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleDateClick(day)}
              >
                <span className={`font-bold ${isToday ? 'bg-bordeaux text-white rounded-full w-7 h-7 flex items-center justify-center' : ''}`}>
                  {day.getDate()}
                </span>
                 <div className="flex-grow overflow-y-auto text-xs mt-1 space-y-1">
                    {schedule && schedule.itens.slice(0, 3).map(item => (
                        <div key={item.id} className={`w-full h-1.5 rounded ${getMinistryColor(item.funcaoId)}`}></div>
                    ))}
                    {schedule && schedule.itens.length > 3 && <div className="text-gray-500 text-center">+ {schedule.itens.length - 3}</div>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {selectedDate && <ScheduleModal date={selectedDate} onClose={() => setSelectedDate(null)} canEdit={canEditSchedules} />}
    </>
  );
};

export default CalendarView;
