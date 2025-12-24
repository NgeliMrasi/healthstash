// src/app.js

require('dotenv').config();
const express = require('express');
const { createDemoAccount } = require('./services/assets');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (_req, res) => {
  res.json({ status: 'HealthStash API running' });
});

app.get('/stellar/demo-account', async (_req, res) => {
  try {
    const account = await createDemoAccount();
    res.json(account);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`HealthStash API listening on port ${PORT}`);
});
