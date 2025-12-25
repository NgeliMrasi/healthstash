import { createIssuerAccount } from '../stellar/createIssuer.js';
import { createTestWallet } from '../stellar/createWallet.js';

async function run() {
  console.log("🚀 Creating Issuer...");
  const issuer = await createIssuerAccount();
  console.log("👑 Issuer Account:", issuer);

  console.log("👛 Creating Test Wallet...");
  const wallet = await createTestWallet();
  console.log("💰 Wallet:", wallet);

  // TODO: Add HealthCoin issuance & trustline setup
}

run();
