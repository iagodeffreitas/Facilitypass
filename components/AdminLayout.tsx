import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, ShoppingBag, DollarSign, CreditCard, Settings, CheckCircle } from 'lucide-react';

export const AdminLayout: React.FC = () => {
  const location = useLocation();
  const isActive = (path: string) => {
      // Handle exact match for root /admin, otherwise startsWith for sub-routes
      if (path === '/admin') return location.pathname === '/admin';
      return location.pathname.startsWith(path);
  };
  
  const navItems = [
    { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/admin/members', label: 'Membros', icon: Users },
    { path: '/admin/offers', label: 'Ofertas', icon: ShoppingBag },
    { path: '/admin/affiliates', label: 'Afiliados', icon: DollarSign },
    { path: '/admin/gateways', label: 'Gateways', icon: CreditCard },
    { path: '/admin/success-preview', label: 'Página de Obrigado', icon: CheckCircle },
    { path: '/admin/settings', label: 'Configurações', icon: Settings },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row gap-8">
            <aside className="w-full md:w-64 flex-shrink-0">
                <nav className="space-y-2">
                    {navItems.map(item => {
                        const Icon = item.icon;
                        const active = isActive(item.path);
                        return (
                            <Link 
                                key={item.path}
                                to={item.path} 
                                className={`flex items-center px-4 py-3 rounded-lg border transition-all duration-200 ${
                                    active
                                    ? 'bg-brand-red text-white border-brand-red shadow-md' 
                                    : 'bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 hover:border-brand-red text-gray-700 dark:text-gray-200 hover:shadow-sm'
                                }`}
                            >
                                <Icon className={`w-5 h-5 mr-3 ${active ? 'text-white' : 'text-gray-400 group-hover:text-brand-red'}`} />
                                <span className="font-medium">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>
            </aside>
            <main className="flex-1 min-w-0">
                <div className="bg-transparent rounded-xl animate-fade-in">
                    <Outlet />
                </div>
            </main>
        </div>
    </div>
  );
};