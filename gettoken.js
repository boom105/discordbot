const jwt = require('jsonwebtoken')
const dotenv = require('dotenv')
dotenv.config()

const API_KEY = process.env.API_KEY;
const API_SECRET = process.env.API_SECRET;
const TOKEN_EXPIRE = '60s';
const ENCODE_ALG = 'HS256';

function generateToken(payload){
  var token = jwt.sign(
    {"form_params" : payload},
    API_SECRET,
    {
      issuer : API_KEY,
      expiresIn : TOKEN_EXPIRE,
      algorithm : ENCODE_ALG
    }
  )

  return token;
}


module.exports = {
    generateToken : generateToken,
    refreshToken : generateToken
}






