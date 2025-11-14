import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import type { Servo, Funcao, Ministerio, Escala, Evento, User, RolePermissions, Permission, UserRole } from '../types';
import { MINISTERIOS, FUNCOES, SERVOS_INICIAIS, ESCALAS_INICIAIS, EVENTOS_INICIAIS, USERS_INICIAIS, INITIAL_ROLE_PERMISSIONS } from '../constants';

interface DataContextType {
  ministerios: Ministerio[];
  funcoes: Funcao[];
  servos: Servo[];
  escalas: Escala[];
  eventos: Evento[];
  users: User[];
  currentUser: User;
  setCurrentUser: (user: User) => void;
  rolePermissions: RolePermissions;
  updateRolePermissions: (role: UserRole, permissions: Permission[]) => void;
  hasPermission: (permission: Permission) => boolean;
  addEscala: (novaEscala: Escala) => void;
  updateEscala: (escalaAtualizada: Escala) => void;
  getEscalaPorData: (data: string) => Escala | undefined;
  addServo: (novoServo: Omit<Servo, 'id'>) => void;
  updateServo: (servoAtualizado: Servo) => void;
  addUser: (novoUser: Omit<User, 'id'>) => void;
  updateUser: (userAtualizado: User) => void;
  deleteUser: (userId: number) => void;
  addEvento: (novoEvento: Omit<Evento, 'id' | 'escalas'>) => void;
  updateEvento: (eventoAtualizado: Evento) => void;
  deleteEvento: (eventoId: number) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// Helper function to load from localStorage or return default value
function getInitialState<T>(key: string, defaultValue: T): T {
    try {
        const storedValue = localStorage.getItem(key);
        if (storedValue) {
            return JSON.parse(storedValue);
        }
    } catch (error) {
        console.error(`Error reading ${key} from localStorage`, error);
        localStorage.removeItem(key); // Clear corrupted data
    }
    return defaultValue;
}


export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [servos, setServos] = useState<Servo[]>(() => getInitialState('servos', SERVOS_INICIAIS));
  const [escalas, setEscalas] = useState<Escala[]>(() => getInitialState('escalas', ESCALAS_INICIAIS));
  const [eventos, setEventos] = useState<Evento[]>(() => getInitialState('eventos', EVENTOS_INICIAIS));
  const [users, setUsers] = useState<User[]>(() => getInitialState('users', USERS_INICIAIS));
  const [rolePermissions, setRolePermissions] = useState<RolePermissions>(() => getInitialState('rolePermissions', INITIAL_ROLE_PERMISSIONS));
  
  // Persist state changes to localStorage
  useEffect(() => { localStorage.setItem('servos', JSON.stringify(servos)); }, [servos]);
  useEffect(() => { localStorage.setItem('escalas', JSON.stringify(escalas)); }, [escalas]);
  useEffect(() => { localStorage.setItem('eventos', JSON.stringify(eventos)); }, [eventos]);
  useEffect(() => { localStorage.setItem('users', JSON.stringify(users)); }, [users]);
  useEffect(() => { localStorage.setItem('rolePermissions', JSON.stringify(rolePermissions)); }, [rolePermissions]);


  const [currentUser, setCurrentUserInternal] = useState<User>(() => {
    const allUsers = getInitialState('users', USERS_INICIAIS);
    const currentUserId = getInitialState('currentUserId', allUsers[0]?.id || null);
    
    if (currentUserId) {
        const foundUser = allUsers.find(u => u.id === currentUserId);
        if (foundUser) return foundUser;
    }
    return allUsers[0] || USERS_INICIAIS[0];
  });

  const setCurrentUser = (user: User) => {
    setCurrentUserInternal(user);
    localStorage.setItem('currentUserId', JSON.stringify(user.id));
  };


  const updateRolePermissions = (role: UserRole, permissions: Permission[]) => {
    if (role === 'Administrador') return; // Cannot change admin permissions
    setRolePermissions(prev => ({
      ...prev,
      [role]: permissions,
    }));
  };

  const hasPermission = useMemo(() => (permission: Permission) => {
    return rolePermissions[currentUser.role]?.includes(permission) ?? false;
  }, [currentUser, rolePermissions]);

  const addEscala = (novaEscala: Escala) => {
    setEscalas(prev => [...prev.filter(e => e.data !== novaEscala.data), novaEscala]);
  };
  
  const updateEscala = (escalaAtualizada: Escala) => {
      setEscalas(prev => prev.map(e => e.data === escalaAtualizada.data ? escalaAtualizada : e));
  };

  const getEscalaPorData = (data: string) => {
      return escalas.find(e => e.data === data);
  };

  const addServo = (novoServo: Omit<Servo, 'id'>) => {
    const newServoWithId: Servo = {
      ...novoServo,
      id: Date.now(),
      fotoUrl: novoServo.fotoUrl || `https://picsum.photos/seed/${Date.now()}/100/100`
    };
    setServos(prev => [...prev, newServoWithId]);
  };

  const updateServo = (servoAtualizado: Servo) => {
    setServos(prev => prev.map(s => (s.id === servoAtualizado.id ? servoAtualizado : s)));
  };

  const addUser = (novoUser: Omit<User, 'id'>) => {
    const newUserWithId: User = { ...novoUser, id: Date.now() };
    setUsers(prev => [...prev, newUserWithId]);
  };

  const updateUser = (userAtualizado: User) => {
    setUsers(prev => prev.map(u => (u.id === userAtualizado.id ? userAtualizado : u)));
    // If updating the current user, update the context state as well
    if (currentUser.id === userAtualizado.id) {
        setCurrentUser(userAtualizado);
    }
  };

  const deleteUser = (userId: number) => {
    setUsers(prev => prev.filter(u => u.id !== userId));
  };

  const addEvento = (novoEvento: Omit<Evento, 'id' | 'escalas'>) => {
    const newEventoWithId: Evento = {
      ...novoEvento,
      id: Date.now(),
      escalas: {} // Initialize with empty scales
    };
    setEventos(prev => [...prev, newEventoWithId]);
  };

  const updateEvento = (eventoAtualizado: Evento) => {
    setEventos(prev => prev.map(e => (e.id === eventoAtualizado.id ? eventoAtualizado : e)));
  };

  const deleteEvento = (eventoId: number) => {
    setEventos(prev => prev.filter(e => e.id !== eventoId));
  };


  const value = {
    ministerios: MINISTERIOS,
    funcoes: FUNCOES,
    servos,
    escalas,
    eventos,
    users,
    currentUser,
    setCurrentUser,
    rolePermissions,
    updateRolePermissions,
    hasPermission,
    addEscala,
    updateEscala,
    getEscalaPorData,
    addServo,
    updateServo,
    addUser,
    updateUser,
    deleteUser,
    addEvento,
    updateEvento,
    deleteEvento,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
