// test-stellar.js
require('dotenv').config();
const { server } = require('./src/services/stellar');

(async () => {
  try {
    // Replace with a funded testnet public key to see balances
    const pub = 'GA3D5H5KTESTPUBLICKEYREPLACE';
    const account = await server.loadAccount(pub);
    console.log('Balances:', account.balances);
  } catch (err) {
    console.error('Connection failed:', err.message);
  }
})();
