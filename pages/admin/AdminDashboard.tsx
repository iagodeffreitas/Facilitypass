import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { DollarSign, Users, ShoppingBag, UserX, RefreshCw } from 'lucide-react';
import { UserRole } from '../../types';

export const AdminDashboard: React.FC = () => {
  const { users, sales, plans, refreshData } = useAuth();
  const { addToast } = useToast();
  const [refreshing, setRefreshing] = useState(false);

  // Calculate Metrics
  const activeClients = users.filter(u => u.role === UserRole.CLIENT && u.subscription?.active).length;
  const totalRevenue = sales.reduce((acc, curr) => acc + curr.amount, 0);
  const inactiveUsers = users.filter(u => u.role === UserRole.CLIENT && !u.subscription?.active).length;
  const totalSalesCount = sales.length;

  // Prepare Chart Data
  const salesData = sales.map((sale, index) => ({
    name: sale.planName,
    amount: sale.amount,
    date: sale.date
  }));

  // Group sales by plan for distribution
  const salesByPlan = plans.map(plan => {
      const count = sales.filter(s => s.planName.includes(plan.name.split(' - ')[0])).length;
      return { name: plan.name.split(' - ')[0], vendas: count };
  });

  const handleRefresh = async () => {
      setRefreshing(true);
      await refreshData();
      setRefreshing(false);
      addToast('Dados atualizados com sucesso', 'info', 2000);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
         <h1 className="text-3xl font-bold">Dashboard Administrativo</h1>
         <button 
            onClick={handleRefresh}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-brand-red transition-colors"
            disabled={refreshing}
         >
             <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`}/>
             {refreshing ? 'Atualizando...' : 'Atualizar Dados'}
         </button>
      </div>
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Receita Total</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">R$ {totalRevenue.toFixed(2)}</h3>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-full">
              <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Clientes Ativos</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{activeClients}</h3>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-full">
              <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Planos Vendidos</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{totalSalesCount}</h3>
            </div>
            <div className="p-3 bg-brand-red/10 rounded-full">
              <ShoppingBag className="w-6 h-6 text-brand-red" />
            </div>
          </div>
        </div>
         <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Inativos</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{inactiveUsers}</h3>
            </div>
            <div className="p-3 bg-gray-100 dark:bg-zinc-800 rounded-full">
              <UserX className="w-6 h-6 text-gray-600 dark:text-gray-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm">
          <h3 className="text-lg font-bold mb-6">Histórico de Vendas</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                <XAxis dataKey="date" hide />
                <YAxis stroke="#888888" fontSize={12} tickFormatter={(value) => `R$${value}`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Line type="monotone" dataKey="amount" stroke="#E63946" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm">
          <h3 className="text-lg font-bold mb-6">Vendas por Tipo de Plano</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesByPlan}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                <XAxis dataKey="name" stroke="#888888" fontSize={12} />
                <YAxis stroke="#888888" fontSize={12} />
                <Tooltip 
                   contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', color: '#fff' }}
                   cursor={{fill: 'rgba(255,255,255,0.05)'}}
                />
                <Bar dataKey="vendas" fill="#CCFF00" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};