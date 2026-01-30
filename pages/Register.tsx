import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Buttons';
import { useTheme } from '../contexts/ThemeContext';

export const Register: React.FC = () => {
  const [searchParams] = useSearchParams();
  const planId = searchParams.get('plan');
  const navigate = useNavigate();
  const { register, user } = useAuth();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    cpf: '',
    phone: '',
    password: ''
  });

  // If already logged in, skip to checkout if plan selected, else dashboard
  useEffect(() => {
    if (user) {
      if (planId) {
        navigate(`/checkout?plan=${planId}`);
      } else {
        navigate('/dashboard');
      }
    }
  }, [user, planId, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await register(formData);
    setLoading(false);
    // Navigation handled by useEffect when user state updates
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-zinc-900 p-8 rounded-xl shadow-2xl border border-gray-200 dark:border-zinc-800">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">Criar Conta</h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Para adquirir seu plano Facility Pass
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="name" className="sr-only">Nome Completo</label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 placeholder-gray-500 text-gray-900 dark:text-white dark:bg-zinc-800 focus:outline-none focus:ring-brand-red focus:border-brand-red sm:text-sm"
                placeholder="Nome Completo"
                value={formData.name}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="email" className="sr-only">E-mail</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 placeholder-gray-500 text-gray-900 dark:text-white dark:bg-zinc-800 focus:outline-none focus:ring-brand-red focus:border-brand-red sm:text-sm"
                placeholder="E-mail"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="cpf" className="sr-only">CPF</label>
              <input
                id="cpf"
                name="cpf"
                type="text"
                required
                className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 placeholder-gray-500 text-gray-900 dark:text-white dark:bg-zinc-800 focus:outline-none focus:ring-brand-red focus:border-brand-red sm:text-sm"
                placeholder="CPF (apenas números)"
                value={formData.cpf}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="phone" className="sr-only">Celular / WhatsApp</label>
              <input
                id="phone"
                name="phone"
                type="tel"
                required
                className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 placeholder-gray-500 text-gray-900 dark:text-white dark:bg-zinc-800 focus:outline-none focus:ring-brand-red focus:border-brand-red sm:text-sm"
                placeholder="DDD + Celular"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
             <div>
              <label htmlFor="pass" className="sr-only">Senha</label>
              <input
                id="pass"
                name="password"
                type="password"
                required
                className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 placeholder-gray-500 text-gray-900 dark:text-white dark:bg-zinc-800 focus:outline-none focus:ring-brand-red focus:border-brand-red sm:text-sm"
                placeholder="Senha"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Processando...' : 'Continuar para Pagamento'}
            </Button>
          </div>
          
          <div className="text-center text-sm">
            <span className="text-gray-500">Já tem conta? </span>
            <Link to="/login" className="text-brand-red hover:underline font-medium">Faça Login</Link>
          </div>
        </form>
      </div>
    </div>
  );
};