import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/Buttons';
import { PaymentGateway, GatewayProvider, PaymentMethodType } from '../../types';
import { Plus, Edit2, Trash2, CheckCircle, XCircle, CreditCard, Wallet, Bitcoin, AlertTriangle } from 'lucide-react';

const PROVIDERS: { value: GatewayProvider; label: string }[] = [
  { value: 'MERCADOPAGO', label: 'Mercado Pago' },
  { value: 'PAGARME', label: 'Pagar.me' },
  { value: 'STRIPE', label: 'Stripe' },
  { value: 'OXAPAY', label: 'OxaPay' },
];

export const PaymentGateways: React.FC = () => {
  const { gateways, addGateway, updateGateway, deleteGateway, toggleGatewayStatus } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const [form, setForm] = useState<Partial<PaymentGateway>>({
    title: '',
    provider: 'MERCADOPAGO',
    isEnabled: true,
    methods: [],
    credentials: {}
  });

  const resetForm = () => {
    setForm({
      title: '',
      provider: 'MERCADOPAGO',
      isEnabled: true,
      methods: [],
      credentials: {}
    });
    setIsEditing(false);
    setEditingId(null);
    setError('');
  };

  const handleEdit = (gateway: PaymentGateway) => {
    setForm(gateway);
    setEditingId(gateway.id);
    setIsEditing(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.provider) {
        setError('Preencha o título da conta.');
        return;
    }
    if ((form.methods || []).length === 0) {
        setError('Selecione pelo menos um método de pagamento.');
        return;
    }

    if (editingId) {
       // Updating logic handled in toggle mostly, but here for content
       updateGateway(form as PaymentGateway);
    } else {
       addGateway(form as PaymentGateway);
    }
    resetForm();
  };

  const handleToggleStatus = (id: string) => {
      const result = toggleGatewayStatus(id);
      if (!result.success && result.message) {
          alert(result.message);
      }
  };

  const toggleMethod = (method: PaymentMethodType) => {
      const currentMethods = form.methods || [];
      if (currentMethods.includes(method)) {
          setForm({ ...form, methods: currentMethods.filter(m => m !== method) });
      } else {
          setForm({ ...form, methods: [...currentMethods, method] });
      }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Gateway de Pagamentos</h1>
        {!isEditing && (
            <Button onClick={() => setIsEditing(true)}>
                <Plus className="w-4 h-4 mr-2"/> Nova Conexão
            </Button>
        )}
      </div>

      {isEditing && (
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-lg animate-fade-in">
           <h3 className="text-lg font-bold mb-4">{editingId ? 'Editar Conexão' : 'Nova Conexão'}</h3>
           {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded text-sm">{error}</div>}
           
           <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                      <label className="block text-sm font-medium mb-1">Tipo do Gateway</label>
                      <select 
                        className="w-full p-2 border rounded dark:bg-zinc-800 dark:border-zinc-700"
                        value={form.provider}
                        onChange={e => setForm({...form, provider: e.target.value as GatewayProvider})}
                      >
                          {PROVIDERS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                      </select>
                  </div>
                  <div>
                      <label className="block text-sm font-medium mb-1">Título da Conta</label>
                      <input 
                        type="text"
                        className="w-full p-2 border rounded dark:bg-zinc-800 dark:border-zinc-700"
                        placeholder="Ex: Mercado Pago Principal"
                        value={form.title}
                        onChange={e => setForm({...form, title: e.target.value})}
                      />
                  </div>
              </div>

              {/* Dynamic Credentials Fields */}
              <div className="p-4 bg-gray-50 dark:bg-zinc-800/50 rounded border border-gray-200 dark:border-zinc-700">
                  <h4 className="text-sm font-bold mb-3">Credenciais de Acesso</h4>
                  <div className="space-y-3">
                      {form.provider === 'MERCADOPAGO' && (
                          <>
                            <input 
                                placeholder="Public Key"
                                className="w-full p-2 border rounded dark:bg-zinc-800 dark:border-zinc-700"
                                value={form.credentials?.publicKey || ''}
                                onChange={e => setForm({...form, credentials: {...form.credentials, publicKey: e.target.value}})}
                            />
                             <input 
                                placeholder="Access Token"
                                type="password"
                                className="w-full p-2 border rounded dark:bg-zinc-800 dark:border-zinc-700"
                                value={form.credentials?.accessToken || ''}
                                onChange={e => setForm({...form, credentials: {...form.credentials, accessToken: e.target.value}})}
                            />
                          </>
                      )}
                      {form.provider === 'STRIPE' && (
                           <>
                            <input 
                                placeholder="Publishable Key"
                                className="w-full p-2 border rounded dark:bg-zinc-800 dark:border-zinc-700"
                                value={form.credentials?.publicKey || ''}
                                onChange={e => setForm({...form, credentials: {...form.credentials, publicKey: e.target.value}})}
                            />
                             <input 
                                placeholder="Secret Key"
                                type="password"
                                className="w-full p-2 border rounded dark:bg-zinc-800 dark:border-zinc-700"
                                value={form.credentials?.secretKey || ''}
                                onChange={e => setForm({...form, credentials: {...form.credentials, secretKey: e.target.value}})}
                            />
                          </>
                      )}
                       {(form.provider === 'PAGARME' || form.provider === 'OXAPAY') && (
                           <input 
                                placeholder="API Key"
                                type="password"
                                className="w-full p-2 border rounded dark:bg-zinc-800 dark:border-zinc-700"
                                value={form.credentials?.apiKey || ''}
                                onChange={e => setForm({...form, credentials: {...form.credentials, apiKey: e.target.value}})}
                            />
                      )}
                  </div>
              </div>

              {/* Methods */}
              <div>
                  <label className="block text-sm font-medium mb-2">Métodos de Pagamento Habilitados</label>
                  <div className="flex flex-wrap gap-4">
                      <label className="flex items-center gap-2 cursor-pointer p-2 border rounded dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-800">
                          <input type="checkbox" checked={form.methods?.includes('PIX')} onChange={() => toggleMethod('PIX')} />
                          <Wallet className="w-4 h-4 text-green-600"/> PIX
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer p-2 border rounded dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-800">
                          <input type="checkbox" checked={form.methods?.includes('CREDIT_CARD')} onChange={() => toggleMethod('CREDIT_CARD')} />
                          <CreditCard className="w-4 h-4 text-blue-600"/> Cartão de Crédito
                      </label>
                       <label className="flex items-center gap-2 cursor-pointer p-2 border rounded dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-800">
                          <input type="checkbox" checked={form.methods?.includes('CRYPTO')} onChange={() => toggleMethod('CRYPTO')} />
                          <Bitcoin className="w-4 h-4 text-orange-500"/> Criptomoedas
                      </label>
                  </div>
              </div>
              
              <div className="flex justify-end gap-3 mt-4">
                  <Button type="button" variant="outline" onClick={resetForm}>Cancelar</Button>
                  <Button type="submit">Salvar Conexão</Button>
              </div>
           </form>
        </div>
      )}

      {/* List */}
      <div className="bg-white dark:bg-zinc-900 shadow overflow-hidden sm:rounded-lg border border-gray-200 dark:border-zinc-800">
          <ul className="divide-y divide-gray-200 dark:divide-zinc-800">
             {gateways.length === 0 && (
                 <li className="p-8 text-center text-gray-500">Nenhum gateway configurado.</li>
             )}
             {gateways.map(gateway => (
                 <li key={gateway.id} className="p-6 hover:bg-gray-50 dark:hover:bg-zinc-800/50">
                     <div className="flex items-center justify-between">
                         <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-full ${gateway.isEnabled ? 'bg-green-100 dark:bg-green-900/20' : 'bg-gray-100 dark:bg-gray-800'}`}>
                                {gateway.provider === 'OXAPAY' ? <Bitcoin className="w-6 h-6"/> : <CreditCard className="w-6 h-6"/>}
                            </div>
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2">
                                    {gateway.title}
                                    <span className="text-xs px-2 py-0.5 rounded bg-gray-200 dark:bg-zinc-700 text-gray-700 dark:text-gray-300">
                                        {PROVIDERS.find(p => p.value === gateway.provider)?.label}
                                    </span>
                                </h3>
                                <div className="flex gap-2 mt-1">
                                    {gateway.methods.map(m => (
                                        <span key={m} className="text-xs text-gray-500 border border-gray-200 dark:border-zinc-700 px-1 rounded">
                                            {m === 'CREDIT_CARD' ? 'Cartão' : m}
                                        </span>
                                    ))}
                                </div>
                            </div>
                         </div>

                         <div className="flex items-center gap-4">
                             <div className="flex flex-col items-end mr-4">
                                 <span className={`text-sm font-bold ${gateway.isEnabled ? 'text-green-600' : 'text-gray-400'}`}>
                                     {gateway.isEnabled ? 'ATIVO' : 'INATIVO'}
                                 </span>
                             </div>
                             
                             <button 
                                onClick={() => handleToggleStatus(gateway.id)}
                                title={gateway.isEnabled ? "Desativar" : "Ativar"}
                                className={`p-2 rounded-full hover:bg-gray-200 dark:hover:bg-zinc-700 ${gateway.isEnabled ? 'text-green-600' : 'text-gray-400'}`}
                             >
                                 {gateway.isEnabled ? <CheckCircle className="w-6 h-6"/> : <XCircle className="w-6 h-6"/>}
                             </button>
                             <button onClick={() => handleEdit(gateway)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-full dark:hover:bg-blue-900/20">
                                 <Edit2 className="w-5 h-5"/>
                             </button>
                             <button onClick={() => {if(confirm('Remover conexão?')) deleteGateway(gateway.id)}} className="p-2 text-red-600 hover:bg-red-50 rounded-full dark:hover:bg-red-900/20">
                                 <Trash2 className="w-5 h-5"/>
                             </button>
                         </div>
                     </div>
                 </li>
             ))}
          </ul>
      </div>
      
      <div className="flex items-start gap-2 text-sm text-amber-600 bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg">
          <AlertTriangle className="w-5 h-5 flex-shrink-0"/>
          <p>
              Nota: O sistema permite no máximo 3 contas ativas simultaneamente. Os métodos de pagamento exibidos no checkout dependerão das contas ativas.
          </p>
      </div>
    </div>
  );
};