import pkg from '@stellar/stellar-sdk';
import fetch from '../utils/fetchWrapper.js';

const { Server, Keypair } = pkg;  // destructure from default import

const server = new Server("https://horizon-testnet.stellar.org");

export async function createIssuerAccount() {
  const keypair = Keypair.random();

  // Fund issuer via Friendbot
  const friendbotUrl = `https://friendbot.stellar.org?addr=${keypair.publicKey()}`;
  await fetch(friendbotUrl);

  const account = await server.loadAccount(keypair.publicKey());

  return {
    role: "HEALTHSTASH_ISSUER",
    publicKey: keypair.publicKey(),
    secretKey: keypair.secret(),
    balances: account.balances,
    network: "TESTNET"
  };
}
