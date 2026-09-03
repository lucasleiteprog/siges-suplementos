import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { Users, PackageSearch, Settings } from 'lucide-react';
import { PatientRegistrationForm } from './components/PatientRegistration/PatientRegistrationForm';
import { PatientList } from './components/PatientList/PatientList';
import { AdminLists } from './components/AdminLists/AdminLists';
import { StockEntry } from './components/StockEntry/StockEntry';

function App() {
  const location = useLocation();

  const getNavClass = (path: string) => {
    return location.pathname === path || (path === '/pacientes/novo' && location.pathname === '/')
      ? "bg-blue-800 text-white flex items-center px-4 py-3 text-sm font-medium rounded-md"
      : "text-blue-100 hover:bg-blue-800 hover:text-white flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors";
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar Navigation */}
      <div className="w-64 bg-blue-900 text-white shadow-xl flex flex-col">
        <div className="p-6 border-b border-blue-800">
          <h1 className="text-xl font-bold tracking-wider">SIGES</h1>
          <p className="text-blue-300 text-xs mt-1">Gestão de Suplementos</p>
        </div>
        
        <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto">
          <Link to="/pacientes" className={getNavClass('/pacientes')}>
            <Users className="w-5 h-5 mr-3 opacity-90" />
            Pacientes
          </Link>
          <div className="pt-6 pb-2">
            <p className="px-4 text-xs font-semibold text-blue-400 uppercase tracking-wider">
              Estoque
            </p>
          </div>
          <Link to="/estoque" className={getNavClass('/estoque')}>
            <PackageSearch className="w-5 h-5 mr-3 opacity-90" />
            Lotes e Entrada
          </Link>
          <div className="pt-6 pb-2">
            <p className="px-4 text-xs font-semibold text-blue-400 uppercase tracking-wider">
              Sistema
            </p>
          </div>
          <Link to="/admin/listas" className={getNavClass('/admin/listas')}>
            <Settings className="w-5 h-5 mr-3 opacity-90" />
            Gerenciar Listas
          </Link>
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto bg-gray-50">
        <Routes>
          <Route path="/" element={<PatientList />} />
          <Route path="/pacientes" element={<PatientList />} />
          <Route path="/pacientes/novo" element={<PatientRegistrationForm />} />
          <Route path="/pacientes/editar/:id" element={<PatientRegistrationForm />} />
          <Route path="/estoque" element={<StockEntry />} />
          <Route path="/admin/listas" element={<AdminLists />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
