
function generateText(count,num,amount)
{
    var text = '';
    switch(count)
    {
        case 1: {
            text += 'Lô: ' + num + '-' + amount + ' points' + ' : trúng 01 nháy\n' +
                    'Bạn được cộng ' + amount*3 + ' points vào quỹ điểm\n';
            break;
        }
        case 2: {
            text += 'Lô: ' + num + '-' + amount + ' points' + ' : trúng 02 nháy\n' +
                    'Bạn được cộng ' + amount*10 + ' points vào quỹ điểm\n';
            break;
        }
        case 3: {
            text += 'Lô: ' + num + '-' + amount + ' points' + ' : trúng 03 nháy\n' +
                    'Bạn được cộng ' + amount*40 + ' points vào quỹ điểm\n';
            break;
        }
        case 4: {
            text += 'Lô: ' + num + '-' + amount + ' points' + ' : trúng 04 nháy\n' +
                    'Bạn được cộng ' + amount*100 + ' points vào quỹ điểm\n';
            break;
        }
        case 5: {
            text += 'Lô: ' + num + '-' + amount + ' points' + ' : trúng 05 nháy\n' +
                    'Bạn được cộng ' + amount*200 + ' points vào quỹ điểm\n';
            break;
        }
        case 6: {
            text += 'Lô: ' + num + '-' + amount + ' points' + ' : trúng 06 nháy\n' +
                    'Bạn được cộng ' + amount*400 + ' points vào quỹ điểm\n';
            break;
        }
        default:{
            text += 'Về quá nhiều nháy, nhờ admin cộng point thủ công đi!'
        }
    }

    return text;
}

function generateValue(count,amount)
{
    var val = 0;
    switch(count)
    {
        case 1:{
            val = 3 * amount;
            break;
        }
        case 2:{
            val = 10 * amount;
            break;
        }
        case 3:{
            val = 40 * amount;
            break;
        }
        case 4:{
            val = 100 * amount;
            break;
        }
        case 5:{
            val = 200 * amount;
            break;
        }
        case 6:{
            val = 400 * amount;
            break;
        }

    } 

    return val;
}

module.exports = {
    generateText : generateText,
    generateValue : generateValue
}