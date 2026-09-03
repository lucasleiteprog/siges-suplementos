# 🏥 SIGES - Sistema Integrado de Gestão de Suplementos

O **SIGES** é um sistema web local e responsivo desenvolvido para facilitar e organizar a gestão clínica e logística da distribuição de suplementos alimentares aos pacientes. 

## 🚀 Funcionalidades Atuais

- **Gestão de Pacientes:** 
  - Cadastro completo com informações pessoais, endereço e dados clínicos.
  - Cálculo automático de **IMC**, respeitando diretrizes distintas para Adultos (OMS) e Idosos (OPAS/Lipschitz).
  - Tabela de listagem dinâmica com busca instantânea.
- **Gestão Clínica Avançada:**
  - Suporte a múltiplos Diagnósticos (CIDs) e Fórmulas Autorizadas.
  - Vias de acesso (Sonda Nasogástrica, Gastrostomia, Via Oral, etc).
  - Controle rigoroso de validade de Relatórios Médicos e Nutricionais.
- **Painel Administrativo:**
  - Módulo completo (CRUD) para gerenciar as listas de Diagnósticos, Fórmulas, Unidades de Saúde (UBS) e Pastas de Arquivo Físico.

## 🛠️ Tecnologias Utilizadas

- **Frontend:** React, TypeScript, Tailwind CSS v4, Vite, React Router, Lucide Icons.
- **Backend:** Node.js, Express, TypeScript, Prisma ORM.
- **Banco de Dados:** SQLite (projetado para redes locais e equipes pequenas).
- **Arquitetura:** Monorepo (Frontend e Backend divididos em pastas).

## ⚙️ Como executar o projeto localmente

1. Abra dois terminais (um para o backend, outro para o frontend).
2. **Terminal 1 (Backend):**
   ```bash
   cd backend
   npm install
   npx prisma db push
   npx prisma generate
   npm run dev
   ```
3. **Terminal 2 (Frontend):**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
4. O sistema estará disponível em `http://localhost:5173`.

---
*Este projeto está atualmente na Fase 2 do Roadmap e recebendo novas funcionalidades.*
