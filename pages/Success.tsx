import React from 'react';
import { Button } from '../components/ui/Buttons';
import { CheckCircle, MessageCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const Success: React.FC = () => {
  const { settings } = useAuth();
  
  const whatsappNumber = settings.supportWhatsapp || '5511999999999';
  const message = encodeURIComponent('Olá! Acabei de realizar o pagamento do meu plano Facility Pass e gostaria de solicitar a ativação do meu cadastro.');
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${message}`;

  return (
    <div className="flex-grow flex items-center justify-center bg-gray-50 dark:bg-zinc-950 p-4">
      <div className="max-w-lg w-full bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl p-8 text-center border border-gray-200 dark:border-zinc-800 animate-fade-in">
        <div className="mx-auto w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6">
          <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
        </div>
        
        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-4">Pagamento Confirmado!</h2>
        <div className="bg-gray-50 dark:bg-zinc-800 p-4 rounded-lg mb-6">
            <p className="text-gray-600 dark:text-gray-300 text-sm">
            Seu pedido foi processado com sucesso. Para começar a treinar, finalize a ativação da sua conta junto ao nosso suporte.
            </p>
        </div>

        <div className="space-y-4">
            <a href={whatsappLink} target="_blank" rel="noreferrer" className="block transform transition hover:scale-105 duration-200">
            <Button className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white py-4 text-lg font-bold shadow-lg flex items-center justify-center gap-2">
                <MessageCircle className="w-6 h-6" />
                Falar com Suporte no WhatsApp
            </Button>
            </a>

            <Link to="/dashboard" className="block">
            <Button variant="outline" className="w-full flex items-center justify-center gap-2">
                Ir para o Painel <ArrowRight className="w-4 h-4"/>
            </Button>
            </Link>
        </div>
      </div>
    </div>
  );
};