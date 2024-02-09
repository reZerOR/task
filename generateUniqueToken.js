const crypto = require('crypto');

function generateUniqueToken(length = 32) {
  return crypto.randomBytes(length).toString('hex');
}

// Example usage
// const token = generateUniqueToken();
// console.log('Generated Token:', token);

const jwt = require('jsonwebtoken');

function validateAndExtractEmailFromToken(token, secretKey) {
  try {
    // Verify the token using the provided secret key
    jwt.verify(token, secretKey);
    return true; // Token is valid
  } catch (error) {
    return false; // Token is invalid
  }
}

module.exports = { generateUniqueToken,validateAndExtractEmailFromToken
}