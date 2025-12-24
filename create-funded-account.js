// create-funded-account.js

require('dotenv').config();

console.log("Node version:", process.version);
console.log("typeof fetch:", typeof fetch);

const { Horizon, Keypair } = require('@stellar/stellar-sdk');

const server = new Horizon.Server(
  process.env.HORIZON_URL || 'https://horizon-testnet.stellar.org'
);

(async () => {
  try {
    const keypair = Keypair.random();

    console.log('🔑 New Testnet Account');
    console.log('Public Key:', keypair.publicKey());
    console.log('Secret Key:', keypair.secret());

    const friendbotUrl =
      `https://friendbot.stellar.org?addr=${encodeURIComponent(keypair.publicKey())}`;

    const response = await fetch(friendbotUrl);
    if (!response.ok) {
      throw new Error(`Friendbot failed: ${response.status}`);
    }

    console.log('💸 Account funded');

    const account = await server.loadAccount(keypair.publicKey());
    console.log('📊 Account Balances:');
    account.balances.forEach(b => {
      const asset =
        b.asset_type === 'native' ? 'XLM' : `${b.asset_code}:${b.asset_issuer}`;
      console.log(`- ${asset}: ${b.balance}`);
    });

  } catch (err) {
    console.error('❌ Error creating funded account:', err.message);
  }
})();
