
import React, { useState } from 'react';
import { XCircleIcon } from './icons';

interface SettingsModalProps {
  onClose: () => void;
}

const ToggleSwitch: React.FC<{ label: string; enabled: boolean; onChange: (enabled: boolean) => void; }> = ({ label, enabled, onChange }) => (
    <div className="flex items-center justify-between">
        <span className="text-gray-700 font-medium">{label}</span>
        <label className="flex items-center space-x-2 cursor-pointer">
            <div className="relative">
                <input type="checkbox" checked={enabled} onChange={(e) => onChange(e.target.checked)} className="sr-only" />
                <div className={`block w-14 h-8 rounded-full transition-colors ${enabled ? 'bg-bordeaux' : 'bg-gray-300'}`}></div>
                <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${enabled ? 'translate-x-6' : ''}`}></div>
            </div>
        </label>
    </div>
);

const SettingsModal: React.FC<SettingsModalProps> = ({ onClose }) => {
    const [darkMode, setDarkMode] = useState(false);
    const [notifications, setNotifications] = useState(true);

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-lg shadow-2xl text-black w-full max-w-md max-h-[90vh] flex flex-col">
                <header className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-xl font-bold text-bordeaux font-display">Configurações</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 transition-colors">
                        <XCircleIcon size={24} className="text-gray-500" />
                    </button>
                </header>

                <main className="p-6 overflow-y-auto flex-grow space-y-6">
                    <div>
                        <h3 className="font-semibold text-gray-500 text-sm uppercase tracking-wider mb-2">Aparência</h3>
                        <div className="bg-gray-100 p-4 rounded-lg space-y-4">
                           <ToggleSwitch label="Modo Escuro" enabled={darkMode} onChange={setDarkMode} />
                        </div>
                    </div>
                     <div>
                        <h3 className="font-semibold text-gray-500 text-sm uppercase tracking-wider mb-2">Geral</h3>
                        <div className="bg-gray-100 p-4 rounded-lg space-y-4">
                           <ToggleSwitch label="Receber Notificações" enabled={notifications} onChange={setNotifications} />
                           <div className="flex items-center justify-between">
                                <span className="text-gray-700 font-medium">Idioma</span>
                                <select className="p-2 border border-gray-700 rounded bg-black text-white text-sm">
                                    <option>Português (Brasil)</option>
                                    <option disabled>English</option>
                                </select>
                           </div>
                        </div>
                    </div>
                </main>
                 <footer className="p-4 border-t flex justify-end items-center">
                    <button onClick={onClose} className="px-6 py-2 bg-bordeaux text-white rounded-lg hover:bg-bordeaux-light transition-colors font-semibold">
                        Fechar
                    </button>
                </footer>
            </div>
        </div>
    );
};

export default SettingsModal;