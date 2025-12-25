// src/app.js

require('dotenv').config();
const express = require('express');
const { createDemoAccount, issueAsset } = require('./services/assets');
const { Horizon } = require('@stellar/stellar-sdk');

const app = express();
const PORT = process.env.PORT || 3000;

// Horizon server instance (Testnet by default)
const server = new Horizon.Server(
  process.env.HORIZON_URL || 'https://horizon-testnet.stellar.org'
);

app.use(express.json());

// Health check route
app.get('/', (_req, res) => {
  res.json({ status: 'HealthStash API running' });
});

// Demo account route
app.get('/stellar/demo-account', async (_req, res) => {
  try {
    const account = await createDemoAccount();
    res.json(account);
  } catch (err) {
    console.error('Error in /stellar/demo-account:', err);
    res.status(500).json({ error: err.message });
  }
});

// Issue asset route
app.post('/stellar/issue-asset', async (req, res) => {
  try {
    const { issuerSecret, assetCode, amount, destinationPublicKey } = req.body;

    if (!issuerSecret || !assetCode || !amount || !destinationPublicKey) {
      return res.status(400).json({
        error: 'Missing required fields: issuerSecret, assetCode, amount, destinationPublicKey',
      });
    }

    const result = await issueAsset(issuerSecret, assetCode, amount, destinationPublicKey);
    res.json({ status: 'Asset issued successfully', result });
  } catch (err) {
    console.error('Error in /stellar/issue-asset:', err);
    res.status(500).json({ error: err.message });
  }
});

// Transaction history route
app.get('/stellar/history/:publicKey', async (req, res) => {
  try {
    const { publicKey } = req.params;
    if (!publicKey) {
      return res.status(400).json({ error: 'Missing publicKey parameter' });
    }

    const account = await server.loadAccount(publicKey);
    const transactions = await server.transactions()
      .forAccount(publicKey)
      .order('desc')
      .limit(10)
      .call();

    res.json({
      publicKey,
      balances: account.balances,
      recentTransactions: transactions.records.map(tx => ({
        id: tx.id,
        created_at: tx.created_at,
        source_account: tx.source_account,
        operation_count: tx.operation_count,
        successful: tx.successful,
      })),
    });
  } catch (err) {
    console.error('Error in /stellar/history:', err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`HealthStash API listening on port ${PORT}`);
});
