// test-hash.ts
const nodeCrypto = require("crypto") as typeof import("crypto");

const baseString = "m_payment_id=gNYxRKyqfbyeZ9JW3K5J&pf_payment_id=2447055&payment_status=COMPLETE&item_name=Pocket+Agency+Basic+Subscription&item_description=&amount_gross=199.00&amount_fee=-4.58&amount_net=194.42&custom_str1=F2JhuXXHC5X63Y5MtR6PNYRKerD3&custom_str2=&custom_str3=&custom_str4=&custom_str5=&custom_int1=&custom_int2=&custom_int3=&custom_int4=&custom_int5=&name_first=Pocket+Agency&name_last=Subscription&email_address=billing%40yourwebsite.com&merchant_id=10037398&token=d64e76d0-0811-4c31-8e16-7b0926478256&billing_date=2025-03-12";
const testString = `${baseString}&passphrase=Ru1j3ssale77-77`; // No encoding
const hash = nodeCrypto
  .createHash("md5")
  .update(testString, "utf8")
  .digest("hex")
  .toLowerCase();

console.log("Test hash (with passphrase, no encoding):", hash);
console.log("Expected hash:", "9afe2f590ac1b342f765b676c7a3d7fa");
console.log("String length (with passphrase):", testString.length);
console.log("Base string length:", baseString.length);