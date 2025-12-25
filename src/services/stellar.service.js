const {
  Horizon,
  Keypair,
  Networks
} = require('@stellar/stellar-sdk');

const horizonUrl = process.env.HORIZON_URL;
const server = new Horizon.Server(horizonUrl);

async function createDemoAccount() {
  const pair = Keypair.random();

  await fetch(
    `https://friendbot.stellar.org?addr=${encodeURIComponent(pair.publicKey())}`
  );

  const account = await server.loadAccount(pair.publicKey());

  return {
    publicKey: pair.publicKey(),
    secretKey: pair.secret(),
    balances: account.balances
  };
}

module.exports = {
  createDemoAccount
};
