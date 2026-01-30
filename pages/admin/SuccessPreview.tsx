import React from 'react';
import { Success } from '../Success';
import { Info, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

export const SuccessPreview: React.FC = () => {
  return (
    <div className="space-y-6 animate-fade-in">
       {/* Header explaining the page */}
       <div className="flex items-center justify-between">
         <h1 className="text-3xl font-bold">Visualização: Página de Obrigado</h1>
       </div>

       {/* Info Box */}
       <div className="bg-blue-50 dark:bg-blue-900/20 p-5 rounded-xl flex items-start gap-4 border border-blue-100 dark:border-blue-800">
         <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-lg">
            <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />
         </div>
         <div>
           <h3 className="text-sm font-bold text-blue-900 dark:text-blue-100">Simulação em Tempo Real</h3>
           <p className="text-sm text-blue-800 dark:text-blue-200 mt-1">
               Esta é a página exata que seu cliente vê após o pagamento ser confirmado.
           </p>
           <ul className="list-disc list-inside text-xs text-blue-600 dark:text-blue-300 mt-2 space-y-1">
               <li>O botão do WhatsApp utiliza o número configurado na aba <Link to="/admin/settings" className="underline hover:text-blue-800 font-medium">Configurações</Link>.</li>
               <li>O layout se adapta automaticamente a celulares e computadores.</li>
               <li>Os botões abaixo são funcionais (cuidado ao clicar para não sair do painel).</li>
           </ul>
         </div>
       </div>

       {/* The Preview Container (Mock Browser) */}
       <div className="border-4 border-gray-300 dark:border-zinc-700 rounded-xl overflow-hidden shadow-2xl">
         {/* Browser Toolbar */}
         <div className="bg-gray-100 dark:bg-zinc-800 px-4 py-3 border-b border-gray-300 dark:border-zinc-700 flex items-center gap-4">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-400 hover:bg-red-500 transition-colors"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-400 hover:bg-yellow-500 transition-colors"></div>
              <div className="w-3 h-3 rounded-full bg-green-400 hover:bg-green-500 transition-colors"></div>
            </div>
            
            <div className="bg-white dark:bg-black/20 rounded-md px-3 py-1.5 text-xs text-gray-500 flex-1 text-center font-mono flex items-center justify-center gap-2 shadow-sm border border-gray-200 dark:border-zinc-700">
               <span className="text-green-500">🔒</span> https://facilitypass.com/success
            </div>
         </div>

         {/* Viewport */}
         <div className="bg-gray-50 dark:bg-zinc-950 min-h-[600px] relative isolate overflow-y-auto">
            {/* We render the Success component directly. 
                Since Success.tsx uses 'flex-grow' and 'min-h-screen' logic in Layout, 
                we ensure this container allows it to expand naturally. */}
            <div className="absolute inset-0">
                <Success />
            </div>
         </div>
       </div>
    </div>
  );
};