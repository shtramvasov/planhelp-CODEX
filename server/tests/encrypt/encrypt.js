const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Function to encrypt string using the public key
function encryptString(plaintext, publicKeyFile) {
  const publicKey = fs.readFileSync(path.join(__dirname, publicKeyFile), 'utf8');
  // publicEncrypt() method with its parameters
  const encrypted = crypto.publicEncrypt(
    {
      key: publicKey,
      padding: crypto.constants.RSA_PKCS1_PADDING, // Common padding
    },
    Buffer.from(plaintext)
  );
  return encrypted.toString('base64'); // Return as base64 string for storage/transmission
}

// --- Example Usage ---
const plainText = "Супер секрет еба !!! !@#$%^&*(";

// Encrypt the text using the public key
const encrypted = encryptString(plainText, 'public_key.pem');
console.log("Plaintext:", plainText);
console.log();
console.log("Encrypted Text (base64): ", encrypted);
console.log();
