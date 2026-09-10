import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function fix() {
  await prisma.user.updateMany({
    where: { role: 'ADMIN' },
    data: {
      perm_pacientes_editar: true,
      perm_pacientes_excluir: true,
      perm_estoque_editar: true,
      perm_estoque_excluir: true,
      perm_listas_base: true,
      perm_usuarios: true
    }
  });
  console.log('Admins fixed!');
}

fix().finally(() => prisma.$disconnect());
