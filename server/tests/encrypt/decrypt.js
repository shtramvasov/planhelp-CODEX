const crypto = require('crypto');
const fs = require('fs');
const path = require('path');


function decryptString(ciphertext, privateKeyFile) {
    const privateKey = fs.readFileSync(path.join(__dirname, privateKeyFile), 'utf8');
    // privateDecrypt() method with its parameters
    const decrypted = crypto.privateDecrypt(
      {
        key: privateKey,
        padding: crypto.constants.RSA_PKCS1_PADDING, // Must use the same padding as encryption
        passphrase: '', // Optional: if your private key is passphrase-protected
      },
      Buffer.from(ciphertext, 'base64') // Convert from base64 string back to buffer
    );
    return decrypted.toString('utf8');
  }

const decrypted = decryptString("MAzmWYPeM8KdIurzfRRmM+EmLmwJAO1BJxCTl7WNBTy0DFTEOJmphIwYWB9o30/CDRYqoQBTuRYgWFZ9RQy8hP6LdU5uM9z6ROeFsnOKZQkGMdSrw4MDVK1RbwjKW+9ianluvknqCJ6FEeJkfwyibarJSsNZnyohRUmztQIKdoqg2vJ0vkkNzs4U2lhqhoyIqd4qScbivRgWWXS7VH+6CE4q/WvrUNK0f4w4zxP7qzT3+MN/HHAClluVxeXSab/Yz8L3hOQVPerdIAzZQfG6qrk3Mqp64w+Kt5sNub+teJb/FROOsmd8xOBYmTX5hKux6YDIM8zpZBpguV5rDEEwmI4wVACHbh3u6aZR7vVOaUyv6UEUe88gqTNbzp5fKFUmsJFSFmXbfZekmOM1IvRIxplsNVoG+FNbjT2ECZOh88Jjx+Gw0XVIrEvk8DXbH37dzDto7ccDlUGnD+F3zKLsXP3/IVX+o/gHmyxnNoVyYiWQJvAHo0CQeBMl8pNnaP562yVREWFB3VnBRJlnbgilxHkkuWUsNw6zAupsT+Ys3WiHZ27aY3k8w41FDWBQ9RnTeRt3X8vGKfxvs2PTdU7yXVOrmBoJ8qONTUY/3Y906ARtXB3pdQTb9BMGv5nwJev86v95mDHAjVHvc+sl2z7KIgMfrSprY8Tqqm785pjohf0=", 'private_key.pem');
console.log("Decrypted Text:", decrypted);