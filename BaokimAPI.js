const axios = require('axios')
const GetToken = require('./gettoken')
const randomstring = require('randomstring')

const baseURL = 'https://api.baokim.vn/payment/'


// function getVATList(){

//   axios.get(baseURL + 'api/v4/vat/list', {
//   params : {
//     jwt : GetToken.generateToken()
//   }
//   })
//   .then(res => {
//     console.log(res.data.data);
//   })
//   .catch(error => {
//     console.log(error);
//   })
// }

let getVATList = function() {  
  return axios.get(baseURL + 'api/v4/vat/list' + '?jwt=' + GetToken.generateToken());
}

// getVATList().then((result) => {
//     console.log(result.data.data)
// }).catch((err) => {
//     console.log(err)
// });

function buyCard(isp,amount){

    var service_item_id = 0 ;
    switch(isp){
        case 'viettel' || 'VIETTEL':
            service_item_id = 1;
            break;
        case 'vinaphone' || 'VINA' || 'VINAPHONE':
            service_item_id = 2;
            break;
        case 'mobifone' || 'MOBI' || 'MOBIFONE' :
            service_item_id = 3;
            break;
    }

    let payload = {
        "mrc_order_id" : randomstring.generate(7),
        "service_item_id" : service_item_id,
        "amount" : amount
    }

    let respone = axios.post(baseURL + 'api/v4/vat/purchase' + '?jwt=' + GetToken.generateToken(payload),payload)

    return respone;
}

// buyCard('VINAPHONE',10000).then((result) => {
//     console.log(result.data)
//     console.log('PIN: ' + result.data.data.pin + '\nSeri: ' + result.data.data.seri);
// }).catch((err) => {
//     console.log(err)
// });

module.exports = {
    buyCard : buyCard,
    getVATList :getVATList
}

