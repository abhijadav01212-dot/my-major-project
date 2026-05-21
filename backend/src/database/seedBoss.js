import 'dotenv/config';
import { databaseStatus, initDatabase, seedAccountsAccount, seedBossAccount } from './sqlite.js';

export function ensureSystemAccounts() {
  initDatabase();
  seedBossAccount();
  seedAccountsAccount();
  return databaseStatus();
}

if (process.argv[1]?.endsWith('seedBoss.js')) {
  const status = ensureSystemAccounts();
  console.log(`Boss and Accounts accounts ready in ${status.path}`);
}
