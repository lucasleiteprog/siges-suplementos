import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Trash2, UserPlus, Shield } from 'lucide-react';

export function UserManagement() {
  const { token, user: currentUser } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    nome: '',
    username: '',
    password: '',
    role: 'EMPLOYEE'
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setUsers(await res.json());
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setFormData({ nome: '', username: '', password: '', role: 'EMPLOYEE' });
        fetchUsers();
      } else {
        const error = await res.json();
        alert(error.error || 'Erro ao criar usuário');
      }
    } catch (e) {
      alert('Erro de conexão');
    }
  };

  const handleDelete = async (id: number) => {
    if (id === currentUser?.id) {
      alert('Você não pode excluir a si mesmo.');
      return;
    }
    if (!window.confirm('Tem certeza que deseja excluir este usuário?')) return;
    
    try {
      const res = await fetch(`/api/users/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) fetchUsers();
      else alert('Erro ao excluir.');
    } catch (e) {
      alert('Erro de conexão');
    }
  };

  if (loading) return <div className="p-10 text-center">Carregando...</div>;

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-md mt-10 mb-20">
      <div className="flex items-center mb-8 border-b pb-4">
        <Shield className="w-6 h-6 mr-3 text-blue-600" />
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Gerenciador de Acessos</h2>
          <p className="text-gray-500 text-sm mt-1">Crie contas para os funcionários e defina suas permissões.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Formulário */}
        <div className="md:col-span-1 bg-gray-50 p-6 rounded-lg border border-gray-200 h-fit">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
            <UserPlus className="w-5 h-5 mr-2 text-blue-600" />
            Novo Usuário
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
              <input type="text" required value={formData.nome} onChange={e => setFormData({...formData, nome: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome de Usuário (Login)</label>
              <input type="text" required value={formData.username} onChange={e => setFormData({...formData, username: e.target.value.toLowerCase()})} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Senha Provisória</label>
              <input type="text" required value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nível de Acesso</label>
              <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
                <option value="EMPLOYEE">Funcionário (Padrão)</option>
                <option value="ADMIN">Administrador (Acesso Total)</option>
              </select>
            </div>
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors mt-4">
              Criar Conta
            </button>
          </form>
        </div>

        {/* Lista */}
        <div className="md:col-span-2">
          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Login</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Permissão</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map(u => (
                  <tr key={u.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{u.nome} {u.id === currentUser?.id ? <span className="text-xs font-normal text-blue-500 ml-2">(Você)</span> : ''}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{u.username}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${u.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'}`}>
                        {u.role === 'ADMIN' ? 'Administrador' : 'Funcionário'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {u.id !== currentUser?.id && (
                        <button onClick={() => handleDelete(u.id)} className="text-red-600 hover:text-red-900" title="Excluir Acesso">
                          <Trash2 className="w-5 h-5 ml-auto" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
