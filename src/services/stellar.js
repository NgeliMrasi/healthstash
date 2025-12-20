const StellarSdk = require('stellar-sdk');

const server = new StellarSdk.Horizon.Server(process.env.HORIZON_URL);

async function friendbotFund(pub) {
  const res = await fetch(`https://friendbot.stellar.org?addr=${encodeURIComponent(pub)}`);
  if (!res.ok) throw new Error(`Friendbot failed: ${await res.text()}`);
}

async function createFundedAccount() {
  const kp = StellarSdk.Keypair.random();
  await friendbotFund(kp.publicKey());
  return kp;
}

async function loadAccount(pub) { return server.loadAccount(pub); }
async function submit(tx) { return server.submitTransaction(tx); }
function asset(code, issuerPub) { return new StellarSdk.Asset(code, issuerPub); }

module.exports = {
  server,
  Keypair: StellarSdk.Keypair,
  Asset: StellarSdk.Asset,
  Operation: StellarSdk.Operation,
  TransactionBuilder: StellarSdk.TransactionBuilder,
  Networks: StellarSdk.Networks,
  BASE_FEE: StellarSdk.BASE_FEE,
  Memo: StellarSdk.Memo,
  createFundedAccount,
  loadAccount,
  submit,
  asset
};
