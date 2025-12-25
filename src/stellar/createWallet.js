import pkg from '@stellar/stellar-sdk';
import fetch from '../utils/fetchWrapper.js';

const { Server, Keypair } = pkg;

const server = new Server("https://horizon-testnet.stellar.org");

export async function createTestWallet() {
  const keypair = Keypair.random();

  const friendbotUrl = `https://friendbot.stellar.org?addr=${keypair.publicKey()}`;
  await fetch(friendbotUrl);

  const account = await server.loadAccount(keypair.publicKey());

  return {
    publicKey: keypair.publicKey(),
    secretKey: keypair.secret(),
    balances: account.balances
  };
}
