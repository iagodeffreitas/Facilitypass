import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/Buttons';
import { Save, MessageCircle, Phone, CheckCircle } from 'lucide-react';

export const Settings: React.FC = () => {
  const { settings, updateSettings } = useAuth();
  const [form, setForm] = useState(settings);
  const [msg, setMsg] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    setForm(settings);
  }, [settings]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(form);
    setIsSaved(true);
    setMsg('Configurações salvas com sucesso!');
    setTimeout(() => {
        setMsg('');
        setIsSaved(false);
    }, 3000);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Configurações Gerais</h1>
      </div>

      <form onSubmit={handleSubmit} className="max-w-3xl space-y-8">
        
        {/* Contact Settings Card */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-lg border border-gray-200 dark:border-zinc-800 p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
                <MessageCircle className="w-32 h-32 text-green-500" />
            </div>
            
            <div className="flex items-center gap-4 mb-8 pb-6 border-b border-gray-100 dark:border-zinc-800">
                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                    <MessageCircle className="w-8 h-8 text-green-600 dark:text-green-400"/>
                </div>
                <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Canal de Suporte</h2>
                    <p className="text-sm text-gray-500">Configuração do contato direto com o cliente.</p>
                </div>
            </div>

            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        WhatsApp Oficial de Atendimento
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Phone className="h-5 w-5 text-gray-400" />
                        </div>
                        <input 
                            type="text"
                            value={form.supportWhatsapp}
                            onChange={e => setForm({...form, supportWhatsapp: e.target.value})}
                            className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-zinc-700 rounded-lg leading-5 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 sm:text-sm transition-all"
                            placeholder="Ex: 5511999999999"
                        />
                    </div>
                    <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                        <MessageCircle className="w-3 h-3"/>
                        Este número receberá todas as solicitações de suporte e ativação.
                    </p>
                </div>

                <div className="bg-green-50 dark:bg-green-900/10 p-4 rounded-lg border border-green-100 dark:border-green-900/20">
                    <h4 className="text-sm font-bold text-green-800 dark:text-green-400 mb-1">Como funciona?</h4>
                    <p className="text-xs text-green-700 dark:text-green-500">
                        O botão flutuante no site e os links de "Abrir Chamado" na área do cliente irão redirecionar automaticamente para este número.
                    </p>
                </div>
            </div>
        </div>

        {/* Action Bar */}
        <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-200 dark:border-zinc-800">
            {msg && (
                <div className="flex items-center text-green-600 dark:text-green-400 text-sm animate-fade-in font-medium">
                    <CheckCircle className="w-4 h-4 mr-2"/> {msg}
                </div>
            )}
            <Button type="submit" size="lg" className="min-w-[200px]" disabled={isSaved}>
                <Save className="w-5 h-5 mr-2"/>
                {isSaved ? 'Salvo!' : 'Salvar Alterações'}
            </Button>
        </div>
      </form>
    </div>
  );
};