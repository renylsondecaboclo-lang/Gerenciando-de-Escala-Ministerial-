
import React from 'react';
import type { View } from '../types';
import { useData } from '../contexts/DataContext';
import { UserIcon, SettingsIcon, HelpCircleIcon } from './icons';

interface HeaderProps {
    view: View;
    onProfileClick: () => void;
    onSettingsClick: () => void;
}

const viewTitles: Record<View, string> = {
    dashboard: "Dashboard",
    escala: "Escala Mensal",
    servos: "Servos",
    eventos: "Eventos",
    relatorios: "Relatórios",
    admin: "Administração",
};

const Header: React.FC<HeaderProps> = ({ view, onProfileClick, onSettingsClick }) => {
    const { currentUser, users, setCurrentUser } = useData();
    const title = viewTitles[view];

    const handleUserChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedUser = users.find(u => u.id === parseInt(e.target.value));
        if (selectedUser) {
            setCurrentUser(selectedUser);
        }
    };

    return (
        <header className="bg-bordeaux-light/50 backdrop-blur-sm sticky top-0 z-20 shadow-md">
            <div className="container mx-auto flex justify-between items-center p-4">
                <h1 className="text-xl md:text-2xl font-bold font-display text-white">{title}</h1>
                <div className="flex items-center space-x-4">
                    {currentUser.role === 'Administrador' && (
                        <div className="relative">
                           <select
                                value={currentUser.id}
                                onChange={handleUserChange}
                                className="text-xs appearance-none bg-black text-white rounded-full px-3 py-1 pr-8 font-semibold focus:outline-none focus:ring-2 focus:ring-accent border border-gray-600"
                           >
                            {users.map(user => (
                                <option key={user.id} value={user.id}>{`Simular: ${user.name}`}</option>
                            ))}
                           </select>
                           <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-white">
                                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                           </div>
                        </div>
                    )}
                    <button onClick={onProfileClick} className="text-white hover:text-accent transition-colors">
                        <UserIcon size={24} />
                    </button>
                    <button onClick={onSettingsClick} className="text-white hover:text-accent transition-colors">
                        <SettingsIcon size={24} />
                    </button>
                    <button className="text-white hover:text-accent transition-colors">
                        <HelpCircleIcon size={24} />
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;