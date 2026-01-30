import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/Buttons';
import { User, Payout } from '../../types';
import { Search, Edit2, Trash2, Eye, Lock, Unlock, X, Save, TrendingUp, DollarSign, UserCheck, CreditCard, Upload, FileText, CheckCircle, AlertTriangle } from 'lucide-react';

export const Affiliates: React.FC = () => {
  const { users, sales, updateUser, payouts, addPayout } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');

  // Modal States
  const [viewUser, setViewUser] = useState<User | null>(null); // For generic details
  const [financeUser, setFinanceUser] = useState<User | null>(null); // For financial dashboard
  const [payModalUser, setPayModalUser] = useState<User | null>(null); // For payment action
  const [editCommissionUser, setEditCommissionUser] = useState<User | null>(null);
  
  // Forms
  const [newCommissionVal, setNewCommissionVal] = useState<string>('');
  const [paymentAmount, setPaymentAmount] = useState<string>('');
  const [maxPaymentAmount, setMaxPaymentAmount] = useState<number>(0);
  const [receiptImage, setReceiptImage] = useState<string | null>(null);

  const affiliates = users.filter(u => u.isAffiliate);

  const filteredAffiliates = affiliates.filter(a => 
    a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (a.affiliateCode || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- Helpers ---

  const getAffiliateStats = (affiliateId: string) => {
    const affiliateSales = sales.filter(s => s.affiliateId === affiliateId);
    const totalSales = affiliateSales.length;
    const totalCommission = affiliateSales.reduce((acc, curr) => acc + (curr.commissionAmount || 0), 0);
    const totalPaid = payouts.filter(p => p.affiliateId === affiliateId).reduce((acc, curr) => acc + curr.amount, 0);
    const totalRevenueGenerated = affiliateSales.reduce((acc, curr) => acc + curr.amount, 0);
    
    return { totalSales, totalCommission, totalPaid, balance: totalCommission - totalPaid, totalRevenueGenerated, affiliateSales };
  };

  const getMonthlyStats = (affiliateId: string) => {
      const affiliateSales = sales.filter(s => s.affiliateId === affiliateId);
      const groups: {[key: string]: {sales: number, commission: number}} = {};
      
      affiliateSales.forEach(sale => {
          const date = new Date(sale.date);
          const key = `${date.getMonth() + 1}/${date.getFullYear()}`;
          if(!groups[key]) groups[key] = { sales: 0, commission: 0 };
          groups[key].sales += 1;
          groups[key].commission += (sale.commissionAmount || 0);
      });
      return groups;
  };

  // --- Actions ---

  const handleEditCommission = (user: User) => {
      setEditCommissionUser(user);
      setNewCommissionVal(user.affiliateCommissionOverride?.toString() || '');
  };

  const saveCommission = (e: React.FormEvent) => {
      e.preventDefault();
      if(editCommissionUser) {
          const val = parseFloat(newCommissionVal);
          updateUser({
              ...editCommissionUser,
              affiliateCommissionOverride: isNaN(val) ? undefined : val
          });
          setEditCommissionUser(null);
      }
  };

  const handleBlockToggle = (user: User) => {
      const isBlocked = user.affiliateStatus === 'BLOCKED';
      const newStatus = isBlocked ? 'ACTIVE' : 'BLOCKED';
      
      if(confirm(`Deseja ${isBlocked ? 'desbloquear' : 'bloquear'} o afiliado ${user.name}?`)) {
          updateUser({
              ...user,
              affiliateStatus: newStatus
          });
      }
  };

  const handleDeleteAffiliate = (user: User) => {
      if(confirm(`Tem certeza que deseja remover ${user.name} do programa de afiliados? O usuário continuará existindo como cliente.`)) {
          updateUser({
              ...user,
              isAffiliate: false,
              affiliateCode: undefined,
              affiliateStatus: undefined,
              affiliateCommissionOverride: undefined
          });
      }
  };

  const handleOpenPayment = (user: User, balance: number) => {
      setPayModalUser(user);
      setPaymentAmount(balance.toFixed(2));
      setMaxPaymentAmount(balance);
      setReceiptImage(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
              setReceiptImage(reader.result as string);
          };
          reader.readAsDataURL(file);
      }
  };

  const submitPayment = (e: React.FormEvent) => {
      e.preventDefault();
      if (!payModalUser || !paymentAmount) return;

      const amount = parseFloat(paymentAmount);
      if(amount > maxPaymentAmount) {
          alert("O valor do pagamento não pode ser maior que o saldo disponível.");
          return;
      }

      addPayout({
          affiliateId: payModalUser.id,
          amount: amount,
          date: new Date().toISOString(),
          status: 'PAID',
          receiptUrl: receiptImage || undefined
      });

      setPayModalUser(null);
      // Force refresh of stats happens automatically via Context update
      alert('Pagamento registrado e saldo atualizado!');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Gestão de Afiliados</h1>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-gray-200 dark:border-zinc-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm text-gray-500">Total de Afiliados</h3>
                <p className="text-2xl font-bold">{affiliates.length}</p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-full">
                  <UserCheck className="w-6 h-6 text-blue-600"/>
              </div>
          </div>
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-gray-200 dark:border-zinc-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm text-gray-500">Comissões Pagas</h3>
                <p className="text-2xl font-bold text-green-600">
                    R$ {payouts.reduce((acc, curr) => acc + curr.amount, 0).toFixed(2)}
                </p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-full">
                  <DollarSign className="w-6 h-6 text-green-600"/>
              </div>
          </div>
           <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-gray-200 dark:border-zinc-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm text-gray-500">Vendas Indicadas</h3>
                <p className="text-2xl font-bold text-brand-red">
                    {sales.filter(s => s.affiliateId).length}
                </p>
              </div>
               <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-full">
                  <TrendingUp className="w-6 h-6 text-brand-red"/>
              </div>
          </div>
      </div>

      {/* Search */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg leading-5 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-brand-red sm:text-sm"
          placeholder="Buscar por nome, email ou código..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-zinc-900 shadow overflow-hidden sm:rounded-lg border border-gray-200 dark:border-zinc-800">
         <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-zinc-800">
                <thead className="bg-gray-50 dark:bg-zinc-800">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Afiliado</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Código</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendas</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Comissão Fixa</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                    </tr>
                </thead>
                <tbody className="bg-white dark:bg-zinc-900 divide-y divide-gray-200 dark:divide-zinc-800">
                    {filteredAffiliates.map(affiliate => {
                        const stats = getAffiliateStats(affiliate.id);
                        const isBlocked = affiliate.affiliateStatus === 'BLOCKED';
                        
                        return (
                            <tr key={affiliate.id} className={isBlocked ? 'bg-red-50 dark:bg-red-900/10' : ''}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <button 
                                          onClick={() => setFinanceUser(affiliate)}
                                          className="text-left group"
                                        >
                                            <div className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-brand-red underline decoration-dotted underline-offset-4">{affiliate.name}</div>
                                            <div className="text-sm text-gray-500">{affiliate.email}</div>
                                        </button>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${isBlocked ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'}`}>
                                        {isBlocked ? 'Bloqueado' : 'Ativo'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="font-mono text-xs bg-gray-100 dark:bg-zinc-800 px-2 py-1 rounded">
                                        {affiliate.affiliateCode}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {stats.totalSales}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {affiliate.affiliateCommissionOverride ? (
                                        <span className="text-blue-600 font-bold">{affiliate.affiliateCommissionOverride}%</span>
                                    ) : (
                                        <span className="text-gray-400 text-xs">Padrão</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <div className="flex justify-end gap-2">
                                        <button 
                                            onClick={() => setFinanceUser(affiliate)} 
                                            title="Ver Financeiro"
                                            className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-full transition"
                                        >
                                            <DollarSign className="w-4 h-4" />
                                        </button>
                                        <button 
                                            onClick={() => setViewUser(affiliate)} 
                                            title="Ver Detalhes"
                                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition"
                                        >
                                            <Eye className="w-4 h-4" />
                                        </button>
                                        <button 
                                            onClick={() => handleEditCommission(affiliate)}
                                            title="Editar Comissão"
                                            className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-full transition"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button 
                                            onClick={() => handleBlockToggle(affiliate)}
                                            title={isBlocked ? "Desbloquear" : "Bloquear"}
                                            className={`p-2 rounded-full transition ${isBlocked ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:text-orange-600 hover:bg-orange-50'}`}
                                        >
                                            {isBlocked ? <Unlock className="w-4 h-4"/> : <Lock className="w-4 h-4"/>}
                                        </button>
                                        <button 
                                            onClick={() => handleDeleteAffiliate(affiliate)}
                                            title="Excluir Afiliado"
                                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                     {filteredAffiliates.length === 0 && (
                        <tr>
                            <td colSpan={6} className="px-6 py-8 text-center text-gray-500">Nenhum afiliado encontrado com os filtros atuais.</td>
                        </tr>
                    )}
                </tbody>
            </table>
         </div>
      </div>

      {/* --- MODALS --- */}

      {/* FINANCE DASHBOARD MODAL */}
      {financeUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
             <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-2xl w-full max-w-4xl overflow-hidden border border-gray-200 dark:border-zinc-800 flex flex-col max-h-[90vh]">
                <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-zinc-800">
                    <div>
                        <h3 className="text-xl font-bold flex items-center gap-2">
                             <CreditCard className="w-6 h-6 text-brand-red"/>
                             Financeiro: {financeUser.name}
                        </h3>
                        <p className="text-sm text-gray-500">Gestão de Comissões e Pagamentos</p>
                    </div>
                    <button onClick={() => setFinanceUser(null)} className="text-gray-400 hover:text-gray-600">
                        <X className="w-6 h-6"/>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                        {(() => {
                            const stats = getAffiliateStats(financeUser.id);
                            return (
                                <>
                                    <div className="bg-gray-50 dark:bg-zinc-800 p-4 rounded-lg">
                                        <p className="text-sm text-gray-500">Total Comissões</p>
                                        <p className="text-2xl font-bold">R$ {stats.totalCommission.toFixed(2)}</p>
                                    </div>
                                    <div className="bg-gray-50 dark:bg-zinc-800 p-4 rounded-lg">
                                        <p className="text-sm text-gray-500">Total Pago</p>
                                        <p className="text-2xl font-bold text-green-600">R$ {stats.totalPaid.toFixed(2)}</p>
                                    </div>
                                    <div className="bg-brand-red/10 p-4 rounded-lg border border-brand-red/20">
                                        <p className="text-sm text-red-600 dark:text-red-400">Saldo Pendente</p>
                                        <p className="text-2xl font-bold text-brand-red">R$ {stats.balance.toFixed(2)}</p>
                                        {stats.balance > 0 && (
                                            <Button size="sm" className="mt-2 w-full" onClick={() => handleOpenPayment(financeUser, stats.balance)}>
                                                Realizar Pagamento
                                            </Button>
                                        )}
                                    </div>
                                </>
                            );
                        })()}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Monthly Breakdown */}
                        <div>
                            <h4 className="font-bold mb-4 flex items-center gap-2">
                                <TrendingUp className="w-4 h-4"/> Comissões Mensais
                            </h4>
                            <div className="space-y-2">
                                {Object.entries(getMonthlyStats(financeUser.id)).map(([month, data]) => (
                                    <div key={month} className="flex justify-between items-center p-3 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg">
                                        <div>
                                            <span className="font-bold">{month}</span>
                                            <div className="text-xs text-gray-500">{data.sales} vendas</div>
                                        </div>
                                        <span className="font-bold text-green-600">+ R$ {data.commission.toFixed(2)}</span>
                                    </div>
                                ))}
                                {Object.keys(getMonthlyStats(financeUser.id)).length === 0 && (
                                    <p className="text-gray-500 text-sm">Nenhuma venda registrada.</p>
                                )}
                            </div>
                        </div>

                        {/* Payment History */}
                        <div>
                            <h4 className="font-bold mb-4 flex items-center gap-2">
                                <FileText className="w-4 h-4"/> Histórico de Pagamentos
                            </h4>
                            <div className="space-y-2">
                                {payouts.filter(p => p.affiliateId === financeUser.id).map(payout => (
                                    <div key={payout.id} className="p-3 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg flex justify-between items-start">
                                        <div>
                                            <div className="font-bold text-sm">Pagamento Realizado</div>
                                            <div className="text-xs text-gray-500">{new Date(payout.date).toLocaleDateString()}</div>
                                            {payout.receiptUrl && (
                                                <a href={payout.receiptUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline mt-1 block">
                                                    Ver Comprovante
                                                </a>
                                            )}
                                        </div>
                                        <span className="font-bold text-red-600">- R$ {payout.amount.toFixed(2)}</span>
                                    </div>
                                ))}
                                {payouts.filter(p => p.affiliateId === financeUser.id).length === 0 && (
                                    <p className="text-gray-500 text-sm">Nenhum pagamento realizado.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* PAYMENT MODAL */}
      {payModalUser && (
           <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
             <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-200 dark:border-zinc-800">
                <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-zinc-800">
                    <h3 className="text-lg font-bold">Realizar Pagamento</h3>
                    <button onClick={() => setPayModalUser(null)} className="text-gray-400 hover:text-gray-600">
                        <X className="w-5 h-5"/>
                    </button>
                </div>
                
                <form onSubmit={submitPayment} className="p-6 space-y-4">
                    {/* Bank Details View */}
                    <div className="bg-gray-50 dark:bg-zinc-800 p-4 rounded-lg text-sm space-y-2">
                        <h4 className="font-bold text-gray-700 dark:text-gray-300 mb-2 border-b border-gray-200 dark:border-zinc-700 pb-1">Dados Bancários do Afiliado</h4>
                        {payModalUser.bankDetails ? (
                            <>
                                {payModalUser.bankDetails.pixKey && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Chave PIX:</span>
                                        <span className="font-mono font-medium">{payModalUser.bankDetails.pixKey}</span>
                                    </div>
                                )}
                                {payModalUser.bankDetails.bankName && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Banco:</span>
                                        <span className="font-medium">{payModalUser.bankDetails.bankName}</span>
                                    </div>
                                )}
                                {payModalUser.bankDetails.agency && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Ag/Conta:</span>
                                        <span className="font-medium">{payModalUser.bankDetails.agency} / {payModalUser.bankDetails.account}</span>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="text-red-500 flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4"/>
                                Usuário não cadastrou dados bancários.
                            </div>
                        )}
                    </div>

                    <div>
                        <div className="flex justify-between mb-1">
                            <label className="block text-sm font-medium">Valor a Pagar (R$)</label>
                            <span className="text-xs text-gray-500">Saldo Devedor: R$ {maxPaymentAmount.toFixed(2)}</span>
                        </div>
                        <input 
                            type="number"
                            step="0.01"
                            max={maxPaymentAmount}
                            required
                            className="w-full p-2 border rounded dark:bg-zinc-800 dark:border-zinc-700 font-bold text-brand-red"
                            value={paymentAmount}
                            onChange={e => setPaymentAmount(e.target.value)}
                        />
                        <p className="text-xs text-gray-400 mt-1">
                            Ao confirmar, este valor será descontado do saldo do afiliado.
                        </p>
                    </div>

                    <div>
                         <label className="block text-sm font-medium mb-1">Comprovante de Pagamento</label>
                         <div className="border-2 border-dashed border-gray-300 dark:border-zinc-700 rounded-lg p-4 text-center hover:bg-gray-50 dark:hover:bg-zinc-800 transition cursor-pointer relative">
                             <input 
                                type="file" 
                                accept="image/*"
                                onChange={handleFileUpload}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                             />
                             {receiptImage ? (
                                 <div className="flex flex-col items-center">
                                     <CheckCircle className="w-8 h-8 text-green-500 mb-2"/>
                                     <span className="text-sm text-green-600">Comprovante anexado</span>
                                 </div>
                             ) : (
                                 <div className="flex flex-col items-center text-gray-500">
                                     <Upload className="w-8 h-8 mb-2"/>
                                     <span className="text-sm">Clique para enviar imagem</span>
                                 </div>
                             )}
                         </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <Button type="button" variant="outline" onClick={() => setPayModalUser(null)}>Cancelar</Button>
                        <Button type="submit" disabled={!paymentAmount || parseFloat(paymentAmount) <= 0}>Confirmar e Quitar Saldo</Button>
                    </div>
                </form>
             </div>
           </div>
      )}

      {/* View Details Modal (Generic Info) */}
      {viewUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden border border-gray-200 dark:border-zinc-800">
                <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800/50">
                    <div>
                        <h3 className="text-xl font-bold">{viewUser.name}</h3>
                        <p className="text-sm text-gray-500">Detalhes do Afiliado</p>
                    </div>
                    <button onClick={() => setViewUser(null)} className="text-gray-400 hover:text-gray-600">
                        <X className="w-6 h-6"/>
                    </button>
                </div>
                
                <div className="p-6">
                    {/* Info Grid */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="p-4 rounded-lg bg-gray-50 dark:bg-zinc-800">
                            <span className="text-xs text-gray-500 block">Email</span>
                            <span className="font-medium">{viewUser.email}</span>
                        </div>
                         <div className="p-4 rounded-lg bg-gray-50 dark:bg-zinc-800">
                            <span className="text-xs text-gray-500 block">Telefone</span>
                            <span className="font-medium">{viewUser.phone}</span>
                        </div>
                         <div className="p-4 rounded-lg bg-gray-50 dark:bg-zinc-800">
                            <span className="text-xs text-gray-500 block">Código de Afiliado</span>
                            <span className="font-mono font-bold text-blue-600">{viewUser.affiliateCode}</span>
                        </div>
                        <div className="p-4 rounded-lg bg-gray-50 dark:bg-zinc-800">
                            <span className="text-xs text-gray-500 block">Status</span>
                            <span className={`font-bold ${viewUser.affiliateStatus === 'BLOCKED' ? 'text-red-500' : 'text-green-500'}`}>
                                {viewUser.affiliateStatus === 'BLOCKED' ? 'Bloqueado' : 'Ativo'}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="p-6 bg-gray-50 dark:bg-zinc-800/50 border-t border-gray-200 dark:border-zinc-800 text-right">
                    <Button onClick={() => setViewUser(null)}>Fechar</Button>
                </div>
            </div>
        </div>
      )}

      {/* Edit Commission Modal */}
      {editCommissionUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
             <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-200 dark:border-zinc-800">
                <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-zinc-800">
                    <h3 className="text-lg font-bold">Editar Comissão</h3>
                    <button onClick={() => setEditCommissionUser(null)} className="text-gray-400 hover:text-gray-600">
                        <X className="w-5 h-5"/>
                    </button>
                </div>
                <form onSubmit={saveCommission} className="p-6">
                    <div className="mb-4">
                        <p className="text-sm text-gray-500 mb-4">
                            Defina uma porcentagem de comissão personalizada para <strong>{editCommissionUser.name}</strong>. 
                            Isso substituirá a comissão padrão de todos os planos.
                        </p>
                        <label className="block text-sm font-medium mb-1">Porcentagem da Comissão (%)</label>
                        <div className="relative">
                            <input 
                                type="number" 
                                step="0.1" 
                                min="0" 
                                max="100"
                                required
                                className="w-full p-2 pr-8 border rounded dark:bg-zinc-800 dark:border-zinc-700"
                                value={newCommissionVal}
                                onChange={e => setNewCommissionVal(e.target.value)}
                                placeholder="Ex: 15"
                            />
                            <span className="absolute right-3 top-2 text-gray-400">%</span>
                        </div>
                        <p className="text-xs text-gray-400 mt-2">Deixe em branco ou 0 para voltar ao padrão.</p>
                    </div>
                    
                    <div className="flex justify-end gap-3">
                         <Button type="button" variant="outline" onClick={() => setEditCommissionUser(null)}>Cancelar</Button>
                         <Button type="submit">Salvar</Button>
                    </div>
                </form>
             </div>
        </div>
      )}

    </div>
  );
};