
let str = '!challenge @bomm     100000';
let arr = str.match(/\S+/g);
for(i = 0; i < arr.length; i++){
    console.log(i + ' ' + arr[i]);
}