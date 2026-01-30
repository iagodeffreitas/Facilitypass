import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Buttons';
import { Check, Dumbbell, Zap, Map, Star } from 'lucide-react';
import { MAP_URL } from '../constants';

export const LandingPage: React.FC = () => {
  const { plans, user } = useAuth();
  const navigate = useNavigate();

  const handleSelectPlan = (planId: string) => {
    if (user) {
      // If user is already logged in, go straight to checkout
      navigate(`/checkout?plan=${planId}`);
    } else {
      // If not, go to register (which allows switching to login) keeping the plan param
      navigate(`/register?plan=${planId}`);
    }
  };

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-zinc-900">
          {/* Abstract Background pattern */}
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#454545_1px,transparent_1px)] [background-size:16px_16px]"></div>
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-red/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight mb-6">
            Facility Pass PF: Liberdade para treinar <br/>
            <span className="text-brand-red">onde e quando quiser</span>
          </h1>
          <p className="max-w-2xl mx-auto text-xl text-gray-300 mb-10">
            Acesso ilimitado às melhores academias do Brasil. Sem fidelidade abusiva, sem burocracia. O plano ideal para sua rotina.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button size="lg" onClick={() => document.getElementById('plans')?.scrollIntoView({ behavior: 'smooth'})}>
              Ver Planos
            </Button>
            <a href={MAP_URL} target="_blank" rel="noreferrer">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                    <Map className="w-5 h-5 mr-2"/>
                    Ver Academias
                </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-white dark:bg-zinc-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 bg-gray-50 dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800">
              <div className="w-12 h-12 bg-brand-accent/10 rounded-lg flex items-center justify-center mb-4">
                <Dumbbell className="w-6 h-6 text-brand-accent" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Multi-Academias</h3>
              <p className="text-gray-600 dark:text-gray-400">Acesse milhares de unidades. Smart Fit, Bio Ritmo e muito mais em um só plano Facility Pass.</p>
            </div>
            <div className="p-6 bg-gray-50 dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800">
              <div className="w-12 h-12 bg-brand-red/10 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-brand-red" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Ativação Imediata</h3>
              <p className="text-gray-600 dark:text-gray-400">Pagou, treinou. Sem espera para aprovação de documentos complexos.</p>
            </div>
            <div className="p-6 bg-gray-50 dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800">
              <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center mb-4">
                <Star className="w-6 h-6 text-blue-500" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Benefícios Premium</h3>
              <p className="text-gray-600 dark:text-gray-400">Além de treino, tenha acesso a apps de meditação, nutrição e aulas online.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Plans Section */}
      <section id="plans" className="py-20 bg-gray-50 dark:bg-zinc-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Escolha seu plano Facility Pass</h2>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Transparência total. Sem taxas escondidas.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.filter(p => p.active).map((plan) => (
              <div key={plan.id} className="relative flex flex-col p-8 bg-white dark:bg-zinc-950 rounded-2xl shadow-xl border border-gray-200 dark:border-zinc-800 hover:border-brand-red transition-colors duration-300">
                <div className="mb-4">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{plan.name}</h3>
                  <p className="text-gray-500 text-sm mt-2">{plan.description}</p>
                </div>
                <div className="mb-6">
                  <span className="text-4xl font-extrabold text-gray-900 dark:text-white">R$ {plan.price.toFixed(2)}</span>
                  <span className="text-gray-500"> /mês</span>
                  <div className="text-xs text-brand-red font-semibold mt-1">Plano {plan.durationMonths} meses</div>
                </div>
                <ul className="space-y-4 mb-8 flex-1">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start">
                      <Check className="w-5 h-5 text-green-500 mr-2 shrink-0" />
                      <span className="text-gray-600 dark:text-gray-300 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button onClick={() => handleSelectPlan(plan.id)} className="w-full">
                  Quero este
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};