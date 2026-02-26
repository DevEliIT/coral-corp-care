import { ReactNode, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutDashboard,
  Building2,
  FileText,
  FileSignature,
  Package,
  LogOut,
  Phone,
  Menu,
  X,
  ChevronLeft,
  Users,
  UsersRound,
  Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  label: string;
  icon: ReactNode;
  path: string;
  managerOnly?: boolean;
}

interface NavItem {
  label: string;
  icon: ReactNode;
  path: string;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', icon: <LayoutDashboard className="h-5 w-5" />, path: '/' },
  { label: 'Empresas', icon: <Building2 className="h-5 w-5" />, path: '/empresas' },
  { label: 'Contatos', icon: <Users className="h-5 w-5" />, path: '/contatos' },
  { label: 'Propostas', icon: <FileText className="h-5 w-5" />, path: '/propostas' },
  { label: 'Contratos', icon: <FileSignature className="h-5 w-5" />, path: '/contratos' },
  { label: 'Planos', icon: <Package className="h-5 w-5" />, path: '/planos' },
  { label: 'Equipe', icon: <UsersRound className="h-5 w-5" />, path: '/equipe', managerOnly: true },
];

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { profile, signOut, isManager } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };



  return (
    <div className="min-h-screen flex w-full bg-background">
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          'hidden lg:flex flex-col bg-sidebar transition-all duration-300 relative',
          sidebarOpen ? 'w-64' : 'w-20'
        )}
      >
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute -right-3 top-8 h-6 w-6 rounded-full bg-sidebar border border-sidebar-border flex items-center justify-center hover:bg-sidebar-accent transition-colors z-10"
        >
          <ChevronLeft className={cn(
            'h-4 w-4 text-sidebar-foreground transition-transform',
            !sidebarOpen && 'rotate-180'
          )} />
        </button>

        <div className="flex items-center gap-3 px-4 py-6 border-b border-sidebar-border">
          <div className="h-10 w-10 rounded-lg bg-sidebar-primary/10 flex items-center justify-center shrink-0">
            <Phone className="h-5 w-5 text-sidebar-primary" />
          </div>
          {sidebarOpen && (
            <div className="overflow-hidden">
              <h1 className="font-bold text-sidebar-foreground text-lg">TeleCRM</h1>
              <p className="text-xs text-sidebar-foreground/60 truncate">
                {profile?.role === 'manager' ? 'Gestor' : 'Vendedor'}
              </p>
            </div>
          )}
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems
            .filter((item) => !item.managerOnly || isManager)
            .map((item) => {
              const isActive = location.pathname === item.path ||
                (item.path !== '/' && location.pathname.startsWith(item.path));

              return (
                <button
                  key={item.path}
                  onClick={() => {
                    navigate(item.path);
                    setMobileMenuOpen(false);
                  }}
                  className={cn(
                    'sidebar-nav-item w-full',
                    isActive && 'sidebar-nav-item-active'
                  )}
                >
                  {item.icon}
                  {sidebarOpen && <span>{item.label}</span>}
                </button>
              );
            })}
        </nav>

        <div className="px-3 py-4 border-t border-sidebar-border">
          {sidebarOpen && profile?.full_name && (
            <p className="text-sm text-sidebar-foreground/60 mb-3 px-3 truncate">
              {profile.full_name}
            </p>
          )}
          <button
            onClick={() => {
              navigate('/configuracoes');
              setMobileMenuOpen(false);
            }}
            className={cn(
              'sidebar-nav-item w-full mb-1',
              location.pathname === '/configuracoes' && 'sidebar-nav-item-active'
            )}
          >
            <Settings className="h-5 w-5" />
            {sidebarOpen && <span>Configurações</span>}
          </button>
          <button
            onClick={handleSignOut}
            className="sidebar-nav-item w-full text-sidebar-foreground/60 hover:text-red-400"
          >
            <LogOut className="h-5 w-5" />
            {sidebarOpen && <span>Sair</span>}
          </button>
        </div>
      </aside>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileMenuOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 h-10 w-10 rounded-lg bg-card border border-border flex items-center justify-center shadow-md"
      >
        <Menu className="h-5 w-5 text-foreground" />
      </button>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-foreground/50 z-50"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={cn(
          'lg:hidden fixed inset-y-0 left-0 z-50 flex flex-col bg-sidebar w-64 transition-transform duration-300',
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <button
          onClick={() => setMobileMenuOpen(false)}
          className="absolute top-4 right-4 h-8 w-8 rounded-lg bg-sidebar-accent flex items-center justify-center"
        >
          <X className="h-4 w-4 text-sidebar-foreground" />
        </button>

        <div className="flex items-center gap-3 px-4 py-6 border-b border-sidebar-border">
          <div className="h-10 w-10 rounded-lg bg-sidebar-primary/10 flex items-center justify-center shrink-0">
            <Phone className="h-5 w-5 text-sidebar-primary" />
          </div>
          {sidebarOpen && (
            <div className="overflow-hidden">
              <h1 className="font-bold text-sidebar-foreground text-lg">TeleCRM</h1>
              <p className="text-xs text-sidebar-foreground/60 truncate">
                {profile?.role === 'manager' ? 'Gestor' : 'Vendedor'}
              </p>
            </div>
          )}
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems
            .filter((item) => !item.managerOnly || isManager)
            .map((item) => {
              const isActive = location.pathname === item.path ||
                (item.path !== '/' && location.pathname.startsWith(item.path));

              return (
                <button
                  key={item.path}
                  onClick={() => {
                    navigate(item.path);
                    setMobileMenuOpen(false);
                  }}
                  className={cn(
                    'sidebar-nav-item w-full',
                    isActive && 'sidebar-nav-item-active'
                  )}
                >
                  {item.icon}
                  {sidebarOpen && <span>{item.label}</span>}
                </button>
              );
            })}
        </nav>

        <div className="px-3 py-4 border-t border-sidebar-border">
          {sidebarOpen && profile?.full_name && (
            <p className="text-sm text-sidebar-foreground/60 mb-3 px-3 truncate">
              {profile.full_name}
            </p>
          )}
          <button
            onClick={() => {
              navigate('/configuracoes');
              setMobileMenuOpen(false);
            }}
            className={cn(
              'sidebar-nav-item w-full mb-1',
              location.pathname === '/configuracoes' && 'sidebar-nav-item-active'
            )}
          >
            <Settings className="h-5 w-5" />
            {sidebarOpen && <span>Configurações</span>}
          </button>
          <button
            onClick={handleSignOut}
            className="sidebar-nav-item w-full text-sidebar-foreground/60 hover:text-red-400"
          >
            <LogOut className="h-5 w-5" />
            {sidebarOpen && <span>Sair</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-4 lg:p-8 pt-16 lg:pt-8">
          {children}
        </div>
      </main>
    </div>
  );
}