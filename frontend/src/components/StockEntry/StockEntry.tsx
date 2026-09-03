import React, { useEffect, useState } from 'react';
import { PackageSearch, Plus, Calendar, AlertCircle, Pencil, Trash2 } from 'lucide-react';

interface Batch {
  id: number;
  numero_lote: string;
  data_validade: string;
  quantidade_inicial: number;
  quantidade_atual: number;
  data_entrada: string;
  observacoes: string | null;
  formula: {
    id: number;
    nome: string;
  };
}

interface Formula {
  id: number;
  nome: string;
}

export function StockEntry() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [formulas, setFormulas] = useState<Formula[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    formulaId: '',
    numero_lote: '',
    data_validade: '',
    quantidade_inicial: '',
    observacoes: ''
  });

  useEffect(() => {
    fetchBatches();
    fetchFormulas();
  }, []);

  const fetchBatches = async () => {
    try {
      const res = await fetch('/api/batches');
      if (res.ok) setBatches(await res.json());
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const fetchFormulas = async () => {
    try {
      const res = await fetch('/api/formulas');
      if (res.ok) setFormulas(await res.json());
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingId ? `/api/batches/${editingId}` : '/api/batches';
      const method = editingId ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setIsModalOpen(false);
        setEditingId(null);
        setFormData({ formulaId: '', numero_lote: '', data_validade: '', quantidade_inicial: '', observacoes: '' });
        fetchBatches();
      } else {
        const error = await res.json();
        alert(error.error || 'Erro ao salvar lote');
      }
    } catch (e) {
      alert('Erro na conexão com o servidor');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Tem certeza que deseja excluir este lote?')) return;
    try {
      const res = await fetch(`/api/batches/${id}`, { method: 'DELETE' });
      if (res.ok) fetchBatches();
      else alert('Erro ao excluir lote.');
    } catch (e) {
      alert('Erro na conexão');
    }
  };

  const handleEdit = (batch: Batch) => {
    setEditingId(batch.id);
    setFormData({
      formulaId: batch.formula.id.toString(),
      numero_lote: batch.numero_lote,
      data_validade: new Date(batch.data_validade).toISOString().split('T')[0],
      quantidade_inicial: batch.quantidade_inicial.toString(),
      observacoes: batch.observacoes || ''
    });
    setIsModalOpen(true);
  };

  const getDaysToExpire = (dateStr: string) => {
    const diff = new Date(dateStr).getTime() - new Date().getTime();
    return Math.ceil(diff / (1000 * 3600 * 24));
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-md mt-10 mb-20">
      <div className="flex justify-between items-center mb-8 border-b pb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center">
            <PackageSearch className="w-6 h-6 mr-2 text-blue-600" />
            Controle de Estoque e Lotes
          </h2>
          <p className="text-gray-500 text-sm mt-1">Gerencie a entrada de novas latas e controle as datas de validade</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Registrar Entrada
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg">
          <div className="text-sm text-blue-600 font-medium">Total de Fórmulas no Estoque</div>
          <div className="text-2xl font-bold text-blue-900 mt-1">
            {batches.reduce((acc, curr) => acc + curr.quantidade_atual, 0)} latas
          </div>
        </div>
        <div className="bg-red-50 border border-red-100 p-4 rounded-lg">
          <div className="text-sm text-red-600 font-medium">Lotes Próximos ao Vencimento</div>
          <div className="text-2xl font-bold text-red-900 mt-1">
            {batches.filter(b => getDaysToExpire(b.data_validade) <= 60 && b.quantidade_atual > 0).length} lotes
          </div>
          <div className="text-xs text-red-500 mt-1">Vencendo em 60 dias</div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Carregando estoque...</div>
      ) : (
        <div className="overflow-x-auto border border-gray-200 rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fórmula</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lote</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Validade</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Saldo Atual</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {batches.length > 0 ? (
                batches.map((batch) => {
                  const days = getDaysToExpire(batch.data_validade);
                  const isExpiringSoon = days <= 60 && days >= 0;
                  const isExpired = days < 0;
                  const isEmpty = batch.quantidade_atual === 0;

                  return (
                    <tr key={batch.id} className={`hover:bg-gray-50 ${isEmpty ? 'opacity-60 bg-gray-50' : ''}`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{batch.formula.nome}</div>
                        <div className="text-xs text-gray-500">Entrada: {new Date(batch.data_entrada).toLocaleDateString('pt-BR')}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{batch.numero_lote}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900">
                          <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                          {new Date(batch.data_validade).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className={`text-lg font-bold ${isEmpty ? 'text-gray-400' : 'text-blue-600'}`}>
                            {batch.quantidade_atual}
                          </div>
                          <div className="text-xs text-gray-500 ml-1 mt-1">/ {batch.quantidade_inicial}</div>
                        </div>
                        {/* Visual Progress Bar */}
                        <div className="w-24 h-1.5 bg-gray-200 rounded-full mt-2">
                          <div 
                            className={`h-1.5 rounded-full ${isEmpty ? 'bg-gray-400' : 'bg-blue-500'}`} 
                            style={{ width: `${Math.max(0, Math.min(100, (batch.quantidade_atual / batch.quantidade_inicial) * 100))}%` }}
                          ></div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {isEmpty ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            Esgotado
                          </span>
                        ) : isExpired ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            <AlertCircle className="w-3 h-3 mr-1" /> Vencido
                          </span>
                        ) : isExpiringSoon ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                            <AlertCircle className="w-3 h-3 mr-1" /> Vence em {days} dias
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            No Prazo
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button 
                          onClick={() => handleEdit(batch)}
                          className="text-gray-400 hover:text-blue-600 mr-3 transition-colors"
                          title="Editar Lote"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(batch.id)}
                          className="text-gray-400 hover:text-red-600 transition-colors"
                          title="Excluir Lote"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
                    Nenhum lote registrado no estoque.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Nova Entrada */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg shadow-xl border border-gray-200">
            <h3 className="text-lg font-bold mb-4 text-gray-800 border-b pb-2">Registrar Entrada de Lote</h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fórmula Recebida</label>
                <select 
                  required
                  value={formData.formulaId}
                  onChange={e => setFormData({...formData, formulaId: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Selecione uma fórmula...</option>
                  {formulas.map(f => (
                    <option key={f.id} value={f.id}>{f.nome}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Número do Lote</label>
                  <input 
                    type="text" required
                    placeholder="Ex: LTA-1234"
                    value={formData.numero_lote}
                    onChange={e => setFormData({...formData, numero_lote: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Data de Validade</label>
                  <input 
                    type="date" required
                    value={formData.data_validade}
                    onChange={e => setFormData({...formData, data_validade: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantidade Recebida (Latas)</label>
                <input 
                  type="number" required min="1"
                  placeholder="Ex: 50"
                  value={formData.quantidade_inicial}
                  onChange={e => setFormData({...formData, quantidade_inicial: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Observações (Opcional)</label>
                <textarea 
                  rows={2}
                  value={formData.observacoes}
                  onChange={e => setFormData({...formData, observacoes: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Registrar Lote</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
