// src/services/stellar.js

const {
  Horizon,
  Keypair,
  Asset,
  Operation,
  TransactionBuilder,
  Networks
} = require('@stellar/stellar-sdk');

// Horizon server instance (Testnet). Your .env must have:
// HORIZON_URL=https://horizon-testnet.stellar.org
const server = new Horizon.Server(process.env.HORIZON_URL);

// Load balances for an account
async function getAccountBalances(publicKey) {
  const account = await server.loadAccount(publicKey);
  return account.balances.map(b => ({
    asset: b.asset_type === 'native' ? 'XLM' : `${b.asset_code}:${b.asset_issuer}`,
    balance: b.balance
  }));
}

// Create a new account (funded via Friendbot on testnet)
async function createAccount(secretKey) {
  const keypair = Keypair.fromSecret(secretKey);
  const response = await fetch(
    `https://friendbot.stellar.org?addr=${encodeURIComponent(keypair.publicKey())}`
  );
  return await response.json();
}

// Send a payment (XLM or custom asset "CODE:ISSUER")
async function sendPayment(sourceSecret, destinationPublic, amount, asset = 'XLM') {
  const sourceKeypair = Keypair.fromSecret(sourceSecret);
  const account = await server.loadAccount(sourceKeypair.publicKey());
  const fee = await server.fetchBaseFee();

  const txBuilder = new TransactionBuilder(account, {
    fee,
    networkPassphrase: Networks.TESTNET
  });

  let paymentOp;
  if (asset === 'XLM') {
    paymentOp = Operation.payment({
      destination: destinationPublic,
      asset: Asset.native(),
      amount: amount.toString()
    });
  } else {
    const [assetCode, issuer] = asset.split(':');
    paymentOp = Operation.payment({
      destination: destinationPublic,
      asset: new Asset(assetCode, issuer),
      amount: amount.toString()
    });
  }

  const transaction = txBuilder.addOperation(paymentOp).setTimeout(30).build();
  transaction.sign(sourceKeypair);
  return server.submitTransaction(transaction);
}

// Add a trustline for a custom asset
async function trustAsset(secretKey, assetCode, issuer) {
  const keypair = Keypair.fromSecret(secretKey);
  const account = await server.loadAccount(keypair.publicKey());
  const fee = await server.fetchBaseFee();

  const txBuilder = new TransactionBuilder(account, {
    fee,
    networkPassphrase: Networks.TESTNET
  });

  const transaction = txBuilder
    .addOperation(Operation.changeTrust({
      asset: new Asset(assetCode, issuer)
    }))
    .setTimeout(30)
    .build();

  transaction.sign(keypair);
  return server.submitTransaction(transaction);
}

module.exports = {
  server,
  getAccountBalances,
  createAccount,
  sendPayment,
  trustAsset
};
