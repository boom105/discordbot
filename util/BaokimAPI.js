const axios = require('axios');
const randomstring = require('randomstring');
const jwt = require('jsonwebtoken');
require('dotenv').config();


const API_KEY = process.env.API_KEY;
const API_SECRET = process.env.API_SECRET;
const TOKEN_EXPIRE = '60s';
const ENCODE_ALG = 'HS256';

const baseURL = 'https://api.baokim.vn/payment/';

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

let getVATList = function() {  
  return axios.get(baseURL + 'api/v4/vat/list' + '?jwt=' + generateToken());
}


function getBalance(){
    return axios.get(baseURL + 'api/v4/account/detail' + '?jwt=' + generateToken());
}

function buyCard(isp,amount){

    var service_item_id = 0 ;
    switch(isp){
        case 'viettel':
            service_item_id = 1;
            break;
        case  'vina' :
            service_item_id = 2;
            break;
        case 'mobi' :
            service_item_id = 3;
            break;
    }

    let payload = {
        "mrc_order_id" : randomstring.generate(7),
        "service_item_id" : service_item_id,
        "amount" : amount
    }

    let respone = axios.post(baseURL + 'api/v4/vat/purchase' + '?jwt=' + generateToken(payload),payload);

    return respone;
}


module.exports = {
    buyCard : buyCard,
    getVATList : getVATList,
    getBalance : getBalance
}

