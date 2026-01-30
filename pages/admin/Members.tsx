import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/Buttons';
import { UserRole, User } from '../../types';
import { Trash2, Edit2, Search, Shield, ShieldAlert, Eye, EyeOff, X, Phone, User as UserIcon, Save, Power, Calendar, Briefcase, AlertTriangle } from 'lucide-react';

export const Members: React.FC = () => {
  const { users, deleteUser, updateUser, user: currentUser, plans } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  
  // --- States for User Edit Modal (Personal Info) ---
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // --- States for Plan Management Modal (Subscription) ---
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [planTargetUser, setPlanTargetUser] = useState<User | null>(null);
  const [planForm, setPlanForm] = useState({
      planId: '',
      active: true,
      endDate: ''
  });

  // Filter users based on search
  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.cpf.includes(searchTerm)
  );

  // --- Handlers for Personal Info Edit ---

  const handleEditClick = (user: User) => {
    setEditingUser({ ...user }); 
    setShowPassword(false);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingUser(null);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser) {
        updateUser(editingUser);
        handleCloseEditModal();
    }
  };

  // --- Handlers for Plan Management ---

  const handleOpenPlanModal = (user: User) => {
      if (user.role !== UserRole.CLIENT) return;
      
      setPlanTargetUser(user);
      
      if (user.subscription) {
          // Pre-fill with existing subscription data
          setPlanForm({
              planId: user.subscription.planId,
              active: user.subscription.active,
              endDate: user.subscription.endDate.split('T')[0] // Format for input date
          });
      } else {
          // Default empty state
          setPlanForm({
              planId: '',
              active: true,
              endDate: ''
          });
      }
      setIsPlanModalOpen(true);
  };

  const handleClosePlanModal = () => {
      setIsPlanModalOpen(false);
      setPlanTargetUser(null);
  };

  const handlePlanSelectionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const newPlanId = e.target.value;
      const selectedPlan = plans.find(p => p.id === newPlanId);
      
      // Auto-calculate end date based on selected plan duration
      let newEndDate = planForm.endDate;
      if (selectedPlan) {
          const date = new Date();
          date.setMonth(date.getMonth() + selectedPlan.durationMonths);
          newEndDate = date.toISOString().split('T')[0];
      }

      setPlanForm({
          ...planForm,
          planId: newPlanId,
          endDate: newEndDate
      });
  };

  const handleSavePlan = (e: React.FormEvent) => {
      e.preventDefault();
      if (!planTargetUser || !planForm.planId || !planForm.endDate) return;

      const updatedUser = {
          ...planTargetUser,
          subscription: {
              planId: planForm.planId,
              active: planForm.active,
              startDate: planTargetUser.subscription?.startDate || new Date().toISOString(),
              endDate: new Date(planForm.endDate).toISOString()
          }
      };

      updateUser(updatedUser);
      handleClosePlanModal();
      alert(`Plano de ${planTargetUser.name} atualizado com sucesso!`);
  };

  const handleDeletePlan = () => {
      if (!planTargetUser) return;
      if (window.confirm(`Tem certeza que deseja REMOVER totalmente o plano de ${planTargetUser.name}? Ele perderá o acesso imediatamente.`)) {
          updateUser({ ...planTargetUser, subscription: undefined });
          handleClosePlanModal();
      }
  };

  // --- General Actions ---

  const toggleRole = (targetUser: User) => {
      if (currentUser?.id === targetUser.id) {
          alert("Você não pode alterar seu próprio nível de permissão.");
          return;
      }
      const newRole = targetUser.role === UserRole.ADMIN ? UserRole.CLIENT : UserRole.ADMIN;
      if (window.confirm(`Alterar permissão de ${targetUser.name}?`)) {
          updateUser({ ...targetUser, role: newRole });
      }
  };

  const handleDeleteUser = (id: string) => {
      if (currentUser?.id === id) {
          alert("Você não pode excluir sua própria conta.");
          return;
      }
      if(window.confirm('Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita.')) {
          deleteUser(id);
      }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Gerenciar Usuários</h1>
        <div className="text-sm text-gray-500">
            Total: {users.length}
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg leading-5 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-brand-red sm:text-sm"
          placeholder="Buscar por nome, email ou CPF..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Users List */}
      <div className="bg-white dark:bg-zinc-900 shadow overflow-hidden sm:rounded-lg border border-gray-200 dark:border-zinc-800">
        <ul className="divide-y divide-gray-200 dark:divide-zinc-800">
          {filteredUsers.map((userItem) => (
            <li key={userItem.id} className="p-4 hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition duration-150 ease-in-out">
              <div className="flex items-center justify-between flex-wrap gap-4">
                
                {/* User Info */}
                <div className="flex items-center gap-4 min-w-0 flex-1">
                    <div className={`p-3 rounded-full flex-shrink-0 ${userItem.role === UserRole.ADMIN ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600' : 'bg-gray-100 dark:bg-zinc-800 text-gray-500'}`}>
                        {userItem.role === UserRole.ADMIN ? <Shield className="w-6 h-6"/> : <UserIcon className="w-6 h-6"/>}
                    </div>
                    <div className="min-w-0">
                        <div className="flex items-center gap-2">
                            {/* Clickable Name for Plan Management */}
                            {userItem.role === UserRole.CLIENT ? (
                                <button 
                                    onClick={() => handleOpenPlanModal(userItem)}
                                    className="text-left group focus:outline-none flex items-center gap-2"
                                    title="Clique para gerenciar o plano"
                                >
                                    <p className="text-sm font-bold text-gray-900 dark:text-white truncate group-hover:text-brand-red group-hover:underline decoration-dotted underline-offset-4 transition-colors">
                                        {userItem.name}
                                    </p>
                                    <Edit2 className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </button>
                            ) : (
                                <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                                    {userItem.name}
                                </p>
                            )}

                            {userItem.role === UserRole.ADMIN && (
                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                    Admin
                                </span>
                            )}
                            {userItem.role === UserRole.CLIENT && (
                                <>
                                    {userItem.subscription ? (
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${userItem.subscription.active ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>
                                            {userItem.subscription.active ? 'Plano Ativo' : 'Plano Inativo'}
                                        </span>
                                    ) : (
                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400">
                                            Sem Plano
                                        </span>
                                    )}
                                </>
                            )}
                        </div>
                        <p className="text-sm text-gray-500 truncate">{userItem.email}</p>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-gray-400">
                            <span>CPF: {userItem.cpf}</span>
                            <span>Tel: {userItem.phone}</span>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => toggleRole(userItem)}
                    title={userItem.role === UserRole.ADMIN ? "Remover Admin" : "Tornar Admin"}
                    className={`p-2 rounded-lg transition-colors ${
                        userItem.role === UserRole.ADMIN 
                        ? 'text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20' 
                        : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800 hover:text-gray-600'
                    }`}
                  >
                    {userItem.role === UserRole.ADMIN ? <Shield className="w-5 h-5" /> : <Shield className="w-5 h-5 opacity-50" />}
                  </button>

                  <button 
                      onClick={() => handleEditClick(userItem)}
                      title="Editar Dados Pessoais"
                      className="p-2 text-gray-400 hover:text-brand-red hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors"
                  >
                      <UserIcon className="w-5 h-5" />
                  </button>
                  
                  <button 
                    onClick={() => handleDeleteUser(userItem.id)}
                    title="Excluir Usuário"
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </li>
          ))}
          {filteredUsers.length === 0 && (
            <li className="p-8 text-center text-gray-500">Nenhum usuário encontrado.</li>
          )}
        </ul>
      </div>

      {/* --- MODAL 1: PLAN MANAGEMENT --- */}
      {isPlanModalOpen && planTargetUser && (
           <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
               <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-200 dark:border-zinc-800">
                   <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800/50">
                        <div>
                            <h3 className="text-xl font-bold flex items-center gap-2">
                                <Briefcase className="w-5 h-5 text-brand-red"/>
                                Gerenciar Assinatura
                            </h3>
                            <p className="text-sm text-gray-500">Cliente: {planTargetUser.name}</p>
                        </div>
                        <button onClick={handleClosePlanModal} className="text-gray-400 hover:text-gray-600">
                            <X className="w-6 h-6"/>
                        </button>
                   </div>
                   
                   <form onSubmit={handleSavePlan} className="p-6 space-y-6">
                        
                        {/* Current Plan Info or Warning */}
                        {!planTargetUser.subscription && (
                            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-900/30 rounded-lg text-sm text-yellow-800 dark:text-yellow-500 flex items-start gap-2">
                                <AlertTriangle className="w-5 h-5 flex-shrink-0"/>
                                <p>Este usuário não possui plano ativo. Selecione um plano abaixo para criar uma assinatura.</p>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium mb-2">Selecionar Plano</label>
                            <select 
                                required
                                className="w-full p-3 border rounded-lg dark:bg-zinc-800 dark:border-zinc-700 focus:ring-2 focus:ring-brand-red outline-none transition"
                                value={planForm.planId}
                                onChange={handlePlanSelectionChange}
                            >
                                <option value="">Selecione um plano...</option>
                                {plans.map(p => (
                                    <option key={p.id} value={p.id}>
                                        {p.name} - R$ {p.price.toFixed(2)} ({p.durationMonths} meses)
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Vencimento da Assinatura</label>
                                <div className="relative">
                                    <Calendar className="w-4 h-4 absolute left-3 top-3.5 text-gray-400"/>
                                    <input 
                                        type="date"
                                        required
                                        className="w-full pl-10 p-3 border rounded-lg dark:bg-zinc-800 dark:border-zinc-700 focus:ring-2 focus:ring-brand-red outline-none"
                                        value={planForm.endDate}
                                        onChange={e => setPlanForm({...planForm, endDate: e.target.value})}
                                    />
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium mb-2">Status do Acesso</label>
                                <button 
                                    type="button"
                                    onClick={() => setPlanForm({...planForm, active: !planForm.active})}
                                    className={`w-full p-3 rounded-lg border font-bold transition flex items-center justify-center gap-2 ${planForm.active ? 'bg-green-100 border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-800' : 'bg-red-50 border-red-200 text-red-600 dark:bg-red-900/10'}`}
                                >
                                    <Power className="w-4 h-4"/>
                                    {planForm.active ? 'ATIVO' : 'BLOQUEADO'}
                                </button>
                            </div>
                        </div>

                        <div className="pt-4 flex justify-between items-center border-t border-gray-100 dark:border-zinc-800">
                            {planTargetUser.subscription ? (
                                <button 
                                    type="button" 
                                    onClick={handleDeletePlan}
                                    className="text-red-500 hover:text-red-700 text-sm flex items-center gap-1 font-medium px-2 py-1 hover:bg-red-50 dark:hover:bg-red-900/10 rounded transition"
                                >
                                    <Trash2 className="w-4 h-4"/> Excluir Plano
                                </button>
                            ) : (
                                <div></div> 
                            )}
                            
                            <div className="flex gap-3">
                                <Button type="button" variant="outline" onClick={handleClosePlanModal}>
                                    Cancelar
                                </Button>
                                <Button type="submit">
                                    <Save className="w-4 h-4 mr-2"/>
                                    {planTargetUser.subscription ? 'Salvar Alterações' : 'Criar Assinatura'}
                                </Button>
                            </div>
                        </div>
                   </form>
               </div>
           </div>
      )}

      {/* --- MODAL 2: PERSONAL INFO EDIT --- */}
      {isEditModalOpen && editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-200 dark:border-zinc-800">
                <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-zinc-800">
                    <h3 className="text-xl font-bold">Editar Dados Pessoais</h3>
                    <button onClick={handleCloseEditModal} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                        <X className="w-6 h-6"/>
                    </button>
                </div>
                
                <form onSubmit={handleSaveUser} className="p-6 space-y-4">
                    {/* Role Toggle inside Modal */}
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-zinc-800/50 rounded-lg border border-gray-200 dark:border-zinc-700">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${editingUser.role === UserRole.ADMIN ? 'bg-blue-100 text-blue-600' : 'bg-gray-200 text-gray-500'}`}>
                                <ShieldAlert className="w-5 h-5"/>
                            </div>
                            <div>
                                <p className="font-semibold text-sm">Permissão de Administrador</p>
                                <p className="text-xs text-gray-500">Acesso total às configurações</p>
                            </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                                type="checkbox" 
                                className="sr-only peer"
                                checked={editingUser.role === UserRole.ADMIN}
                                onChange={() => setEditingUser({...editingUser, role: editingUser.role === UserRole.ADMIN ? UserRole.CLIENT : UserRole.ADMIN})}
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Nome Completo</label>
                        <input 
                            required
                            className="w-full p-2 border rounded-lg dark:bg-zinc-800 dark:border-zinc-700"
                            value={editingUser.name}
                            onChange={e => setEditingUser({...editingUser, name: e.target.value})}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">CPF</label>
                            <input 
                                className="w-full p-2 border rounded-lg dark:bg-zinc-800 dark:border-zinc-700"
                                value={editingUser.cpf}
                                onChange={e => setEditingUser({...editingUser, cpf: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Telefone</label>
                            <div className="relative">
                                <Phone className="w-4 h-4 absolute left-3 top-3 text-gray-400"/>
                                <input 
                                    className="w-full p-2 pl-9 border rounded-lg dark:bg-zinc-800 dark:border-zinc-700"
                                    value={editingUser.phone}
                                    onChange={e => setEditingUser({...editingUser, phone: e.target.value})}
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">E-mail</label>
                        <input 
                            type="email"
                            required
                            className="w-full p-2 border rounded-lg dark:bg-zinc-800 dark:border-zinc-700"
                            value={editingUser.email}
                            onChange={e => setEditingUser({...editingUser, email: e.target.value})}
                        />
                    </div>

                    {/* Password Field with Toggle */}
                    <div className="p-4 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-100 dark:border-yellow-900/30 rounded-lg">
                        <label className="block text-sm font-bold text-yellow-800 dark:text-yellow-500 mb-1">Senha de Acesso</label>
                        <div className="relative">
                            <input 
                                type={showPassword ? "text" : "password"}
                                className="w-full p-2 pr-10 border rounded-lg dark:bg-zinc-800 dark:border-zinc-700"
                                value={editingUser.password || ''}
                                onChange={e => setEditingUser({...editingUser, password: e.target.value})}
                            />
                            <button 
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                            >
                                {showPassword ? <EyeOff className="w-5 h-5"/> : <Eye className="w-5 h-5"/>}
                            </button>
                        </div>
                        <p className="text-xs text-yellow-600/80 dark:text-yellow-500/80 mt-1">
                            Você pode visualizar ou redefinir a senha do usuário aqui.
                        </p>
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                        <Button type="button" variant="outline" onClick={handleCloseEditModal}>
                            Cancelar
                        </Button>
                        <Button type="submit">
                            <Save className="w-4 h-4 mr-2"/>
                            Salvar Dados
                        </Button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};