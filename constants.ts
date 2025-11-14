
import { MinisterioID, type Ministerio, type Funcao, type Servo, type Turno, type Escala, type Evento, type User, type UserRole, type Permission, type RolePermissions } from './types';

export const MINISTERIOS: Ministerio[] = [
  { id: MinisterioID.Comunicacao, nome: 'Comunicação', cor: 'bg-blue-500' },
  { id: MinisterioID.Louvor, nome: 'Louvor', cor: 'bg-purple-500' },
  { id: MinisterioID.Recepcao, nome: 'Recepção', cor: 'bg-green-500' },
  { id: MinisterioID.Servico, nome: 'Serviço/Limpeza', cor: 'bg-orange-500' },
];

export const FUNCOES: Funcao[] = [
  { id: 1, nome: 'Projeção', ministerioId: MinisterioID.Comunicacao },
  { id: 2, nome: 'Iluminação', ministerioId: MinisterioID.Comunicacao },
  { id: 3, nome: 'Captação de Imagem', ministerioId: MinisterioID.Comunicacao },
  { id: 4, nome: 'Live', ministerioId: MinisterioID.Comunicacao },
  { id: 5, nome: 'Vocal', ministerioId: MinisterioID.Louvor },
  { id: 6, nome: 'Guitarrista', ministerioId: MinisterioID.Louvor },
  { id: 7, nome: 'Baterista', ministerioId: MinisterioID.Louvor },
  { id: 8, nome: 'Contrabaixo', ministerioId: MinisterioID.Louvor },
  { id: 9, nome: 'Teclado', ministerioId: MinisterioID.Louvor },
  { id: 10, nome: 'Violão', ministerioId: MinisterioID.Louvor },
  { id: 13, nome: 'Técnico de Som', ministerioId: MinisterioID.Louvor },
  { id: 11, nome: 'Recepção', ministerioId: MinisterioID.Recepcao },
  { id: 12, nome: 'Limpeza/Serviço', ministerioId: MinisterioID.Servico },
];

export const SERVOS_INICIAIS: Servo[] = [
  { id: 1, nome: 'Ana Silva', telefone: '(11) 98765-4321', funcoes: [5, 10], ativo: true, fotoUrl: 'https://picsum.photos/id/1027/100/100' },
  { id: 2, nome: 'Bruno Costa', telefone: '(11) 91234-5678', funcoes: [6, 8], ativo: true, fotoUrl: 'https://picsum.photos/id/1005/100/100' },
  { id: 3, nome: 'Carla Dias', telefone: '(21) 99876-5432', funcoes: [1], ativo: true, fotoUrl: 'https://picsum.photos/id/1011/100/100' },
  { id: 4, nome: 'Daniel Martins', telefone: '(31) 98888-7777', funcoes: [7], ativo: true, fotoUrl: 'https://picsum.photos/id/1012/100/100' },
  { id: 5, nome: 'Eduarda Lima', telefone: '(51) 97654-3210', funcoes: [11], ativo: true, fotoUrl: 'https://picsum.photos/id/1013/100/100' },
  { id: 6, nome: 'Fábio Pereira', telefone: '(41) 96543-2109', funcoes: [12], ativo: true, fotoUrl: 'https://picsum.photos/id/1014/100/100' },
  { id: 7, nome: 'Gabriela Rocha', telefone: '(61) 95432-1098', funcoes: [9], ativo: true, fotoUrl: 'https://picsum.photos/id/1015/100/100' },
  { id: 8, nome: 'Heitor Santos', telefone: '(71) 94321-0987', funcoes: [2, 3], ativo: true, fotoUrl: 'https://picsum.photos/id/1016/100/100' },
  { id: 9, nome: 'Isabela Nunes', telefone: '(81) 93210-9876', funcoes: [4], ativo: false, fotoUrl: 'https://picsum.photos/id/1018/100/100' },
  { id: 10, nome: 'João Vitor', telefone: '(91) 92109-8765', funcoes: [10], ativo: true, fotoUrl: 'https://picsum.photos/id/1019/100/100' },
];

export const TURNOS: Turno[] = [
    { id: 1, nome: 'Manhã', horario: '08:00 - 12:00' },
    { id: 2, nome: 'Tarde', horario: '13:00 - 17:00' },
    { id: 3, nome: 'Noite', horario: '18:00 - 22:00' },
];

// Get today's date to make the mock data relevant
const today = new Date();
const sunday = new Date(today);
sunday.setDate(today.getDate() - today.getDay());
const nextSunday = new Date(sunday);
nextSunday.setDate(sunday.getDate() + 7);

const formatToYYYYMMDD = (date: Date) => date.toISOString().split('T')[0];

export const ESCALAS_INICIAIS: Escala[] = [
  {
    data: formatToYYYYMMDD(sunday),
    publicado: true,
    observacoes: 'Ensaio geral às 18h no sábado.',
    itens: [
      { id: 1, funcaoId: 5, servoId: 1, turnoId: 3 }, // Vocal: Ana
      { id: 2, funcaoId: 6, servoId: 2, turnoId: 3 }, // Guitarra: Bruno
      { id: 3, funcaoId: 7, servoId: 4, turnoId: 3 }, // Bateria: Daniel
      { id: 4, funcaoId: 9, servoId: 7, turnoId: 3 }, // Teclado: Gabriela
      { id: 5, funcaoId: 1, servoId: 3, turnoId: 3 }, // Projeção: Carla
      { id: 6, funcaoId: 11, servoId: 5, turnoId: 3 }, // Recepção: Eduarda
    ],
  },
  {
    data: formatToYYYYMMDD(nextSunday),
    publicado: false,
    itens: [
      { id: 7, funcaoId: 5, servoId: 1, turnoId: 3 }, // Vocal: Ana
      { id: 8, funcaoId: 10, servoId: 10, turnoId: 3 }, // Violão: João
    ],
  },
];

const confStartDate = new Date(today);
confStartDate.setDate(today.getDate() + 12);
const confEndDate = new Date(confStartDate);
confEndDate.setDate(confStartDate.getDate() + 2);

export const EVENTOS_INICIAIS: Evento[] = [
    {
        id: 1,
        titulo: 'Conferência Anual',
        dataInicio: formatToYYYYMMDD(confStartDate),
        dataFim: formatToYYYYMMDD(confEndDate),
        local: 'Sede da Igreja',
        escalas: {}
    }
];

export const USER_ROLES: UserRole[] = ['Administrador', 'Pastor', 'Líder', 'Servo'];

export const USERS_INICIAIS: User[] = [
    { id: 1, name: 'João Administrador', email: 'admin@email.com', role: 'Administrador', photoUrl: 'https://picsum.photos/seed/user1/100/100' },
    { id: 2, name: 'Maria Pastora', email: 'pastora@email.com', role: 'Pastor', photoUrl: 'https://picsum.photos/seed/user2/100/100' },
    { id: 3, name: 'Carlos Líder', email: 'lider@email.com', role: 'Líder', photoUrl: 'https://picsum.photos/seed/user3/100/100' },
    { id: 4, name: 'Ana Servo', email: 'servo@email.com', role: 'Servo', photoUrl: 'https://picsum.photos/seed/user4/100/100' },
];

export const ALL_PERMISSIONS: { id: Permission, description: string, category: string }[] = [
    { id: 'viewDashboard', description: 'Visualizar Dashboard', category: 'Geral' },
    { id: 'viewEscala', description: 'Visualizar Escalas', category: 'Escalas' },
    { id: 'manageEscala', description: 'Gerenciar Escalas', category: 'Escalas' },
    { id: 'viewServos', description: 'Visualizar Servos', category: 'Servos' },
    { id: 'manageServos', description: 'Gerenciar Servos', category: 'Servos' },
    { id: 'viewEventos', description: 'Visualizar Eventos', category: 'Eventos' },
    { id: 'manageEventos', description: 'Gerenciar Eventos', category: 'Eventos' },
    { id: 'viewRelatorios', description: 'Visualizar Relatórios', category: 'Relatórios' },
    { id: 'viewAdmin', description: 'Acessar Admin', category: 'Admin' },
    { id: 'manageUsers', description: 'Gerenciar Usuários', category: 'Admin' },
    { id: 'managePermissions', description: 'Gerenciar Permissões', category: 'Admin' },
];

export const INITIAL_ROLE_PERMISSIONS: RolePermissions = {
    Administrador: ALL_PERMISSIONS.map(p => p.id),
    Pastor: [
        'viewDashboard', 'viewEscala', 'manageEscala', 'viewServos', 'manageServos',
        'viewEventos', 'manageEventos', 'viewRelatorios', 'viewAdmin', 'manageUsers'
    ],
    Líder: [
        'viewDashboard', 'viewEscala', 'manageEscala', 'viewServos', 'manageServos', 'viewEventos'
    ],
    Servo: [
        'viewDashboard', 'viewEscala', 'viewServos', 'viewEventos'
    ],
};