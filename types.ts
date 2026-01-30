export enum UserRole {
  ADMIN = 'ADMIN',
  CLIENT = 'CLIENT'
}

export enum PlanDuration {
  MONTHLY = 'Mensal',
  QUARTERLY = 'Trimestral',
  SEMIANNUAL = 'Semestral',
  ANNUAL = 'Anual'
}

export interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  durationMonths: number;
  features: string[];
  active: boolean;
  // Affiliate fields
  affiliateEnabled?: boolean;
  commissionPercent?: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  cpf: string;
  phone: string;
  role: UserRole;
  password?: string; // In a real app, this would be hashed
  subscription?: {
    planId: string;
    startDate: string; // ISO Date
    endDate: string; // ISO Date
    active: boolean;
  };
  // Affiliate data
  isAffiliate?: boolean;
  affiliateStatus?: 'ACTIVE' | 'BLOCKED';
  affiliateCode?: string;
  affiliateCommissionOverride?: number;
  bankDetails?: {
    pixKey?: string;
    pixType?: 'CPF' | 'CNPJ' | 'EMAIL' | 'PHONE' | 'RANDOM';
    bankName?: string;
    agency?: string;
    account?: string;
  };
}

export interface Payout {
  id: string;
  affiliateId: string;
  amount: number;
  date: string; // ISO Date
  receiptUrl?: string; // URL or Base64 of the image
  status: 'PAID' | 'PROCESSING';
  notes?: string;
}

export interface SaleMetric {
  date: string;
  amount: number;
  planName: string;
  affiliateId?: string; // Track who sold it
  commissionAmount?: number;
}

export interface DashboardStats {
  totalRevenue: number;
  activeUsers: number;
  totalSales: number;
  inactiveUsers: number;
}

// Global System Settings
export interface SystemSettings {
  supportWhatsapp: string;
  mercadoPagoPublicKey?: string;
  mercadoPagoAccessToken?: string;
}

// Payment Gateway Types
export type GatewayProvider = 'MERCADOPAGO' | 'PAGARME' | 'STRIPE' | 'OXAPAY';
export type PaymentMethodType = 'PIX' | 'CREDIT_CARD' | 'CRYPTO';

export interface PaymentGateway {
  id: string;
  title: string;
  provider: GatewayProvider;
  isEnabled: boolean;
  methods: PaymentMethodType[];
  credentials: {
    publicKey?: string;
    accessToken?: string; // MP, Pagarme
    secretKey?: string; // Stripe
    apiKey?: string; // OxaPay, Pagarme
    [key: string]: string | undefined;
  };
}