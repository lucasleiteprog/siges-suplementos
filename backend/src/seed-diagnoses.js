const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const diagnoses = [
  "Demência",
  "Parkinson",
  "Alzheimer",
  "Caquexia",
  "Sequelas de AVC",
  "Acamado",
  "DPOC (Doença Pulmonar Obstrutiva Crônica)",
  "DM (Diabetes Mellitus)",
  "HAS (Hipertensão Arterial Sistêmica)",
  "Senilidade",
  "Sarcopenia",
  "Insuficiência cardíaca",
  "Insuficiência Renal",
  "Paciente Oncológico",
  "Baixo Peso",
  "Depressão",
  "Paralisia cerebral",
  "Pós operatório",
  "Intolerância a lactose",
  "Síndrome demêncial",
  "Epilepsia",
  "Seletividade alimentar",
  "Microcefalia",
  "Atrofia Muscular",
  "Disfagia/ Afagia",
  "Síndrome de má absorção",
  "Transtorno de motilidade intestinal",
  "TEA - Transtorno do espectro autista"
];

async function main() {
  console.log('Iniciando cadastro em lote...');
  for (const nome of diagnoses) {
    await prisma.diagnosis.upsert({
      where: { nome },
      update: {},
      create: { nome }
    });
  }
  console.log("Todos os diagnósticos foram cadastrados com sucesso no banco de dados!");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
