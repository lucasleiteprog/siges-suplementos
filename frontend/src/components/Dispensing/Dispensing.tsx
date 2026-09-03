import React, { useEffect, useState } from 'react';
import { Truck, CheckCircle2, User, Search, PackageSearch, AlertTriangle } from 'lucide-react';

export function Dispensing() {
  const [patients, setPatients] = useState<any[]>([]);
  const [batches, setBatches] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<any | null>(null);
  const [selectedFormulaId, setSelectedFormulaId] = useState<string>('');
  const [quantity, setQuantity] = useState<string>('');
  const [quemEntregou, setQuemEntregou] = useState<string>('');
  const [quemRecebeu, setQuemRecebeu] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchPatients();
    fetchBatches();
  }, []);

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

  const getFormulaStock = (formulaId: number) => {
    return batches
      .filter(b => b.formulaId === formulaId && b.quantidade_atual > 0)
      .reduce((sum, b) => sum + b.quantidade_atual, 0);
  };

  const handleDispense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient || !selectedFormulaId || !quantity || !quemEntregou || !quemRecebeu) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/dispense', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient_id: selectedPatient.id,
          formula_id: selectedFormulaId,
          quantidade_solicitada: quantity,
          quem_entregou: quemEntregou,
          quem_recebeu: quemRecebeu
        })
      });

      const data = await res.json();
      if (res.ok) {
        setSuccessMessage('Entrega realizada com sucesso! O estoque foi reduzido (FEFO) e o histórico gravado.');
        setQuantity('');
        setQuemEntregou('');
        setQuemRecebeu('');
        setSelectedFormulaId('');
        fetchBatches(); // Update stock immediately
        
        // Refresh patient data to show updated 'data_entrega'
        fetchPatients();
        setTimeout(() => setSuccessMessage(''), 5000);
      } else {
        alert(data.error || 'Erro ao realizar entrega.');
      }
    } catch (e) {
      alert('Erro de conexão com o servidor.');
    }
    setSubmitting(false);
  };

  if (loading) {
    return <div className="p-10 text-center text-gray-500">Carregando dados...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-md mt-10 mb-20">
      <div className="flex items-center mb-8 border-b pb-4">
        <Truck className="w-6 h-6 mr-3 text-blue-600" />
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Dispensação e Entregas</h2>
          <p className="text-gray-500 text-sm mt-1">Registre a entrega de fórmulas para os pacientes e dê baixa automática no estoque (FEFO).</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left Column: Select Patient */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <User className="w-5 h-5 mr-2" /> 1. Selecionar Paciente
          </h3>
          
          <div className="relative mb-4">
            <Search className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Buscar por nome ou CPF..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="border border-gray-200 rounded-md h-96 overflow-y-auto bg-gray-50">
            {filteredPatients.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {filteredPatients.map(patient => (
                  <li 
                    key={patient.id} 
                    onClick={() => {
                      setSelectedPatient(patient);
                      setSelectedFormulaId('');
                      setSuccessMessage('');
                    }}
                    className={`p-3 cursor-pointer hover:bg-blue-50 transition-colors ${selectedPatient?.id === patient.id ? 'bg-blue-100 border-l-4 border-blue-600' : ''}`}
                  >
                    <div className="font-medium text-gray-900">{patient.nome}</div>
                    <div className="text-xs text-gray-500 flex justify-between mt-1">
                      <span>CPF: {patient.cpf || 'Não informado'}</span>
                      {patient.data_entrega && (
                        <span className="text-green-600">Última entrega: {new Date(patient.data_entrega).toLocaleDateString()}</span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-4 text-sm text-gray-500 text-center mt-10">Nenhum paciente encontrado.</div>
            )}
          </div>
        </div>

        {/* Right Column: Dispense Action */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <PackageSearch className="w-5 h-5 mr-2" /> 2. Realizar Entrega
          </h3>

          {!selectedPatient ? (
            <div className="h-96 border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center bg-gray-50 text-gray-400 p-6 text-center">
              Selecione um paciente na lista ao lado para ver suas fórmulas autorizadas e registrar a entrega.
            </div>
          ) : (
            <div className="border border-gray-200 rounded-md p-6 bg-white shadow-sm">
              <div className="mb-6 pb-4 border-b border-gray-100">
                <h4 className="text-xl font-bold text-gray-800">{selectedPatient.nome}</h4>
                <div className="text-sm text-gray-500 mt-1">
                  Cartão SUS: {selectedPatient.cartao_sus || 'N/A'} • 
                  Idade: {new Date().getFullYear() - new Date(selectedPatient.data_nascimento).getFullYear()} anos
                </div>
              </div>

              {successMessage && (
                <div className="mb-6 bg-green-50 border border-green-200 text-green-700 p-4 rounded-md flex items-center">
                  <CheckCircle2 className="w-5 h-5 mr-2 flex-shrink-0" />
                  <span className="text-sm font-medium">{successMessage}</span>
                </div>
              )}

              {selectedPatient.data_ultimo_relatorio && (new Date().getTime() - new Date(selectedPatient.data_ultimo_relatorio).getTime()) > 90 * 24 * 60 * 60 * 1000 && (
                <div className="mb-6 bg-red-50 border border-red-200 p-4 rounded-md flex">
                  <AlertTriangle className="w-5 h-5 text-red-600 mr-2 flex-shrink-0" />
                  <div>
                    <span className="font-bold text-red-800 block">Relatório Vencido!</span>
                    <span className="text-sm text-red-700">A data do último relatório médico/nutricional ultrapassou 90 dias (Data: {new Date(selectedPatient.data_ultimo_relatorio).toLocaleDateString()}). Peça atualização.</span>
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
                      <label className="block text-sm font-medium text-gray-700 mb-1">Quem entregou (Profissional)</label>
                      <input 
                        type="text" 
                        required
                        placeholder="Ex: João da Silva"
                        value={quemEntregou}
                        onChange={(e) => setQuemEntregou(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Quem recebeu (Retirante)</label>
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
                        O sistema dará baixa nos lotes mais antigos automaticamente (FEFO).
                      </p>
                    )}
                  </div>

                  <button 
                    type="submit" 
                    disabled={submitting || !selectedFormulaId || !quantity || !quemEntregou || !quemRecebeu}
                    className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium rounded-md shadow-sm transition-colors flex justify-center items-center"
                  >
                    {submitting ? 'Processando entrega...' : 'Confirmar Dispensação'}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
