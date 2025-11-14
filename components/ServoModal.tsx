
import React, { useState, useEffect, useRef } from 'react';
import { useData } from '../contexts/DataContext';
import type { Servo, Funcao } from '../types';
import { XCircleIcon, CameraIcon, UserIcon } from './icons';

interface ServoModalProps {
  servoToEdit: Servo | null;
  onClose: () => void;
}

const DEFAULT_SERVO_STATE: Omit<Servo, 'id'> = {
    nome: '',
    telefone: '',
    fotoUrl: '',
    funcoes: [],
    ativo: true,
};

const ServoModal: React.FC<ServoModalProps> = ({ servoToEdit, onClose }) => {
    const { addServo, updateServo, ministerios, funcoes } = useData();
    const [servoData, setServoData] = useState<Omit<Servo, 'id'> & { id?: number }>(() => ({ ...DEFAULT_SERVO_STATE }));
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (servoToEdit) {
            setServoData(servoToEdit);
        } else {
            setServoData({ ...DEFAULT_SERVO_STATE });
        }
    }, [servoToEdit]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setServoData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };
    
    const handleFuncaoChange = (funcaoId: number) => {
        setServoData(prev => {
            const funcoes = prev.funcoes.includes(funcaoId)
                ? prev.funcoes.filter(id => id !== funcaoId)
                : [...prev.funcoes, funcaoId];
            return { ...prev, funcoes };
        });
    };

    const handlePhotoUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Limit file size to 5MB to prevent issues
        if (file.size > 5 * 1024 * 1024) {
            alert('O arquivo é muito grande. Por favor, selecione uma imagem menor que 5MB.');
            return;
        }

        const reader = new FileReader();
        reader.onload = (loadEvent) => {
            const result = loadEvent.target?.result;
            if (typeof result !== 'string') {
                console.error("File reading did not result in a string.");
                alert('Ocorreu um erro ao ler o arquivo da imagem.');
                return;
            }

            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 512;
                const MAX_HEIGHT = 512;
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }
                } else {
                    if (height > MAX_HEIGHT) {
                        width *= MAX_HEIGHT / height;
                        height = MAX_HEIGHT;
                    }
                }
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    alert('Não foi possível processar a imagem.');
                    return;
                }
                
                ctx.drawImage(img, 0, 0, width, height);

                // Use jpeg for better compression for photos
                const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
                setServoData(prev => ({ ...prev, fotoUrl: dataUrl }));
            };
            img.onerror = () => {
                 alert('O arquivo selecionado não é uma imagem válida.');
            }
            img.src = result;
        };
        reader.onerror = () => {
            alert('Ocorreu um erro ao carregar o arquivo.');
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (servoData.id) {
            updateServo(servoData as Servo);
        } else {
            addServo(servoData);
        }
        onClose();
    };
    
    const funcoesPorMinisterio = (ministerioId: number): Funcao[] => {
        return funcoes.filter(f => f.ministerioId === ministerioId);
    };

    const inputClasses = "block w-full rounded-md border-0 py-2.5 px-3 bg-black text-white shadow-sm ring-1 ring-inset ring-gray-700 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-accent sm:text-sm";


    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-lg shadow-2xl text-black w-full max-w-lg max-h-[90vh] flex flex-col">
                <header className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-xl font-bold text-bordeaux font-display">
                        {servoToEdit ? 'Editar Servo' : 'Adicionar Novo Servo'}
                    </h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 transition-colors">
                        <XCircleIcon size={24} className="text-gray-500" />
                    </button>
                </header>

                <form id="servo-form" onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-grow space-y-6">
                    {/* Basic Info with Photo */}
                    <div className="flex flex-col sm:flex-row items-center gap-6">
                        <div className="relative">
                            <div className="w-28 h-28 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden border-4 border-bordeaux-light">
                                {servoData.fotoUrl ? (
                                    <img src={servoData.fotoUrl} alt="Foto do Servo" className="w-full h-full object-cover" />
                                ) : (
                                    <UserIcon size={64} className="text-gray-400" />
                                )}
                            </div>
                            <button
                                type="button"
                                onClick={handlePhotoUploadClick}
                                className="absolute bottom-0 right-0 bg-accent text-white p-2 rounded-full hover:bg-opacity-80 transition-all transform hover:scale-110"
                                aria-label="Alterar foto"
                            >
                                <CameraIcon size={16} />
                            </button>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                className="hidden"
                                accept="image/png, image/jpeg, image/webp"
                            />
                        </div>

                        <div className="space-y-4 flex-grow w-full">
                           <div className="relative">
                               <label htmlFor="nome" className="absolute -top-2 left-2 inline-block bg-white px-1 text-xs font-medium text-gray-900">Nome Completo</label>
                               <input type="text" name="nome" id="nome" value={servoData.nome} onChange={handleChange} required className={inputClasses} />
                            </div>
                           <div className="relative">
                               <label htmlFor="telefone" className="absolute -top-2 left-2 inline-block bg-white px-1 text-xs font-medium text-gray-900">Telefone</label>
                               <input type="tel" name="telefone" id="telefone" value={servoData.telefone} onChange={handleChange} required className={inputClasses} />
                            </div>
                        </div>
                    </div>

                    {/* Funções */}
                    <div>
                        <h3 className="font-semibold text-gray-700 mb-2">Funções</h3>
                        <div className="space-y-3">
                            {ministerios.map(ministerio => (
                                <div key={ministerio.id}>
                                    <p className="font-bold text-sm text-gray-600 border-b pb-1 mb-2">{ministerio.nome}</p>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                        {funcoesPorMinisterio(ministerio.id).map(funcao => (
                                            <label key={funcao.id} className="flex items-center space-x-2 text-sm">
                                                <input
                                                    type="checkbox"
                                                    checked={servoData.funcoes.includes(funcao.id)}
                                                    onChange={() => handleFuncaoChange(funcao.id)}
                                                    className="rounded text-bordeaux focus:ring-bordeaux"
                                                />
                                                <span>{funcao.nome}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    
                     {/* Status */}
                    <div className="flex items-center justify-between pt-2">
                         <span className="text-gray-700 font-medium">Status</span>
                         <label className="flex items-center space-x-2 cursor-pointer">
                            <span className={`text-sm ${!servoData.ativo ? 'font-semibold text-red-600' : 'text-gray-500'}`}>Inativo</span>
                            <div className="relative">
                                <input type="checkbox" name="ativo" checked={servoData.ativo} onChange={handleChange} className="sr-only" />
                                <div className={`block w-14 h-8 rounded-full transition-colors ${servoData.ativo ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${servoData.ativo ? 'translate-x-6' : ''}`}></div>
                            </div>
                            <span className={`text-sm ${servoData.ativo ? 'font-semibold text-green-700' : 'text-gray-500'}`}>Ativo</span>
                        </label>
                    </div>

                </form>

                <footer className="p-4 border-t flex justify-end items-center space-x-4">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">Cancelar</button>
                    <button type="submit" form="servo-form" className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">Salvar Servo</button>
                </footer>
            </div>
        </div>
    );
};

export default ServoModal;