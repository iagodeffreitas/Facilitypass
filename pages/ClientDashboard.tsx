import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Buttons';
import { Calendar, AlertCircle, MapPin, TrendingUp, Copy, DollarSign, Building2, Save, History, ExternalLink, Eye, X, Info, Check, MessageCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { MAP_URL } from '../constants';

export const ClientDashboard: React.FC = () => {
  const { user, plans, toggleAffiliateStatus, sales, payouts, updateUser, settings } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'plans' | 'affiliate'>('plans');
  const [viewReceipt, setViewReceipt] = useState<string | null>(null);

  // Bank Details State
  const [bankForm, setBankForm] = useState({
      pixKey: '',
      pixType: 'CPF',
      bankName: '',
      agency: '',
      account: ''
  });

  useEffect(() => {
      if (user && user.bankDetails) {
          setBankForm({
              pixKey: user.bankDetails.pixKey || '',
              pixType: user.bankDetails.pixType || 'CPF',
              bankName: user.bankDetails.bankName || '',
              agency: user.bankDetails.agency || '',
              account: user.bankDetails.account || ''
          });
      }
  }, [user]);

  if (!user) return null;

  // --- Support Link ---
  const supportLink = `https://wa.me/${settings.supportWhatsapp}?text=${encodeURIComponent(`Olá, sou o cliente ${user.name} (CPF: ${user.cpf}) e preciso de ajuda.`)}`;

  // --- Plans Logic ---
  const subscription = user.subscription;
  const currentPlan = subscription ? plans.find(p => p.id === subscription.planId) : null;
  const calculateDaysLeft = () => {
    if (!subscription) return 0;
    const end = new Date(subscription.endDate).getTime();
    const now = new Date().getTime();
    const diff = end - now;
    return Math.ceil(diff / (1000 * 3600 * 24));
  };
  const daysLeft = calculateDaysLeft();
  const progressPercentage = currentPlan 
    ? Math.max(0, Math.min(100, (daysLeft / (currentPlan.durationMonths * 30)) * 100)) 
    : 0;

  // --- Affiliate Logic ---
  const affiliateSales = sales.filter(s => s.affiliateId === user.id);
  const totalEarnings = affiliateSales.reduce((acc, curr) => acc + (curr.commissionAmount || 0), 0);
  const myPayouts = payouts.filter(p => p.affiliateId === user.id).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const totalPaid = myPayouts.reduce((acc, curr) => acc + curr.amount, 0);
  const balance = totalEarnings - totalPaid;
  const affiliateLink = `https://facilitypass-demo.com/?ref=${user.affiliateCode}`;

  const handleSaveBankDetails = (e: React.FormEvent) => {
      e.preventDefault();
      updateUser({
          ...user,
          bankDetails: {
              ...bankForm,
              pixType: bankForm.pixType as any
          }
      });
      alert('Dados bancários atualizados com sucesso!');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold">Olá, {user.name}</h1>
        <div className="flex bg-gray-200 dark:bg-zinc-800 p-1 rounded-lg">
            <button 
                onClick={() => setActiveTab('plans')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'plans' ? 'bg-white dark:bg-zinc-700 shadow text-brand-red' : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'}`}
            >
                Meus Planos
            </button>
            <button 
                onClick={() => setActiveTab('affiliate')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'affiliate' ? 'bg-white dark:bg-zinc-700 shadow text-brand-red' : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'}`}
            >
                Área de Afiliado
            </button>
        </div>
      </div>

      {activeTab === 'plans' ? (
          <div className="space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Active Plan Card */}
                <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-lg border border-gray-200 dark:border-zinc-800 p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-brand-red"/>
                    Meu Plano Atual
                </h2>
                
                {subscription && currentPlan ? (
                    <div>
                    <div className="mb-6">
                        <span className="text-2xl font-bold text-brand-red">{currentPlan.name}</span>
                        <p className="text-gray-500 mt-1">{currentPlan.description}</p>
                    </div>

                    <div className="mb-6">
                        <div className="flex justify-between text-sm mb-1">
                        <span>Validade</span>
                        <span className={daysLeft < 30 ? "text-red-500 font-bold" : ""}>{daysLeft} dias restantes</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-zinc-700 rounded-full h-2.5">
                        <div 
                            className="bg-brand-red h-2.5 rounded-full transition-all duration-1000" 
                            style={{ width: `${progressPercentage}%` }}
                        ></div>
                        </div>
                        <p className="text-xs text-gray-400 mt-2">Vence em: {new Date(subscription.endDate).toLocaleDateString()}</p>
                    </div>

                    <div className="p-4 bg-gray-50 dark:bg-zinc-800 rounded-lg mb-4">
                        <p className="text-sm font-medium">Token de Acesso:</p>
                        <p className="font-mono text-xl tracking-widest mt-1">FP-{user.cpf.slice(0,3)}-{Math.floor(Math.random()*9000)+1000}</p>
                        <p className="text-xs text-gray-500 mt-2">Apresente este código na recepção da academia.</p>
                    </div>
                    </div>
                ) : (
                    <div className="text-center py-10">
                    <AlertCircle className="w-10 h-10 text-gray-400 mx-auto mb-3"/>
                    <p className="text-gray-500">Você não possui um plano ativo.</p>
                    <Button 
                        className="mt-4" 
                        onClick={() => document.getElementById('available-plans')?.scrollIntoView({ behavior: 'smooth'})}
                    >
                        Ver Ofertas Disponíveis
                    </Button>
                    </div>
                )}
                </div>

                {/* Quick Actions & Support */}
                <div className="space-y-6">
                    {/* Support Card */}
                    <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-lg border border-gray-200 dark:border-zinc-800 p-6">
                        <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                            <MessageCircle className="w-5 h-5 text-green-600"/>
                            Precisa de Ajuda?
                        </h3>
                        <p className="text-sm mb-4 text-gray-500">Está com dúvidas sobre seu plano, pagamentos ou acesso?</p>
                        <a href={supportLink} target="_blank" rel="noreferrer">
                            <Button variant="outline" className="w-full border-green-500 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20">
                                Abrir Chamado no WhatsApp
                            </Button>
                        </a>
                    </div>

                    <div className="bg-brand-red/10 border border-brand-red/20 rounded-xl p-6">
                        <h3 className="font-bold text-lg mb-2">Encontre uma academia</h3>
                        <p className="text-sm mb-4">Verifique a disponibilidade de academias próximas que aceitam seu plano.</p>
                        <a href={MAP_URL} target="_blank" rel="noreferrer">
                            <Button variant="primary" className="w-full">
                                <MapPin className="w-4 h-4 mr-2"/> Acessar Mapa
                            </Button>
                        </a>
                    </div>

                    <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-lg border border-gray-200 dark:border-zinc-800 p-6">
                        <h3 className="font-bold text-lg mb-4">Dados Cadastrais</h3>
                        <ul className="space-y-3 text-sm">
                            <li className="flex justify-between border-b border-gray-100 dark:border-zinc-800 pb-2">
                                <span className="text-gray-500">Nome</span>
                                <span>{user.name}</span>
                            </li>
                            <li className="flex justify-between border-b border-gray-100 dark:border-zinc-800 pb-2">
                                <span className="text-gray-500">Email</span>
                                <span>{user.email}</span>
                            </li>
                            <li className="flex justify-between border-b border-gray-100 dark:border-zinc-800 pb-2">
                                <span className="text-gray-500">CPF</span>
                                <span>{user.cpf}</span>
                            </li>
                        </ul>
                        <Button variant="outline" size="sm" className="mt-4 w-full">Editar Dados</Button>
                    </div>
                </div>
            </div>

            {/* Available Plans Section */}
            <div id="available-plans" className="animate-fade-in border-t border-gray-200 dark:border-zinc-800 pt-10">
                <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Ofertas Disponíveis</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {plans.filter(p => p.active).map(plan => {
                    const isCurrent = subscription?.planId === plan.id && subscription?.active;
                    return (
                        <div key={plan.id} className={`flex flex-col bg-white dark:bg-zinc-900 rounded-xl p-6 border transition-all duration-300 ${isCurrent ? 'border-brand-red ring-1 ring-brand-red' : 'border-gray-200 dark:border-zinc-800 hover:border-brand-red/50 hover:shadow-lg'}`}>
                            <div className="mb-4">
                                <h3 className="font-bold text-lg">{plan.name}</h3>
                                <p className="text-sm text-gray-500 mt-1 min-h-[40px]">{plan.description}</p>
                            </div>
                            <div className="mb-6">
                                <span className="text-3xl font-bold">R$ {plan.price.toFixed(2)}</span>
                                <span className="text-xs text-gray-500">/mês</span>
                                <div className="text-xs text-brand-red font-semibold mt-1">Plano {plan.durationMonths} meses</div>
                            </div>
                            <ul className="space-y-2 mb-8 flex-1">
                                {plan.features.slice(0, 4).map((f, i) => (
                                    <li key={i} className="flex items-start text-xs text-gray-600 dark:text-gray-400">
                                        <Check className="w-4 h-4 text-green-500 mr-2 shrink-0"/>
                                        {f}
                                    </li>
                                ))}
                            </ul>
                            <Button 
                                variant={isCurrent ? 'outline' : 'primary'} 
                                disabled={isCurrent}
                                onClick={() => navigate(`/checkout?plan=${plan.id}`)}
                                className="w-full"
                            >
                                {isCurrent ? 'Plano Atual' : 'Contratar Agora'}
                            </Button>
                        </div>
                    );
                })}
                </div>
            </div>
          </div>
      ) : (
          <div className="animate-fade-in">
              {!user.isAffiliate ? (
                  <div className="bg-white dark:bg-zinc-900 p-10 rounded-xl border border-gray-200 dark:border-zinc-800 text-center max-w-2xl mx-auto">
                      <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                          <TrendingUp className="w-10 h-10 text-blue-600 dark:text-blue-400"/>
                      </div>
                      <h2 className="text-2xl font-bold mb-4">Torne-se um Parceiro Facility Pass</h2>
                      <p className="text-gray-600 dark:text-gray-300 mb-8">
                          Divulgue nossos planos para seus amigos e seguidores e ganhe comissões por cada venda realizada. É simples, rápido e você acompanha tudo por aqui.
                      </p>
                      <Button size="lg" onClick={() => toggleAffiliateStatus(user.id)}>
                          Quero ser Afiliado
                      </Button>
                  </div>
              ) : (
                  <div className="space-y-8">
                      {/* Top Stats */}
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="bg-gradient-to-br from-brand-red to-red-700 text-white p-6 rounded-xl shadow-lg">
                            <h3 className="text-sm opacity-80 mb-1">Saldo Disponível</h3>
                            <p className="text-3xl font-bold">R$ {balance.toFixed(2)}</p>
                            <div className="flex items-start gap-2 mt-3 text-xs text-red-100 bg-white/20 p-2 rounded">
                                <Info className="w-4 h-4 flex-shrink-0" />
                                <span>Pagamentos realizados todo dia 5.</span>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-gray-200 dark:border-zinc-800">
                            <h3 className="text-sm text-gray-500 mb-1">Vendas Realizadas</h3>
                            <p className="text-3xl font-bold text-gray-900 dark:text-white">{affiliateSales.length}</p>
                        </div>
                        <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-gray-200 dark:border-zinc-800">
                            <h3 className="text-sm text-gray-500 mb-1">Total Recebido</h3>
                            <p className="text-3xl font-bold text-green-600">R$ {totalPaid.toFixed(2)}</p>
                        </div>
                        <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-gray-200 dark:border-zinc-800">
                            <h3 className="text-sm text-gray-500 mb-1">Taxa de Conversão</h3>
                            <p className="text-3xl font-bold text-blue-500">3.2%</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                          {/* Left Column: Link & Bank Details */}
                          <div className="space-y-8">
                                {/* Link Sharing */}
                                <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-gray-200 dark:border-zinc-800">
                                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                                        <TrendingUp className="w-5 h-5 text-brand-red"/>
                                        Seu Link de Divulgação
                                    </h3>
                                    <div className="flex flex-col sm:flex-row gap-4">
                                        <div className="flex-grow p-3 bg-gray-50 dark:bg-zinc-800 rounded-lg border border-gray-200 dark:border-zinc-700 font-mono text-sm break-all">
                                            {affiliateLink}
                                        </div>
                                        <Button variant="secondary" onClick={() => { navigator.clipboard.writeText(affiliateLink); alert('Link copiado!'); }}>
                                            <Copy className="w-4 h-4 mr-2"/> Copiar
                                        </Button>
                                    </div>
                                    <p className="text-sm text-gray-500 mt-2">
                                        Seu código de parceiro é: <span className="font-bold text-gray-900 dark:text-white">{user.affiliateCode}</span>
                                    </p>
                                </div>

                                {/* Bank Details Form */}
                                <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-gray-200 dark:border-zinc-800">
                                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                                        <Building2 className="w-5 h-5 text-brand-red"/>
                                        Dados para Recebimento
                                    </h3>
                                    <form onSubmit={handleSaveBankDetails} className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium mb-1">Tipo de Chave PIX</label>
                                                <select 
                                                    className="w-full p-2 border rounded dark:bg-zinc-800 dark:border-zinc-700"
                                                    value={bankForm.pixType}
                                                    onChange={e => setBankForm({...bankForm, pixType: e.target.value})}
                                                >
                                                    <option value="CPF">CPF</option>
                                                    <option value="EMAIL">E-mail</option>
                                                    <option value="PHONE">Telefone</option>
                                                    <option value="RANDOM">Chave Aleatória</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium mb-1">Chave PIX</label>
                                                <input 
                                                    type="text"
                                                    className="w-full p-2 border rounded dark:bg-zinc-800 dark:border-zinc-700"
                                                    value={bankForm.pixKey}
                                                    onChange={e => setBankForm({...bankForm, pixKey: e.target.value})}
                                                    placeholder="Digite sua chave"
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-3 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium mb-1">Banco</label>
                                                <input 
                                                    className="w-full p-2 border rounded dark:bg-zinc-800 dark:border-zinc-700"
                                                    value={bankForm.bankName}
                                                    onChange={e => setBankForm({...bankForm, bankName: e.target.value})}
                                                    placeholder="Ex: Nubank"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium mb-1">Agência</label>
                                                <input 
                                                    className="w-full p-2 border rounded dark:bg-zinc-800 dark:border-zinc-700"
                                                    value={bankForm.agency}
                                                    onChange={e => setBankForm({...bankForm, agency: e.target.value})}
                                                    placeholder="0001"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium mb-1">Conta</label>
                                                <input 
                                                    className="w-full p-2 border rounded dark:bg-zinc-800 dark:border-zinc-700"
                                                    value={bankForm.account}
                                                    onChange={e => setBankForm({...bankForm, account: e.target.value})}
                                                    placeholder="12345-6"
                                                />
                                            </div>
                                        </div>
                                        <Button type="submit" variant="outline" className="w-full">
                                            <Save className="w-4 h-4 mr-2"/> Salvar Dados Bancários
                                        </Button>
                                    </form>
                                </div>
                          </div>

                          {/* Right Column: Offers & History */}
                          <div className="space-y-8">
                                {/* Payout History */}
                                <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-gray-200 dark:border-zinc-800">
                                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                                        <History className="w-5 h-5 text-brand-red"/>
                                        Histórico de Pagamentos
                                    </h3>
                                    <div className="overflow-hidden">
                                        {myPayouts.length > 0 ? (
                                            <div className="space-y-3">
                                                {myPayouts.map(payout => (
                                                    <div key={payout.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-zinc-800 rounded-lg border border-gray-100 dark:border-zinc-700">
                                                        <div>
                                                            <p className="font-bold text-green-600">R$ {payout.amount.toFixed(2)}</p>
                                                            <p className="text-xs text-gray-500">{new Date(payout.date).toLocaleDateString()}</p>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full font-medium">
                                                                PAGO
                                                            </span>
                                                            {payout.receiptUrl && (
                                                                <button 
                                                                    onClick={() => setViewReceipt(payout.receiptUrl || null)}
                                                                    className="flex items-center gap-1 text-xs text-blue-500 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 px-2 py-1 rounded transition-colors"
                                                                    title="Ver Comprovante"
                                                                >
                                                                    <Eye className="w-4 h-4"/>
                                                                    <span className="hidden sm:inline">Comprovante</span>
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-6 text-gray-500 bg-gray-50 dark:bg-zinc-800 rounded-lg">
                                                Nenhum pagamento recebido ainda.
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Available Offers (Compact View) */}
                                <div>
                                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                                        <DollarSign className="w-5 h-5 text-brand-red"/>
                                        Comissões por Plano
                                    </h3>
                                    <div className="space-y-3">
                                        {plans.filter(p => p.active && p.affiliateEnabled).map(plan => (
                                            <div key={plan.id} className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 flex justify-between items-center">
                                                <div>
                                                    <h4 className="font-bold text-sm">{plan.name}</h4>
                                                    <p className="text-xs text-gray-500">Preço: R$ {plan.price.toFixed(2)}</p>
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full mb-1 inline-block">{plan.commissionPercent}%</span>
                                                    <p className="font-bold text-green-600 text-sm">Ganhe R$ {((plan.price * (plan.commissionPercent || 0)) / 100).toFixed(2)}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                          </div>
                      </div>
                  </div>
              )}
          </div>
      )}

      {/* RECEIPT VIEW MODAL */}
      {viewReceipt && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in" onClick={() => setViewReceipt(null)}>
              <div className="bg-white dark:bg-zinc-900 rounded-xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl relative" onClick={e => e.stopPropagation()}>
                  {/* Header */}
                  <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-zinc-800">
                      <h3 className="font-bold text-lg">Comprovante de Pagamento</h3>
                      <button 
                          onClick={() => setViewReceipt(null)} 
                          className="p-1 text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 transition"
                      >
                          <X className="w-6 h-6"/>
                      </button>
                  </div>
                  {/* Image Body */}
                  <div className="flex-1 overflow-auto p-4 flex justify-center items-center bg-gray-100 dark:bg-black/50">
                       <img src={viewReceipt} alt="Comprovante de Pagamento" className="max-w-full max-h-[70vh] object-contain shadow-lg rounded" />
                  </div>
                  <div className="p-4 border-t border-gray-200 dark:border-zinc-800 flex justify-end bg-white dark:bg-zinc-900">
                      <Button onClick={() => setViewReceipt(null)}>Fechar</Button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};