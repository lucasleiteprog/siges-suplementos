import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

interface Entity { id: number; nome: string; }

const RESTRICTIONS_MOCK: Entity[] = [
  { id: 1, nome: 'Diabetes' },
  { id: 2, nome: 'Intolerância à Lactose' },
  { id: 3, nome: 'Doença Celíaca' },
  { id: 4, nome: 'Alergia à Proteína do Leite de Vaca (APLV)' },
];

export function PatientRegistrationForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [formData, setFormData] = useState({
    nome: '', cpf: '', cartao_sus: '', data_nascimento: '',
    endereco: '', bairro: '', visita_social: false,
    cids: '', observacoes: '',
    folder_id: '', ubs_id: '',
    relatorio_medico: false, relatorio_nutricional: false, 
    peso: '', altura: '', nome_profissional: '', registro_profissional: '',
    data_ultimo_relatorio: '', quantidade: '', data_entrega: '',
  });

  const [formaAlimentacao, setFormaAlimentacao] = useState<string[]>([]);
  const [viaAcessoSonda, setViaAcessoSonda] = useState<string[]>([]);
  const [selectedRestrictions, setSelectedRestrictions] = useState<number[]>([]);
  
  const [diagnoses, setDiagnoses] = useState<Entity[]>([]);
  const [selectedDiagnoses, setSelectedDiagnoses] = useState<Entity[]>([]);
  const [isDiagnosisModalOpen, setIsDiagnosisModalOpen] = useState(false);
  const [newDiagnosisName, setNewDiagnosisName] = useState('');
  const [searchDiag, setSearchDiag] = useState('');
  const [isDiagDropdownOpen, setIsDiagDropdownOpen] = useState(false);

  const [folders, setFolders] = useState<Entity[]>([]);
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [searchFolder, setSearchFolder] = useState('');
  const [isFolderDropdownOpen, setIsFolderDropdownOpen] = useState(false);

  const [ubsList, setUbsList] = useState<Entity[]>([]);
  const [isUbsModalOpen, setIsUbsModalOpen] = useState(false);
  const [newUbsName, setNewUbsName] = useState('');
  const [searchUbs, setSearchUbs] = useState('');
  const [isUbsDropdownOpen, setIsUbsDropdownOpen] = useState(false);

  const [formulas, setFormulas] = useState<Entity[]>([]);
  const [selectedFormulas, setSelectedFormulas] = useState<Entity[]>([]);
  const [isFormulaModalOpen, setIsFormulaModalOpen] = useState(false);
  const [newFormulaName, setNewFormulaName] = useState('');
  const [searchFormula, setSearchFormula] = useState('');
  const [isFormulaDropdownOpen, setIsFormulaDropdownOpen] = useState(false);

  useEffect(() => {
    fetchData('/api/diagnoses', setDiagnoses);
    fetchData('/api/folders', setFolders);
    fetchData('/api/ubs', setUbsList);
    fetchData('/api/formulas', setFormulas);

    if (id) {
      loadPatientData(id);
    }
  }, [id]);

  const loadPatientData = async (patientId: string) => {
    try {
      const res = await fetch(`/api/patients/${patientId}`);
      if (!res.ok) throw new Error('Erro ao buscar paciente');
      const data = await res.json();
      
      setFormData({
        nome: data.nome || '',
        cpf: data.cpf || '',
        cartao_sus: data.cartao_sus || '',
        data_nascimento: data.data_nascimento ? new Date(data.data_nascimento).toISOString().split('T')[0] : '',
        endereco: data.endereco || '',
        bairro: data.bairro || '',
        ubs_id: data.ubs_id ? data.ubs_id.toString() : '',
        folder_id: data.folder_id ? data.folder_id.toString() : '',
        cids: data.cids || '',
        observacoes: data.observacoes || '',
        visita_social: Boolean(data.visita_social),
        relatorio_medico: Boolean(data.relatorio_medico),
        relatorio_nutricional: Boolean(data.relatorio_nutricional),
        peso: data.peso ? data.peso.toString() : '',
        altura: data.altura ? data.altura.toString() : '',
        nome_profissional: data.nome_profissional || '',
        registro_profissional: data.registro_profissional || '',
        quantidade: data.quantidade ? data.quantidade.toString() : '',
        data_ultimo_relatorio: data.data_ultimo_relatorio ? new Date(data.data_ultimo_relatorio).toISOString().split('T')[0] : '',
        data_entrega: data.data_entrega ? new Date(data.data_entrega).toISOString().split('T')[0] : '',
      });

      setFormaAlimentacao(data.forma_alimentacao ? data.forma_alimentacao.split(',').map((s: string) => s.trim()) : []);
      setViaAcessoSonda(data.via_acesso_sonda ? data.via_acesso_sonda.split(',').map((s: string) => s.trim()) : []);
      
      if (data.diagnoses) setSelectedDiagnoses(data.diagnoses);
      if (data.formulas) setSelectedFormulas(data.formulas);
      // We don't save restrictions in DB yet based on schema, assuming omitted for now or added later.

    } catch (error) {
      console.error(error);
      alert('Erro ao carregar os dados do paciente.');
    }
  };

  useEffect(() => {
    if (formData.folder_id && folders.length > 0) {
      const found = folders.find(f => f.id.toString() === formData.folder_id);
      if (found) setSearchFolder(found.nome);
    }
  }, [formData.folder_id, folders]);

  useEffect(() => {
    if (formData.ubs_id && ubsList.length > 0) {
      const found = ubsList.find(u => u.id.toString() === formData.ubs_id);
      if (found) setSearchUbs(found.nome);
    }
  }, [formData.ubs_id, ubsList]);

  const fetchData = async (url: string, setter: React.Dispatch<React.SetStateAction<any[]>>) => {
    try {
      const res = await fetch(url);
      if (res.ok) setter(await res.json());
    } catch (e) {
      console.error(`Erro ao buscar dados de ${url}`, e);
    }
  };

  const handleCreateEntity = async (url: string, nome: string, setter: any, callback: (novo: Entity) => void) => {
    if (!nome.trim()) return;
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome })
      });
      if (res.ok) {
        const novo = await res.json();
        setter((prev: Entity[]) => [...prev, novo].sort((a,b) => a.nome.localeCompare(b.nome)));
        callback(novo);
      } else {
        const err = await res.json();
        alert(err.error || 'Erro ao criar registro');
      }
    } catch (e) {
      alert('Erro na conexão com o servidor');
    }
  };

  const filteredDiagnoses = diagnoses.filter(d => 
    d.nome.toLowerCase().includes(searchDiag.toLowerCase()) && 
    !selectedDiagnoses.some(sd => sd.id === d.id)
  );
  const filteredFolders = folders.filter(f => 
    f.nome.toLowerCase().includes(searchFolder.toLowerCase()) && 
    f.id.toString() !== formData.folder_id
  );
  const filteredUbs = ubsList.filter(u => 
    u.nome.toLowerCase().includes(searchUbs.toLowerCase()) && 
    u.id.toString() !== formData.ubs_id
  );
  const filteredFormulas = formulas.filter(f => 
    f.nome.toLowerCase().includes(searchFormula.toLowerCase()) && 
    !selectedFormulas.some(sf => sf.id === f.id)
  );

  const idadePreview = useMemo(() => {
    if (!formData.data_nascimento) return null;
    const birthDate = new Date(formData.data_nascimento);
    if (isNaN(birthDate.getTime())) return null;

    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }, [formData.data_nascimento]);

  const imc = useMemo(() => {
    if (!formData.peso || !formData.altura) return '';
    const p = parseFloat(formData.peso.replace(',', '.'));
    let a = parseFloat(formData.altura.replace(',', '.'));
    if (isNaN(p) || isNaN(a) || a === 0) return '';
    if (a > 3) a = a / 100;
    return (p / (a * a)).toFixed(2);
  }, [formData.peso, formData.altura]);

  const imcClassification = useMemo(() => {
    if (!imc) return '';
    const val = parseFloat(imc);
    const age = idadePreview;

    if (age !== null && age >= 60) {
      if (val < 22) return 'Baixo peso (Desnutrição)';
      if (val <= 27) return 'Eutrofia (Peso adequado)';
      return 'Excesso de peso';
    }

    if (val < 16) return 'Baixo peso Grau III (Magreza Severa)';
    if (val < 17) return 'Baixo peso Grau II (Magreza Moderada)';
    if (val < 18.5) return 'Baixo peso Grau I (Magreza Leve)';
    if (val < 25) return 'Eutrofia (Peso Normal)';
    if (val < 30) return 'Sobrepeso (Pré-obeso)';
    if (val < 35) return 'Obesidade Grau I';
    if (val < 40) return 'Obesidade Grau II (Severa)';
    return 'Obesidade Grau III (Mórbida)';
  }, [imc, idadePreview]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    let { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
      return;
    }
    if (name === 'cpf') value = value.replace(/\D/g, '').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})/, '$1-$2').substring(0, 14);
    else if (name === 'cartao_sus') value = value.replace(/\D/g, '').replace(/(\d{3})(\d)/, '$1 $2').replace(/(\d{4})(\d)/, '$1 $2').replace(/(\d{4})(\d)/, '$1 $2').substring(0, 18);
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const toggleArrayItem = (setter: React.Dispatch<React.SetStateAction<string[]>>, item: string) => {
    setter(prev => prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...formData,
      peso: formData.peso ? parseFloat(formData.peso.replace(',', '.')) : null,
      altura: formData.altura ? parseFloat(formData.altura.replace(',', '.')) : null,
      imc: imc ? parseFloat(imc) : null,
      forma_alimentacao: formaAlimentacao.length > 0 ? formaAlimentacao.join(', ') : null,
      via_acesso_sonda: viaAcessoSonda.length > 0 ? viaAcessoSonda.join(', ') : null,
      quantidade: parseInt(formData.quantidade) || null,
      diagnosticos: selectedDiagnoses.map(d => d.id),
      formulas: selectedFormulas.map(f => f.id),
    };
    
    try {
      const url = isEditing ? `/api/patients/${id}` : '/api/patients';
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Erro ao salvar paciente');

      alert(isEditing ? 'Paciente atualizado com sucesso!' : 'Paciente cadastrado com sucesso!');
      navigate('/pacientes');
    } catch (error: any) {
      alert(error.message);
    }
  };

  return (
    <>
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md mt-10 mb-20 relative">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-2">
          {isEditing ? 'Editar Paciente' : 'Cadastro de Paciente'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* 1. Dados Pessoais */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-700 border-l-4 border-blue-500 pl-2">1. Dados Pessoais</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
              <input type="text" name="nome" value={formData.nome} onChange={handleInputChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Ex: João da Silva"/>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">CPF</label>
                <input type="text" name="cpf" value={formData.cpf} onChange={handleInputChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="000.000.000-00"/>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cartão do SUS</label>
                <input type="text" name="cartao_sus" value={formData.cartao_sus} onChange={handleInputChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="000 0000 0000 0000"/>
              </div>
              <div>
                <div className="flex justify-between items-baseline mb-1">
                  <label className="block text-sm font-medium text-gray-700">Data Nasc.</label>
                  {idadePreview !== null && (
                    <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                      {idadePreview} {idadePreview === 1 ? 'ano' : 'anos'}
                    </span>
                  )}
                </div>
                <input type="date" name="data_nascimento" value={formData.data_nascimento} onChange={handleInputChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"/>
              </div>
            </div>
          </div>

          {/* 2. Endereço e Localização */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-700 border-l-4 border-green-500 pl-2">2. Endereço e Localização</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Endereço Completo</label>
                <input type="text" name="endereco" value={formData.endereco} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Ex: Rua das Flores, 123"/>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bairro</label>
                <input type="text" name="bairro" value={formData.bairro} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Ex: Centro"/>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">UBS</label>
                <div className="relative flex">
                  <input
                    type="text" placeholder="Pesquise..." value={searchUbs}
                    onChange={(e) => { setSearchUbs(e.target.value); setIsUbsDropdownOpen(true); setFormData(prev => ({ ...prev, ubs_id: '' })); }}
                    onFocus={() => setIsUbsDropdownOpen(true)}
                    onBlur={() => setTimeout(() => setIsUbsDropdownOpen(false), 200)}
                    className="flex-1 w-full px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                  <button 
                    type="button" onClick={() => setIsUbsModalOpen(true)}
                    className="px-3 py-2 bg-gray-100 border-t border-r border-b border-gray-300 rounded-r-md text-gray-700 hover:bg-gray-200 transition-colors font-medium whitespace-nowrap"
                  >
                    + Novo
                  </button>
                  {isUbsDropdownOpen && filteredUbs.length > 0 && (
                    <ul className="absolute z-10 w-full top-11 bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
                      {filteredUbs.map(u => (
                        <li key={u.id} className="px-3 py-2 hover:bg-blue-50 cursor-pointer text-sm border-b border-gray-50 last:border-0"
                            onMouseDown={(e) => { e.preventDefault(); setFormData(prev => ({ ...prev, ubs_id: u.id.toString() })); setSearchUbs(u.nome); setIsUbsDropdownOpen(false); }}>
                          {u.nome}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
            <div className="pt-2">
              <label className="flex items-center space-x-2 cursor-pointer p-3 bg-green-50 border border-green-100 rounded-md w-fit">
                <input type="checkbox" name="visita_social" checked={formData.visita_social} onChange={handleInputChange} className="w-5 h-5 text-green-600 rounded border-gray-300 focus:ring-green-500"/>
                <span className="text-sm font-medium text-green-800">Paciente teve Visita Social realizada?</span>
              </label>
            </div>
          </div>

          {/* 3. Informações Clínicas */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-700 border-l-4 border-red-500 pl-2">3. Informações Clínicas</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Peso (kg)</label>
                <input type="text" name="peso" value={formData.peso} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Ex: 65.5"/>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Altura (m)</label>
                <input type="text" name="altura" value={formData.altura} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Ex: 1.70"/>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cálculo IMC</label>
                <div className="flex items-center space-x-2">
                  <input type="text" readOnly value={imc} className="w-20 px-3 py-2 border border-gray-200 bg-gray-50 rounded-md text-gray-600 font-semibold text-center" placeholder="--"/>
                  {imcClassification && (
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full whitespace-nowrap ${
                      imcClassification.includes('Eutrofia') ? 'bg-green-100 text-green-800' :
                      imcClassification.includes('Obesidade') || imcClassification.includes('Desnutrição') || imcClassification.includes('Severa') ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {imcClassification}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Diagnósticos</label>
                <div className="flex flex-col space-y-2">
                  <div className="relative flex">
                    <input type="text" placeholder="Pesquise um diagnóstico..." value={searchDiag} onChange={(e) => { setSearchDiag(e.target.value); setIsDiagDropdownOpen(true); }} onFocus={() => setIsDiagDropdownOpen(true)} onBlur={() => setTimeout(() => setIsDiagDropdownOpen(false), 200)} className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
                    <button type="button" onClick={() => setIsDiagnosisModalOpen(true)} className="px-4 py-2 bg-gray-100 border-t border-r border-b border-gray-300 rounded-r-md text-gray-700 hover:bg-gray-200">+ Novo</button>
                    {isDiagDropdownOpen && filteredDiagnoses.length > 0 && (
                      <ul className="absolute z-10 w-full top-11 bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
                        {filteredDiagnoses.map(d => (
                          <li key={d.id} className="px-3 py-2 hover:bg-blue-50 cursor-pointer text-sm border-b border-gray-50 last:border-0" onMouseDown={(e) => { e.preventDefault(); setSelectedDiagnoses(prev => [...prev, d]); setSearchDiag(''); setIsDiagDropdownOpen(false); }}>{d.nome}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                  {selectedDiagnoses.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2 p-3 bg-gray-50 border border-gray-200 rounded-md">
                      {selectedDiagnoses.map(diag => (
                        <span key={diag.id} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 border border-blue-200 shadow-sm">
                          {diag.nome}
                          <button type="button" onClick={() => setSelectedDiagnoses(p => p.filter(x => x.id !== diag.id))} className="ml-2 w-4 h-4 rounded-full text-blue-400 hover:text-blue-900 hover:bg-blue-200 focus:outline-none"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">CIDs (Separados por vírgula)</label>
                <input type="text" name="cids" value={formData.cids} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Ex: E10.9, E11.9"/>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Restrições Alimentares / Clínicas</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 p-4 border border-gray-200 rounded-md bg-gray-50">
                {RESTRICTIONS_MOCK.map(r => (
                  <label key={r.id} className="flex items-center space-x-2 cursor-pointer">
                    <input type="checkbox" checked={selectedRestrictions.includes(r.id)} onChange={() => setSelectedRestrictions(p => p.includes(r.id) ? p.filter(x => x !== r.id) : [...p, r.id])} className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"/>
                    <span className="text-sm text-gray-700">{r.nome}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="p-4 border border-gray-200 rounded-md">
                <label className="block text-sm font-semibold text-gray-700 mb-3">Forma de Alimentação</label>
                <div className="flex flex-col space-y-2">
                  {['VO', 'VO + TNE', 'TNE EXCLUSIVA', 'TNE + TPP'].map(metodo => (
                    <label key={metodo} className="flex items-center space-x-2 cursor-pointer">
                      <input type="checkbox" checked={formaAlimentacao.includes(metodo)} onChange={() => toggleArrayItem(setFormaAlimentacao, metodo)} className="w-4 h-4 text-red-600 rounded border-gray-300 focus:ring-red-500"/>
                      <span className="text-sm text-gray-700">{metodo}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="p-4 border border-gray-200 rounded-md">
                <label className="block text-sm font-semibold text-gray-700 mb-3">Via de Acesso (Sonda)</label>
                <div className="flex flex-col space-y-2">
                  {['Nasogástrica', 'Nasoentérica', 'Gastrostomia', 'Jejunostomia'].map(via => (
                    <label key={via} className="flex items-center space-x-2 cursor-pointer">
                      <input type="checkbox" checked={viaAcessoSonda.includes(via)} onChange={() => toggleArrayItem(setViaAcessoSonda, via)} className="w-4 h-4 text-orange-600 rounded border-gray-300 focus:ring-orange-500"/>
                      <span className="text-sm text-gray-700">{via}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 mt-2">Observações Gerais</label>
              <textarea name="observacoes" value={formData.observacoes} onChange={handleInputChange} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"/>
            </div>
          </div>

          {/* 4. Dados da Prescrição / Relatório */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-700 border-l-4 border-purple-500 pl-2">4. Relatório Médico e Dispensação</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 p-4 bg-purple-50 border border-purple-100 rounded-md">
              <div className="flex space-x-6 items-center">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input type="checkbox" name="relatorio_medico" checked={formData.relatorio_medico} onChange={handleInputChange} className="w-5 h-5 text-purple-600 rounded border-gray-300 focus:ring-purple-500"/>
                  <span className="font-medium text-purple-900">Relatório Médico</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input type="checkbox" name="relatorio_nutricional" checked={formData.relatorio_nutricional} onChange={handleInputChange} className="w-5 h-5 text-purple-600 rounded border-gray-300 focus:ring-purple-500"/>
                  <span className="font-medium text-purple-900">Relatório Nutricional</span>
                </label>
              </div>
              <div className="flex space-x-4">
                <div className="flex-1">
                  <label className="block text-xs text-purple-800 mb-1">Nome do Profissional</label>
                  <input type="text" name="nome_profissional" value={formData.nome_profissional} onChange={handleInputChange} className="w-full px-2 py-1 text-sm border border-purple-200 rounded focus:outline-none focus:ring-1 focus:ring-purple-500 bg-white" placeholder="Dr(a). Fulano"/>
                </div>
                <div className="w-1/3">
                  <label className="block text-xs text-purple-800 mb-1">CRM / CRN</label>
                  <input type="text" name="registro_profissional" value={formData.registro_profissional} onChange={handleInputChange} className="w-full px-2 py-1 text-sm border border-purple-200 rounded focus:outline-none focus:ring-1 focus:ring-purple-500 bg-white" placeholder="000000"/>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pasta do Arquivo Físico</label>
                <div className="relative flex">
                  <input type="text" placeholder="Pesquise..." value={searchFolder} onChange={(e) => { setSearchFolder(e.target.value); setIsFolderDropdownOpen(true); setFormData(prev => ({ ...prev, folder_id: '' })); }} onFocus={() => setIsFolderDropdownOpen(true)} onBlur={() => setTimeout(() => setIsFolderDropdownOpen(false), 200)} className="flex-1 w-full px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"/>
                  <button type="button" onClick={() => setIsFolderModalOpen(true)} className="px-3 py-2 bg-gray-100 border-t border-r border-b border-gray-300 rounded-r-md text-gray-700 hover:bg-gray-200">+</button>
                  {isFolderDropdownOpen && filteredFolders.length > 0 && (
                    <ul className="absolute z-10 w-full top-11 bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
                      {filteredFolders.map(f => (
                        <li key={f.id} className="px-3 py-2 hover:bg-blue-50 cursor-pointer text-sm border-b border-gray-50 last:border-0" onMouseDown={(e) => { e.preventDefault(); setFormData(prev => ({ ...prev, folder_id: f.id.toString() })); setSearchFolder(f.nome); setIsFolderDropdownOpen(false); }}>{f.nome}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data Últ. Relatório</label>
                <input type="date" name="data_ultimo_relatorio" value={formData.data_ultimo_relatorio} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"/>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Próxima Entrega</label>
                <input type="date" name="data_entrega" value={formData.data_entrega} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"/>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Qtde. Total Mensal</label>
                <input type="number" name="quantidade" value={formData.quantidade} onChange={handleInputChange} min="1" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Ex: 5"/>
              </div>
            </div>

            <div className="pt-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Fórmulas Autorizadas</label>
              <div className="flex flex-col space-y-2">
                <div className="relative flex">
                  <input type="text" placeholder="Pesquise uma fórmula (ex: Padrão, Hipercalórica)..." value={searchFormula} onChange={(e) => { setSearchFormula(e.target.value); setIsFormulaDropdownOpen(true); }} onFocus={() => setIsFormulaDropdownOpen(true)} onBlur={() => setTimeout(() => setIsFormulaDropdownOpen(false), 200)} className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"/>
                  <button type="button" onClick={() => setIsFormulaModalOpen(true)} className="px-4 py-2 bg-gray-100 border-t border-r border-b border-gray-300 rounded-r-md text-gray-700 hover:bg-gray-200">+ Novo</button>
                  {isFormulaDropdownOpen && filteredFormulas.length > 0 && (
                    <ul className="absolute z-50 w-full bottom-full mb-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
                      {filteredFormulas.map(f => (
                        <li key={f.id} className="px-3 py-2 hover:bg-purple-50 cursor-pointer text-sm border-b border-gray-50 last:border-0" onMouseDown={(e) => { e.preventDefault(); setSelectedFormulas(prev => [...prev, f]); setSearchFormula(''); setIsFormulaDropdownOpen(false); }}>{f.nome}</li>
                      ))}
                    </ul>
                  )}
                </div>
                {selectedFormulas.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2 p-3 bg-gray-50 border border-gray-200 rounded-md">
                    {selectedFormulas.map(f => (
                      <span key={f.id} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800 border border-purple-200 shadow-sm">
                        {f.nome}
                        <button type="button" onClick={() => setSelectedFormulas(p => p.filter(x => x.id !== f.id))} className="ml-2 w-4 h-4 rounded-full text-purple-400 hover:text-purple-900 hover:bg-purple-200 focus:outline-none"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t mt-8">
            <button 
              type="button" 
              onClick={() => navigate('/pacientes')} 
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none font-medium"
            >
              Cancelar
            </button>
            <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 font-medium">
              {isEditing ? 'Salvar Alterações' : 'Salvar Paciente'}
            </button>
          </div>
        </form>
      </div>

      {isDiagnosisModalOpen && (
        <Modal title="Novo Diagnóstico" placeholder="Ex: Fibrose Cística" value={newDiagnosisName} setValue={setNewDiagnosisName} onSave={() => handleCreateEntity('/api/diagnoses', newDiagnosisName, setDiagnoses, (novo) => { setSelectedDiagnoses(p => [...p, novo]); setIsDiagnosisModalOpen(false); setNewDiagnosisName(''); })} onClose={() => setIsDiagnosisModalOpen(false)} />
      )}
      {isFolderModalOpen && (
        <Modal title="Nova Pasta" placeholder="Ex: Armário 2" value={newFolderName} setValue={setNewFolderName} onSave={() => handleCreateEntity('/api/folders', newFolderName, setFolders, (novo) => { setFormData(p => ({ ...p, folder_id: novo.id.toString() })); setSearchFolder(novo.nome); setIsFolderModalOpen(false); setNewFolderName(''); })} onClose={() => setIsFolderModalOpen(false)} />
      )}
      {isUbsModalOpen && (
        <Modal title="Nova UBS" placeholder="Ex: UBS Vila Nova" value={newUbsName} setValue={setNewUbsName} onSave={() => handleCreateEntity('/api/ubs', newUbsName, setUbsList, (novo) => { setFormData(p => ({ ...p, ubs_id: novo.id.toString() })); setSearchUbs(novo.nome); setIsUbsModalOpen(false); setNewUbsName(''); })} onClose={() => setIsUbsModalOpen(false)} />
      )}
      {isFormulaModalOpen && (
        <Modal title="Nova Fórmula" placeholder="Ex: Hipercalórica" value={newFormulaName} setValue={setNewFormulaName} onSave={() => handleCreateEntity('/api/formulas', newFormulaName, setFormulas, (novo) => { setSelectedFormulas(p => [...p, novo]); setIsFormulaModalOpen(false); setNewFormulaName(''); })} onClose={() => setIsFormulaModalOpen(false)} />
      )}
    </>
  );
}

function Modal({ title, placeholder, value, setValue, onSave, onClose }: any) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl border border-gray-200">
        <h3 className="text-lg font-bold mb-4 text-gray-800">{title}</h3>
        <input type="text" autoFocus value={value} onChange={(e) => setValue(e.target.value)} onKeyDown={(e) => { if(e.key === 'Enter') onSave(); }} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-6" placeholder={placeholder} />
        <div className="flex justify-end space-x-3">
          <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">Cancelar</button>
          <button type="button" onClick={onSave} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Salvar</button>
        </div>
      </div>
    </div>
  );
}
