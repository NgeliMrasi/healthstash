import { createIssuerAccount } from "../stellar/createIssuer.js";

(async () => {
  console.log("🚀 Creating Test Issuer...");
  const issuer = await createIssuerAccount();
  console.log("👛 Issuer Created:", issuer);
})();
