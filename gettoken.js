const jwt = require('jsonwebtoken')
const dotenv = require('dotenv')
dotenv.config()

const API_KEY = "dc4b94d5728b4fdcb05558d441820397";
const API_SECRET = "91cb5278ac52438981499b689f4eeac4";
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






