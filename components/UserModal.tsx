
import React, { useState, useEffect } from 'react';
import { useData } from '../contexts/DataContext';
import type { User, UserRole } from '../types';
import { USER_ROLES } from '../constants';
import { XCircleIcon } from './icons';

interface UserModalProps {
  userToEdit: User | null;
  onClose: () => void;
  isEditingSelf?: boolean;
}

const DEFAULT_USER_STATE: Omit<User, 'id'> = {
    name: '',
    email: '',
    role: 'Servo',
};

const UserModal: React.FC<UserModalProps> = ({ userToEdit, onClose, isEditingSelf = false }) => {
    const { addUser, updateUser } = useData();
    const [userData, setUserData] = useState<Omit<User, 'id'> & { id?: number }>(DEFAULT_USER_STATE);

    useEffect(() => {
        if (userToEdit) {
            setUserData(userToEdit);
        } else {
            setUserData(DEFAULT_USER_STATE);
        }
    }, [userToEdit]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setUserData(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (userData.id) {
            updateUser(userData as User);
        } else {
            addUser(userData);
        }
        onClose();
    };

    const inputClasses = "block w-full rounded-md border-0 py-2.5 px-3 bg-black text-white shadow-sm ring-1 ring-inset ring-gray-700 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-accent sm:text-sm";

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-lg shadow-2xl text-black w-full max-w-md max-h-[90vh] flex flex-col">
                <header className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-xl font-bold text-bordeaux font-display">
                        {userToEdit ? 'Editar Usuário' : 'Adicionar Novo Usuário'}
                    </h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 transition-colors">
                        <XCircleIcon size={24} className="text-gray-500" />
                    </button>
                </header>

                <form id="user-form" onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-grow space-y-6">
                    {/* Name */}
                    <div className="relative">
                        <label htmlFor="name" className="absolute -top-2 left-2 inline-block bg-white px-1 text-xs font-medium text-gray-900">Nome Completo</label>
                        <input type="text" name="name" id="name" value={userData.name} onChange={handleChange} required className={inputClasses} />
                    </div>
                    {/* Email */}
                    <div className="relative">
                        <label htmlFor="email" className="absolute -top-2 left-2 inline-block bg-white px-1 text-xs font-medium text-gray-900">Email</label>
                        <input type="email" name="email" id="email" value={userData.email} onChange={handleChange} required className={inputClasses} />
                    </div>
                    {/* Role */}
                    {!isEditingSelf && (
                        <div className="relative">
                             <label htmlFor="role" className="absolute -top-2 left-2 inline-block bg-white px-1 text-xs font-medium text-gray-900">Nível de Acesso</label>
                             <select
                                name="role"
                                id="role"
                                value={userData.role}
                                onChange={handleChange}
                                className={inputClasses}
                            >
                                {USER_ROLES.filter(r => r !== 'Administrador').map(role => (
                                    <option key={role} value={role}>{role}</option>
                                ))}
                            </select>
                        </div>
                    )}
                </form>

                <footer className="p-4 border-t flex justify-end items-center space-x-4">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">Cancelar</button>
                    <button type="submit" form="user-form" className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">Salvar Usuário</button>
                </footer>
            </div>
        </div>
    );
};

export default UserModal;