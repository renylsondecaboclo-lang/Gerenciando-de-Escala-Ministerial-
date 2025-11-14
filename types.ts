
export type View = 'dashboard' | 'escala' | 'servos' | 'eventos' | 'relatorios' | 'admin';

export enum MinisterioID {
  Comunicacao = 1,
  Louvor = 2,
  Recepcao = 3,
  Servico = 4,
}

export interface Ministerio {
  id: MinisterioID;
  nome: string;
  cor: string;
}

export interface Funcao {
  id: number;
  nome: string;
  ministerioId: MinisterioID;
}

export interface Servo {
  id: number;
  nome: string;
  telefone: string;
  fotoUrl?: string;
  funcoes: number[];
  ativo: boolean;
}

export interface Turno {
    id: number;
    nome: string;
    horario: string;
}

export interface EscalaItem {
  id: number;
  funcaoId: number;
  servoId: number;
  turnoId: number;
}

export interface Escala {
  data: string; // YYYY-MM-DD
  itens: EscalaItem[];
  observacoes?: string;
  publicado: boolean;
}

export interface Evento {
  id: number;
  titulo: string;
  dataInicio: string; // YYYY-MM-DD
  dataFim: string; // YYYY-MM-DD
  local: string;
  escalas: { [date: string]: Escala };
}

export type UserRole = 'Administrador' | 'Pastor' | 'Líder' | 'Servo';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  photoUrl?: string;
}

export type Permission = 
  | 'viewDashboard'
  | 'viewEscala'
  | 'manageEscala'
  | 'viewServos'
  | 'manageServos'
  | 'viewEventos'
  | 'manageEventos'
  | 'viewRelatorios'
  | 'viewAdmin'
  | 'manageUsers'
  | 'managePermissions';

export type RolePermissions = Record<UserRole, Permission[]>;