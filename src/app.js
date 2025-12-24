// src/app.js

require('dotenv').config();
const express = require('express');
const { createDemoAccount, issueAsset } = require('./services/assets');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Health check
app.get('/', (_req, res) => {
  res.json({ status: 'HealthStash API running' });
});

// Create demo account
app.get('/stellar/demo-account', async (_req, res) => {
  try {
    const account = await createDemoAccount();
    res.json(account);
  } catch (err) {
    console.error('Error in /stellar/demo-account:', err);
    res.status(500).json({ error: err.message });
  }
});

// Issue custom asset
app.post('/stellar/issue-asset', async (req, res) => {
  const { issuerSecret, assetCode, amount, destinationPublicKey } = req.body;
  if (!issuerSecret || !issuerSecret.startsWith('S')) {
    return res.status(400).json({ error: 'Invalid issuerSecret: must start with S' });
  }
  try {
    const result = await issueAsset(issuerSecret, assetCode, amount, destinationPublicKey);
    res.json({ success: true, result });
  } catch (err) {
    console.error('Error in /stellar/issue-asset:', err);
    res.status(500).json({ error: err.message });
  }
});

// Demo account + token issuance
app.post('/stellar/demo-account-with-token', async (req, res) => {
  const { assetCode, amount } = req.body;
  const issuerSecret = process.env.ISSUER_SECRET;

  if (!issuerSecret || !issuerSecret.startsWith('S')) {
    return res.status(500).json({ error: 'ISSUER_SECRET not set or invalid in environment' });
  }

  try {
    // Create demo account
    const account = await createDemoAccount();

    // Issue token to the new account
    const issueResult = await issueAsset(issuerSecret, assetCode, amount, account.publicKey);

    res.json({
      success: true,
      account,
      issuedAsset: { assetCode, amount },
      transaction: issueResult
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
