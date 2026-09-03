import React, { useEffect, useState } from 'react';
import { Search, Plus, Filter, UserRound, Folder as FolderIcon, MapPin, Edit } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export function PatientList() {
  const [patients, setPatients] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/api/patients')
      .then(res => res.json())
      .then(data => {
        setPatients(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const filteredPatients = patients.filter(p => 
    p.nome.toLowerCase().includes(search.toLowerCase()) || 
    p.cpf.includes(search) || 
    p.cartao_sus.includes(search)
  );

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-md mt-10 mb-20">
      <div className="flex justify-between items-center mb-8 border-b pb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Pacientes</h2>
          <p className="text-gray-500 text-sm mt-1">{patients.length} pacientes cadastrados</p>
        </div>
        <Link 
          to="/pacientes/novo" 
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Paciente
        </Link>
      </div>

      <div className="flex space-x-4 mb-6">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
            placeholder="Pesquisar por nome, CPF ou Cartão SUS..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 bg-white">
          <Filter className="w-4 h-4 mr-2 text-gray-500" />
          Filtros
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Carregando pacientes...</div>
      ) : (
        <div className="overflow-x-auto border border-gray-200 rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Paciente
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Identificação
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Localização
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fórmulas
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pasta
                </th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPatients.length > 0 ? (
                filteredPatients.map((patient) => (
                  <tr key={patient.id} onClick={() => navigate(`/pacientes/editar/${patient.id}`)} className="hover:bg-blue-50 cursor-pointer transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <UserRound className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{patient.nome}</div>
                          <div className="text-sm text-gray-500">
                            Nasc: {new Date(patient.data_nascimento).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">CPF: {patient.cpf || '-'}</div>
                      <div className="text-sm text-gray-500">SUS: {patient.cartao_sus || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <MapPin className="w-3 h-3 text-gray-400 mr-1" />
                        {patient.ubs ? patient.ubs.nome : 'Sem UBS vinculada'}
                      </div>
                      <div className="text-sm text-gray-500 ml-4">{patient.bairro || 'Bairro não inf.'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {patient.formulas && patient.formulas.length > 0 ? (
                          patient.formulas.map((f: any) => (
                            <span key={f.id} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">
                              {f.nome}
                            </span>
                          ))
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </div>
                      {patient.quantidade && (
                        <div className="text-xs text-gray-500 mt-1">{patient.quantidade} latas/mês</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {patient.folder ? (
                        <div className="flex items-center text-sm font-medium text-blue-700 bg-blue-50 px-2 py-1 rounded-md w-fit border border-blue-100">
                          <FolderIcon className="w-4 h-4 mr-2" />
                          {patient.folder.nome}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                      <button 
                        onClick={(e) => { e.stopPropagation(); navigate(`/pacientes/editar/${patient.id}`); }}
                        className="text-blue-600 hover:text-blue-900 bg-blue-50 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Editar Paciente"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
                    Nenhum paciente encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
