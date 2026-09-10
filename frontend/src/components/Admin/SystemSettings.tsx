import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Settings as SettingsIcon, Save } from 'lucide-react';

export function SystemSettings() {
  const { token } = useAuth();
  const [formData, setFormData] = useState({
    dias_validade_relatorio: 90,
    dias_aviso_renovacao: 30
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        setFormData({
          dias_validade_relatorio: data.dias_validade_relatorio,
          dias_aviso_renovacao: data.dias_aviso_renovacao
        });
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        alert('Configurações salvas com sucesso!');
      } else {
        alert('Erro ao salvar');
      }
    } catch (e) {
      alert('Erro de conexão');
    }
  };

  if (loading) return <div className="p-10 text-center">Carregando...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md mt-10 mb-20">
      <div className="flex items-center mb-8 border-b pb-4">
        <SettingsIcon className="w-6 h-6 mr-3 text-blue-600" />
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Configurações do Sistema</h2>
          <p className="text-gray-500 text-sm mt-1">Ajuste as regras globais e prazos do sistema.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Regras de Relatórios e Dispensação</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Validade do Relatório Médico (dias)
              </label>
              <input 
                type="number" 
                min="1"
                required 
                value={formData.dias_validade_relatorio} 
                onChange={e => setFormData({...formData, dias_validade_relatorio: parseInt(e.target.value)})} 
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500" 
              />
              <p className="text-xs text-gray-500 mt-1">Após esse prazo, a dispensação é bloqueada.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Aviso de Renovação (dias antes do vencimento)
              </label>
              <input 
                type="number" 
                min="1"
                required 
                value={formData.dias_aviso_renovacao} 
                onChange={e => setFormData({...formData, dias_aviso_renovacao: parseInt(e.target.value)})} 
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500" 
              />
              <p className="text-xs text-gray-500 mt-1">O aviso laranja de vencimento próximo aparecerá.</p>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button type="submit" className="flex items-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-md transition-colors">
            <Save className="w-5 h-5 mr-2" />
            Salvar Configurações
          </button>
        </div>
      </form>
    </div>
  );
}
