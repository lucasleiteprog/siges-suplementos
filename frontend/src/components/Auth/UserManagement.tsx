import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Trash2, UserPlus, Shield, CheckSquare, Edit, X } from 'lucide-react';

export function UserManagement() {
  const { token, user: currentUser } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const initialForm = {
    nome: '',
    username: '',
    password: '',
    role: 'EMPLOYEE',
    perm_pacientes_editar: true,
    perm_pacientes_excluir: false,
    perm_estoque_editar: true,
    perm_estoque_excluir: false,
    perm_listas_base: false,
    perm_usuarios: false
  };

  const [formData, setFormData] = useState(initialForm);

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
      const url = editingId ? `/api/users/${editingId}` : '/api/users';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setFormData(initialForm);
        setEditingId(null);
        setIsModalOpen(false);
        fetchUsers();
      } else {
        const error = await res.json();
        alert(error.error || 'Erro ao salvar usuário');
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

  const handleEdit = (user: any) => {
    setEditingId(user.id);
    setFormData({
      ...user,
      password: ''
    });
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData(initialForm);
    setIsModalOpen(false);
  }

  const handleCheckbox = (field: string) => {
    setFormData(prev => ({ ...prev, [field]: !(prev as any)[field] }));
  };

  if (loading) return <div className="p-10 text-center">Carregando...</div>;

  return (
    <div className="max-w-7xl mx-auto p-6 bg-white rounded-lg shadow-md mt-10 mb-20">
      <div className="flex justify-between items-center mb-8 border-b pb-4">
        <div className="flex items-center">
          <Shield className="w-6 h-6 mr-3 text-blue-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Gerenciador de Acessos</h2>
            <p className="text-gray-500 text-sm mt-1">Crie contas e defina exatamente o que cada funcionário pode ver ou fazer.</p>
          </div>
        </div>
        <button 
          onClick={() => { setEditingId(null); setFormData(initialForm); setIsModalOpen(true); }}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium transition-colors"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Novo Acesso
        </button>
      </div>

      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome / Login</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acessos</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ações</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map(u => (
              <tr key={u.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{u.nome} {u.id === currentUser?.id ? <span className="text-xs font-normal text-blue-500 ml-1">(Você)</span> : ''}</div>
                  <div className="text-xs text-gray-500">@{u.username}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1">
                    {u.perm_pacientes_editar && <span className="px-2 py-1 text-[10px] font-semibold rounded bg-blue-100 text-blue-800">Edit Pacientes</span>}
                    {u.perm_pacientes_excluir && <span className="px-2 py-1 text-[10px] font-semibold rounded bg-red-100 text-red-800">Del Pacientes</span>}
                    {u.perm_estoque_editar && <span className="px-2 py-1 text-[10px] font-semibold rounded bg-blue-100 text-blue-800">Edit Estoque</span>}
                    {u.perm_estoque_excluir && <span className="px-2 py-1 text-[10px] font-semibold rounded bg-red-100 text-red-800">Del Estoque</span>}
                    {u.perm_listas_base && <span className="px-2 py-1 text-[10px] font-semibold rounded bg-purple-100 text-purple-800">Listas Base</span>}
                    {u.perm_usuarios && <span className="px-2 py-1 text-[10px] font-semibold rounded bg-purple-100 text-purple-800">Usuários</span>}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                  <button onClick={() => handleEdit(u)} className="text-blue-600 hover:text-blue-900" title="Editar Permissões">
                    <Edit className="w-5 h-5 inline" />
                  </button>
                  {u.id !== currentUser?.id && (
                    <button onClick={() => handleDelete(u.id)} className="text-red-600 hover:text-red-900" title="Excluir Usuário">
                      <Trash2 className="w-5 h-5 inline" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-bold text-gray-800 flex items-center">
                {editingId ? <Edit className="w-5 h-5 mr-2 text-blue-600" /> : <UserPlus className="w-5 h-5 mr-2 text-blue-600" />}
                {editingId ? 'Editando Acesso' : 'Novo Acesso'}
              </h3>
              <button onClick={handleCancel} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
                <input type="text" required value={formData.nome} onChange={e => setFormData({...formData, nome: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome de Usuário (Login)</label>
                <input type="text" required disabled={!!editingId} value={formData.username} onChange={e => setFormData({...formData, username: e.target.value.toLowerCase()})} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 disabled:bg-gray-100" />
              </div>
              {!editingId && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Senha Provisória</label>
                  <input type="text" required value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500" />
                </div>
              )}

              <div className="pt-4 border-t border-gray-200 mt-4">
                <h4 className="font-semibold text-gray-800 mb-2 flex items-center"><CheckSquare className="w-4 h-4 mr-2" /> Permissões do Sistema</h4>
                
                <div className="space-y-3">
                  <div className="bg-white p-3 border border-gray-200 rounded">
                    <span className="text-xs font-bold text-gray-500 uppercase block mb-2">Pacientes</span>
                    <label className="flex items-center text-sm mb-1"><input type="checkbox" checked={formData.perm_pacientes_editar} onChange={() => handleCheckbox('perm_pacientes_editar')} className="mr-2 rounded border-gray-300 text-blue-600" /> Pode Adicionar/Editar</label>
                    <label className="flex items-center text-sm"><input type="checkbox" checked={formData.perm_pacientes_excluir} onChange={() => handleCheckbox('perm_pacientes_excluir')} className="mr-2 rounded border-gray-300 text-red-600" /> Pode Excluir Cadastro</label>
                  </div>

                  <div className="bg-white p-3 border border-gray-200 rounded">
                    <span className="text-xs font-bold text-gray-500 uppercase block mb-2">Estoque e Lotes</span>
                    <label className="flex items-center text-sm mb-1"><input type="checkbox" checked={formData.perm_estoque_editar} onChange={() => handleCheckbox('perm_estoque_editar')} className="mr-2 rounded border-gray-300 text-blue-600" /> Pode Dar Entrada/Editar Lote</label>
                    <label className="flex items-center text-sm"><input type="checkbox" checked={formData.perm_estoque_excluir} onChange={() => handleCheckbox('perm_estoque_excluir')} className="mr-2 rounded border-gray-300 text-red-600" /> Pode Excluir Lote</label>
                  </div>

                  <div className="bg-white p-3 border border-gray-200 rounded">
                    <span className="text-xs font-bold text-gray-500 uppercase block mb-2">Administração</span>
                    <label className="flex items-center text-sm mb-1"><input type="checkbox" checked={formData.perm_listas_base} onChange={() => handleCheckbox('perm_listas_base')} className="mr-2 rounded border-gray-300 text-purple-600" /> Gerenciar Listas (Fórmulas, UBS, etc)</label>
                    <label className="flex items-center text-sm"><input type="checkbox" checked={formData.perm_usuarios} onChange={() => handleCheckbox('perm_usuarios')} className="mr-2 rounded border-gray-300 text-purple-600" /> Gerenciar Usuários e Acessos</label>
                  </div>
                </div>
              </div>

              <div className="flex space-x-2 mt-6 pt-4 border-t">
                <button type="button" onClick={handleCancel} className="flex-1 border border-gray-300 text-gray-700 font-medium py-2 px-4 rounded-md transition-colors hover:bg-gray-50">Cancelar</button>
                <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors">
                  {editingId ? 'Salvar' : 'Criar Conta'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
