
import React from 'react';
import { useData } from '../contexts/DataContext';
import { XCircleIcon, UserIcon, EditIcon, LogOutIcon } from './icons';

interface ProfileModalProps {
  onClose: () => void;
  onEditProfile: () => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ onClose, onEditProfile }) => {
  const { currentUser } = useData();

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-lg shadow-2xl text-black w-full max-w-sm">
        <header className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold text-bordeaux font-display">Meu Perfil</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 transition-colors">
            <XCircleIcon size={24} className="text-gray-500" />
          </button>
        </header>

        <main className="p-6 flex flex-col items-center space-y-4">
          <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden border-4 border-bordeaux-light">
            {currentUser.photoUrl ? (
              <img src={currentUser.photoUrl} alt="Foto do Usuário" className="w-full h-full object-cover" />
            ) : (
              <UserIcon size={64} className="text-gray-400" />
            )}
          </div>
          <div className="text-center">
            <h3 className="font-bold text-xl text-gray-800">{currentUser.name}</h3>
            <p className="text-sm text-gray-500">{currentUser.email}</p>
          </div>
          <div className="w-full pt-4 space-y-2">
            <button onClick={onEditProfile} className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors font-semibold">
              <EditIcon size={18} />
              <span>Editar Perfil</span>
            </button>
            <button className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors font-semibold">
              <LogOutIcon size={18} />
              <span>Sair</span>
            </button>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ProfileModal;