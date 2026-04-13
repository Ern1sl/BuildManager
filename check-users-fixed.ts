import { db } from "./src/lib/db";

async function main() {
  const users = await db.user.findMany();
  console.log("\n--- REGISTERED USERS ---");
  if (users.length === 0) {
    console.log("No users found in database.");
  } else {
    users.forEach(u => console.log(`- '${u.email}' (Role: ${u.role})`));
  }
  console.log("-----------------------\n");
}

main()
  .catch(e => console.error(e))
  .finally(async () => process.exit(0));
