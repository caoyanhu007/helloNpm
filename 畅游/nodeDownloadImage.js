const fs = require('fs');
const request = require('request')


let ws = fs.createWriteStream('image.jpg', {encoding: 'utf-8'});
let resBuff = request('http://tl.cyg.changyou.com/transaction/captcha-image?goods_serial_num=20210118507458306&amp;t=1611523411599');
resBuff.pipe(ws);