const crypto = require('crypto');
const fs = require('fs');

function generateKeyFiles() {
  const keyPair = crypto.generateKeyPairSync('rsa', {
    modulusLength: 4096, // Recommended a length of 2048 or 4096 bits
    publicKeyEncoding: {
      type: 'spki', // spki for public key format
      format: 'pem' // pem format is standard for Node.js
    },
    privateKeyEncoding: {
      type: 'pkcs8', // pkcs8 for private key format
      format: 'pem',
      // Optional: Add cipher and passphrase to encrypt the private key file
      // cipher: 'aes-256-cbc', 
      // passphrase: 'your_secure_passphrase'
    }
  });

  // Save the keys to files
  fs.writeFileSync('public_key.pem', keyPair.publicKey);
  fs.writeFileSync('private_key.pem', keyPair.privateKey);

  console.log('Public and private keys generated and saved to files.');
}

generateKeyFiles();