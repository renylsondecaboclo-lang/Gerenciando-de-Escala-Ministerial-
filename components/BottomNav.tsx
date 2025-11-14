
import React from 'react';
import type { View, Permission } from '../types';
import { HomeIcon, CalendarIcon, UsersIcon, EventIcon, ReportIcon, ShieldIcon } from './icons';
import { useData } from '../contexts/DataContext';

interface BottomNavProps {
  activeView: View;
  setActiveView: (view: View) => void;
}

const navItems: { view: View; label: string; icon: React.ElementType, permission: Permission }[] = [
  { view: 'dashboard', label: 'Início', icon: HomeIcon, permission: 'viewDashboard' },
  { view: 'escala', label: 'Escala', icon: CalendarIcon, permission: 'viewEscala' },
  { view: 'servos', label: 'Servos', icon: UsersIcon, permission: 'viewServos' },
  { view: 'eventos', label: 'Eventos', icon: EventIcon, permission: 'viewEventos' },
  { view: 'relatorios', label: 'Relatórios', icon: ReportIcon, permission: 'viewRelatorios' },
  { view: 'admin', label: 'Admin', icon: ShieldIcon, permission: 'viewAdmin' },
];

const BottomNav: React.FC<BottomNavProps> = ({ activeView, setActiveView }) => {
  const { hasPermission } = useData();
  
  const visibleNavItems = navItems.filter(item => hasPermission(item.permission));

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-bordeaux-light border-t border-white/10 shadow-lg z-50">
      <div className={`container mx-auto grid grid-cols-${visibleNavItems.length}`}>
        {visibleNavItems.map(({ view, label, icon: Icon }) => (
          <button
            key={view}
            onClick={() => setActiveView(view)}
            className={`flex flex-col items-center justify-center py-2 text-xs font-medium transition-all duration-200 ease-in-out ${
              activeView === view
                ? 'text-accent scale-110'
                : 'text-white/70 hover:text-white'
            }`}
          >
            <Icon size={24} className="mb-1" />
            <span>{label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;
