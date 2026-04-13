import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import * as dotenv from "dotenv";
import { join } from "path";

dotenv.config({ path: join(process.cwd(), ".env") });

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL is missing");
  process.exit(1);
}

const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Starting Sequential Seed...");

  try {
    console.log("1. Cleaning Stock...");
    await prisma.stock.deleteMany();
    console.log("2. Cleaning Alerts...");
    await prisma.alert.deleteMany();
    console.log("3. Cleaning Tasks...");
    await prisma.task.deleteMany();
    console.log("4. Cleaning Workers...");
    await prisma.worker.deleteMany();
    console.log("5. Cleaning Projects...");
    await prisma.project.deleteMany();

    console.log("6. Creating Northgate Project...");
    const p1 = await prisma.project.create({
      data: { name: "Northgate Phase 2", percentage: 67, status: "on track", color: "bg-green-500" },
    });

    console.log("7. Creating Veliu Project...");
    const p2 = await prisma.project.create({
      data: { name: "Veliu Residential Block", percentage: 41, status: "needs review", color: "bg-orange-500" },
    });

    console.log("8. Creating Dragash Project...");
    await prisma.project.create({
      data: { name: "Dragash Road Extension", percentage: 12, status: "on track", color: "bg-blue-500" },
    });

    console.log("9. Creating Workers...");
    for (let i = 0; i < 5; i++) {
        await prisma.worker.create({ data: { name: `Worker ${i+1}`, role: "Laborer", monthlyPay: 80 } });
    }

    console.log("10. Creating Tasks...");
    await prisma.task.create({ data: { text: "Morning briefing with foremen", status: "Done", checked: true } });
    await prisma.task.create({ data: { text: "Confirm concrete order for Thursday", status: "Urgent", checked: false } });

    console.log("11. Creating Alerts...");
    await prisma.alert.create({ 
      data: {
        type: "warning", 
        text: "Plumbing on Northgate is behind pace.", 
        time: "Now", 
        isNow: true 
      }
    });

    console.log("12. Creating Stock...");
    await prisma.stock.create({ 
        data: { item: "Concrete", amount: "12 m³", date: "Tomorrow", projectId: p1.id } 
    });

    console.log("Seed Success!");
  } catch (error) {
    console.error("Step failed:");
    console.error(error);
    throw error;
  }
}

main()
  .catch((e) => {
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
    process.exit(0);
  });
