// src/routes/stellar.js

const express = require('express');
const router = express.Router();
const {
  getAccountBalances,
  createAccount,
  sendPayment,
  trustAsset
} = require('../services/stellar');

// GET balances for an account
router.get('/balances/:accountId', async (req, res) => {
  try {
    const balances = await getAccountBalances(req.params.accountId);
    res.json({ accountId: req.params.accountId, balances });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load balances', details: err.message });
  }
});

// POST create a new account (testnet Friendbot)
router.post('/create', async (req, res) => {
  try {
    const { secretKey } = req.body;
    const result = await createAccount(secretKey);
    res.json({ message: 'Account created', result });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create account', details: err.message });
  }
});

// POST send a payment
router.post('/pay', async (req, res) => {
  try {
    const { sourceSecret, destinationPublic, amount, asset } = req.body;
    const result = await sendPayment(sourceSecret, destinationPublic, amount, asset);
    res.json({ message: 'Payment sent', result });
  } catch (err) {
    res.status(500).json({ error: 'Payment failed', details: err.message });
  }
});

// POST add a trustline
router.post('/trust', async (req, res) => {
  try {
    const { secretKey, assetCode, issuer } = req.body;
    const result = await trustAsset(secretKey, assetCode, issuer);
    res.json({ message: 'Trustline added', result });
  } catch (err) {
    res.status(500).json({ error: 'Trustline failed', details: err.message });
  }
});

module.exports = router;
