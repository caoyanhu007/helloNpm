const puppeteer = require('puppeteer');
const fs = require('fs');
(async () => {
    let options = {
        //ignoreHTTPSErrors:true,//是否在导航期间忽略 HTTPS 错误. 默认是 false。
        //timeout: 0,//等待 Chrome 实例启动的最长时间。默认为30000（30秒）。如果传入 0 的话则不限制时间
        //headless: false,
        // defaultViewport: {
        //     width: 1920,
        //     height: 1080
        // },
        //executablePath: 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
        //slowMo: 50
    };
    const browser = await puppeteer.launch(options);
    const page = await browser.newPage();
    let cookies = fs.readFileSync('cookie.txt', 'utf-8');
    cookies = JSON.parse(cookies);
    console.log('cookies.length : ' + cookies.length);
    await page.setCookie(...cookies);
    let url = fs.readFileSync('path.txt', 'utf-8');
    await page.goto(url);
    let sed = await page.$eval('.less-than-day', element => element.getAttribute("data-second"));
    console.log('公示剩余:' + sed + '秒...');
    setTimeout(re_load, sed * 1000);

    async function re_load() {
        await page.reload({
            //timeout: 60 * 1000,
            //waitUntil: "domcontentloaded"
        });
        //let elements = await page.$$('.btn-buy');
        let buySubmitElement = await page.$('#buySubmit').catch((err) => {
            console.log(err);
        });
        if (buySubmitElement !== null) {
            await page.evaluate(() => {
                function codeImageCheck() {
                    //let date1 = new Date().getTime();
                    document.getElementById('buySubmit').click();
                    //console.log('立即购买!');
                    let dataURL = '';
                    //通过构造函数来创建的 img 实例，在赋予 src 值后就会立刻下载图片，相比 createElement() 创建 <img> 省去了 append()，也就避免了文档冗余和污染
                    let Img = new Image();
                    Img.src = document.getElementById("J_attackCode").getAttribute("src");
                    //Img.crossOrigin = 'Anonymous';//跨域
                    Img.onload = function () { //要先确保图片完整获取到，这是个异步事件
                        let canvas = document.createElement("canvas"), //创建canvas元素
                            width = Img.width, //确保canvas的尺寸和图片一样
                            height = Img.height;
                        canvas.width = Img.width;
                        canvas.height = Img.height;
                        canvas.getContext("2d").drawImage(Img, 0, 0, width, height); //将图片绘制到canvas中
                        dataURL = canvas.toDataURL('image/jpeg', 1); //转换图片为dataURL,图片质量取值0-1之间,默认0.92
                        let apiUrl = 'http://api.ttshitu.com/base64';
                        let username = 'caoyanhu007';
                        let password = '1qaz2wsx';
                        let typeid = '3';
                        let image = dataURL.split(';base64,')[1];
                        let Ajax = {
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
                        Ajax.post(apiUrl, 'username=' + username + '&password=' + password + '&typeid=' + typeid + '&image=' + image, (res) => {
                            //console.log(JSON.parse(res).data.result);
                            let inputEle = document.getElementById('J_attackCodeVal');
                            inputEle.value = JSON.parse(res).data.result;//输入框填入验证码
                            let aEles = document.getElementsByClassName('btn-normal ui-btn-normal ui-btn-large');
                            aEles[0].click();

                            //let date2 = new Date().getTime();
                            //console.log('抢购完成耗时:' + (date2 - date1) / 1000 + '秒!');
                            // setTimeout(function () {
                            //     let ps = document.getElementsByClassName('dialog-text');
                            //     if (ps.length > 0 && ps[0].innerHTML.includes('验证码错误')) {
                            //         //console.log('验证码错误，请重新输入。');
                            //         document.getElementsByClassName('span ui-button-text')[0].click();
                            //         codeImageCheck();//验证码错误,重新验证!
                            //     }
                            // }, 1000);

                            //await browser.close();
                        });
                    };
                }
                codeImageCheck();
            });
        } else {
            //console.log('重刷页面!');
            await re_load();
        }
    }
})()


