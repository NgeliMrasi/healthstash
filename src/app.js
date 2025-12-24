// src/app.js

require('dotenv').config();
const express = require('express');
const { createDemoAccount, issueAsset } = require('./services/assets');

const app = express();
const PORT = process.env.PORT || 3000;

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

    if (!issuerSecret || !issuerSecret.startsWith('S')) {
      return res.status(400).json({ error: 'Invalid issuerSecret: must be a valid Stellar secret key starting with S' });
    }

    const result = await issueAsset(issuerSecret, assetCode, amount, destinationPublicKey);
    res.json({ success: true, result });
  } catch (err) {
    console.error('Error in /stellar/issue-asset:', err);
    res.status(500).json({ error: err.message });
  }
});

// **New combined route**: create demo account + issue token
app.post('/stellar/demo-account-with-token', async (req, res) => {
  try {
    const { assetCode, amount } = req.body;

    if (!assetCode || !amount) {
      return res.status(400).json({ error: 'assetCode and amount are required' });
    }

    // 1️⃣ Create a demo account
    const demoAccount = await createDemoAccount();

    // 2️⃣ Issue asset to the demo account using demo account itself as issuer
    const assetResult = await issueAsset(demoAccount.secretKey, assetCode, amount, demoAccount.publicKey);

    res.json({
      demoAccount,
      issuedAsset: {
        assetCode,
        amount,
        result: assetResult,
      },
    });
  } catch (err) {
    console.error('Error in /stellar/demo-account-with-token:', err);
    res.status(500).json({ error: err.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`HealthStash API listening on port ${PORT}`);
});
