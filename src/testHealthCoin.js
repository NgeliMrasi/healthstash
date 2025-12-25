import { createIssuerAccount } from "./stellar/createIssuer.js";
import { createWallet } from "./stellar/createWallet.js";
import { issueHealthCoin } from "./stellar/issueHealthCoin.js";
import {
  Horizon,
  Asset,
  TransactionBuilder,
  Operation,
  Networks,
  Keypair
} from "@stellar/stellar-sdk";

const server = new Horizon.Server("https://horizon-testnet.stellar.org");

(async () => {
  console.log("🚀 Creating Issuer...");
  const issuer = await createIssuerAccount();

  console.log("👛 Creating Wallet...");
  const wallet = await createWallet("EMPLOYEE");

  console.log("🔗 Adding Trustline...");
  const walletAccount = await server.loadAccount(wallet.publicKey);
  const walletKeypair = Keypair.fromSecret(wallet.secretKey);

  const healthCoin = new Asset("HEALTH", issuer.publicKey);

  const trustTx = new TransactionBuilder(walletAccount, {
    fee: "100",
    networkPassphrase: Networks.TESTNET
  })
    .addOperation(
      Operation.changeTrust({
        asset: healthCoin
      })
    )
    .setTimeout(30)
    .build();

  trustTx.sign(walletKeypair);
  await server.submitTransaction(trustTx);

  console.log("💊 Issuing HealthCoin...");
  const result = await issueHealthCoin({
    issuerSecret: issuer.secretKey,
    destinationPublicKey: wallet.publicKey,
    amount: "1000"
  });

  console.log("✅ HealthCoin Issued");
  console.log("🔗 Tx:", result._links.transaction.href);
})();
