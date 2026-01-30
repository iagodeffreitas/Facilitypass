import { Plan, User, UserRole } from './types';

export const INITIAL_PLANS: Plan[] = [
  {
    id: 'p1',
    name: 'FP1 - Básico',
    description: 'Acesso a academias Smart Fit e bio ritmos selecionadas.',
    price: 89.90,
    durationMonths: 12,
    features: ['Acesso a +1000 academias', 'Sem taxa de adesão', 'App exclusivo'],
    active: true,
    affiliateEnabled: true,
    commissionPercent: 10
  },
  {
    id: 'p2',
    name: 'FP2 - Intermediário',
    description: 'Acesso ampliado incluindo natação e aulas coletivas.',
    price: 139.90,
    durationMonths: 12,
    features: ['Tudo do FP1', 'Acesso a Bio Ritmo', 'Aulas de Grupo'],
    active: true,
    affiliateEnabled: true,
    commissionPercent: 15
  },
  {
    id: 'p3',
    name: 'FP3 - Gold',
    description: 'O plano completo para quem quer exclusividade.',
    price: 249.90,
    durationMonths: 12,
    features: ['Tudo do FP2', 'Personal Trainer Online', 'Acesso VIP', 'Massagem'],
    active: true,
    affiliateEnabled: false,
    commissionPercent: 0
  }
];

export const INITIAL_USERS: User[] = [
  {
    id: 'admin1',
    name: 'Administrador Facility',
    email: 'admin@facilitypass.com',
    cpf: '000.000.000-00',
    phone: '11999999999',
    role: UserRole.ADMIN,
    password: '123' 
  },
  {
    id: 'client1',
    name: 'João da Silva',
    email: 'joao@cliente.com',
    cpf: '111.222.333-44',
    phone: '11988887777',
    role: UserRole.CLIENT,
    password: '123',
    subscription: {
      planId: 'p1',
      startDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(), // 30 days ago
      endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 335).toISOString(),
      active: true
    },
    isAffiliate: true,
    affiliateCode: 'JOAO10',
    bankDetails: {
        pixKey: 'joao@cliente.com',
        pixType: 'EMAIL',
        bankName: 'Nubank',
        agency: '0001',
        account: '123456-7'
    }
  }
];

export const MAP_URL = "https://totalpass.com/br/mapa/";