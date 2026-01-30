import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/Buttons';
import { Plan } from '../../types';
import { Trash2, Plus, Archive, Users, Edit2 } from 'lucide-react';

export const Offers: React.FC = () => {
  const { plans, addPlan, deletePlan, updatePlan } = useAuth();
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [newPlan, setNewPlan] = useState<Partial<Plan>>({
    name: '', description: '', price: 0, durationMonths: 12, features: [], active: true, affiliateEnabled: false, commissionPercent: 0
  });
  const [featureInput, setFeatureInput] = useState('');

  const resetForm = () => {
      setNewPlan({ name: '', description: '', price: 0, durationMonths: 12, features: [], active: true, affiliateEnabled: false, commissionPercent: 0 });
      setFeatureInput('');
      setEditingId(null);
      setIsCreating(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if(newPlan.name && newPlan.price) {
        if (editingId) {
            // Update existing plan
            updatePlan({ ...newPlan, id: editingId } as Plan);
        } else {
            // Create new plan
            addPlan(newPlan as Omit<Plan, 'id'>);
        }
        resetForm();
    }
  };

  const handleEdit = (plan: Plan) => {
      setNewPlan(plan);
      setEditingId(plan.id);
      setIsCreating(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const addFeature = () => {
    if(featureInput.trim()) {
        setNewPlan(prev => ({ ...prev, features: [...(prev.features || []), featureInput] }));
        setFeatureInput('');
    }
  };

  const removeFeature = (index: number) => {
      setNewPlan(prev => ({
          ...prev,
          features: prev.features?.filter((_, i) => i !== index)
      }));
  };

  const toggleStatus = (plan: Plan) => {
    updatePlan({ ...plan, active: !plan.active });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Ofertas e Planos</h1>
        <Button onClick={() => {
            if (isCreating) {
                resetForm();
            } else {
                setIsCreating(true);
            }
        }}>
            {isCreating ? 'Cancelar' : <><Plus className="w-4 h-4 mr-2"/> Novo Plano</>}
        </Button>
      </div>

      {isCreating && (
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-lg mb-6 animate-fade-in">
            <h3 className="text-lg font-bold mb-4">{editingId ? 'Editar Oferta' : 'Criar Nova Oferta'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input 
                        placeholder="Nome do Plano" 
                        required
                        className="p-2 border rounded dark:bg-zinc-800 dark:border-zinc-700"
                        value={newPlan.name}
                        onChange={e => setNewPlan({...newPlan, name: e.target.value})}
                    />
                    <input 
                        type="number"
                        placeholder="Preço (R$)" 
                        required
                        step="0.01"
                        className="p-2 border rounded dark:bg-zinc-800 dark:border-zinc-700"
                        value={newPlan.price || ''}
                        onChange={e => setNewPlan({...newPlan, price: parseFloat(e.target.value)})}
                    />
                </div>
                <input 
                    placeholder="Descrição Curta" 
                    className="w-full p-2 border rounded dark:bg-zinc-800 dark:border-zinc-700"
                    value={newPlan.description}
                    onChange={e => setNewPlan({...newPlan, description: e.target.value})}
                />
                
                {/* Affiliate Settings */}
                <div className="p-4 bg-gray-50 dark:bg-zinc-800/50 rounded-lg border border-gray-200 dark:border-zinc-700">
                    <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                        <Users className="w-4 h-4"/> Configuração de Afiliados
                    </h4>
                    <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 text-sm cursor-pointer">
                            <input 
                                type="checkbox" 
                                checked={newPlan.affiliateEnabled}
                                onChange={e => setNewPlan({...newPlan, affiliateEnabled: e.target.checked})}
                                className="rounded text-brand-red focus:ring-brand-red bg-white dark:bg-zinc-900 border-gray-300 dark:border-zinc-600"
                            />
                            Permitir venda por afiliados
                        </label>
                        {newPlan.affiliateEnabled && (
                            <div className="flex items-center gap-2">
                                <span className="text-sm">Comissão (%):</span>
                                <input 
                                    type="number" 
                                    max="100"
                                    min="0"
                                    className="w-20 p-1 border rounded dark:bg-zinc-900 dark:border-zinc-600"
                                    value={newPlan.commissionPercent || 0}
                                    onChange={e => setNewPlan({...newPlan, commissionPercent: parseFloat(e.target.value)})}
                                />
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex gap-2">
                    <input 
                        placeholder="Adicionar Benefício (Enter para adicionar)" 
                        className="flex-1 p-2 border rounded dark:bg-zinc-800 dark:border-zinc-700"
                        value={featureInput}
                        onChange={e => setFeatureInput(e.target.value)}
                        onKeyDown={e => { if(e.key === 'Enter') { e.preventDefault(); addFeature(); }}}
                    />
                    <Button type="button" onClick={addFeature} variant="secondary">Add</Button>
                </div>
                <div className="flex flex-wrap gap-2">
                    {newPlan.features?.map((f, i) => (
                        <span key={i} className="flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-zinc-800 rounded text-sm group">
                            {f}
                            <button type="button" onClick={() => removeFeature(i)} className="text-gray-400 hover:text-red-500 ml-1">×</button>
                        </span>
                    ))}
                </div>
                 <input 
                        type="number"
                        placeholder="Duração (Meses)" 
                        required
                        className="p-2 border rounded dark:bg-zinc-800 dark:border-zinc-700"
                        value={newPlan.durationMonths}
                        onChange={e => setNewPlan({...newPlan, durationMonths: parseInt(e.target.value)})}
                    />
                <Button type="submit" className="w-full">{editingId ? 'Salvar Alterações' : 'Criar Oferta'}</Button>
            </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map(plan => (
            <div key={plan.id} className={`p-6 rounded-xl border ${plan.active ? 'bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800' : 'bg-gray-100 dark:bg-zinc-900/50 border-gray-200 dark:border-zinc-800 opacity-75'}`}>
                <div className="flex justify-between items-start mb-4">
                    <h3 className="font-bold text-xl">{plan.name}</h3>
                    <div className="flex gap-2">
                         <button onClick={() => handleEdit(plan)} title="Editar" className="text-gray-400 hover:text-blue-500">
                             <Edit2 className="w-5 h-5"/>
                         </button>
                         <button onClick={() => toggleStatus(plan)} title={plan.active ? "Arquivar" : "Ativar"} className="text-gray-400 hover:text-yellow-500">
                             <Archive className="w-5 h-5"/>
                         </button>
                         <button onClick={() => { if(window.confirm('Excluir plano permanentemente?')) deletePlan(plan.id)}} className="text-gray-400 hover:text-red-500">
                             <Trash2 className="w-5 h-5"/>
                         </button>
                    </div>
                </div>
                <p className="text-2xl font-bold mb-2">R$ {plan.price.toFixed(2)}</p>
                <p className="text-sm text-gray-500 mb-4">{plan.description}</p>
                <div className="space-y-1">
                    {plan.features.map((f, i) => (
                        <div key={i} className="text-xs px-2 py-1 bg-gray-100 dark:bg-zinc-800 inline-block rounded mr-1 mb-1">{f}</div>
                    ))}
                </div>

                {plan.affiliateEnabled && (
                    <div className="mt-3 pt-3 border-t border-dashed border-gray-200 dark:border-zinc-800">
                        <div className="flex items-center justify-between text-xs text-blue-600 dark:text-blue-400">
                            <span className="flex items-center gap-1"><Users className="w-3 h-3"/> Afiliados Permitidos</span>
                            <span className="font-bold">{plan.commissionPercent}% Comissão</span>
                        </div>
                    </div>
                )}

                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-zinc-800 flex justify-between items-center">
                    <span className="text-xs text-gray-400">Duração: {plan.durationMonths} meses</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${plan.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {plan.active ? 'Ativo' : 'Arquivado'}
                    </span>
                </div>
            </div>
        ))}
      </div>
    </div>
  );
};