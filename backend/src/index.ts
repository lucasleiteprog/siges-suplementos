import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Health check endpoint for Electron
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// ==========================================
// DIAGNÓSTICOS
// ==========================================
app.get('/api/diagnoses', async (req, res) => {
  try {
    const diagnoses = await prisma.diagnosis.findMany({ orderBy: { nome: 'asc' } });
    res.json(diagnoses);
  } catch (error: any) {
    res.status(500).json({ error: 'Erro ao buscar diagnósticos' });
  }
});

app.post('/api/diagnoses', async (req, res) => {
  try {
    const { nome } = req.body;
    const diagnosis = await prisma.diagnosis.create({ data: { nome } });
    res.status(201).json(diagnosis);
  } catch (error: any) {
    if (error.code === 'P2002') return res.status(400).json({ error: 'Diagnóstico já existe.' });
    res.status(500).json({ error: 'Erro ao criar diagnóstico' });
  }
});

// ==========================================
// PASTAS (FOLDERS)
// ==========================================
app.get('/api/folders', async (req, res) => {
  try {
    const folders = await prisma.folder.findMany({ orderBy: { nome: 'asc' } });
    res.json(folders);
  } catch (error: any) {
    res.status(500).json({ error: 'Erro ao buscar pastas' });
  }
});

app.post('/api/folders', async (req, res) => {
  try {
    const { nome } = req.body;
    const folder = await prisma.folder.create({ data: { nome } });
    res.status(201).json(folder);
  } catch (error: any) {
    if (error.code === 'P2002') return res.status(400).json({ error: 'Pasta já existe.' });
    res.status(500).json({ error: 'Erro ao criar pasta' });
  }
});

// ==========================================
// UBS
// ==========================================
app.get('/api/ubs', async (req, res) => {
  try {
    const ubs = await prisma.ubs.findMany({ orderBy: { nome: 'asc' } });
    res.json(ubs);
  } catch (error: any) {
    res.status(500).json({ error: 'Erro ao buscar UBS' });
  }
});

app.post('/api/ubs', async (req, res) => {
  try {
    const { nome } = req.body;
    const ubs = await prisma.ubs.create({ data: { nome } });
    res.status(201).json(ubs);
  } catch (error: any) {
    if (error.code === 'P2002') return res.status(400).json({ error: 'UBS já existe.' });
    res.status(500).json({ error: 'Erro ao criar UBS' });
  }
});

// ==========================================
// FÓRMULAS
// ==========================================
app.get('/api/formulas', async (req, res) => {
  try {
    const formulas = await prisma.formula.findMany({ orderBy: { nome: 'asc' } });
    res.json(formulas);
  } catch (error: any) {
    res.status(500).json({ error: 'Erro ao buscar fórmulas' });
  }
});

app.post('/api/formulas', async (req, res) => {
  try {
    const { nome } = req.body;
    const formula = await prisma.formula.create({ data: { nome } });
    res.status(201).json(formula);
  } catch (error: any) {
    if (error.code === 'P2002') return res.status(400).json({ error: 'Fórmula já existe.' });
    res.status(500).json({ error: 'Erro ao criar Fórmula' });
  }
});

// ==========================================
// PACIENTES
// ==========================================
app.post('/api/patients', async (req, res) => {
  try {
    const data = req.body;
    
    const patient = await prisma.$transaction(async (tx) => {
      const novoPaciente = await tx.patient.create({
        data: {
          nome: data.nome,
          cpf: data.cpf,
          cartao_sus: data.cartao_sus,
          data_nascimento: new Date(data.data_nascimento),
          endereco: data.endereco,
          bairro: data.bairro,
          ubs_id: data.ubs_id ? parseInt(data.ubs_id) : null,
          cids: data.cids,
          observacoes: data.observacoes,
          folder_id: data.folder_id ? parseInt(data.folder_id) : null,
          relatorio_medico: Boolean(data.relatorio_medico),
          relatorio_nutricional: Boolean(data.relatorio_nutricional),
          visita_social: Boolean(data.visita_social),
          forma_alimentacao: data.forma_alimentacao,
          via_acesso_sonda: data.via_acesso_sonda,
          peso: data.peso ? parseFloat(data.peso) : null,
          altura: data.altura ? parseFloat(data.altura) : null,
          imc: data.imc ? parseFloat(data.imc) : null,
          nome_profissional: data.nome_profissional,
          registro_profissional: data.registro_profissional,
          quantidade: data.quantidade,
          data_entrega: data.data_entrega ? new Date(data.data_entrega) : null,
          data_ultimo_relatorio: data.data_ultimo_relatorio ? new Date(data.data_ultimo_relatorio) : null,
          diagnoses: {
            connect: (data.diagnosticos || []).map((id: number) => ({ id }))
          },
          formulas: {
            connect: (data.formulas || []).map((id: number) => ({ id }))
          }
        }
      });

      if (data.restrictions && data.restrictions.length > 0) {
        const restricoesData = data.restrictions.map((rId: number) => ({
          patient_id: novoPaciente.id,
          restriction_id: rId
        }));
        
        await tx.patientRestriction.createMany({
          data: restricoesData
        });
      }

      return novoPaciente;
    });

    res.status(201).json(patient);
  } catch (error: any) {
    console.error(error);
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'CPF ou Cartão SUS já cadastrados no sistema.' });
    }
    res.status(500).json({ error: 'Erro ao cadastrar paciente.' });
  }
});

// ==========================================
// DISPENSAÇÃO E ESTOQUE
// ==========================================
app.post('/api/dispense', async (req, res) => {
  const { patient_id, prescription_id, quantidade_solicitada, confirmar_substituicao } = req.body;

  try {
    // UTILIZANDO TRANSAÇÃO INTERATIVA DO PRISMA
    // Garante que todo o processo (leitura de estoque, dedução e histórico) seja atômico.
    // Evita Race Conditions (dois atendentes dando baixa na mesma lata).
    const result = await prisma.$transaction(async (tx) => {
      
      // 1. Busca e Validação da Prescrição e Laudo
      const prescription = await tx.prescription.findUnique({
        where: { id: prescription_id },
        include: { report: true, alternatives: { orderBy: { ordem_prioridade: 'asc' } } }
      });
      
      if (!prescription) throw new Error('Prescrição não encontrada');
      if (new Date() > new Date(prescription.report.data_vencimento)) {
        throw new Error('Laudo médico vencido (mais de 90 dias). Dispensação bloqueada.');
      }

      // 2. Cálculo do Saldo do Produto Principal (FEFO)
      const mainBatches = await tx.batch.findMany({
        where: { product_id: prescription.product_main_id, quantidade: { gt: 0 } },
        orderBy: { data_validade: 'asc' }
      });
      const totalMainStock = mainBatches.reduce((sum, b) => sum + b.quantidade, 0);

      let targetBatches: any[] = [];
      let targetProductId = prescription.product_main_id;
      let substituicao = false;

      // Se há estoque do principal
      if (totalMainStock >= quantidade_solicitada) {
        targetBatches = mainBatches;
      } else {
        // 3. Lógica de Substituição se faltar o Principal
        for (const alt of prescription.alternatives) {
          const altBatches = await tx.batch.findMany({
            where: { product_id: alt.product_alternative_id, quantidade: { gt: 0 } },
            orderBy: { data_validade: 'asc' }
          });
          const totalAltStock = altBatches.reduce((sum, b) => sum + b.quantidade, 0);
          
          if (totalAltStock >= quantidade_solicitada) {
             if (!confirmar_substituicao) {
               // Interrompe a transação e avisa o frontend para pedir permissão ao usuário
               throw new Error(`REQUIRE_SUBSTITUTION_CONFIRM:${alt.product_alternative_id}`);
             }
             targetBatches = altBatches;
             targetProductId = alt.product_alternative_id;
             substituicao = true;
             break;
          }
        }
        
        if (targetBatches.length === 0) {
           throw new Error('Estoque insuficiente para o produto principal e todas as alternativas autorizadas.');
        }
      }

      // 4. Efetuar a baixa nos lotes (FEFO)
      let qtdRestante = quantidade_solicitada;
      const historyRecords = [];
      
      for (const batch of targetBatches) {
        if (qtdRestante <= 0) break;
        
        const qtdParaTirar = Math.min(batch.quantidade, qtdRestante);
        
        // Atualiza a quantidade do lote
        const updatedBatch = await tx.batch.update({
          where: { id: batch.id },
          data: { quantidade: { decrement: qtdParaTirar } }
        });
        
        // Proteção extra: Prisma decrementa mesmo se for menor que 0 no SQLite.
        // Se a transação simultânea fez o saldo ficar negativo, abortamos a transação inteira (Rollback).
        if (updatedBatch.quantidade < 0) {
          throw new Error('Conflito de concorrência detectado: O estoque esgotou durante a operação. Tente novamente.');
        }
        
        qtdRestante -= qtdParaTirar;
        
        historyRecords.push({
          patient_id,
          prescription_id,
          batch_id: batch.id,
          product_dispensed_id: targetProductId,
          quantidade: qtdParaTirar,
          substituicao_realizada: substituicao
        });
      }

      // 5. Registrar Histórico
      await tx.dispensingHistory.createMany({
        data: historyRecords
      });

      return { success: true, substituicao, targetProductId };
    });

    return res.status(200).json(result);

  } catch (error: any) {
    // Tratar o "Erro" controlado de sugestão de substituição
    if (error.message && error.message.startsWith('REQUIRE_SUBSTITUTION_CONFIRM:')) {
      const altId = error.message.split(':')[1];
      return res.status(200).json({
        require_confirmation: true,
        suggested_alternative_id: parseInt(altId, 10),
        message: 'O suplemento principal está sem estoque. Deseja utilizar a alternativa autorizada da prescrição?'
      });
    }
    
    // Retornar erros reais (Laudo vencido, sem estoque, etc)
    return res.status(400).json({ error: error.message || 'Erro interno na transação de dispensação' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
