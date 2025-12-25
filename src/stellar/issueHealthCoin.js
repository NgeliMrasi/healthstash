import pkg from '@stellar/stellar-sdk';
const { Server, Keypair, TransactionBuilder, Operation, Asset, Networks } = pkg;
import fetch from '../utils/fetchWrapper.js';

const server = new Server("https://horizon-testnet.stellar.org");

export async function issueHealthCoin(issuerSecret, recipientPublic, amount = "1000") {
  const issuerKeypair = Keypair.fromSecret(issuerSecret);
  const issuerAccount = await server.loadAccount(issuerKeypair.publicKey());

  const healthCoin = new Asset("HealthCoin", issuerKeypair.publicKey());

  const transaction = new TransactionBuilder(issuerAccount, {
    fee: await server.fetchBaseFee(),
    networkPassphrase: Networks.TESTNET
  })
    .addOperation(Operation.payment({
      destination: recipientPublic,
      asset: healthCoin,
      amount: amount
    }))
    .setTimeout(30)
    .build();

  transaction.sign(issuerKeypair);
  const txResult = await server.submitTransaction(transaction);

  return {
    asset: healthCoin,
    txResult
  };
}
