// src/services/assets.js

require('dotenv').config();
const { Horizon, Keypair, Asset, Operation, TransactionBuilder, Networks } = require('@stellar/stellar-sdk');

// Horizon server instance (Testnet by default, configurable via .env)
const server = new Horizon.Server(
  process.env.HORIZON_URL || 'https://horizon-testnet.stellar.org'
);

/**
 * Create a new funded testnet account using Friendbot
 */
async function createDemoAccount() {
  const keypair = Keypair.random();

  const friendbotUrl = `https://friendbot.stellar.org?addr=${encodeURIComponent(
    keypair.publicKey()
  )}`;

  const response = await fetch(friendbotUrl);
  if (!response.ok) {
    throw new Error(`Friendbot failed: ${response.status} ${response.statusText}`);
  }
  await response.json();

  const account = await server.loadAccount(keypair.publicKey());

  return {
    publicKey: keypair.publicKey(),
    secretKey: keypair.secret(),
    balances: account.balances,
  };
}

/**
 * Issue a custom asset (token) on testnet
 */
async function issueAsset(issuerSecret, assetCode, amount, destinationPublicKey) {
  const issuerKeypair = Keypair.fromSecret(issuerSecret);
  const asset = new Asset(assetCode, issuerKeypair.publicKey());

  const account = await server.loadAccount(issuerKeypair.publicKey());
  const transaction = new TransactionBuilder(account, {
    fee: await server.fetchBaseFee(),
    networkPassphrase: Networks.TESTNET,
  })
    .addOperation(
      Operation.payment({
        destination: destinationPublicKey,
        asset,
        amount: amount.toString(),
      })
    )
    .setTimeout(30)
    .build();

  transaction.sign(issuerKeypair);
  return server.submitTransaction(transaction);
}

module.exports = {
  createDemoAccount,
  issueAsset,
};
