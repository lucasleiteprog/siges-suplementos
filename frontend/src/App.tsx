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
import { useAuth } from './contexts/AuthContext';

function App() {
  const location = useLocation();
  const { user, logout, loading } = useAuth();

  if (loading) return <div className="h-screen flex items-center justify-center bg-gray-50 text-blue-900 font-bold">Carregando sistema...</div>;
  
  if (!user) return <Login />;

  const getNavClass = (path: string) => {
    return location.pathname === path || (path === '/pacientes/novo' && location.pathname.includes('/pacientes/'))
      ? "bg-blue-800 text-white flex items-center px-4 py-3 text-sm font-medium rounded-md"
      : "text-blue-100 hover:bg-blue-800 hover:text-white flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors";
  };

  const isAdmin = user.role === 'ADMIN';

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar Navigation */}
      <div className="w-64 bg-blue-900 text-white shadow-xl flex flex-col">
        <div className="p-6 border-b border-blue-800">
          <h1 className="text-xl font-bold tracking-wider">SIGES</h1>
          <p className="text-blue-300 text-xs mt-1">Gestão de Suplementos</p>
        </div>
        
        <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto">
          <Link to="/" className={getNavClass('/')}>
            <LayoutDashboard className="w-5 h-5 mr-3 opacity-90" />
            Dashboard
          </Link>
          <div className="pt-4 pb-2">
            <p className="px-4 text-xs font-semibold text-blue-400 uppercase tracking-wider">
              Pacientes
            </p>
          </div>
          <Link to="/pacientes" className={getNavClass('/pacientes')}>
            <Users className="w-5 h-5 mr-3 opacity-90" />
            Consultar e Cadastrar
          </Link>
          <div className="pt-4 pb-2">
            <p className="px-4 text-xs font-semibold text-blue-400 uppercase tracking-wider">
              Dispensação
            </p>
          </div>
          <Link to="/entregas" className={getNavClass('/entregas')}>
            <Truck className="w-5 h-5 mr-3 opacity-90" />
            Nova Entrega
          </Link>
          <div className="pt-4 pb-2">
            <p className="px-4 text-xs font-semibold text-blue-400 uppercase tracking-wider">
              Estoque
            </p>
          </div>
          <Link to="/estoque" className={getNavClass('/estoque')}>
            <PackageSearch className="w-5 h-5 mr-3 opacity-90" />
            Lotes e Entrada
          </Link>
          
          {isAdmin && (
            <>
              <div className="pt-4 pb-2">
                <p className="px-4 text-xs font-semibold text-blue-400 uppercase tracking-wider">
                  Administração
                </p>
              </div>
              <Link to="/admin/listas" className={getNavClass('/admin/listas')}>
                <Settings className="w-5 h-5 mr-3 opacity-90" />
                Listas Base
              </Link>
              <Link to="/admin/usuarios" className={getNavClass('/admin/usuarios')}>
                <Shield className="w-5 h-5 mr-3 opacity-90" />
                Usuários e Acessos
              </Link>
            </>
          )}
        </nav>

        <div className="p-4 border-t border-blue-800 bg-blue-950">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-white">{user.nome}</p>
              <p className="text-xs text-blue-300">{isAdmin ? 'Administrador' : 'Funcionário'}</p>
            </div>
            <button onClick={logout} className="p-2 text-blue-300 hover:text-red-400 transition-colors" title="Sair do sistema">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto bg-gray-50">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/pacientes" element={<PatientList />} />
          <Route path="/pacientes/novo" element={<PatientRegistrationForm />} />
          <Route path="/pacientes/editar/:id" element={<PatientRegistrationForm />} />
          <Route path="/entregas" element={<Dispensing />} />
          <Route path="/estoque" element={<StockEntry />} />
          {isAdmin && (
            <>
              <Route path="/admin/listas" element={<AdminLists />} />
              <Route path="/admin/usuarios" element={<UserManagement />} />
            </>
          )}
          {/* Fallback para rotas não autorizadas */}
          <Route path="*" element={<div className="p-10 text-center text-gray-500 font-bold">Página não encontrada ou acesso negado.</div>} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
