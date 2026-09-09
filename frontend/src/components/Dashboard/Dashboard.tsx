import React, { useEffect, useState } from 'react';
import { Users, PackageSearch, AlertTriangle, TrendingUp, Clock, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Dashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard')
      .then(res => res.json())
      .then(json => {
        setData(json);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading || !data) {
    return <div className="p-10 text-center text-gray-500">Carregando métricas...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800">Painel Geral</h2>
        <p className="text-gray-500 mt-1">Resumo do sistema de dispensação de suplementos nutricionais.</p>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100 flex items-center">
          <div className="p-4 bg-blue-100 rounded-full mr-4">
            <Users className="w-8 h-8 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 uppercase">Pacientes Cadastrados</p>
            <p className="text-3xl font-bold text-gray-800">{data.totalPatients}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100 flex items-center">
          <div className="p-4 bg-emerald-100 rounded-full mr-4">
            <PackageSearch className="w-8 h-8 text-emerald-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 uppercase">Tipos de Fórmulas</p>
            <p className="text-3xl font-bold text-gray-800">{data.totalFormulas}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100 flex items-center">
          <div className="p-4 bg-purple-100 rounded-full mr-4">
            <TrendingUp className="w-8 h-8 text-purple-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 uppercase">Entregues no Mês</p>
            <p className="text-3xl font-bold text-gray-800">{data.totalDispensedMonth} <span className="text-sm font-normal text-gray-400">latas</span></p>
          </div>
        </div>
      </div>

      {/* Main Grid for Alerts and Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left Column: Alerts */}
        <div className="space-y-8">
          
          {/* Expiration Alerts */}
          <div className="bg-white rounded-lg shadow-sm border border-orange-200 overflow-hidden">
            <div className="bg-orange-50 border-b border-orange-200 p-4 flex items-center">
              <AlertTriangle className="w-5 h-5 text-orange-600 mr-2" />
              <h3 className="font-bold text-orange-800">Alerta de Validades (Próx. 60 dias)</h3>
            </div>
            <div className="p-0">
              {data.expiringBatches.length > 0 ? (
                <ul className="divide-y divide-gray-100">
                  {data.expiringBatches.map((batch: any) => {
                    const days = Math.floor((new Date(batch.data_validade).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
                    const isExpired = days < 0;
                    return (
                      <li key={batch.id} className="p-4 hover:bg-orange-50/50 transition-colors flex justify-between items-center">
                        <div>
                          <p className="font-semibold text-gray-800">{batch.formula.nome}</p>
                          <p className="text-xs text-gray-500">Lote: {batch.numero_lote} • Restam: {batch.quantidade_atual} latas</p>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-bold ${isExpired ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
                          {isExpired ? 'Vencido!' : `Vence em ${days} dias`}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <div className="p-6 text-center text-gray-500 text-sm">
                  Nenhum lote com vencimento próximo detectado.
                </div>
              )}
            </div>
          </div>

          {/* Empty Stock Alerts */}
          <div className="bg-white rounded-lg shadow-sm border border-red-200 overflow-hidden">
            <div className="bg-red-50 border-b border-red-200 p-4 flex items-center">
              <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
              <h3 className="font-bold text-red-800">Lotes Esgotados</h3>
            </div>
            <div className="p-0">
              {data.emptyBatches.length > 0 ? (
                <ul className="divide-y divide-gray-100">
                  {data.emptyBatches.map((batch: any) => (
                    <li key={batch.id} className="p-4 flex justify-between items-center">
                      <div>
                        <p className="font-semibold text-gray-800">{batch.formula.nome}</p>
                        <p className="text-xs text-gray-500">Lote: {batch.numero_lote} (Acabou)</p>
                      </div>
                      <Link to="/estoque" className="text-xs text-blue-600 font-medium hover:underline">Repor Estoque</Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-6 text-center text-gray-500 text-sm">
                  Nenhum lote zerado no momento.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col h-full">
          <div className="bg-gray-50 border-b border-gray-200 p-4 flex items-center justify-between">
            <div className="flex items-center">
              <Clock className="w-5 h-5 text-gray-600 mr-2" />
              <h3 className="font-bold text-gray-800">Últimas Dispensações</h3>
            </div>
            <Link to="/entregas" className="text-sm text-blue-600 font-medium hover:underline">Nova Entrega</Link>
          </div>
          <div className="p-0 flex-1">
            {data.recentDispensing.length > 0 ? (
              <ul className="divide-y divide-gray-100">
                {data.recentDispensing.map((dispense: any) => (
                  <li key={dispense.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start mb-1">
                      <p className="font-bold text-gray-800">{dispense.patient.nome}</p>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {new Date(dispense.data_dispensacao).toLocaleDateString('pt-BR')} às {new Date(dispense.data_dispensacao).toLocaleTimeString('pt-BR', { hour: '2-digit', minute:'2-digit' })}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      Retirou <strong className="text-blue-600">{dispense.quantidade} latas</strong> de {dispense.batch.formula.nome}
                    </p>
                    <div className="flex text-xs text-gray-500 space-x-4">
                      <span><span className="font-medium">Por:</span> {dispense.quem_entregou}</span>
                      <span><span className="font-medium">Para:</span> {dispense.quem_recebeu}</span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-10 text-center text-gray-500 flex flex-col items-center justify-center h-full">
                <p>Nenhuma dispensação registrada neste mês.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
