import React, { useEffect, useState } from 'react';
import { Pencil, Trash2, Plus, X, Check } from 'lucide-react';

type EntityType = 'diagnoses' | 'folders' | 'ubs' | 'formulas';

interface Entity {
  id: number;
  nome: string;
}

export function AdminLists() {
  const [activeTab, setActiveTab] = useState<EntityType>('formulas');
  const [items, setItems] = useState<Entity[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit State
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');

  // Add State
  const [isAdding, setIsAdding] = useState(false);
  const [newValue, setNewValue] = useState('');

  useEffect(() => {
    fetchItems();
  }, [activeTab]);

  const fetchItems = async () => {
    setLoading(true);
    setEditingId(null);
    setIsAdding(false);
    try {
      const res = await fetch(`/api/${activeTab}`);
      if (res.ok) setItems(await res.json());
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleAdd = async () => {
    if (!newValue.trim()) return;
    try {
      const res = await fetch(`/api/${activeTab}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome: newValue })
      });
      if (res.ok) {
        setNewValue('');
        setIsAdding(false);
        fetchItems();
      } else {
        alert('Erro ao adicionar item (já existe?).');
      }
    } catch (e) {
      alert('Erro de conexão.');
    }
  };

  const handleUpdate = async (id: number) => {
    if (!editValue.trim()) return;
    try {
      const res = await fetch(`/api/${activeTab}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome: editValue })
      });
      if (res.ok) {
        setEditingId(null);
        fetchItems();
      } else {
        alert('Erro ao atualizar item.');
      }
    } catch (e) {
      alert('Erro de conexão.');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Tem certeza que deseja excluir este item? Ele será removido de todos os pacientes que o utilizam.')) return;
    try {
      const res = await fetch(`/api/${activeTab}/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        fetchItems();
      } else {
        alert('Erro ao excluir item. Pode estar vinculado a um paciente.');
      }
    } catch (e) {
      alert('Erro de conexão.');
    }
  };

  const tabs = [
    { id: 'formulas', label: 'Fórmulas' },
    { id: 'diagnoses', label: 'Diagnósticos (CIDs)' },
    { id: 'ubs', label: 'Unidades de Saúde (UBS)' },
    { id: 'folders', label: 'Pastas Físicas' }
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md mt-10 mb-20">
      <div className="mb-8 border-b pb-4">
        <h2 className="text-2xl font-bold text-gray-800">Administração de Listas</h2>
        <p className="text-gray-500 text-sm mt-1">Gerencie os cadastros auxiliares do sistema</p>
      </div>

      <div className="flex space-x-1 border-b border-gray-200 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as EntityType)}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
              activeTab === tab.id
                ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-700">
            {tabs.find(t => t.id === activeTab)?.label}
          </h3>
          <button 
            onClick={() => { setIsAdding(true); setNewValue(''); }}
            className="flex items-center px-3 py-1.5 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-1" />
            Adicionar Novo
          </button>
        </div>

        {isAdding && (
          <div className="flex items-center mb-4 p-3 bg-white border border-blue-200 rounded-md shadow-sm">
            <input
              type="text"
              autoFocus
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleAdd(); else if (e.key === 'Escape') setIsAdding(false); }}
              placeholder="Digite o nome..."
              className="flex-1 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
            <button onClick={handleAdd} className="ml-2 p-1.5 text-green-600 hover:bg-green-50 rounded">
              <Check className="w-5 h-5" />
            </button>
            <button onClick={() => setIsAdding(false)} className="ml-1 p-1.5 text-red-500 hover:bg-red-50 rounded">
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {loading ? (
          <div className="text-center py-8 text-gray-500 text-sm">Carregando...</div>
        ) : items.length === 0 && !isAdding ? (
          <div className="text-center py-8 text-gray-500 text-sm">Nenhum item cadastrado nesta lista.</div>
        ) : (
          <ul className="divide-y divide-gray-200 bg-white border border-gray-200 rounded-md">
            {items.map(item => (
              <li key={item.id} className="flex items-center justify-between p-3 hover:bg-gray-50">
                {editingId === item.id ? (
                  <div className="flex items-center flex-1 mr-4">
                    <input
                      type="text"
                      autoFocus
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleUpdate(item.id); else if (e.key === 'Escape') setEditingId(null); }}
                      className="flex-1 px-3 py-1 border border-blue-400 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                    <button onClick={() => handleUpdate(item.id)} className="ml-2 p-1 text-green-600 hover:bg-green-50 rounded">
                      <Check className="w-5 h-5" />
                    </button>
                    <button onClick={() => setEditingId(null)} className="ml-1 p-1 text-gray-400 hover:bg-gray-100 rounded">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <>
                    <span className="text-sm font-medium text-gray-700">{item.nome}</span>
                    <div className="flex space-x-1">
                      <button 
                        onClick={() => { setEditingId(item.id); setEditValue(item.nome); }}
                        className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="Editar"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(item.id)}
                        className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Excluir"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
