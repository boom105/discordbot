
const {DateTime} = require('luxon');

var dt = DateTime.local();

function checkTime(){
    return (dt.hour > 8 && dt.hour < 18) ? true : false;
  }

console.log(checkTime());