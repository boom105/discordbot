const API = require('./BaokimAPI')

API.getBalance().then((result) => {
    console.log(result.data.data.balance);
}).catch((err) => {
    console.log(err);
})