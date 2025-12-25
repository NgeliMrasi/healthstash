import { createWallet, issueHealthCoin } from '../stellar/issueHealthCoin.js';
import StellarSdk from '@stellar/stellar-sdk';
import fetch from 'node-fetch';

async function main() {
  console.log("🚀 Creating Issuer Wallet...");
  const issuer = await createWallet();
  console.log("👛 Issuer Created:", issuer);

  console.log("🚀 Creating Employee Wallet...");
  const employee = await createWallet();
  console.log("👛 Employee Created:", employee);

  console.log("🔗 Issuing HealthCoin to Employee...");
  try {
    const result = await issueHealthCoin(
      issuer.secretKey,
      employee.publicKey,
      "1000" // amount of HealthCoin to issue
    );
    console.log("💊 HealthCoin Issued Successfully!");
    console.log("🔗 Transaction URL:", `https://horizon-testnet.stellar.org/transactions/${result.hash}`);
  } catch (err) {
    console.error("❌ Failed to issue HealthCoin:", err);
  }
}

main();
