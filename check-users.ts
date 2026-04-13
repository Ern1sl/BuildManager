import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany();
  console.log("--- Registered Users ---");
  users.forEach(u => console.log(`- ${u.email}`));
  console.log("-----------------------");
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
