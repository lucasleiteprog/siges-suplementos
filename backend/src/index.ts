import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

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
app.put('/api/diagnoses/:id', async (req, res) => {
  try {
    const diag = await prisma.diagnosis.update({ where: { id: parseInt(req.params.id) }, data: { nome: req.body.nome } });
    res.json(diag);
  } catch (e) { res.status(500).json({ error: 'Erro' }); }
});
app.delete('/api/diagnoses/:id', async (req, res) => {
  try {
    await prisma.diagnosis.delete({ where: { id: parseInt(req.params.id) } });
    res.status(204).send();
  } catch (e) { res.status(500).json({ error: 'Erro' }); }
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
app.put('/api/folders/:id', async (req, res) => {
  try {
    const f = await prisma.folder.update({ where: { id: parseInt(req.params.id) }, data: { nome: req.body.nome } });
    res.json(f);
  } catch (e) { res.status(500).json({ error: 'Erro' }); }
});
app.delete('/api/folders/:id', async (req, res) => {
  try {
    await prisma.folder.delete({ where: { id: parseInt(req.params.id) } });
    res.status(204).send();
  } catch (e) { res.status(500).json({ error: 'Erro' }); }
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
app.put('/api/ubs/:id', async (req, res) => {
  try {
    const u = await prisma.ubs.update({ where: { id: parseInt(req.params.id) }, data: { nome: req.body.nome } });
    res.json(u);
  } catch (e) { res.status(500).json({ error: 'Erro' }); }
});
app.delete('/api/ubs/:id', async (req, res) => {
  try {
    await prisma.ubs.delete({ where: { id: parseInt(req.params.id) } });
    res.status(204).send();
  } catch (e) { res.status(500).json({ error: 'Erro' }); }
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
app.put('/api/formulas/:id', async (req, res) => {
  try {
    const f = await prisma.formula.update({ where: { id: parseInt(req.params.id) }, data: { nome: req.body.nome } });
    res.json(f);
  } catch (e) { res.status(500).json({ error: 'Erro' }); }
});
app.delete('/api/formulas/:id', async (req, res) => {
  try {
    await prisma.formula.delete({ where: { id: parseInt(req.params.id) } });
    res.status(204).send();
  } catch (e) { res.status(500).json({ error: 'Erro' }); }
});

// ==========================================
// LOTES (ESTOQUE)
// ==========================================
app.get('/api/batches', async (req, res) => {
  try {
    const batches = await prisma.batch.findMany({
      include: { formula: true },
      orderBy: { data_validade: 'asc' } // FEFO logic
    });
    res.json(batches);
  } catch (error: any) {
    res.status(500).json({ error: 'Erro ao buscar lotes' });
  }
});

app.post('/api/batches', async (req, res) => {
  try {
    const data = req.body;
    const batch = await prisma.batch.create({
      data: {
        formulaId: parseInt(data.formulaId),
        numero_lote: data.numero_lote,
        data_validade: new Date(data.data_validade),
        quantidade_inicial: parseInt(data.quantidade_inicial),
        quantidade_atual: parseInt(data.quantidade_inicial), // Starts equal
        observacoes: data.observacoes || null
      },
      include: { formula: true }
    });
    res.status(201).json(batch);
  } catch (error: any) {
    if (error.code === 'P2002') return res.status(400).json({ error: 'Este lote já existe para esta fórmula.' });
    res.status(500).json({ error: 'Erro ao criar lote', details: error.message });
  }
});

app.put('/api/batches/:id', async (req, res) => {
  try {
    const data = req.body;
    const batch = await prisma.batch.update({
      where: { id: parseInt(req.params.id) },
      data: {
        numero_lote: data.numero_lote,
        data_validade: new Date(data.data_validade),
        quantidade_atual: parseInt(data.quantidade_atual),
        observacoes: data.observacoes || null
      },
      include: { formula: true }
    });
    res.json(batch);
  } catch (e) { res.status(500).json({ error: 'Erro ao atualizar lote' }); }
});

app.delete('/api/batches/:id', async (req, res) => {
  try {
    await prisma.batch.delete({ where: { id: parseInt(req.params.id) } });
    res.status(204).send();
  } catch (e) { res.status(500).json({ error: 'Erro ao excluir lote' }); }
});

// ==========================================
// PACIENTES
// ==========================================
app.get('/api/patients', async (req, res) => {
  try {
    const patients = await prisma.patient.findMany({
      include: {
        ubs: true,
        folder: true,
        diagnoses: true,
        formulas: true
      },
      orderBy: { nome: 'asc' }
    });
    res.json(patients);
  } catch (error: any) {
    res.status(500).json({ error: 'Erro ao buscar pacientes' });
  }
});

app.get('/api/patients/:id', async (req, res) => {
  try {
    const patient = await prisma.patient.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        diagnoses: true,
        formulas: true
      }
    });
    if (!patient) return res.status(404).json({ error: 'Paciente não encontrado' });
    res.json(patient);
  } catch (error: any) {
    res.status(500).json({ error: 'Erro ao buscar paciente' });
  }
});

app.put('/api/patients/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    
    const patient = await prisma.$transaction(async (tx) => {
      // First, update basic fields and disconnect all relations to reset them
      await tx.patient.update({
        where: { id: parseInt(id) },
        data: {
          diagnoses: { set: [] },
          formulas: { set: [] }
        }
      });

      // Now update with new data
      return await tx.patient.update({
        where: { id: parseInt(id) },
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
          restricoes_clinicas: data.restricoes_clinicas,
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
            connect: (data.diagnosticos || []).map((did: number) => ({ id: did }))
          },
          formulas: {
            connect: (data.formulas || []).map((fid: number) => ({ id: fid }))
          }
        }
      });
    });
    
    res.json(patient);
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'CPF ou Cartão SUS já cadastrado.' });
    }
    res.status(500).json({ error: 'Erro ao atualizar paciente', details: error.message });
  }
});

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
          restricoes_clinicas: data.restricoes_clinicas,
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
// DISPENSAÇÃO (ENTREGA FEFO)
// ==========================================
app.post('/api/dispense', async (req, res) => {
  const { patient_id, formula_id, quantidade_solicitada, observacoes, quem_entregou, quem_recebeu } = req.body;

  if (!quem_entregou || !quem_recebeu) {
    return res.status(400).json({ error: 'É obrigatório informar quem entregou e quem recebeu.' });
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Busca todos os lotes dessa fórmula com saldo > 0, ordenados do mais velho pro mais novo (FEFO)
      const batches = await tx.batch.findMany({
        where: { 
          formulaId: parseInt(formula_id), 
          quantidade_atual: { gt: 0 } 
        },
        orderBy: { data_validade: 'asc' }
      });

      const totalStock = batches.reduce((sum, b) => sum + b.quantidade_atual, 0);

      if (totalStock < quantidade_solicitada) {
        throw new Error(`Estoque insuficiente. Solicitado: ${quantidade_solicitada}. Disponível: ${totalStock}.`);
      }

      let qtdRestante = parseInt(quantidade_solicitada);
      const historyRecords = [];
      
      // 2. Dar baixa nos lotes sequencialmente
      for (const batch of batches) {
        if (qtdRestante <= 0) break;
        
        const qtdParaTirar = Math.min(batch.quantidade_atual, qtdRestante);
        
        const updatedBatch = await tx.batch.update({
          where: { id: batch.id },
          data: { quantidade_atual: { decrement: qtdParaTirar } }
        });
        
        if (updatedBatch.quantidade_atual < 0) {
          throw new Error('Conflito de concorrência detectado no estoque. Tente novamente.');
        }
        
        qtdRestante -= qtdParaTirar;
        
        historyRecords.push({
          patient_id: parseInt(patient_id),
          batch_id: batch.id,
          quantidade: qtdParaTirar,
          quem_entregou,
          quem_recebeu,
          observacoes: observacoes || null
        });
      }

      // 3. Registrar o Histórico de Dispensação
      await tx.dispensingHistory.createMany({
        data: historyRecords
      });

      // 4. Atualizar a última data de entrega do paciente
      await tx.patient.update({
        where: { id: parseInt(patient_id) },
        data: { data_entrega: new Date() }
      });

      return { success: true, message: 'Dispensação realizada com sucesso usando método FEFO.' };
    });

    return res.status(200).json(result);

  } catch (error: any) {
    return res.status(400).json({ error: error.message || 'Erro interno na dispensação' });
  }
});

// ==========================================
// DASHBOARD (ESTATÍSTICAS)
// ==========================================
app.get('/api/dashboard', async (req, res) => {
  try {
    const today = new Date();
    const sixtyDaysFromNow = new Date();
    sixtyDaysFromNow.setDate(today.getDate() + 60);

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // 1. Total de pacientes cadastrados
    const totalPatients = await prisma.patient.count();

    // 2. Fórmulas cadastradas
    const totalFormulas = await prisma.formula.count();

    // 3. Alertas de Estoque: Lotes vencendo nos próximos 60 dias
    const expiringBatches = await prisma.batch.findMany({
      where: {
        quantidade_atual: { gt: 0 },
        data_validade: {
          lte: sixtyDaysFromNow
        }
      },
      include: {
        formula: true
      },
      orderBy: { data_validade: 'asc' },
      take: 10
    });

    // 4. Lotes esgotados ou zerados recentemente (só pra avisar)
    const emptyBatches = await prisma.batch.findMany({
      where: { quantidade_atual: 0 },
      include: { formula: true },
      take: 5
    });

    // 5. Histórico recente de dispensações no mês atual
    const recentDispensing = await prisma.dispensingHistory.findMany({
      where: {
        data_dispensacao: {
          gte: startOfMonth
        }
      },
      include: {
        patient: { select: { nome: true } },
        batch: { include: { formula: true } }
      },
      orderBy: { data_dispensacao: 'desc' },
      take: 5
    });

    // Calcular total de itens dispensados neste mês
    const totalDispensedMonth = await prisma.dispensingHistory.aggregate({
      where: {
        data_dispensacao: {
          gte: startOfMonth
        }
      },
      _sum: {
        quantidade: true
      }
    });

    res.status(200).json({
      totalPatients,
      totalFormulas,
      expiringBatches,
      emptyBatches,
      recentDispensing,
      totalDispensedMonth: totalDispensedMonth._sum.quantidade || 0
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao carregar dados do dashboard' });
  }
});

const JWT_SECRET = 'siges-secret-key-123'; // Em produção, usar process.env.JWT_SECRET

// ==========================================
// SEEDING INICIAL (CRIAR ADMIN)
// ==========================================
async function seedAdmin() {
  const adminExists = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
  if (!adminExists) {
    const passwordHash = await bcrypt.hash('admin123', 10);
    await prisma.user.create({
      data: {
        nome: 'Administrador Padrão',
        username: 'admin',
        password_hash: passwordHash,
        role: 'ADMIN'
      }
    });
    console.log('Usuário admin criado (Login: admin / Senha: admin123)');
  }
}
seedAdmin();

// ==========================================
// MIDDLEWARE DE AUTENTICAÇÃO
// ==========================================
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

const requireAdmin = (req: any, res: any, next: any) => {
  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Acesso negado. Apenas administradores.' });
  }
  next();
};

// ==========================================
// ROTAS DE AUTENTICAÇÃO
// ==========================================
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) return res.status(401).json({ error: 'Usuário ou senha inválidos' });

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) return res.status(401).json({ error: 'Usuário ou senha inválidos' });

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role, nome: user.nome }, 
      JWT_SECRET, 
      { expiresIn: '24h' }
    );

    res.json({ token, user: { id: user.id, nome: user.nome, role: user.role } });
  } catch (error) {
    res.status(500).json({ error: 'Erro no servidor' });
  }
});

app.get('/api/auth/me', authenticateToken, (req: any, res: any) => {
  res.json(req.user);
});

// ==========================================
// ROTAS DE GERENCIAMENTO DE USUÁRIOS (SÓ ADMIN)
// ==========================================
app.get('/api/users', authenticateToken, requireAdmin, async (req, res) => {
  const users = await prisma.user.findMany({ select: { id: true, nome: true, username: true, role: true, created_at: true } });
  res.json(users);
});

app.post('/api/users', authenticateToken, requireAdmin, async (req, res) => {
  const { nome, username, password, role } = req.body;
  try {
    const exists = await prisma.user.findUnique({ where: { username } });
    if (exists) return res.status(400).json({ error: 'Username já existe' });

    const password_hash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { nome, username, password_hash, role }
    });
    res.status(201).json({ id: user.id, nome: user.nome, role: user.role });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar usuário' });
  }
});

app.delete('/api/users/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    await prisma.user.delete({ where: { id: parseInt(req.params.id) } });
    res.sendStatus(204);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar usuário' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
