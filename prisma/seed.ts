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
  console.log("Starting Sequential Multi-Tenant Seed...");

  try {
    // 0. Ensure we have at least one user to assign data to
    let user = await prisma.user.findFirst();
    if (!user) {
      console.log("0. No user found, creating default admin@buildmanager.com...");
      user = await prisma.user.create({
        data: {
          email: "admin@buildmanager.com",
          name: "Admin",
          role: "admin",
          // password: "password123" hashed
          password: "$2a$12$N9qo8uLOickgx2ZMRZoMyeIjZAgNI9B969zV69Fv164t.LSKODR2W"
        }
      });
    }
    const userId = user.id;

    console.log("1. Cleaning Database...");
    await prisma.event.deleteMany();
    await prisma.stock.deleteMany();
    await prisma.alert.deleteMany();
    await prisma.task.deleteMany();
    await prisma.worker.deleteMany();
    await prisma.role.deleteMany();
    await prisma.phase.deleteMany();
    await prisma.siteLog.deleteMany();
    await prisma.project.deleteMany();

    console.log("2. Creating Roles...");
    const role1 = await prisma.role.create({ data: { name: "Laborer", userId } });
    const role2 = await prisma.role.create({ data: { name: "Foreman", userId } });

    console.log("3. Creating Projects...");
    const p1 = await prisma.project.create({
      data: { name: "Northgate Phase 2", percentage: 67, status: "on track", color: "bg-green-500", userId },
    });

    const p2 = await prisma.project.create({
      data: { name: "Veliu Residential Block", percentage: 41, status: "needs review", color: "bg-orange-500", userId },
    });

    await prisma.project.create({
      data: { name: "Dragash Road Extension", percentage: 12, status: "on track", color: "bg-blue-500", userId },
    });

    console.log("4. Creating Workers...");
    for (let i = 0; i < 5; i++) {
        await prisma.worker.create({ 
          data: { 
            name: `Worker ${i+1}`, 
            role: i === 0 ? role2.name : role1.name, 
            monthlyPay: 80,
            userId 
          } 
        });
    }

    console.log("5. Creating Tasks...");
    await prisma.task.create({ data: { text: "Morning briefing with foremen", status: "Done", checked: true, userId } });
    await prisma.task.create({ data: { text: "Confirm concrete order for Thursday", status: "Urgent", checked: false, userId } });

    console.log("6. Creating Alerts...");
    await prisma.alert.create({ 
      data: {
        type: "warning", 
        text: "Plumbing on Northgate is behind pace.", 
        time: "Now", 
        isNow: true,
        userId
      }
    });

    console.log("7. Creating Stock...");
    await prisma.stock.create({ 
        data: { 
          item: "Concrete", 
          amount: "12 m³", 
          date: "Tomorrow", 
          projectId: p1.id,
          status: "On track",
          bay: "Bay 2",
          userId 
        } 
    });

    console.log("Seed Success for userId:", userId);
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
