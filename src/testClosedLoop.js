import fetch from "node-fetch";
import StellarSdk from "@stellar/stellar-sdk";

// Correctly destructure from default export
const { Server, Keypair, Asset, TransactionBuilder, Operation, BASE_FEE, Networks } = StellarSdk;

// ---------- ISSUER ----------
const ISSUER_SECRET = "SBQ5NEGRPGUO6EKOWA5FMFBYSAOL7ECQI4VSJLX6CVUXU5ZLQAA3GPRM";
const ISSUER_KEYPAIR = Keypair.fromSecret(ISSUER_SECRET);

// ---------- SERVER ----------
const server = new Server("https://horizon-testnet.stellar.org");

// ---------- UTILITY ----------
async function fundAccount(publicKey) {
  const friendbotUrl = `https://friendbot.stellar.org?addr=${publicKey}`;
  const res = await fetch(friendbotUrl);
  if (!res.ok) throw new Error("Friendbot failed");
  return await res.json();
}

async function createWallet() {
  const keypair = Keypair.random();
  await fundAccount(keypair.publicKey());
  const account = await server.loadAccount(keypair.publicKey());
  return { keypair, balances: account.balances };
}

async function addTrustline(walletKeypair) {
  const asset = new Asset("HealthCoin", ISSUER_KEYPAIR.publicKey());
  const account = await server.loadAccount(walletKeypair.publicKey());
  const tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: Networks.TESTNET
  })
    .addOperation(Operation.changeTrust({ asset, limit: "10000" }))
    .setTimeout(30)
    .build();
  tx.sign(walletKeypair);
  await server.submitTransaction(tx);
}

async function issueHealthCoin(walletPublicKey, amount = "100") {
  const asset = new Asset("HealthCoin", ISSUER_KEYPAIR.publicKey());
  const issuerAccount = await server.loadAccount(ISSUER_KEYPAIR.publicKey());
  const tx = new TransactionBuilder(issuerAccount, {
    fee: BASE_FEE,
    networkPassphrase: Networks.TESTNET
  })
    .addOperation(Operation.payment({ destination: walletPublicKey, asset, amount }))
    .setTimeout(30)
    .build();
  tx.sign(ISSUER_KEYPAIR);
  return await server.submitTransaction(tx);
}

// ---------- DEMO ----------
(async () => {
  console.log("👛 Creating Employee Wallet...");
  const employee = await createWallet();
  console.log("Employee publicKey:", employee.keypair.publicKey());

  console.log("🔗 Adding Trustline...");
  await addTrustline(employee.keypair);

  console.log("💊 Issuing HealthCoin...");
  const txRes = await issueHealthCoin(employee.keypair.publicKey(), "100");
  console.log("✅ HealthCoin Issued:", txRes._links.transaction.href);
})();
