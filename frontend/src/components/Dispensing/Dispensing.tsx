import React, { useEffect, useState } from 'react';
import { Truck, CheckCircle2, User, Search, PackageSearch, AlertTriangle, Clock, X, Plus } from 'lucide-react';

export function Dispensing() {
  const [patients, setPatients] = useState<any[]>([]);
  const [batches, setBatches] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<any | null>(null);
  const [selectedFormulaId, setSelectedFormulaId] = useState<string>('');
  const [quantity, setQuantity] = useState<string>('');
  const [quemEntregou, setQuemEntregou] = useState<string>('');
  const [quemRecebeu, setQuemRecebeu] = useState<string>('');
  const [observacoes, setObservacoes] = useState<string>('');
  const [isUrgencyChecked, setIsUrgencyChecked] = useState<boolean>(false);
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchHistory();
    fetchPatients();
    fetchBatches();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/dispense');
      if (res.ok) setHistory(await res.json());
    } catch (e) {
      console.error(e);
    }
  };

  const fetchPatients = async () => {
    try {
      const res = await fetch('/api/patients');
      if (res.ok) setPatients(await res.json());
    } catch (e) {
      console.error(e);
    }
  };

  const fetchBatches = async () => {
    try {
      const res = await fetch('/api/batches');
      if (res.ok) setBatches(await res.json());
      setLoading(false);
    } catch (e) {
      console.error(e);
    }
  };

  const filteredPatients = patients.filter(p => 
    p.nome.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.cpf.includes(searchQuery)
  );

  let daysSinceDelivery = -1;
  let isEarlyDelivery = false;
  
  if (selectedPatient?.data_entrega) {
    const msDiff = new Date().getTime() - new Date(selectedPatient.data_entrega).getTime();
    daysSinceDelivery = Math.floor(msDiff / (1000 * 60 * 60 * 24));
    if (daysSinceDelivery < 30) {
      isEarlyDelivery = true;
    }
  }

  const getFormulaStock = (formulaId: number) => {
    return batches
      .filter(b => b.formula_id === formulaId)
      .reduce((acc, curr) => acc + curr.quantidade_atual, 0);
  };

  const handleDispense = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccessMessage('');

    try {
      const res = await fetch('/api/dispense', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient_id: selectedPatient.id,
          formula_id: parseInt(selectedFormulaId),
          quantidade_solicitada: parseInt(quantity),
          quem_entregou: quemEntregou,
          quem_recebeu: quemRecebeu,
          observacoes: observacoes
        })
      });

      const data = await res.json();
      if (res.ok) {
        setSuccessMessage('Dispensação realizada com sucesso!');
        fetchBatches();
        fetchPatients();
        fetchHistory();
        
        // Reset form for next dispense
        setTimeout(() => {
          setSelectedPatient(null);
          setSelectedFormulaId('');
          setQuantity('');
          setQuemEntregou('');
          setQuemRecebeu('');
          setObservacoes('');
          setSuccessMessage('');
          setIsModalOpen(false);
        }, 1500);
      } else {
        alert(data.error || 'Erro ao realizar dispensação');
      }
    } catch (error) {
      alert('Erro de conexão ao realizar dispensação');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-10 text-center">Carregando...</div>;

  return (
    <div className="max-w-7xl mx-auto p-6 bg-white rounded-lg shadow-md mt-10 mb-20">
      <div className="flex justify-between items-center mb-8 border-b pb-4">
        <div className="flex items-center">
          <Truck className="w-6 h-6 mr-3 text-blue-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Dispensação e Entregas</h2>
            <p className="text-gray-500 text-sm mt-1">Histórico recente de entregas e botão para nova dispensação.</p>
          </div>
        </div>
        <button 
          onClick={() => {
            setSelectedPatient(null);
            setIsModalOpen(true);
          }}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nova Dispensação
        </button>
      </div>

      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Paciente</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fórmula / Qtd</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Entregue por</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Recebido por</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {history.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">Nenhum histórico encontrado.</td>
              </tr>
            ) : (
              history.map(h => (
                <tr key={h.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(h.data_entrega).toLocaleDateString()} {new Date(h.data_entrega).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {h.patient.nome}
                    <div className="text-xs text-gray-500 font-normal">CPF: {h.patient.cpf}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className="font-semibold text-blue-700">{h.quantidade_entregue} latas</span>
                    <div className="text-xs text-gray-600">{h.formula.nome}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {h.quem_entregou || '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {h.quem_recebeu || '-'}
                    {h.observacoes && (
                      <div className="text-xs text-red-500 mt-1" title={h.observacoes}>Ver obs.</div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl h-[85vh] flex flex-col">
            <div className="flex justify-between items-center p-4 border-b shrink-0">
              <h3 className="text-xl font-bold text-gray-800 flex items-center">
                <Truck className="w-6 h-6 mr-2 text-blue-600" />
                Nova Dispensação
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X className="w-6 h-6" /></button>
            </div>
            
            <div className="flex-1 overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-2 h-full">
                
                {/* Left Column: Search */}
                <div className="border-r border-gray-200 bg-gray-50 flex flex-col h-full">
                  <div className="p-4 border-b border-gray-200 shrink-0">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        placeholder="Buscar paciente por nome ou CPF..."
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto">
                    {filteredPatients.length > 0 ? (
                      <ul className="divide-y divide-gray-200">
                        {filteredPatients.map(patient => {
                          let diasDesdeEntrega = 999;
                          if (patient.data_entrega) {
                            diasDesdeEntrega = Math.floor((new Date().getTime() - new Date(patient.data_entrega).getTime()) / (1000 * 60 * 60 * 24));
                          }
                          return (
                            <li 
                              key={patient.id} 
                              onClick={() => {
                                setSelectedPatient(patient);
                                setSelectedFormulaId('');
                                setSuccessMessage('');
                                setIsUrgencyChecked(false);
                              }}
                              className={`p-4 cursor-pointer hover:bg-blue-50 transition-colors ${selectedPatient?.id === patient.id ? 'bg-blue-100 border-l-4 border-blue-600' : ''}`}
                            >
                              <div className="font-medium text-gray-900">{patient.nome}</div>
                              <div className="text-xs text-gray-500 flex justify-between mt-1">
                                <span>CPF: {patient.cpf || 'Não informado'}</span>
                                {patient.data_entrega && (
                                  <span className={diasDesdeEntrega < 30 ? "text-red-600 font-medium" : "text-green-600 font-medium"}>
                                    Última entrega: {new Date(patient.data_entrega).toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    ) : (
                      <div className="p-4 text-sm text-gray-500 text-center mt-10">Nenhum paciente encontrado.</div>
                    )}
                  </div>
                </div>

                {/* Right Column: Dispense Action */}
                <div className="p-6 overflow-y-auto h-full">
                  {!selectedPatient ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400">
                      <User className="w-16 h-16 mb-4 text-gray-300" />
                      <p className="text-lg font-medium text-gray-500">Selecione um paciente</p>
                      <p className="text-sm">Busque na lista ao lado para iniciar a entrega</p>
                    </div>
                  ) : (
                    <div>
                      {successMessage ? (
                        <div className="h-full flex flex-col items-center justify-center text-green-600">
                          <CheckCircle2 className="w-16 h-16 mb-4" />
                          <p className="text-xl font-bold">{successMessage}</p>
                        </div>
                      ) : (
                        <>
                          <div className="mb-6 bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                            <h3 className="font-bold text-gray-800 text-lg">{selectedPatient.nome}</h3>
                            <div className="mt-2 text-sm text-gray-600 grid grid-cols-2 gap-2">
                              <div><span className="font-medium">CPF:</span> {selectedPatient.cpf || '-'}</div>
                              <div><span className="font-medium">Idade:</span> {selectedPatient.data_nascimento ? Math.floor((new Date().getTime() - new Date(selectedPatient.data_nascimento).getTime()) / 31557600000) + ' anos' : '-'}</div>
                              <div className="col-span-2">
                                <span className="font-medium">Última Entrega:</span> {selectedPatient.data_entrega ? new Date(selectedPatient.data_entrega).toLocaleDateString() : 'Nunca recebeu'}
                              </div>
                            </div>
                          </div>

                          {isEarlyDelivery && (
                            <div className="mb-6 bg-red-50 border border-red-200 p-4 rounded-md flex">
                              <AlertTriangle className="w-5 h-5 text-red-600 mr-2 flex-shrink-0" />
                              <div>
                                <span className="font-bold text-red-800 block">Dispensação Bloqueada ({daysSinceDelivery} dias)</span>
                                <span className="text-sm text-red-700 block mb-3">A última entrega foi feita há apenas {daysSinceDelivery} dias ({new Date(selectedPatient.data_entrega).toLocaleDateString()}). O paciente ainda está dentro do período de 30 dias.</span>
                                
                                <label className="flex items-center text-sm font-medium text-red-900 cursor-pointer">
                                  <input 
                                    type="checkbox" 
                                    checked={isUrgencyChecked}
                                    onChange={(e) => setIsUrgencyChecked(e.target.checked)}
                                    className="w-4 h-4 text-red-600 border-red-300 rounded focus:ring-red-500 mr-2"
                                  />
                                  Liberar dispensação de urgência (Exigirá justificativa)
                                </label>
                              </div>
                            </div>
                          )}

                          {(!selectedPatient.formulas || selectedPatient.formulas.length === 0) ? (
                            <div className="bg-orange-50 border border-orange-200 p-4 rounded-md flex">
                              <AlertTriangle className="w-5 h-5 text-orange-600 mr-2 flex-shrink-0" />
                              <span className="text-sm text-orange-800">Este paciente não possui nenhuma fórmula autorizada em seu cadastro. Vá em Editar Paciente para adicionar.</span>
                            </div>
                          ) : (
                            <form onSubmit={handleDispense} className="space-y-6">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Fórmula a ser entregue</label>
                                <div className="grid gap-3">
                                  {selectedPatient.formulas.map((f: any) => {
                                    const stock = getFormulaStock(f.id);
                                    const isSelected = selectedFormulaId === f.id.toString();
                                    return (
                                      <label 
                                        key={f.id} 
                                        className={`flex items-center p-3 border rounded-md cursor-pointer transition-colors ${isSelected ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'} ${stock === 0 ? 'opacity-60' : ''}`}
                                      >
                                        <input 
                                          type="radio" 
                                          name="formula" 
                                          value={f.id}
                                          checked={isSelected}
                                          onChange={(e) => setSelectedFormulaId(e.target.value)}
                                          disabled={stock === 0}
                                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                        />
                                        <div className="ml-3 flex-1 flex justify-between items-center">
                                          <span className="font-medium text-gray-900">{f.nome}</span>
                                          <span className={`text-sm font-bold ${stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
                                            {stock > 0 ? `${stock} em estoque` : 'Sem estoque'}
                                          </span>
                                        </div>
                                      </label>
                                    );
                                  })}
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">Quem entregou</label>
                                  <input 
                                    type="text" 
                                    required
                                    placeholder="Ex: João"
                                    value={quemEntregou}
                                    onChange={(e) => setQuemEntregou(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">Quem recebeu</label>
                                  <input 
                                    type="text" 
                                    required
                                    placeholder="Ex: Maria (Mãe)"
                                    value={quemRecebeu}
                                    onChange={(e) => setQuemRecebeu(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  />
                                </div>
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Quantidade Entregue (Latas)</label>
                                <input 
                                  type="number" 
                                  min="1"
                                  required
                                  placeholder="Ex: 30"
                                  value={quantity}
                                  onChange={(e) => setQuantity(e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                {selectedFormulaId && (
                                  <p className="text-xs text-gray-500 mt-1">
                                    O sistema dará baixa nos lotes mais antigos (FEFO).
                                  </p>
                                )}
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Observações {(isEarlyDelivery && isUrgencyChecked) ? <span className="text-red-500 font-bold">(Motivo obrigatório)</span> : ''}</label>
                                <textarea 
                                  rows={2}
                                  required={isEarlyDelivery && isUrgencyChecked}
                                  placeholder={(isEarlyDelivery && isUrgencyChecked) ? "Descreva o motivo da urgência..." : "Anotações opcionais..."}
                                  value={observacoes}
                                  onChange={(e) => setObservacoes(e.target.value)}
                                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${(isEarlyDelivery && isUrgencyChecked && !observacoes.trim()) ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
                                />
                              </div>

                              <button 
                                type="submit" 
                                disabled={(isEarlyDelivery && !isUrgencyChecked) || submitting || !selectedFormulaId || !quantity || !quemEntregou || !quemRecebeu || (isEarlyDelivery && isUrgencyChecked && !observacoes.trim())}
                                className={`w-full py-3 px-4 font-medium rounded-md shadow-sm transition-colors flex justify-center items-center ${
                                  (isEarlyDelivery && !isUrgencyChecked) 
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                                    : 'bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white'
                                }`}
                              >
                                {(isEarlyDelivery && !isUrgencyChecked) ? 'Bloqueado (Prazo)' : submitting ? 'Processando...' : 'Confirmar Dispensação'}
                              </button>
                            </form>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
