import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { UserRole } from '../types';
import { Sun, Moon, LogOut, User, Menu, X, MapPin, MessageCircle } from 'lucide-react';
import { Button } from './ui/Buttons';
import { MAP_URL } from '../constants';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout, settings } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Affiliate Tracking: Capture ref code from URL
  useEffect(() => {
    const refCode = searchParams.get('ref');
    if (refCode) {
      localStorage.setItem('facility_ref', refCode);
      console.log('Referral code captured:', refCode);
    }
  }, [searchParams]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;

  // Hide WhatsApp button on admin pages to avoid clutter
  const showWhatsApp = !location.pathname.startsWith('/admin');
  
  // Dynamic Support Link
  const supportLink = `https://wa.me/${settings.supportWhatsapp}?text=${encodeURIComponent("Olá, gostaria de falar com o suporte Facility Pass.")}`;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-zinc-950 text-gray-900 dark:text-gray-100">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 w-full border-b border-gray-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="flex items-center gap-2">
                <div className="h-8 w-8 bg-brand-red rounded-lg flex items-center justify-center transform -skew-x-12">
                   <span className="text-white font-bold text-xl skew-x-12">F</span>
                </div>
                <span className="font-bold text-xl tracking-tight hidden sm:block">
                  Facility<span className="text-brand-red">Pass</span> PF
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              <a 
                href={MAP_URL} 
                target="_blank" 
                rel="noreferrer"
                className="text-sm font-medium hover:text-brand-red flex items-center gap-1"
              >
                <MapPin className="w-4 h-4" />
                Mapa de Academias
              </a>

              {user ? (
                <>
                  {user.role === UserRole.ADMIN && (
                    <Link to="/admin" className={`text-sm font-medium hover:text-brand-red ${isActive('/admin') ? 'text-brand-red' : ''}`}>
                      Dashboard
                    </Link>
                  )}
                  {user.role === UserRole.CLIENT && (
                    <Link to="/dashboard" className={`text-sm font-medium hover:text-brand-red ${isActive('/dashboard') ? 'text-brand-red' : ''}`}>
                      Meus Planos
                    </Link>
                  )}
                  <div className="flex items-center gap-3 pl-4 border-l border-gray-300 dark:border-gray-700">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Olá, {user.name.split(' ')[0]}</span>
                    <Button variant="outline" size="sm" onClick={handleLogout}>
                      <LogOut className="w-4 h-4 mr-2" /> Sair
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <Link to="/login">
                    <Button variant="outline" size="sm">Login</Button>
                  </Link>
                  <Link to="/register">
                    <Button variant="primary" size="sm">Cadastrar</Button>
                  </Link>
                </>
              )}

              <button 
                onClick={toggleTheme}
                className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-zinc-800 transition-colors"
                aria-label="Toggle Theme"
              >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
            </div>

            {/* Mobile Menu Button */}
            <div className="flex md:hidden items-center gap-4">
              <button 
                onClick={toggleTheme}
                className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-zinc-800"
              >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-zinc-800"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
            <div className="px-4 pt-2 pb-6 space-y-3">
              <a href={MAP_URL} target="_blank" rel="noreferrer" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-100 dark:hover:bg-zinc-800">
                <div className="flex items-center gap-2"><MapPin className="w-4 h-4"/> Mapa de Academias</div>
              </a>
              
              {user ? (
                <>
                  <div className="px-3 py-2 text-sm text-gray-500">Logado como: {user.name}</div>
                  {user.role === UserRole.ADMIN && (
                    <Link to="/admin" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-100 dark:hover:bg-zinc-800">Admin Dashboard</Link>
                  )}
                  {user.role === UserRole.CLIENT && (
                    <Link to="/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-100 dark:hover:bg-zinc-800">Meus Planos</Link>
                  )}
                  <Button variant="danger" className="w-full mt-4" onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}>
                    Sair
                  </Button>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full">Login</Button>
                  </Link>
                  <Link to="/register" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="primary" className="w-full">Cadastrar</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="flex-grow">
        {children}
      </main>

      {/* Floating WhatsApp Button */}
      {showWhatsApp && settings.supportWhatsapp && (
          <a 
            href={supportLink}
            target="_blank"
            rel="noreferrer"
            className="fixed bottom-6 right-6 z-50 bg-[#25D366] hover:bg-[#128C7E] text-white p-4 rounded-full shadow-2xl transition-transform hover:scale-110 flex items-center justify-center group"
            aria-label="Falar com Suporte no WhatsApp"
          >
              <MessageCircle className="w-8 h-8"/>
              <span className="absolute right-full mr-3 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white px-3 py-1 rounded-lg text-sm font-bold shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                  Falar com Suporte
              </span>
          </a>
      )}

      {/* Footer */}
      <footer className="bg-white dark:bg-zinc-950 border-t border-gray-200 dark:border-zinc-800 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            © {new Date().getFullYear()} Facility Pass Pessoa Física. Todos os direitos reservados.
          </p>
          <div className="mt-4 flex justify-center space-x-6 text-sm text-gray-400">
             <a href="#" className="hover:text-brand-red">Termos de Uso</a>
             <a href="#" className="hover:text-brand-red">Privacidade</a>
             <a href={supportLink} target="_blank" rel="noreferrer" className="hover:text-brand-red">Suporte</a>
          </div>
        </div>
      </footer>
    </div>
  );
};