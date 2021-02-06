const puppeteer = require('puppeteer');
const fs = require('fs');
(async () => {
    let options = {
        ignoreHTTPSErrors: true,//是否在导航期间忽略 HTTPS 错误. 默认是 false。
        timeout: 0,//等待 Chrome 实例启动的最长时间。默认为30000（30秒）。如果传入 0 的话则不限制时间
        headless: false,
        defaultViewport: {
            width: 1920,
            height: 1080,
        },
        executablePath: 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
        //slowMo: 50
    };
    const browser = await puppeteer.launch(options);
    const page = await browser.newPage();
    await page.setViewport({
        width: 1600,
        height: 1200
    });
    let cookies = fs.readFileSync('cookie.txt', 'utf-8');
    cookies = JSON.parse(cookies);
    console.log('cookies.length : ' + cookies.length);
    await page.setCookie(...cookies);
    let url = fs.readFileSync('path.txt', 'utf-8');
    let serial_num = url.split('=')[1];
    await page.goto(url);
    await page.evaluate((_url, _serial_num) => {
        let Ajax = {
            getImage: function (url, fn) {
                let xhr = new XMLHttpRequest();
                xhr.open('GET', url, true);
                xhr.responseType = "blob";
                xhr.onreadystatechange = function () {
                    if (xhr.readyState === 4 && xhr.status === 200 || xhr.status === 304) {
                        fn.call(this, xhr.response);
                    }
                };
                xhr.send();
            },
            get: function (url, fn) {
                let xhr = new XMLHttpRequest();
                xhr.open('GET', url, true);
                xhr.responseType = 'document';
                xhr.onreadystatechange = function () {
                    if (xhr.readyState === 4 && xhr.status === 200 || xhr.status === 304) {
                        fn.call(this, xhr.responseXML);
                    }
                };
                xhr.send();
            },
            post: function (url, data, fn) {
                let xhr = new XMLHttpRequest();
                xhr.open("POST", url, true);
                xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
                xhr.onreadystatechange = function () {
                    if (xhr.readyState === 4 && (xhr.status === 200 || xhr.status === 304)) {
                        fn.call(this, xhr.responseText);
                    }
                };
                xhr.send(data);
            }
        }
        Ajax.get(_url, (res) => {
            let sed = res.getElementsByClassName('less-than-day')[0].getAttribute('data-second');
            let times = setInterval(() => {
                console.log('剩余' + --sed + '秒');
                if (Number(sed) === 0) {
                    clearInterval(times);
                    let flag = setInterval(() => {
                        Ajax.get(_url, (res) => {
                            if (res.getElementsByClassName('btn-buy').length !== 0) {
                                clearInterval(flag);
                                let timeStamp = new Date().getTime();
                                let imageCodeUrl = 'http://tl.cyg.changyou.com/transaction/captcha-image?goods_serial_num=' + _serial_num + '&t=' + timeStamp;
                                Ajax.getImage(imageCodeUrl, (res) => {
                                    let reader = new FileReader();
                                    reader.readAsDataURL(res);
                                    reader.onload = function (e) {
                                        let src = e.target.result;
                                        let apiUrl = 'http://api.ttshitu.com/base64';
                                        let username = 'caoyanhu007';
                                        let password = '1qaz2wsx';
                                        let typeid = '3';
                                        let image = src.split(';base64,')[1];
                                        Ajax.post(apiUrl, 'username=' + username + '&password=' + password + '&typeid=' + typeid + '&image=' + image, (res) => {
                                            let imageCode = JSON.parse(res).data.result;
                                            Ajax.post('http://tl.cyg.changyou.com/transaction/buy', 'goods_serial_num=' + _serial_num + '&captcha_code=' + imageCode, (res) => {
                                                console.log(res);
                                            });
                                            //await browser.close();
                                        });
                                    }
                                });
                            }
                        });
                    }, 200);
                }
            }, 1000);
        });
    }, url, serial_num)
})()


