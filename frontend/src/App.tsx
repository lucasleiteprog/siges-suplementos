import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { Users, PackageSearch, Settings, Truck, LayoutDashboard, LogOut, Shield } from 'lucide-react';
import { PatientRegistrationForm } from './components/PatientRegistration/PatientRegistrationForm';
import { PatientList } from './components/PatientList/PatientList';
import { AdminLists } from './components/AdminLists/AdminLists';
import { StockEntry } from './components/StockEntry/StockEntry';
import { Dispensing } from './components/Dispensing/Dispensing';
import { Dashboard } from './components/Dashboard/Dashboard';
import { Login } from './components/Auth/Login';
import { UserManagement } from './components/Auth/UserManagement';
import { SystemSettings } from './components/Admin/SystemSettings';
import { useAuth } from './contexts/AuthContext';

function App() {
  const location = useLocation();
  const { user, logout, loading } = useAuth();

  if (loading) return <div className="h-screen flex items-center justify-center bg-gray-50 text-blue-900 font-bold">Carregando sistema...</div>;
  
  if (!user) return <Login />;

  const getNavClass = (path: string) => {
    return location.pathname === path || (path === '/pacientes/novo' && location.pathname.includes('/pacientes/'))
      ? "bg-blue-800 text-white flex items-center px-4 py-2 text-sm font-medium rounded-md"
      : "text-blue-100 hover:bg-blue-800 hover:text-white flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors";
  };

  const isAdmin = user.role === 'ADMIN';

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar Navigation */}
      <div className="w-64 bg-blue-900 text-white shadow-xl flex flex-col">
        <div className="p-6 border-b border-blue-800">
          <h1 className="text-xl font-bold tracking-wider flex items-center">
            <PackageSearch className="w-6 h-6 mr-2" />
            SIGES
          </h1>
          <p className="text-blue-300 text-xs mt-1">Gestão de Suplementos</p>
        </div>
        
        <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto scrollbar-hide">
          <Link to="/" className={getNavClass('/')}>
            <LayoutDashboard className="w-5 h-5 mr-3 opacity-90" />
            Dashboard
          </Link>
          <div className="pt-3 pb-1">
            <p className="px-4 text-xs font-semibold text-blue-400 uppercase tracking-wider">
              Pacientes
            </p>
          </div>
          <Link to="/pacientes" className={getNavClass('/pacientes')}>
            <Users className="w-5 h-5 mr-3 opacity-90" />
            Consultar e Cadastrar
          </Link>
          <div className="pt-3 pb-1">
            <p className="px-4 text-xs font-semibold text-blue-400 uppercase tracking-wider">
              Dispensação
            </p>
          </div>
          <Link to="/dispensacao" className={getNavClass('/dispensacao')}>
            <Truck className="w-5 h-5 mr-3 opacity-90" />
            Nova Entrega
          </Link>
          <div className="pt-3 pb-1">
            <p className="px-4 text-xs font-semibold text-blue-400 uppercase tracking-wider">
              Estoque
            </p>
          </div>
          <Link to="/estoque" className={getNavClass('/estoque')}>
            <PackageSearch className="w-5 h-5 mr-3 opacity-90" />
            Gerenciar Lotes
          </Link>
          
          {(user.perm_listas_base || user.perm_usuarios || isAdmin) && (
            <>
              <div className="pt-3 pb-1">
                <p className="px-4 text-xs font-semibold text-blue-400 uppercase tracking-wider">
                  Administração
                </p>
              </div>
              {user.perm_listas_base && (
                <Link to="/admin/listas" className={getNavClass('/admin/listas')}>
                  <Settings className="w-5 h-5 mr-3 opacity-90" />
                  Listas Base (Fórmulas)
                </Link>
              )}
              {user.perm_usuarios && (
                <Link to="/admin/usuarios" className={getNavClass('/admin/usuarios')}>
                  <Shield className="w-5 h-5 mr-3 opacity-90" />
                  Usuários e Acessos
                </Link>
              )}
              {isAdmin && (
                <Link to="/admin/configuracoes" className={getNavClass('/admin/configuracoes')}>
                  <Settings className="w-5 h-5 mr-3 opacity-90" />
                  Configurações
                </Link>
              )}
            </>
          )}
        </nav>

        <div className="p-4 border-t border-blue-800">
          <div className="flex items-center mb-4 px-2">
            <div className="w-8 h-8 rounded-full bg-blue-700 flex items-center justify-center text-sm font-bold mr-3">
              {user.nome.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium truncate">{user.nome}</p>
              <p className="text-xs text-blue-300 truncate">{user.role}</p>
            </div>
          </div>
          <button onClick={logout} className="flex items-center w-full px-4 py-2 text-sm text-blue-200 hover:text-white hover:bg-blue-800 rounded-md transition-colors">
            <LogOut className="w-4 h-4 mr-3" />
            Sair do Sistema
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto bg-gray-50">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/pacientes" element={<PatientList />} />
          <Route path="/pacientes/novo" element={<PatientRegistrationForm />} />
          <Route path="/pacientes/editar/:id" element={<PatientRegistrationForm />} />
          <Route path="/dispensacao" element={<Dispensing />} />
          <Route path="/estoque" element={<StockEntry />} />
          {user.perm_listas_base && (
             <Route path="/admin/listas" element={<AdminLists />} />
          )}
          {user.perm_usuarios && (
            <Route path="/admin/usuarios" element={<UserManagement />} />
          )}
          {isAdmin && (
            <Route path="/admin/configuracoes" element={<SystemSettings />} />
          )}
          {/* Fallback para rotas não autorizadas */}
          <Route path="*" element={<div className="p-10 text-center text-gray-500 font-bold">Página não encontrada ou acesso negado.</div>} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
