const StellarSdk = require('stellar-sdk');
const { Keypair, Asset, Operation, TransactionBuilder, Networks, BASE_FEE } = StellarSdk;
const server = new StellarSdk.Horizon.Server(process.env.HORIZON_URL);

async function ensureTrustline(holderPub, holderSec, code, issuerPub) {
  const acct = await server.loadAccount(holderPub);
  const a = new Asset(code, issuerPub);
  const tx = new TransactionBuilder(acct, { fee: BASE_FEE, networkPassphrase: Networks.TESTNET })
    .addOperation(Operation.changeTrust({ asset: a }))
    .setTimeout(30).build();
  tx.sign(Keypair.fromSecret(holderSec));
  return server.submitTransaction(tx);
}

async function payment(senderPub, senderSec, destPub, code, issuerPub, amount, memoText) {
  const senderAcct = await server.loadAccount(senderPub);
  const a = new Asset(code, issuerPub);
  const txBuilder = new TransactionBuilder(senderAcct, { fee: BASE_FEE, networkPassphrase: Networks.TESTNET })
    .addOperation(Operation.payment({ destination: destPub, asset: a, amount: String(amount) }))
    .setTimeout(30);
  if (memoText) txBuilder.addMemo(StellarSdk.Memo.text(memoText));
  const tx = txBuilder.build();
  tx.sign(Keypair.fromSecret(senderSec));
  return server.submitTransaction(tx);
}

module.exports = { ensureTrustline, payment };
