import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Plan, UserRole, SaleMetric, PaymentGateway, Payout, SystemSettings } from '../types';
import { supabase } from '../lib/supabaseClient';

interface AuthContextProps {
  user: User | null;
  users: User[];
  plans: Plan[];
  sales: SaleMetric[];
  gateways: PaymentGateway[];
  payouts: Payout[];
  settings: SystemSettings;
  loading: boolean;
  
  refreshData: () => Promise<void>;

  login: (email: string, secret: string) => Promise<boolean>; 
  logout: () => void;
  register: (userData: Omit<User, 'id' | 'role'>) => Promise<void>;
  purchasePlan: (planId: string) => Promise<void>;
  
  // Admin functions
  updateUser: (updatedUser: User) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  addPlan: (plan: Omit<Plan, 'id'>) => Promise<void>;
  updatePlan: (plan: Plan) => Promise<void>;
  deletePlan: (planId: string) => Promise<void>;
  updateSettings: (settings: SystemSettings) => Promise<void>;
  
  // Affiliate functions
  toggleAffiliateStatus: (userId: string) => Promise<void>;
  addPayout: (payout: Omit<Payout, 'id'>) => Promise<void>;
  
  // Gateway functions
  addGateway: (gateway: Omit<PaymentGateway, 'id'>) => Promise<void>;
  updateGateway: (gateway: PaymentGateway) => Promise<void>;
  deleteGateway: (id: string) => Promise<void>;
  toggleGatewayStatus: (id: string) => Promise<{ success: boolean; message?: string }>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState(true);
  
  const [users, setUsers] = useState<User[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [sales, setSales] = useState<SaleMetric[]>([]);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [gateways, setGateways] = useState<PaymentGateway[]>([]);
  const [settings, setSettings] = useState<SystemSettings>({ supportWhatsapp: '' });
  
  const [user, setUser] = useState<User | null>(() => {
      const savedSession = localStorage.getItem('fp_current_user');
      return savedSession ? JSON.parse(savedSession) : null;
  });

  // --- DATA LOADING ---
  const loadData = async () => {
    try {
      setLoading(true);

      // 1. Users
      const { data: usersData } = await supabase.from('users').select('*');
      if (usersData) {
        const mappedUsers: User[] = usersData.map((u: any) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          cpf: u.cpf,
          phone: u.phone,
          role: u.role as UserRole,
          password: u.password,
          isAffiliate: u.is_affiliate,
          affiliateCode: u.affiliate_code,
          affiliateStatus: u.affiliate_status,
          affiliateCommissionOverride: u.affiliate_commission_override,
          subscription: u.subscription,
          bankDetails: u.bank_details
        }));
        setUsers(mappedUsers);
        
        // Refresh current user session data if logged in
        if (user) {
            const currentUserFresh = mappedUsers.find(u => u.id === user.id);
            if (currentUserFresh) setUser(currentUserFresh);
        }
      }

      // 2. Plans
      const { data: plansData } = await supabase.from('plans').select('*');
      if (plansData) {
        setPlans(plansData.map((p: any) => ({
          id: p.id,
          name: p.name,
          description: p.description,
          price: Number(p.price),
          durationMonths: p.duration_months,
          features: p.features,
          active: p.active,
          affiliateEnabled: p.affiliate_enabled,
          commissionPercent: Number(p.commission_percent)
        })));
      }

      // 3. Sales
      const { data: salesData } = await supabase.from('sales').select('*');
      if (salesData) {
        setSales(salesData.map((s: any) => ({
          date: s.date,
          amount: Number(s.amount),
          planName: s.plan_name,
          affiliateId: s.affiliate_id,
          commissionAmount: Number(s.commission_amount)
        })));
      }

      // 4. Gateways
      const { data: gwData } = await supabase.from('gateways').select('*');
      if (gwData) {
        setGateways(gwData.map((g: any) => ({
          id: g.id,
          title: g.title,
          provider: g.provider,
          isEnabled: g.is_enabled,
          methods: g.methods,
          credentials: g.credentials
        })));
      }

      // 5. Payouts
      const { data: payoutData } = await supabase.from('payouts').select('*');
      if (payoutData) {
        setPayouts(payoutData.map((p: any) => ({
          id: p.id,
          affiliateId: p.affiliate_id,
          amount: Number(p.amount),
          date: p.date,
          status: p.status,
          receiptUrl: p.receipt_url,
          notes: p.notes
        })));
      }

      // 6. Settings
      const { data: settingsData } = await supabase.from('settings').select('*').single();
      if (settingsData) {
        setSettings({
          supportWhatsapp: settingsData.support_whatsapp,
          mercadoPagoPublicKey: settingsData.mercado_pago_public_key,
          mercadoPagoAccessToken: settingsData.mercado_pago_access_token
        });
      }

    } catch (error) {
      console.error("Error loading data from Supabase:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Update local storage session whenever user changes
  useEffect(() => {
    if (user) {
        localStorage.setItem('fp_current_user', JSON.stringify(user));
    } else {
        localStorage.removeItem('fp_current_user');
    }
  }, [user]);

  // --- ACTIONS ---

  const login = async (email: string, secret: string): Promise<boolean> => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !data) return false;

    if (data.role === UserRole.ADMIN && data.password === secret) {
        const mappedUser: User = {
            id: data.id,
            name: data.name,
            email: data.email,
            cpf: data.cpf,
            phone: data.phone,
            role: UserRole.ADMIN,
            password: data.password,
            isAffiliate: data.is_affiliate,
            subscription: data.subscription,
            bankDetails: data.bank_details
        };
        setUser(mappedUser);
        return true;
    }

    if (data.role === UserRole.CLIENT && (data.cpf === secret || data.password === secret)) {
         const mappedUser: User = {
            id: data.id,
            name: data.name,
            email: data.email,
            cpf: data.cpf,
            phone: data.phone,
            role: UserRole.CLIENT,
            password: data.password,
            isAffiliate: data.is_affiliate,
            affiliateCode: data.affiliate_code,
            affiliateStatus: data.affiliate_status,
            subscription: data.subscription,
            bankDetails: data.bank_details
        };
        setUser(mappedUser);
        return true;
    }

    return false;
  };

  const logout = () => {
    setUser(null);
  };

  const register = async (userData: Omit<User, 'id' | 'role'>) => {
    const newId = Math.random().toString(36).substr(2, 9);
    const newUser = {
        id: newId,
        name: userData.name,
        email: userData.email,
        cpf: userData.cpf,
        phone: userData.phone,
        password: userData.password,
        role: UserRole.CLIENT,
        is_affiliate: false
    };

    const { error } = await supabase.from('users').insert(newUser);
    
    if (!error) {
        const mappedUser: User = {
            ...userData,
            id: newId,
            role: UserRole.CLIENT,
            isAffiliate: false
        };
        setUsers([...users, mappedUser]);
        setUser(mappedUser);
    } else {
        console.error("Register error", error);
        throw error; // Let component handle UI feedback
    }
  };

  const purchasePlan = async (planId: string) => {
    if (!user) return;
    
    const selectedPlan = plans.find(p => p.id === planId);
    if (!selectedPlan) return;

    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + selectedPlan.durationMonths);

    const subscriptionData = {
        planId,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        active: true
    };

    const { error: userError } = await supabase
        .from('users')
        .update({ subscription: subscriptionData })
        .eq('id', user.id);

    if (userError) {
        console.error("Error updating subscription", userError);
        return;
    }

    const updatedUser: User = {
      ...user,
      subscription: subscriptionData
    };
    setUsers(users.map(u => u.id === user.id ? updatedUser : u));
    setUser(updatedUser);

    let affiliateId: string | undefined;
    let commissionAmount = 0;
    const referralCode = localStorage.getItem('facility_ref');
    
    if (referralCode) {
        const affiliate = users.find(u => 
            u.isAffiliate && 
            u.affiliateStatus !== 'BLOCKED' && 
            u.affiliateCode?.toUpperCase() === referralCode.toUpperCase()
        );

        if (affiliate && affiliate.id !== user.id) {
            affiliateId = affiliate.id;
            let percent = 0;
            if (affiliate.affiliateCommissionOverride !== undefined) {
                percent = affiliate.affiliateCommissionOverride;
            } else if (selectedPlan.affiliateEnabled) {
                percent = selectedPlan.commissionPercent || 0;
            }

            if (percent > 0) {
                commissionAmount = (selectedPlan.price * percent) / 100;
            }
        }
    }

    const saleData = {
        date: new Date().toISOString().split('T')[0],
        amount: selectedPlan.price,
        plan_name: selectedPlan.name,
        affiliate_id: affiliateId,
        commission_amount: commissionAmount
    };

    const { error: saleError } = await supabase.from('sales').insert(saleData);
    if (!saleError) {
        setSales([...sales, {
            date: saleData.date,
            amount: saleData.amount,
            planName: saleData.plan_name,
            affiliateId: saleData.affiliate_id,
            commissionAmount: saleData.commission_amount
        }]);
    }
  };

  const updateUser = async (updatedUser: User) => {
    // IMPORTANT: Explicitly set missing optional fields to null to ensure they are cleared in the database
    const dbUser = {
        name: updatedUser.name,
        email: updatedUser.email,
        cpf: updatedUser.cpf,
        phone: updatedUser.phone,
        role: updatedUser.role,
        password: updatedUser.password,
        is_affiliate: updatedUser.isAffiliate,
        affiliate_code: updatedUser.affiliateCode === undefined ? null : updatedUser.affiliateCode,
        affiliate_status: updatedUser.affiliateStatus === undefined ? null : updatedUser.affiliateStatus,
        affiliate_commission_override: updatedUser.affiliateCommissionOverride === undefined ? null : updatedUser.affiliateCommissionOverride,
        subscription: updatedUser.subscription === undefined ? null : updatedUser.subscription,
        bank_details: updatedUser.bankDetails === undefined ? null : updatedUser.bankDetails
    };

    const { error } = await supabase.from('users').update(dbUser).eq('id', updatedUser.id);
    if (!error) {
        setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
        if (user && user.id === updatedUser.id) setUser(updatedUser);
    }
  };

  const deleteUser = async (userId: string) => {
    const { error } = await supabase.from('users').delete().eq('id', userId);
    if (!error) {
        setUsers(users.filter(u => u.id !== userId));
        if (user && user.id === userId) setUser(null);
    }
  };

  const addPlan = async (planData: Omit<Plan, 'id'>) => {
    const newId = Math.random().toString(36).substr(2, 9);
    const dbPlan = {
        id: newId,
        name: planData.name,
        description: planData.description,
        price: planData.price,
        duration_months: planData.durationMonths,
        features: planData.features,
        active: planData.active,
        affiliate_enabled: planData.affiliateEnabled,
        commission_percent: planData.commissionPercent
    };
    
    const { error } = await supabase.from('plans').insert(dbPlan);
    if (!error) {
        setPlans([...plans, { ...planData, id: newId }]);
    }
  };

  const updatePlan = async (updatedPlan: Plan) => {
     const dbPlan = {
        name: updatedPlan.name,
        description: updatedPlan.description,
        price: updatedPlan.price,
        duration_months: updatedPlan.durationMonths,
        features: updatedPlan.features,
        active: updatedPlan.active,
        affiliate_enabled: updatedPlan.affiliateEnabled,
        commission_percent: updatedPlan.commissionPercent
    };

    const { error } = await supabase.from('plans').update(dbPlan).eq('id', updatedPlan.id);
    if (!error) {
        setPlans(plans.map(p => p.id === updatedPlan.id ? updatedPlan : p));
    }
  };

  const deletePlan = async (planId: string) => {
    const { error } = await supabase.from('plans').delete().eq('id', planId);
    if (!error) {
        setPlans(plans.filter(p => p.id !== planId));
    }
  };

  const updateSettings = async (newSettings: SystemSettings) => {
    const dbSettings = {
        support_whatsapp: newSettings.supportWhatsapp,
        mercado_pago_public_key: newSettings.mercadoPagoPublicKey,
        mercado_pago_access_token: newSettings.mercadoPagoAccessToken
    };
    const { error } = await supabase.from('settings').update(dbSettings).eq('id', 1);
    if (!error) {
        setSettings(newSettings);
    }
  };

  const toggleAffiliateStatus = async (userId: string) => {
    const targetUser = users.find(u => u.id === userId);
    if (!targetUser) return;

    const isBecomingAffiliate = !targetUser.isAffiliate;
    const newCode = isBecomingAffiliate ? (targetUser.name.split(' ')[0].toUpperCase() + Math.floor(Math.random()*1000)) : null;

    const updates = {
        is_affiliate: isBecomingAffiliate,
        affiliate_code: newCode
    };

    const { error } = await supabase.from('users').update(updates).eq('id', userId);
    if (!error) {
        loadData(); 
    }
  };

  const addPayout = async (payoutData: Omit<Payout, 'id'>) => {
    const newId = Math.random().toString(36).substr(2, 9);
    const dbPayout = {
        id: newId,
        affiliate_id: payoutData.affiliateId,
        amount: payoutData.amount,
        date: payoutData.date,
        status: payoutData.status,
        receipt_url: payoutData.receiptUrl,
        notes: payoutData.notes
    };
    const { error } = await supabase.from('payouts').insert(dbPayout);
    if (!error) {
        setPayouts([...payouts, { ...payoutData, id: newId }]);
    }
  };

  const addGateway = async (gateway: Omit<PaymentGateway, 'id'>) => {
    const newId = Math.random().toString(36).substr(2, 9);
    let isEnabled = gateway.isEnabled;
    if (isEnabled) {
      const activeCount = gateways.filter(g => g.isEnabled).length;
      if (activeCount >= 3) isEnabled = false;
    }

    const dbGw = {
        id: newId,
        title: gateway.title,
        provider: gateway.provider,
        is_enabled: isEnabled,
        methods: gateway.methods,
        credentials: gateway.credentials
    };

    const { error } = await supabase.from('gateways').insert(dbGw);
    if (!error) {
        setGateways([...gateways, { ...gateway, id: newId, isEnabled }]);
    }
  };

  const updateGateway = async (gateway: PaymentGateway) => {
    if (gateway.isEnabled) {
        const activeCount = gateways.filter(g => g.isEnabled && g.id !== gateway.id).length;
        if (activeCount >= 3) return;
    }

    const dbGw = {
        title: gateway.title,
        provider: gateway.provider,
        is_enabled: gateway.isEnabled,
        methods: gateway.methods,
        credentials: gateway.credentials
    };

    const { error } = await supabase.from('gateways').update(dbGw).eq('id', gateway.id);
    if (!error) {
        setGateways(gateways.map(g => g.id === gateway.id ? gateway : g));
    }
  };

  const deleteGateway = async (id: string) => {
    const { error } = await supabase.from('gateways').delete().eq('id', id);
    if (!error) {
        setGateways(gateways.filter(g => g.id !== id));
    }
  };

  const toggleGatewayStatus = async (id: string) => {
    const gateway = gateways.find(g => g.id === id);
    if (!gateway) return { success: false, message: 'Gateway not found' };

    const newStatus = !gateway.isEnabled;
    if (newStatus) {
        const activeCount = gateways.filter(g => g.isEnabled).length;
        if (activeCount >= 3) {
            return { success: false, message: 'Limite de 3 contas ativas atingido. Desative uma conta antes.' };
        }
    }

    const { error } = await supabase.from('gateways').update({ is_enabled: newStatus }).eq('id', id);
    if (!error) {
        setGateways(gateways.map(g => g.id === id ? { ...g, isEnabled: newStatus } : g));
        return { success: true };
    }
    return { success: false, message: 'Error updating database' };
  };

  return (
    <AuthContext.Provider value={{ 
      user, users, plans, sales, gateways, payouts, settings, loading,
      refreshData: loadData,
      login, logout, register, purchasePlan,
      updateUser, deleteUser, addPlan, updatePlan, deletePlan, updateSettings, toggleAffiliateStatus, addPayout,
      addGateway, updateGateway, deleteGateway, toggleGatewayStatus
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};