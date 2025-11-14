
import React, { useState, useEffect } from 'react';
import { PlusCircleIcon, EditIcon, TrashIcon, CheckCircleIcon } from './icons';
import { useData } from '../contexts/DataContext';
import type { User, UserRole, Permission, RolePermissions } from '../types';
import { ALL_PERMISSIONS, USER_ROLES } from '../constants';

type AdminTab = 'users' | 'permissions' | 'support' | 'terms' | 'updates';

interface AdminViewProps {
    onAddUser: () => void;
    onEditUser: (user: User) => void;
}

const AdminView: React.FC<AdminViewProps> = ({ onAddUser, onEditUser }) => {
    const { hasPermission } = useData();
    const [activeTab, setActiveTab] = useState<AdminTab>('users');
    
    const canManageUsers = hasPermission('manageUsers');
    const canManagePermissions = hasPermission('managePermissions');

    // Set initial tab based on permissions
    useEffect(() => {
        if(canManageUsers) setActiveTab('users');
        else if(canManagePermissions) setActiveTab('permissions');
        else setActiveTab('support');
    }, [canManageUsers, canManagePermissions]);


    const renderContent = () => {
        switch (activeTab) {
            case 'users':
                return canManageUsers ? <UsersTab onAddUser={onAddUser} onEditUser={onEditUser} /> : null;
            case 'permissions':
                return canManagePermissions ? <PermissionsTab /> : null;
            case 'support':
                return <SupportTab />;
            case 'terms':
                return <TermsTab />;
            case 'updates':
                return <UpdatesTab />;
            default:
                return null;
        }
    };

    const TabButton: React.FC<{ tab: AdminTab; label: string }> = ({ tab, label }) => (
        <button
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-2 text-xs sm:text-sm font-medium rounded-md transition-colors ${
                activeTab === tab 
                ? 'bg-accent text-white' 
                : 'text-white/80 hover:bg-white/10'
            }`}
        >
            {label}
        </button>
    );

    return (
        <div className="space-y-6 animate-fade-in-up">
            <div className="bg-white/10 p-2 rounded-lg flex items-center justify-center flex-wrap gap-2">
                {canManageUsers && <TabButton tab="users" label="Usuários" />}
                {canManagePermissions && <TabButton tab="permissions" label="Permissões" />}
                <TabButton tab="support" label="Suporte" />
                <TabButton tab="terms" label="Termos de Uso" />
                <TabButton tab="updates" label="Atualizações" />
            </div>
            <div className="bg-white/10 p-4 sm:p-6 rounded-lg shadow-lg min-h-[60vh]">
                {renderContent()}
            </div>
        </div>
    );
};

interface UsersTabProps {
    onAddUser: () => void;
    onEditUser: (user: User) => void;
}

const UsersTab: React.FC<UsersTabProps> = ({ onAddUser, onEditUser }) => {
    const { users, deleteUser } = useData();

    const handleDelete = (userId: number) => {
        if(window.confirm('Tem certeza que deseja excluir este usuário?')) {
            deleteUser(userId);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold font-display">Gerenciamento de Usuários</h3>
                <button onClick={onAddUser} className="bg-servo-yellow text-black px-4 py-2 rounded-lg font-bold flex items-center space-x-2">
                    <PlusCircleIcon size={20} />
                    <span>Novo Usuário</span>
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-white/20">
                            <th className="p-2">Nome</th>
                            <th className="p-2">Nível de Acesso</th>
                            <th className="p-2">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user.id} className="border-b border-white/10 hover:bg-white/5">
                                <td className="p-2">
                                    <div className="font-semibold">{user.name}</div>
                                    <div className="text-xs text-white/70">{user.email}</div>
                                </td>
                                <td className="p-2">
                                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-bordeaux-light">{user.role}</span>
                                </td>
                                <td className="p-2 flex space-x-2">
                                    <button onClick={() => onEditUser(user)} className="text-white/80 hover:text-accent"><EditIcon size={18} /></button>
                                    <button onClick={() => handleDelete(user.id)} className="text-white/80 hover:text-red-500"><TrashIcon size={18} /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const PermissionsTab: React.FC = () => {
    const { rolePermissions, updateRolePermissions } = useData();
    const [localPermissions, setLocalPermissions] = useState<RolePermissions>(rolePermissions);
    const [showSuccess, setShowSuccess] = useState(false);

    useEffect(() => {
        setLocalPermissions(rolePermissions);
    }, [rolePermissions]);

    const handlePermissionChange = (role: UserRole, permission: Permission, checked: boolean) => {
        if (role === 'Administrador') return;

        setLocalPermissions(prev => {
            const currentPermissions = prev[role] || [];
            const newPermissions = checked
                ? [...currentPermissions, permission]
                : currentPermissions.filter(p => p !== permission);
            return { ...prev, [role]: newPermissions };
        });
    };

    const handleSave = () => {
        (Object.keys(localPermissions) as UserRole[]).forEach(role => {
            if (role !== 'Administrador') {
                updateRolePermissions(role, localPermissions[role]);
            }
        });
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 2000);
    };

    const permissionCategories = ALL_PERMISSIONS.reduce((acc, p) => {
        if (!acc[p.category]) acc[p.category] = [];
        acc[p.category].push(p);
        return acc;
    }, {} as Record<string, typeof ALL_PERMISSIONS>);

    return (
        <div className="space-y-6">
             <div className="flex justify-between items-start">
                 <div>
                    <h3 className="text-xl font-bold font-display">Gerenciamento de Permissões</h3>
                    <p className="text-sm text-white/70">Defina o que cada nível de acesso pode fazer no sistema.</p>
                 </div>
                 <button onClick={handleSave} className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold flex items-center space-x-2 relative">
                    {showSuccess ? <CheckCircleIcon size={20} /> : null}
                    <span>{showSuccess ? 'Salvo!' : 'Salvar Alterações'}</span>
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b-2 border-white/30">
                            <th className="p-2 w-1/3">Permissão</th>
                            {USER_ROLES.map(role => (
                                <th key={role} className="p-2 text-center">{role}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {Object.entries(permissionCategories).map(([category, permissions]) => (
                            <React.Fragment key={category}>
                                <tr>
                                    <td colSpan={USER_ROLES.length + 1} className="p-2 bg-white/5 font-bold text-accent">{category}</td>
                                </tr>
                                {permissions.map(permission => (
                                    <tr key={permission.id} className="border-b border-white/10 hover:bg-white/5">
                                        <td className="p-2 pl-4">
                                            <div className="font-semibold text-sm">{permission.description}</div>
                                        </td>
                                        {USER_ROLES.map(role => (
                                            <td key={role} className="p-2 text-center">
                                                <input
                                                    type="checkbox"
                                                    className="h-5 w-5 rounded text-accent bg-black/50 border-gray-600 focus:ring-accent focus:ring-offset-bordeaux-light"
                                                    checked={localPermissions[role]?.includes(permission.id) ?? false}
                                                    onChange={e => handlePermissionChange(role, permission.id, e.target.checked)}
                                                    disabled={role === 'Administrador'}
                                                />
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};


const SupportTab: React.FC = () => {
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(!subject || !message) {
            alert('Por favor, preencha todos os campos.');
            return;
        }
        alert('Mensagem enviada com sucesso! A equipe de suporte entrará em contato em breve.');
        setSubject('');
        setMessage('');
    };

    const inputStyle = "w-full p-2 rounded bg-black text-white placeholder-white/70 border border-gray-600 focus:border-accent focus:ring-accent focus:ring-1";

    return (
        <div className="space-y-4">
            <h3 className="text-xl font-bold font-display">Enviar Mensagem para Suporte</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="subject" className="block text-sm font-medium mb-1">Assunto</label>
                    <input type="text" id="subject" value={subject} onChange={e => setSubject(e.target.value)} className={inputStyle} />
                </div>
                <div>
                    <label htmlFor="message" className="block text-sm font-medium mb-1">Mensagem</label>
                    <textarea id="message" rows={6} value={message} onChange={e => setMessage(e.target.value)} className={inputStyle}></textarea>
                </div>
                <button type="submit" className="bg-accent text-white px-6 py-2 rounded-lg font-bold">
                    Enviar
                </button>
            </form>
        </div>
    );
};

const TermsTab: React.FC = () => {
    return (
        <div className="space-y-4 prose prose-invert max-w-none">
            <h3 className="text-xl font-bold font-display">Termos de Uso e Políticas de Privacidade</h3>
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Praesent libero. Sed cursus ante dapibus diam. Sed nisi. Nulla quis sem at nibh elementum imperdiet. Duis sagittis ipsum. Praesent mauris. Fusce nec tellus sed augue semper porta. Mauris massa.</p>
            <h4>1. Coleta de Dados</h4>
            <p>Vestibulum lacinia arcu eget nulla. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himeneos. Curabitur sodales ligula in libero. Sed dignissim lacinia nunc.</p>
            <h4>2. Uso das Informações</h4>
            <p>Curabitur tortor. Pellentesque nibh. Aenean quam. In scelerisque sem at dolor. Maecenas mattis. Sed convallis tristique sem. Proin ut ligula vel nunc egestas porttitor. Morbi lectus risus, iaculis vel, suscipit quis, luctus non, massa. Fusce ac turpis quis ligula lacinia aliquet.</p>
        </div>
    );
};

const UpdatesTab: React.FC = () => {
    const changelog = [
        { version: '1.2.0', date: '28/07/2024', changes: ['Implementado sistema de permissões.', 'Adicionado simulador de usuário para admin.'] },
        { version: '1.1.0', date: '25/07/2024', changes: ['Módulo administrativo adicionado.', 'Ícone de "Admin" na navegação.', 'Correções de bugs menores.'] },
        { version: '1.0.0', date: '15/07/2024', changes: ['Lançamento inicial do aplicativo.', 'Funcionalidades de escala, servos e eventos.'] },
    ];

    return (
        <div className="space-y-6">
            <h3 className="text-xl font-bold font-display">Atualizações e Changelog</h3>
            {changelog.map(log => (
                <div key={log.version}>
                    <h4 className="font-bold text-lg">Versão {log.version} <span className="text-sm font-normal text-white/70">- {log.date}</span></h4>
                    <ul className="list-disc list-inside mt-2 text-white/90 space-y-1 pl-2">
                        {log.changes.map((change, index) => (
                            <li key={index}>{change}</li>
                        ))}
                    </ul>
                </div>
            ))}
        </div>
    );
};

export default AdminView;