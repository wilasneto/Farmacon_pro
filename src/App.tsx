import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, 
  Mail, 
  Phone, 
  FileText, 
  Download, 
  CheckCircle2,
  ArrowRight,
  Plus,
  Trash2,
  Building2,
  Calendar,
  Briefcase,
  AlertCircle,
  Users,
  Settings,
  ChevronRight,
  ShieldCheck,
  CircleHelp,
  Hash
} from 'lucide-react';

// --- Interfaces ---

interface Empresa {
  razaoSocial: string;
  cnpj: string;
  faturamentoDeclarado: string;
  faturamentoReal: string;
  uf: string;
  regimeTributario: string;
  honorario: string;
  dataPrimeiroPagamento: string;
  farmaciaPopular: 'Sim' | 'Não';
  sistema: string;
  rede: string;
  funcionariosRegistrados: string;
  funcionariosSemRegistro: string;
}

interface Solicitacao {
  titulo: string;
  descricao: string;
  departamento: string;
  urgencia: 'normal' | 'alta' | 'urgente';
}

interface FormData {
  executivoRelacionamento: string;
  produto: string;
  grupo: string;
  empresas: Empresa[];
  competenciaFiscal: string;
  competenciaPessoal: string;
  clienteNome: string;
  clienteContato: string;
  clienteEmail: string;
  antigaContabilidadeNome: string;
  antigaContabilidadeContato: string;
  antigaContabilidadeEmail: string;
  holdingPossui: 'Sim' | 'Não';
  holdingConstituira: 'Sim' | 'Não';
  pendenciasPossui: 'Sim' | 'Não';
  pendenciasQuemResolvera: string;
  financeiroNome: string;
  financeiroContato: string;
  financeiroEmail: string;
  operacionalNome: string;
  operacionalContato: string;
  operacionalEmail: string;
  constituicaoEmpresasHavera: 'Sim' | 'Não';
  constituicaoEmpresasQuantidade: string;
  constituicaoEscritoriosHavera: 'Sim' | 'Não';
  constituicaoEscritoriosQuantidade: string;
  mudancaRegimeHavera: 'Sim' | 'Não';
  mudancaRegimeQuantidade: string;
  totalHonorarios: string;
  totalCnpjs: string;
  totalFuncionarios: string;
  classificacao: string;
  solicitacoes: Solicitacao[];
}

const LETTERHEAD_URL = '/letterhead.png';

export default function App() {
  const [formData, setFormData] = useState<FormData>({
    executivoRelacionamento: '', produto: '', grupo: '',
    empresas: [{
      razaoSocial: '', cnpj: '', faturamentoDeclarado: '', faturamentoReal: '',
      uf: '', regimeTributario: '', honorario: '', dataPrimeiroPagamento: '',
      farmaciaPopular: 'Não', sistema: '', rede: '', funcionariosRegistrados: '', funcionariosSemRegistro: ''
    }],
    competenciaFiscal: '', competenciaPessoal: '',
    clienteNome: '', clienteContato: '', clienteEmail: '',
    antigaContabilidadeNome: '', antigaContabilidadeContato: '', antigaContabilidadeEmail: '',
    holdingPossui: 'Não', holdingConstituira: 'Não',
    pendenciasPossui: 'Não', pendenciasQuemResolvera: '',
    financeiroNome: '', financeiroContato: '', financeiroEmail: '',
    operacionalNome: '', operacionalContato: '', operacionalEmail: '',
    constituicaoEmpresasHavera: 'Não', constituicaoEmpresasQuantidade: '0',
    constituicaoEscritoriosHavera: 'Não', constituicaoEscritoriosQuantidade: '0',
    mudancaRegimeHavera: 'Não', mudancaRegimeQuantidade: '0',
    totalHonorarios: '', totalCnpjs: '', totalFuncionarios: '', classificacao: '',
    solicitacoes: [{ titulo: '', descricao: '', departamento: '', urgencia: 'normal' }]
  });

  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // --- Logic Helpers ---

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const maskCNPJ = (value: string) => {
    const digits = value.replace(/\D/g, '');
    return digits
      .slice(0, 14)
      .replace(/(\d{2})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1/$2')
      .replace(/(\d{4})(\d)/, '$1-$2');
  };

  const handleEmpresaChange = (index: number, e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const newEmpresas = [...formData.empresas];
    
    if (name === 'cnpj') {
      newEmpresas[index] = { ...newEmpresas[index], [name]: maskCNPJ(value) };
    } else {
      newEmpresas[index] = { ...newEmpresas[index], [name]: value };
    }
    
    setFormData(prev => ({ ...prev, empresas: newEmpresas }));
  };

  const addEmpresa = () => {
    if (formData.empresas.length < 20) {
      setFormData(prev => ({
        ...prev,
        empresas: [...prev.empresas, {
          razaoSocial: '', cnpj: '', faturamentoDeclarado: '', faturamentoReal: '',
          uf: '', regimeTributario: '', honorario: '', dataPrimeiroPagamento: '',
          farmaciaPopular: 'Não', sistema: '', rede: '', funcionariosRegistrados: '', funcionariosSemRegistro: ''
        }]
      }));
    }
  };

  const handleSolicitacaoChange = (index: number, e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const newSols = [...formData.solicitacoes];
    newSols[index] = { ...newSols[index], [name]: value };
    setFormData(prev => ({ ...prev, solicitacoes: newSols }));
  };

  const addSolicitacao = () => {
    if (formData.solicitacoes.length < 31) {
      setFormData(prev => ({
        ...prev,
        solicitacoes: [...prev.solicitacoes, { titulo: '', descricao: '', departamento: '', urgencia: 'normal' }]
      }));
    }
  };

  const formatCurrency = (value: string) => {
    if (!value) return 'R$ 0,00';
    const num = value.replace(/\D/g, '');
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(num) / 100);
  };

  // --- PDF ---

  const generatePDF = async (type: 'client' | 'seller') => {
    const doc = new jsPDF('p', 'mm', 'a4');
    
    // Watermark/Letterhead
    try {
      const img = new Image();
      await new Promise((resolve) => {
        img.crossOrigin = 'anonymous';
        img.onload = () => { doc.addImage(img, 'PNG', 0, 0, 210, 297); resolve(null); };
        img.onerror = () => resolve(null);
        img.src = LETTERHEAD_URL;
      });
    } catch (e) { console.error(e); }

    let y = 80;

    const drawSection = (title: string, fields: [string, string][]) => {
      if (y > 240) { doc.addPage(); y = 35; }
      doc.setFillColor(31, 41, 55);
      doc.rect(20, y, 170, 7, 'F');
      doc.setTextColor(255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.text(title.toUpperCase(), 25, y + 4.5);
      y += 12;

      fields.forEach(([label, value]) => {
        if (y > 275) { doc.addPage(); y = 35; }
        doc.setTextColor(148, 163, 184);
        doc.setFontSize(7);
        doc.text(label.toUpperCase(), 25, y);
        doc.setTextColor(30, 41, 59);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        const text = String(value || '---');
        const lines = doc.splitTextToSize(text, 160);
        doc.text(lines, 25, y + 4);
        y += (lines.length * 4) + 6;
      });
      y += 4;
    };

    // 1. Lead
    drawSection('Dados Básicos da Lead', [
      ['Executivo de Relacionamento', formData.executivoRelacionamento],
      ['Produto', formData.produto],
      ['Grupo', formData.grupo]
    ]);

    // 2. Empresas
    formData.empresas.forEach((emp, i) => {
      const fields: [string, string][] = [
        ['Razão Social', emp.razaoSocial],
        ['CNPJ', emp.cnpj],
        ['UF', emp.uf],
        ['Regime Tributário', emp.regimeTributario],
        ['Farmácia Popular', emp.farmaciaPopular],
        ['Sistema / Rede', `${emp.sistema} - ${emp.rede}`],
        ['Funcionários (Reg/SR)', `${emp.funcionariosRegistrados} / ${emp.funcionariosSemRegistro}`],
        ['Fat. Declarado', formatCurrency(emp.faturamentoDeclarado)]
      ];
      if (type === 'seller') {
         fields.push(['Faturamento Real', formatCurrency(emp.faturamentoReal)]);
         fields.push(['Honorário Unidade', formatCurrency(emp.honorario)]);
      }
      drawSection(`Empresa ${i + 1}`, fields);
    });

    // 3. Estrutura
    drawSection('Competência e Contatos', [
      ['Competência Fiscal / Pessoal', `${formData.competenciaFiscal} | ${formData.competenciaPessoal}`],
      ['Cliente Principal', `${formData.clienteNome} | ${formData.clienteEmail} | ${formData.clienteContato}`],
      ['Contabilidade Anterior', `${formData.antigaContabilidadeNome} | ${formData.antigaContabilidadeEmail}`]
    ]);

    drawSection('Sociedade e Pendências', [
      ['Holding (Possui/Criará)', `${formData.holdingPossui} / ${formData.holdingConstituira}`],
      ['Pendências (Resolução)', `${formData.pendenciasPossui} - Resolve: ${formData.pendenciasQuemResolvera}`],
      ['Financeiro', `${formData.financeiroNome} - ${formData.financeiroEmail}`],
      ['Operacional', `${formData.operacionalNome} - ${formData.operacionalEmail}`]
    ]);

    // 4. Operações
    drawSection('Constituições e Regime', [
      ['Novas Empresas', `${formData.constituicaoEmpresasHavera} (Qtde: ${formData.constituicaoEmpresasQuantidade})`],
      ['Escritórios Apoio', `${formData.constituicaoEscritoriosHavera} (Qtde: ${formData.constituicaoEscritoriosQuantidade})`],
      ['Mudança de Regime', `${formData.mudancaRegimeHavera} (Qtde: ${formData.mudancaRegimeQuantidade})`]
    ]);

    // 5. Negociação
    drawSection('Negociação Final', [
      ['Total de Honorários', formatCurrency(formData.totalHonorarios)],
      ['Contagem Geral', `CNPJs: ${formData.totalCnpjs} | Funcionários: ${formData.totalFuncionarios}`],
      ['Classificação', formData.classificacao]
    ]);

    // 6. Solicitações (EXCLUSIVE SELLER)
    if (type === 'seller') {
       doc.addPage();
       y = 35;
       doc.setFillColor(37, 99, 235);
       doc.rect(20, y, 170, 8, 'F');
       doc.setTextColor(255);
       doc.text('ABA DE SOLICITAÇÕES E PARTICULARIDADES (INTERNO)', 25, y + 5.5);
       y += 15;

       formData.solicitacoes.forEach((sol, i) => {
         if (y > 270) { doc.addPage(); y = 35; }
         doc.setFont('helvetica', 'bold');
         doc.setTextColor(30, 41, 59);
         doc.text(`SOLICITAÇÃO ${i+1}: ${sol.titulo?.toUpperCase() || 'SEM TÍTULO'}`, 25, y);
         y += 5;
         doc.setFontSize(8);
         doc.text(`SETOR: ${sol.departamento?.toUpperCase() || 'GERAL'} [${sol.urgencia.toUpperCase()}]`, 25, y);
         y += 4;
         doc.setFont('helvetica', 'normal');
         const lines = doc.splitTextToSize(sol.descricao || 'Sem detalhes', 160);
         doc.text(lines, 25, y);
         y += (lines.length * 4) + 8;
       });
    }

    doc.save(`${type === 'client' ? 'cliente' : 'vendedor'}_${formData.grupo || 'docs'}.pdf`);
  };

  const steps = [
    { label: 'Lead', icon: <Briefcase size={16}/> },
    { label: 'Unidades', icon: <Building2 size={16}/> },
    { label: 'Contatos', icon: <Users size={16}/> },
    { label: 'Negociação', icon: <Settings size={16}/> },
    { label: 'Particularidades', icon: <AlertCircle size={16}/> }
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col">
      {/* BARRA DE NAVEGAÇÃO */}
      <nav className="h-auto md:h-16 bg-white border-b border-slate-200 flex flex-col md:flex-row items-center md:justify-between px-4 md:px-8 shrink-0 z-40 fixed top-0 w-full shadow-sm">
        <div className="flex items-center justify-center md:justify-start w-full md:w-auto h-12 md:h-auto shrink-0 border-b md:border-none border-slate-50">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="w-7 h-7 md:w-9 md:h-9 bg-slate-900 rounded-lg flex items-center justify-center text-white font-bold italic shadow-lg">F</div>
            <h1 className="font-black text-slate-800 tracking-tighter text-base md:text-xl">FARMACON<span className="text-blue-600">PRO</span></h1>
          </div>
        </div>
        <div className="flex gap-2 md:gap-2 overflow-x-auto no-scrollbar w-full md:w-auto py-3 md:py-2 px-4 md:px-0 justify-center md:justify-end">
          {steps.map((s, i) => (
            <button 
              key={i} 
              onClick={() => {
                if (isSubmitted) return;
                setActiveStep(i);
              }}
              className={`p-3 md:px-4 md:py-2 rounded-full transition-all flex items-center justify-center gap-2 shrink-0 min-w-[48px] min-h-[48px] md:min-h-0 ${activeStep === i ? 'bg-blue-600 text-white shadow-xl shadow-blue-100 scale-110 md:scale-100' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <span className="scale-150 md:scale-100">{s.icon}</span> <span className="hidden sm:inline text-[10px] font-black uppercase">{s.label}</span>
            </button>
          ))}
        </div>
      </nav>

      <main className="flex-1 mt-28 md:mt-16 flex overflow-hidden">
        <section className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-12 lg:p-16 bg-white w-full">
          <div className="max-w-5xl mx-auto pb-24">
            <AnimatePresence mode="wait">
              {!isSubmitted ? (
                <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }} className="space-y-16">
                  
                  {/* STEP 0: LEAD */}
                  {activeStep === 0 && (
                    <div className="space-y-6 md:space-y-10">
                      <header>
                        <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter uppercase mb-2">Novos Dados da Lead</h2>
                        <p className="text-slate-400 text-xs md:text-sm font-medium">Informações de identificação do grupo e proprietário.</p>
                      </header>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Executivo de Relacionamento</label>
                          <input name="executivoRelacionamento" value={formData.executivoRelacionamento} onChange={handleInputChange} className="w-full p-4 bg-slate-50 border rounded-2xl" placeholder="Nome do vendedor" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Marca / Produto</label>
                          <select name="produto" value={formData.produto} onChange={handleInputChange} className="w-full p-4 bg-slate-50 border rounded-2xl">
                             <option value="">Selecione...</option>
                             <option value="Farmacon">Farmacon</option>
                             <option value="Pets">Pets</option>
                             <option value="RX Análises">RX Análises</option>
                             <option value="RX Soluções">RX Soluções</option>
                             <option value="Mercaddo">Mercaddo</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Identificação do Grupo</label>
                          <input name="grupo" value={formData.grupo} onChange={handleInputChange} className="w-full p-4 bg-slate-50 border rounded-2xl" placeholder="Nome do Grupo Comercial" />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STEP 1: EMPRESAS (DYNAMIC) */}
                  {activeStep === 1 && (
                    <div className="space-y-8 md:space-y-12">
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b pb-6 md:pb-8 gap-4">
                        <div>
                          <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter uppercase mb-2">Dados Empresariais</h2>
                          <p className="text-slate-400 text-xs md:text-sm font-medium">Controle de unidades (Máximo 20).</p>
                        </div>
                        <button onClick={addEmpresa} className="w-full md:w-auto bg-slate-900 px-6 py-3 rounded-2xl text-white font-black text-xs hover:bg-blue-600 transition-all flex items-center justify-center gap-2">
                          <Plus size={18}/> ADICIONAR UNIDADE
                        </button>
                      </div>

                      <div className="grid grid-cols-1 gap-8 md:gap-12">
                        {formData.empresas.map((emp, i) => (
                           <div key={i} className="bg-white border rounded-[1.5rem] md:rounded-[2rem] p-6 md:p-10 relative group shadow-sm hover:shadow-xl transition-all">
                              <span className="absolute -top-4 left-6 md:left-10 bg-blue-600 text-white text-[9px] md:text-[10px] font-black px-4 md:px-6 py-1.5 rounded-full ring-4 md:ring-8 ring-white">EMPRESA #{i + 1}</span>
                              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-8">
                                <div className="md:col-span-2 space-y-2">
                                  <label className="text-[9px] font-black text-slate-400 uppercase">Razão Social</label>
                                  <input value={emp.razaoSocial} name="razaoSocial" onChange={(e)=>handleEmpresaChange(i, e)} className="w-full p-3 border rounded-xl text-sm" />
                                </div>
                                <div className="space-y-2">
                                  <label className="text-[9px] font-black text-slate-400 uppercase">CNPJ</label>
                                  <input 
                                    value={emp.cnpj} 
                                    name="cnpj" 
                                    onChange={(e)=>handleEmpresaChange(i, e)} 
                                    className={`w-full p-3 border rounded-xl text-sm transition-colors ${
                                      emp.cnpj && emp.cnpj.replace(/\D/g, '').length < 14 
                                        ? 'border-red-500 bg-red-50/30 font-bold' 
                                        : 'border-slate-200'
                                    }`} 
                                    placeholder="00.000.000/0000-00"
                                    maxLength={18}
                                  />
                                  {emp.cnpj && emp.cnpj.replace(/\D/g, '').length < 14 && (
                                    <span className="text-[8px] font-black text-red-500 uppercase tracking-tight flex items-center gap-1">
                                      <AlertCircle size={8} /> CNPJ Incompleto
                                    </span>
                                  )}
                                </div>
                                <div className="space-y-2">
                                  <label className="text-[9px] font-black text-slate-400 uppercase">UF</label>
                                  <input value={emp.uf} name="uf" onChange={(e)=>handleEmpresaChange(i, e)} className="w-full p-3 border rounded-xl text-sm" />
                                </div>
                                <div className="space-y-2">
                                  <label className="text-[9px] font-black text-slate-400 uppercase">Regime Tributário</label>
                                  <select value={emp.regimeTributario} name="regimeTributario" onChange={(e)=>handleEmpresaChange(i, e)} className="w-full p-3 border rounded-xl text-sm">
                                    <option value="">Selecione...</option>
                                    <option value="Simples Nacional">Simples Nacional</option>
                                    <option value="Lucro Presumido">Lucro Presumido</option>
                                    <option value="Lucro Real">Lucro Real</option>
                                  </select>
                                </div>
                                <div className="space-y-2">
                                  <label className="text-[9px] font-black text-slate-400 uppercase">Rede</label>
                                  <input value={emp.rede} name="rede" onChange={(e)=>handleEmpresaChange(i, e)} className="w-full p-3 border rounded-xl text-sm" placeholder="Nome da Rede" />
                                </div>
                                <div className="space-y-2">
                                  <label className="text-[9px] font-black text-slate-400 uppercase">Sistema</label>
                                  <input value={emp.sistema} name="sistema" onChange={(e)=>handleEmpresaChange(i, e)} className="w-full p-3 border rounded-xl text-sm" placeholder="ERP" />
                                </div>
                                <div className="space-y-2">
                                  <label className="text-[9px] font-black text-slate-400 uppercase">Farmácia Popular?</label>
                                  <select value={emp.farmaciaPopular} name="farmaciaPopular" onChange={(e)=>handleEmpresaChange(i, e)} className="w-full p-3 border rounded-xl text-sm">
                                    <option value="Não">Não</option>
                                    <option value="Sim">Sim</option>
                                  </select>
                                </div>
                                <div className="space-y-2">
                                  <label className="text-[9px] font-black text-slate-400 uppercase">Data 1º Pagto</label>
                                  <input type="date" value={emp.dataPrimeiroPagamento} name="dataPrimeiroPagamento" onChange={(e)=>handleEmpresaChange(i, e)} className="w-full p-3 border rounded-xl text-sm" />
                                </div>
                                <div className="space-y-2">
                                  <label className="text-[9px] font-black text-slate-400 uppercase">Fat. Declarado</label>
                                  <input value={emp.faturamentoDeclarado ? formatCurrency(emp.faturamentoDeclarado) : ''} onChange={(e) => {
                                    const val = e.target.value.replace(/\D/g, '');
                                    const list = [...formData.empresas]; list[i].faturamentoDeclarado = val; setFormData(p => ({...p, empresas: list}));
                                  }} className="w-full p-3 border rounded-xl text-sm bg-slate-50" />
                                </div>
                                <div className="space-y-2">
                                  <label className="text-[9px] font-black text-blue-600 uppercase">Faturamento Real</label>
                                  <input value={emp.faturamentoReal ? formatCurrency(emp.faturamentoReal) : ''} onChange={(e) => {
                                    const val = e.target.value.replace(/\D/g, '');
                                    const list = [...formData.empresas]; list[i].faturamentoReal = val; setFormData(p => ({...p, empresas: list}));
                                  }} className="w-full p-3 border border-blue-100 rounded-xl text-sm bg-blue-50/20 font-bold" />
                                </div>
                                <div className="space-y-2">
                                  <label className="text-[9px] font-black text-blue-600 uppercase">Honorário</label>
                                  <input value={emp.honorario ? formatCurrency(emp.honorario) : ''} onChange={(e) => {
                                    const val = e.target.value.replace(/\D/g, '');
                                    const list = [...formData.empresas]; list[i].honorario = val; setFormData(p => ({...p, empresas: list}));
                                  }} className="w-full p-3 border border-blue-100 rounded-xl text-sm font-black text-blue-600" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-1">
                                    <label className="text-[8px] font-bold text-slate-400 uppercase">Reg.</label>
                                    <input type="number" value={emp.funcionariosRegistrados} name="funcionariosRegistrados" onChange={(e)=>handleEmpresaChange(i, e)} className="w-full p-2 border rounded-lg text-xs" />
                                  </div>
                                  <div className="space-y-1">
                                    <label className="text-[8px] font-bold text-slate-400 uppercase">SR.</label>
                                    <input type="number" value={emp.funcionariosSemRegistro} name="funcionariosSemRegistro" onChange={(e)=>handleEmpresaChange(i, e)} className="w-full p-2 border rounded-lg text-xs" />
                                  </div>
                                </div>
                              </div>
                              {formData.empresas.length > 1 && (
                                <button onClick={() => setFormData(p => ({...p, empresas: p.empresas.filter((_, idx)=>idx!==i)}))} className="mt-8 text-[10px] font-black text-red-400 hover:text-red-600 flex items-center gap-2">
                                  <Trash2 size={14}/> REMOVER ESTA UNIDADE
                                </button>
                              )}
                           </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* STEP 2: CONTATOS */}
                  {activeStep === 2 && (
                    <div className="space-y-8 md:space-y-12">
                      <header>
                        <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter uppercase mb-2">Estrutura de Contatos</h2>
                        <p className="text-slate-400 text-xs md:text-sm font-medium">Responsáveis técnicos e operacionais.</p>
                      </header>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
                        {/* Competencia */}
                        <div className="p-6 md:p-10 border rounded-[1.5rem] md:rounded-[2.5rem] bg-slate-50 space-y-4 md:space-y-6">
                           <h4 className="text-[10px] md:text-xs font-black text-slate-400 uppercase flex items-center gap-2"><Calendar size={18}/> Primeira Competência</h4>
                           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                              <div className="space-y-2">
                                <label className="text-[9px] font-black text-slate-400 uppercase">Fiscal (Data)</label>
                                <input type="date" name="competenciaFiscal" value={formData.competenciaFiscal} onChange={handleInputChange} className="w-full p-3 md:p-4 border rounded-2xl bg-white" />
                              </div>
                              <div className="space-y-2">
                                <label className="text-[9px] font-black text-slate-400 uppercase">Pessoal (Data)</label>
                                <input type="date" name="competenciaPessoal" value={formData.competenciaPessoal} onChange={handleInputChange} className="w-full p-3 md:p-4 border rounded-2xl bg-white" />
                              </div>
                           </div>
                        </div>

                        {/* Holding e Pendências */}
                        <div className="p-6 md:p-10 border rounded-[1.5rem] md:rounded-[2.5rem] bg-blue-50/30 space-y-6 md:space-y-8">
                           <h4 className="text-[10px] md:text-xs font-black text-blue-600 uppercase flex items-center gap-2"><Briefcase size={18}/> Holding & Pendências</h4>
                           <div className="space-y-4 md:space-y-6">
                              <div className="flex justify-between items-center">
                                 <span className="text-[10px] font-black text-slate-500">Possui Holding?</span>
                                 <div className="flex gap-4">
                                   <label className="text-xs font-bold flex items-center gap-2"><input type="radio" checked={formData.holdingPossui==='Sim'} onChange={()=>setFormData(p=>({...p, holdingPossui:'Sim'}))}/> SIM</label>
                                   <label className="text-xs font-bold flex items-center gap-2"><input type="radio" checked={formData.holdingPossui==='Não'} onChange={()=>setFormData(p=>({...p, holdingPossui:'Não'}))}/> NÃO</label>
                                 </div>
                              </div>
                              <div className="flex justify-between items-center">
                                 <span className="text-[10px] font-black text-slate-500">Constituirá?</span>
                                 <div className="flex gap-4">
                                   <label className="text-xs font-bold flex items-center gap-2"><input type="radio" checked={formData.holdingConstituira==='Sim'} onChange={()=>setFormData(p=>({...p, holdingConstituira:'Sim'}))}/> SIM</label>
                                   <label className="text-xs font-bold flex items-center gap-2"><input type="radio" checked={formData.holdingConstituira==='Não'} onChange={()=>setFormData(p=>({...p, holdingConstituira:'Não'}))}/> NÃO</label>
                                 </div>
                              </div>
                              <div className="space-y-2">
                                 <label className="text-[9px] font-black text-slate-500">Quem resolverá as pendências?</label>
                                 <select name="pendenciasQuemResolvera" value={formData.pendenciasQuemResolvera} onChange={handleInputChange} className="w-full p-3 border rounded-xl bg-white text-sm">
                                    <option value="">Selecione...</option>
                                    <option value="Farmacon">Farmacon</option>
                                    <option value="Pets">Pets</option>
                                    <option value="RX Análises">RX Análises</option>
                                    <option value="RX Soluções">RX Soluções</option>
                                    <option value="Mercaddo">Mercaddo</option>
                                 </select>
                              </div>
                           </div>
                        </div>

                        {/* Blocos de Contato Dinâmicos */}
                        {['cliente', 'antigaContabilidade', 'financeiro', 'operacional'].map((key) => (
                           <div key={key} className="p-6 md:p-10 border rounded-[1.5rem] md:rounded-[2.5rem] bg-white group hover:border-slate-300 transition-all space-y-4 md:space-y-6">
                              <h4 className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest">{key === 'antigaContabilidade' ? 'Contabilidade Anterior' : key}</h4>
                              <div className="space-y-4">
                                 <input name={`${key}Nome`} value={(formData as any)[`${key}Nome`]} onChange={handleInputChange} placeholder="Nome do Responsável" className="w-full p-3 md:p-3.5 border rounded-xl text-sm font-medium" />
                                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <input name={`${key}Contato`} value={(formData as any)[`${key}Contato`]} onChange={handleInputChange} placeholder="Contato/Telefone" className="w-full p-3 md:p-3.5 border rounded-xl text-sm" />
                                    <input name={`${key}Email`} value={(formData as any)[`${key}Email`]} onChange={handleInputChange} placeholder="E-mail" className="w-full p-3 md:p-3.5 border rounded-xl text-sm" />
                                 </div>
                              </div>
                           </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* STEP 3: SOCIEDADE E NEGOCIAÇÃO */}
                  {activeStep === 3 && (
                    <div className="space-y-10 md:space-y-16">
                       <header>
                        <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter uppercase mb-2">Constituições e Negociação</h2>
                        <p className="text-slate-400 text-xs md:text-sm font-medium">Planejamento societário e fechamento financeiro.</p>
                      </header>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                        {/* Constituição e Mudanças */}
                        {[
                          { title: 'Empresas', key: 'constituicaoEmpresas' },
                          { title: 'Escritórios Apoio', key: 'constituicaoEscritorios' },
                          { title: 'Mudar Regime', key: 'mudancaRegime' }
                        ].map((item) => (
                          <div key={item.key} className="p-6 md:p-8 bg-slate-50 border rounded-3xl space-y-4 md:space-y-6">
                             <h4 className="text-[10px] font-black uppercase text-slate-500">Haverá {item.title}?</h4>
                             <div className="flex gap-4 border-b pb-4">
                                <label className="text-xs font-bold flex items-center gap-2"><input type="radio" checked={(formData as any)[`${item.key}Havera`] === 'Sim'} onChange={()=>setFormData(p=>({...p, [`${item.key}Havera`]: 'Sim'}))}/> SIM</label>
                                <label className="text-xs font-bold flex items-center gap-2"><input type="radio" checked={(formData as any)[`${item.key}Havera`] === 'Não'} onChange={()=>setFormData(p=>({...p, [`${item.key}Havera`]: 'Não'}))}/> NÃO</label>
                             </div>
                             <div className="space-y-1">
                                <label className="text-[9px] font-black text-slate-400 uppercase">Quantidade</label>
                                <input type="number" name={`${item.key}Quantidade`} value={(formData as any)[`${item.key}Quantidade`]} onChange={handleInputChange} className="w-full p-3 border rounded-xl bg-white font-bold" />
                             </div>
                          </div>
                        ))}
                      </div>

                      {/* Negociação Final */}
                      <div className="p-8 md:p-12 bg-slate-900 rounded-[2rem] md:rounded-[3rem] text-white space-y-8 md:space-y-10">
                         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 text-left">
                            <div className="space-y-3">
                               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest underline decoration-blue-600 underline-offset-4">Total de Honorários</label>
                               <input value={formData.totalHonorarios ? formatCurrency(formData.totalHonorarios) : ''} onChange={(e)=>setFormData(p=>({...p, totalHonorarios: e.target.value.replace(/\D/g, '')}))} className="w-full bg-slate-800 border-none p-4 md:p-5 rounded-2xl md:rounded-3xl text-2xl md:text-3xl font-black text-blue-400 shadow-inner" />
                            </div>
                            <div className="space-y-3">
                               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Hash size={12}/> Total de CNPJs</label>
                               <input type="number" name="totalCnpjs" value={formData.totalCnpjs} onChange={handleInputChange} className="w-full bg-slate-800 border-none p-4 md:p-5 rounded-2xl md:rounded-3xl text-2xl md:text-3xl font-black shadow-inner" />
                            </div>
                            <div className="space-y-3">
                               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Users size={12}/> Total Funcionários</label>
                               <input type="number" name="totalFuncionarios" value={formData.totalFuncionarios} onChange={handleInputChange} className="w-full bg-slate-800 border-none p-4 md:p-5 rounded-2xl md:rounded-3xl text-2xl md:text-3xl font-black shadow-inner" />
                            </div>
                         </div>
                         <div className="space-y-3 text-left">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Classificação Estratégica</label>
                            <input name="classificacao" value={formData.classificacao} onChange={handleInputChange} className="w-full bg-slate-800 border-none p-4 md:p-5 rounded-2xl md:rounded-3xl text-lg md:text-xl font-bold" placeholder="Digite a classificação interna..." />
                         </div>
                      </div>
                    </div>
                  )}

                  {/* STEP 4: SOLICITACOES (INTERNAL) */}
                  {activeStep === 4 && (
                    <div className="space-y-10 md:space-y-12">
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b pb-6 md:pb-8 border-slate-200 gap-4">
                        <div>
                         <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter uppercase mb-2 flex items-center gap-3 md:gap-4">
                           <AlertCircle className="text-amber-500" size={28} /> Observações Internas
                         </h2>
                         <p className="text-slate-400 text-xs md:text-sm font-medium italic">Dados exclusivos para o PDF do Vendedor.</p>
                        </div>
                        <button onClick={addSolicitacao} disabled={formData.solicitacoes.length >= 31} className="w-full md:w-auto bg-blue-600 px-6 md:px-8 py-3 md:py-4 rounded-2xl md:rounded-3xl text-white font-black text-xs hover:bg-black transition-all flex items-center justify-center gap-3 shadow-xl">
                           <Plus size={20}/> NOVA PARTICULARIDADE
                        </button>
                      </div>

                      <div className="space-y-6 md:space-y-8">
                         {formData.solicitacoes.map((sol, i) => (
                           <motion.div key={i} layout className="p-6 md:p-10 border border-slate-200 rounded-[1.5rem] md:rounded-[2.5rem] bg-slate-50/40 relative group hover:shadow-lg transition-all">
                              <div className="space-y-2 mb-6 text-left">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Título da Particularidade</label>
                                <input value={sol.titulo} name="titulo" onChange={(e)=>handleSolicitacaoChange(i, e)} placeholder="Ex: Ajuste na Taxa de Abertura..." className="w-full p-3 md:p-4 border rounded-xl md:rounded-2xl bg-white font-bold text-base md:text-lg" />
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-6 text-left">
                                <div className="space-y-2">
                                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Setor Responsável</label>
                                  <input value={sol.departamento} name="departamento" onChange={(e)=>handleSolicitacaoChange(i, e)} placeholder="Ex: Societário, TI..." className="w-full p-3 md:p-4 border rounded-xl md:rounded-2xl bg-white font-semibold" />
                                </div>
                                <div className="space-y-2">
                                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Nível de Urgência</label>
                                  <select value={sol.urgencia} name="urgencia" onChange={(e)=>handleSolicitacaoChange(i, e)} className="w-full p-3 md:p-4 border rounded-xl md:rounded-2xl bg-white font-bold">
                                    <option value="normal">NORMAL</option>
                                    <option value="alta">ALTA PRIORIDADE</option>
                                    <option value="urgente">IMEDIATO / URGENTE</option>
                                  </select>
                                </div>
                              </div>
                              <div className="space-y-2 text-left">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Detalhamento Técnico</label>
                                <textarea value={sol.descricao} name="descricao" onChange={(e)=>handleSolicitacaoChange(i, e)} className="w-full p-4 md:p-6 border rounded-2xl md:rounded-3xl text-sm min-h-[120px] md:min-h-[140px] bg-white leading-relaxed" placeholder="Insira aqui notas..." />
                              </div>
                              {formData.solicitacoes.length > 1 && (
                                <button onClick={()=>setFormData(p=>({...p, solicitacoes: p.solicitacoes.filter((_, idx)=>idx!==i)}))} className="absolute top-4 right-4 md:top-6 md:right-8 p-2 md:p-3 text-slate-300 hover:text-red-500 transition-colors shadow-sm bg-white rounded-full">
                                  <Trash2 size={16}/>
                                </button>
                              )}
                           </motion.div>
                         ))}
                      </div>

                      <div className="pt-20 flex flex-col items-center gap-8">
                         <div className="flex items-start gap-4 p-6 bg-blue-900 border rounded-3xl max-w-2xl text-white shadow-2xl">
                            <ShieldCheck className="shrink-0 text-blue-300" size={32} />
                            <div>
                               <h4 className="font-black text-xs uppercase tracking-widest mb-1">Proteção de Dados do Cliente</h4>
                               <p className="text-xs text-blue-100 opacity-80 leading-relaxed font-medium">As informações cadastradas nesta seção de "Particularidades" são marcadas como internas e não serão impressas no documento destinado ao portfólio do cliente.</p>
                            </div>
                         </div>
                         <button 
                          onClick={() => {
                            if (activeStep === 4) {
                              const hasInvalidCnpj = formData.empresas.some(emp => emp.cnpj.replace(/\D/g, '').length < 14);
                              if (hasInvalidCnpj) {
                                alert("Por favor, preencha todos os CNPJs corretamente nas 'Unidades' antes de emitir o relatório.");
                                setActiveStep(1);
                                return;
                              }
                            }
                            setLoading(true); 
                            setTimeout(()=>{ setLoading(false); setIsSubmitted(true); }, 1200); 
                          }}
                           className="w-full max-w-md py-6 bg-slate-900 text-white font-black rounded-[2.5rem] shadow-[0_20px_50px_rgba(30,41,59,0.3)] text-2xl tracking-tighter hover:scale-105 active:scale-95 transition-all uppercase"
                         >
                           {loading ? 'COMPILANDO...' : 'EMITIR RELATÓRIOS'}
                         </button>
                      </div>
                    </div>
                  )}

                  {/* CONTROLES DE NAVEGAÇÃO INFERIOR */}
                  {activeStep < 4 && (
                    <div className="flex flex-col md:flex-row justify-between items-center pt-8 md:pt-12 border-t border-slate-100 gap-6">
                       <button onClick={()=>setActiveStep(s => Math.max(0, s-1))} disabled={activeStep===0} className="w-full md:w-auto text-[10px] font-black text-slate-400 hover:text-slate-900 disabled:opacity-30 uppercase tracking-[0.4em] order-2 md:order-1">Anterior</button>
                       <div className="flex gap-3 order-1 md:order-2">
                         {steps.map((_, i) => (
                           <div key={i} className={`h-1.5 rounded-full transition-all duration-500 ${activeStep === i ? 'bg-blue-600 w-10' : 'bg-slate-200 w-2'}`}></div>
                         ))}
                       </div>
                       <button 
                         onClick={() => {
                           setActiveStep(s => Math.min(4, s+1));
                         }} 
                         className="w-full md:w-auto bg-slate-900 text-white px-10 py-5 md:py-4 rounded-full font-black text-xs transition-all shadow-xl shadow-slate-100 flex items-center justify-center gap-3 order-3 hover:bg-blue-600"
                       >
                         PROSSEGUIR <ArrowRight size={18}/>
                       </button>
                    </div>
                  )}

                </motion.div>
              ) : (
                /* TELA DE SUCESSO / DOWNLOAD */
                <motion.div initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }} className="py-10 md:py-20 text-center max-w-3xl mx-auto px-4">
                   <div className="w-24 h-24 md:w-32 md:h-32 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 md:mb-10 shadow-[0_0_60px_rgba(16,185,129,0.3)] animate-pulse">
                      <CheckCircle2 className="w-12 h-12 md:w-16 md:h-16 text-white" />
                   </div>
                   <h2 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter mb-4">Geração Concluída</h2>
                   <p className="text-slate-400 text-sm md:text-lg font-medium mb-10 md:mb-16 leading-relaxed">Os documentos foram segmentados com sucesso. O PDF do cliente removeu automaticamente as abas de solicitações internas.</p>
                   
                   <div className="flex flex-col md:flex-row gap-6 md:gap-8">
                      <button onClick={()=>generatePDF('client')} className="flex-1 p-6 md:p-10 bg-white border-2 border-slate-100 rounded-[2rem] md:rounded-[3rem] hover:border-blue-600 transition-all flex flex-col items-center gap-4 md:gap-6 group shadow-lg">
                        <div className="w-12 h-12 md:w-16 md:h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform"><FileText size={28}/></div>
                        <div className="text-center">
                          <span className="block font-black text-slate-900 uppercase text-[10px] md:text-xs tracking-widest mb-1">PDF do Cliente</span>
                          <span className="text-[8px] md:text-[10px] text-slate-400 font-bold uppercase italic">Sem solicitações internas</span>
                        </div>
                        <div className="mt-2 md:mt-4 text-blue-600 font-black text-[9px] md:text-[10px] flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-full">DOWNLOAD <Download size={12}/></div>
                      </button>

                      <button onClick={()=>generatePDF('seller')} className="flex-1 p-6 md:p-10 bg-slate-900 rounded-[2rem] md:rounded-[3rem] transition-all flex flex-col items-center gap-4 md:gap-6 group shadow-2xl">
                        <div className="w-12 h-12 md:w-16 md:h-16 bg-white/10 rounded-2xl flex items-center justify-center text-white group-hover:scale-110 transition-transform"><ShieldCheck size={28}/></div>
                        <div className="text-center text-white">
                          <span className="block font-black uppercase text-[10px] md:text-xs tracking-widest mb-1">Ficha do Vendedor</span>
                          <span className="text-[8px] md:text-[10px] text-white/40 font-bold uppercase italic">Contém todos os 31 detalhes</span>
                        </div>
                        <div className="mt-2 md:mt-4 text-white font-black text-[9px] md:text-[10px] flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full">DOWNLOAD COMPLETO <Download size={12}/></div>
                      </button>
                   </div>
                   
                   <button onClick={()=>{setIsSubmitted(false); setActiveStep(0);}} className="mt-12 md:mt-20 text-[9px] md:text-[10px] font-black text-slate-300 hover:text-slate-600 uppercase tracking-[0.3em] md:tracking-[0.5em] transition-colors flex items-center justify-center gap-4 mx-auto group">
                      <CircleHelp size={16} className="group-hover:rotate-12 transition-transform"/> REINICIAR FLUXO DE TRABALHO
                   </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>
      </main>

      <footer className="h-auto md:h-12 bg-white border-t border-slate-200 flex flex-col md:flex-row items-center justify-between px-6 py-4 md:py-0 md:px-10 text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest shrink-0 gap-4">
        <span>© 2026 FARMACON • DOCENGINE V3</span>
        <div className="flex gap-4 md:gap-8">
           <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div> Servidor Seguro</span>
        </div>
      </footer>
    </div>
  );
}
