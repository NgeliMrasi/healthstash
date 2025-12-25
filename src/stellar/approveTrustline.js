import StellarSdk from "@stellar/stellar-sdk";

const server = new StellarSdk.Horizon.Server(
  "https://horizon-testnet.stellar.org"
);

export async function approveTrustline({
  issuerSecret,
  trustorPublicKey,
  assetCode = "HEALTH",
}) {
  const issuerKeypair = StellarSdk.Keypair.fromSecret(issuerSecret);
  const issuerAccount = await server.loadAccount(
    issuerKeypair.publicKey()
  );

  const asset = new StellarSdk.Asset(
    assetCode,
    issuerKeypair.publicKey()
  );

  const tx = new StellarSdk.TransactionBuilder(issuerAccount, {
    fee: StellarSdk.BASE_FEE,
    networkPassphrase: StellarSdk.Networks.TESTNET,
  })
    .addOperation(
      StellarSdk.Operation.allowTrust({
        trustor: trustorPublicKey,
        assetCode: asset.getCode(),
        authorize: true,
      })
    )
    .setTimeout(30)
    .build();

  tx.sign(issuerKeypair);
  await server.submitTransaction(tx);

  console.log(`✅ Trustline approved for ${trustorPublicKey}`);
}
