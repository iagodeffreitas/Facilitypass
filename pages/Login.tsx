import React, { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Buttons';
import { Shield, User as UserIcon } from 'lucide-react';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [searchParams] = useSearchParams();
  const planId = searchParams.get('plan');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handlePostLoginRedirect = (role: string) => {
    if (planId) {
      navigate(`/checkout?plan=${planId}`);
    } else {
      navigate(role === 'ADMIN' ? '/admin' : '/dashboard');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const success = await login(email, password);
      if (success) {
        // Check role locally or wait for state update. 
        // For simplicity, we redirect based on email or fetch logic inside login (but login returns bool)
        // We'll rely on the fact that if login is true, context 'user' will be updated.
        // However, state update might be slightly delayed.
        // A simple check on email string for redirect (as per previous mock logic) works for immediate UX
        if (email === 'admin@facilitypass.com') {
           handlePostLoginRedirect('ADMIN');
        } else {
           handlePostLoginRedirect('CLIENT');
        }
      } else {
        setError('Credenciais inválidas. Tente novamente.');
      }
    } catch (err) {
      setError('Erro ao conectar com o servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = async (role: 'admin' | 'client') => {
    setIsLoading(true);
    let success = false;
    if (role === 'admin') {
      success = await login('admin@facilitypass.com', '123');
    } else {
      success = await login('joao@cliente.com', '123');
    }
    setIsLoading(false);

    if (success) {
      handlePostLoginRedirect(role === 'admin' ? 'ADMIN' : 'CLIENT');
    }
  };

  return (
    <div className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-zinc-900 p-8 rounded-xl shadow-xl border border-gray-200 dark:border-zinc-800">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">Facility Pass PF</h2>
          <p className="mt-2 text-sm text-gray-500">
            Acesso ao sistema com Database
          </p>
        </div>
        
        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 text-sm p-3 rounded text-center">
            {error}
          </div>
        )}

        {/* Quick Login Buttons (Test Mode) */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <button 
            type="button"
            onClick={() => handleQuickLogin('client')}
            className="flex flex-col items-center justify-center p-3 border border-gray-200 dark:border-zinc-700 rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50"
            disabled={isLoading}
          >
            <UserIcon className="w-6 h-6 mb-1 text-brand-red" />
            <span className="text-xs font-medium">Cliente (Teste)</span>
          </button>
          <button 
            type="button"
            onClick={() => handleQuickLogin('admin')}
            className="flex flex-col items-center justify-center p-3 border border-gray-200 dark:border-zinc-700 rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50"
            disabled={isLoading}
          >
            <Shield className="w-6 h-6 mb-1 text-blue-600" />
            <span className="text-xs font-medium">Admin (Teste)</span>
          </button>
        </div>

        <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-zinc-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-zinc-900 text-gray-500">Ou entre com credenciais</span>
            </div>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="email" className="sr-only">E-mail</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 placeholder-gray-500 text-gray-900 dark:text-white dark:bg-zinc-800 focus:outline-none focus:ring-brand-red focus:border-brand-red sm:text-sm"
                placeholder="E-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Senha / CPF</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 placeholder-gray-500 text-gray-900 dark:text-white dark:bg-zinc-800 focus:outline-none focus:ring-brand-red focus:border-brand-red sm:text-sm"
                placeholder="Senha ou CPF"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Entrando...' : 'Entrar'}
            </Button>
          </div>

           <div className="text-center text-sm">
            <span className="text-gray-500">Novo por aqui? </span>
            <Link to={planId ? `/register?plan=${planId}` : "/register"} className="text-brand-red hover:underline font-medium">Cadastre-se</Link>
          </div>
        </form>
      </div>
    </div>
  );
};