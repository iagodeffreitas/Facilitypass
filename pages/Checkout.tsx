import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { Button } from '../components/ui/Buttons';
import { Lock, CreditCard, Wallet, Bitcoin, AlertTriangle, QrCode, Copy, CheckCircle } from 'lucide-react';
import { PaymentMethodType } from '../types';

export const Checkout: React.FC = () => {
  const [searchParams] = useSearchParams();
  const planId = searchParams.get('plan');
  const { plans, purchasePlan, user, gateways } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodType | null>(null);

  // Form States
  const [cardData, setCardData] = useState({ number: '', name: '', expiry: '', cvv: '', cpf: '' });
  const [cryptoCopied, setCryptoCopied] = useState(false);
  const [pixCopied, setPixCopied] = useState(false);

  const selectedPlan = plans.find(p => p.id === planId);

  // Filter active gateways
  const activeGateways = gateways.filter(g => g.isEnabled);
  
  // Determine available methods
  const availableMethods = new Set<PaymentMethodType>();
  activeGateways.forEach(g => {
      g.methods.forEach(m => availableMethods.add(m));
  });

  const hasPix = availableMethods.has('PIX');
  const hasCard = availableMethods.has('CREDIT_CARD');
  const hasCrypto = availableMethods.has('CRYPTO');

  useEffect(() => {
    if (!user) {
        // If not logged in, redirect to login with the plan param
        navigate(planId ? `/login?plan=${planId}` : '/login');
    }
  }, [user, navigate, planId]);

  if (!selectedPlan) {
    return <div className="p-10 text-center">Plano não encontrado.</div>;
  }

  // --- Masking Helpers ---
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Remove non-digits
    const rawValue = e.target.value.replace(/\D/g, '');
    // Limit to 16 digits
    const truncated = rawValue.slice(0, 16);
    // Add space every 4 digits
    const formatted = truncated.replace(/(\d{4})(?=\d)/g, '$1 ');
    setCardData({ ...cardData, number: formatted });
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      // MM/AA format
      let val = e.target.value.replace(/\D/g, '');
      if (val.length > 4) val = val.slice(0, 4);
      if (val.length > 2) {
          val = val.slice(0, 2) + '/' + val.slice(2);
      }
      setCardData({ ...cardData, expiry: val });
  };

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if(!selectedMethod) {
        addToast('Selecione uma forma de pagamento', 'warning');
        return;
    }

    if (selectedMethod === 'CREDIT_CARD') {
        if (!cardData.number || !cardData.name || !cardData.expiry || !cardData.cvv || !cardData.cpf) {
            addToast('Por favor, preencha todos os dados do cartão.', 'error');
            return;
        }
        if (cardData.number.replace(/\s/g, '').length < 16) {
             addToast('Número do cartão inválido.', 'error');
             return;
        }
    }

    setLoading(true);
    
    // Logic to pick a gateway
    const compatibleGateway = activeGateways.find(g => g.methods.includes(selectedMethod));
    
    console.log(`Processing payment via ${compatibleGateway?.provider} (${compatibleGateway?.title})`);

    // Simulate API delay
    setTimeout(() => {
      if (planId) {
        purchasePlan(planId);
        navigate('/success');
      }
    }, 2000);
  };

  const copyToClipboard = (text: string, type: 'PIX' | 'CRYPTO') => {
      navigator.clipboard.writeText(text);
      if(type === 'PIX') {
          setPixCopied(true);
          setTimeout(() => setPixCopied(false), 2000);
          addToast('Chave PIX copiada!', 'success');
      } else {
          setCryptoCopied(true);
          setTimeout(() => setCryptoCopied(false), 2000);
          addToast('Endereço Cripto copiado!', 'success');
      }
  };

  return (
    <div className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-zinc-950">
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Order Summary */}
        <div className="bg-white dark:bg-zinc-900 p-8 rounded-xl shadow-lg border border-gray-200 dark:border-zinc-800 h-fit">
          <h3 className="text-xl font-bold mb-6">Resumo do Pedido</h3>
          <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-100 dark:border-zinc-800">
            <div>
              <p className="font-semibold">{selectedPlan.name}</p>
              <p className="text-sm text-gray-500">Duração: {selectedPlan.durationMonths} meses</p>
            </div>
            <p className="font-bold">R$ {selectedPlan.price.toFixed(2)}</p>
          </div>
          <div className="flex justify-between items-center text-xl font-bold text-gray-900 dark:text-white">
            <span>Total</span>
            <span>R$ {selectedPlan.price.toFixed(2)}</span>
          </div>
          
          <div className="mt-8 p-4 bg-gray-50 dark:bg-zinc-800 rounded-lg">
              <h4 className="text-sm font-semibold mb-2">Seus dados:</h4>
              <p className="text-sm text-gray-500">{user?.name}</p>
              <p className="text-sm text-gray-500">{user?.email}</p>
              <p className="text-sm text-gray-500">{user?.cpf}</p>
          </div>
        </div>

        {/* Payment Selection & Form */}
        <div className="bg-white dark:bg-zinc-900 p-8 rounded-xl shadow-lg border border-gray-200 dark:border-zinc-800">
           <h3 className="text-lg font-semibold mb-4">Pagamento</h3>
           
           {activeGateways.length === 0 ? (
               <div className="text-center p-6 bg-red-50 text-red-600 rounded-lg flex flex-col items-center">
                   <AlertTriangle className="w-8 h-8 mb-2"/>
                   <p>Nenhum método de pagamento disponível no momento.</p>
                   <p className="text-xs mt-1">Contate o administrador.</p>
               </div>
           ) : (
               <div className="space-y-4">
                 
                 {/* Selection Buttons */}
                 <div className="grid grid-cols-3 gap-2 mb-6">
                    {hasPix && (
                        <button 
                            type="button"
                            onClick={() => setSelectedMethod('PIX')}
                            className={`flex flex-col items-center justify-center p-3 border rounded-lg transition-all ${selectedMethod === 'PIX' ? 'border-brand-red bg-red-50 dark:bg-red-900/10 text-brand-red' : 'border-gray-200 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-800'}`}
                        >
                            <Wallet className="w-6 h-6 mb-1"/>
                            <span className="text-xs font-medium">PIX</span>
                        </button>
                    )}
                    {hasCard && (
                        <button 
                            type="button"
                            onClick={() => setSelectedMethod('CREDIT_CARD')}
                            className={`flex flex-col items-center justify-center p-3 border rounded-lg transition-all ${selectedMethod === 'CREDIT_CARD' ? 'border-brand-red bg-red-50 dark:bg-red-900/10 text-brand-red' : 'border-gray-200 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-800'}`}
                        >
                            <CreditCard className="w-6 h-6 mb-1"/>
                            <span className="text-xs font-medium">Cartão</span>
                        </button>
                    )}
                    {hasCrypto && (
                        <button 
                            type="button"
                            onClick={() => setSelectedMethod('CRYPTO')}
                            className={`flex flex-col items-center justify-center p-3 border rounded-lg transition-all ${selectedMethod === 'CRYPTO' ? 'border-brand-red bg-red-50 dark:bg-red-900/10 text-brand-red' : 'border-gray-200 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-800'}`}
                        >
                            <Bitcoin className="w-6 h-6 mb-1"/>
                            <span className="text-xs font-medium">Cripto</span>
                        </button>
                    )}
                 </div>

                 {/* CREDIT CARD FORM */}
                 {selectedMethod === 'CREDIT_CARD' && (
                     <div className="space-y-4 animate-fade-in">
                         <div>
                             <label className="block text-xs font-medium mb-1">Número do Cartão</label>
                             <div className="relative">
                                <CreditCard className="absolute left-3 top-2.5 w-4 h-4 text-gray-400"/>
                                <input 
                                    required
                                    type="text" 
                                    placeholder="0000 0000 0000 0000"
                                    className="w-full pl-9 p-2 border rounded dark:bg-zinc-800 dark:border-zinc-700 font-mono"
                                    value={cardData.number}
                                    onChange={handleCardNumberChange}
                                    maxLength={19}
                                />
                             </div>
                         </div>
                         <div>
                             <label className="block text-xs font-medium mb-1">Nome no Cartão</label>
                             <input 
                                required
                                type="text" 
                                placeholder="COMO NO CARTÃO"
                                className="w-full p-2 border rounded dark:bg-zinc-800 dark:border-zinc-700 uppercase"
                                value={cardData.name}
                                onChange={e => setCardData({...cardData, name: e.target.value.toUpperCase()})}
                             />
                         </div>
                         <div className="grid grid-cols-2 gap-4">
                             <div>
                                <label className="block text-xs font-medium mb-1">Validade</label>
                                <input 
                                    required
                                    type="text" 
                                    placeholder="MM/AA"
                                    maxLength={5}
                                    className="w-full p-2 border rounded dark:bg-zinc-800 dark:border-zinc-700 text-center"
                                    value={cardData.expiry}
                                    onChange={handleExpiryChange}
                                />
                             </div>
                             <div>
                                <label className="block text-xs font-medium mb-1">CVV</label>
                                <input 
                                    required
                                    type="text" 
                                    placeholder="123"
                                    maxLength={4}
                                    className="w-full p-2 border rounded dark:bg-zinc-800 dark:border-zinc-700 text-center"
                                    value={cardData.cvv}
                                    onChange={e => setCardData({...cardData, cvv: e.target.value.replace(/\D/g, '')})}
                                />
                             </div>
                         </div>
                         <div>
                             <label className="block text-xs font-medium mb-1">CPF do Titular</label>
                             <input 
                                required
                                type="text" 
                                placeholder="000.000.000-00"
                                className="w-full p-2 border rounded dark:bg-zinc-800 dark:border-zinc-700"
                                value={cardData.cpf}
                                onChange={e => setCardData({...cardData, cpf: e.target.value})}
                             />
                         </div>
                         <div>
                            <label className="block text-xs font-medium mb-1">Parcelamento</label>
                            <select className="w-full p-2 border rounded dark:bg-zinc-800 dark:border-zinc-700">
                                <option value="1">1x de R$ {selectedPlan.price.toFixed(2)}</option>
                                <option value="2">2x de R$ {(selectedPlan.price / 2).toFixed(2)}</option>
                                <option value="3">3x de R$ {(selectedPlan.price / 3).toFixed(2)}</option>
                            </select>
                         </div>
                     </div>
                 )}

                 {/* PIX FORM */}
                 {selectedMethod === 'PIX' && (
                     <div className="text-center animate-fade-in space-y-4">
                         <div className="p-4 bg-white inline-block rounded-lg shadow-sm border border-gray-200">
                             {/* Placeholder QR Code for Demo */}
                             <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=FACILITYPASS-ORDER-${planId}`} alt="QR Code Pix" className="w-32 h-32" />
                         </div>
                         <p className="text-sm text-gray-500">Escaneie o QR Code ou copie o código abaixo:</p>
                         <div className="flex gap-2">
                             <input 
                                readOnly
                                value={`00020126360014BR.GOV.BCB.PIX0114+551199999999520400005303986540${selectedPlan.price.toFixed(2).replace('.','')}5802BR5913FACILITY PASS6008SAO PAULO62070503***6304`}
                                className="flex-1 p-2 text-xs border rounded bg-gray-50 dark:bg-zinc-800 dark:border-zinc-700"
                             />
                             <Button size="sm" variant="outline" type="button" onClick={() => copyToClipboard('pix-code-mock', 'PIX')}>
                                 {pixCopied ? <CheckCircle className="w-4 h-4 text-green-600"/> : <Copy className="w-4 h-4"/>}
                             </Button>
                         </div>
                         <div className="text-xs text-amber-600 bg-amber-50 dark:bg-amber-900/10 p-2 rounded">
                             O pagamento via PIX é aprovado instantaneamente.
                         </div>
                     </div>
                 )}

                 {/* CRYPTO FORM */}
                 {selectedMethod === 'CRYPTO' && (
                     <div className="text-center animate-fade-in space-y-4">
                         <div className="p-4 bg-white inline-block rounded-lg shadow-sm border border-gray-200">
                             <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh`} alt="Crypto QR" className="w-32 h-32" />
                         </div>
                         <div className="space-y-2 text-left">
                            <label className="block text-xs font-medium">Endereço BTC (Bitcoin Network):</label>
                             <div className="flex gap-2">
                                <input 
                                    readOnly
                                    value="bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh"
                                    className="flex-1 p-2 text-xs border rounded bg-gray-50 dark:bg-zinc-800 dark:border-zinc-700 font-mono"
                                />
                                <Button size="sm" variant="outline" type="button" onClick={() => copyToClipboard('bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh', 'CRYPTO')}>
                                    {cryptoCopied ? <CheckCircle className="w-4 h-4 text-green-600"/> : <Copy className="w-4 h-4"/>}
                                </Button>
                             </div>
                         </div>
                         <div className="text-xs text-blue-600 bg-blue-50 dark:bg-blue-900/10 p-2 rounded">
                             Envie o valor exato equivalente. A confirmação pode levar até 10 minutos.
                         </div>
                     </div>
                 )}
               </div>
           )}

           <div className="mt-8">
             <Button 
                onClick={handlePayment} 
                disabled={loading || activeGateways.length === 0 || !selectedMethod}
                className="w-full py-4 text-lg"
             >
               {loading ? 'Processando...' : selectedMethod === 'PIX' ? 'Já realizei o pagamento' : `Pagar R$ ${selectedPlan.price.toFixed(2)}`}
             </Button>
           </div>
           
           <div className="mt-4 flex items-center justify-center text-xs text-gray-500 gap-1">
             <Lock className="w-3 h-3"/> Pagamento 100% Seguro
           </div>
        </div>

      </div>
    </div>
  );
};