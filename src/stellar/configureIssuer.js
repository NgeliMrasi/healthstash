import StellarSdk from "@stellar/stellar-sdk";

const server = new StellarSdk.Horizon.Server(
  "https://horizon-testnet.stellar.org"
);

export async function configureIssuer(issuerSecret) {
  const issuerKeypair = StellarSdk.Keypair.fromSecret(issuerSecret);
  const account = await server.loadAccount(issuerKeypair.publicKey());

  const tx = new StellarSdk.TransactionBuilder(account, {
    fee: StellarSdk.BASE_FEE,
    networkPassphrase: StellarSdk.Networks.TESTNET,
  })
    .addOperation(
      StellarSdk.Operation.setOptions({
        setFlags: StellarSdk.AuthRequiredFlag,
      })
    )
    .setTimeout(30)
    .build();

  tx.sign(issuerKeypair);
  await server.submitTransaction(tx);

  console.log("🔒 Issuer configured: AUTHORIZATION REQUIRED");
}
