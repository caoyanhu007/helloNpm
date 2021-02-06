const puppeteer = require('puppeteer');
const fs = require('fs');
const axios = require('axios').default;
const apiUrl = 'http://api.ttshitu.com/base64';
const username = 'caoyanhu007';
const password = '1qaz2wsx';
(async () => {
    let date1 = 0, date2 = 0;
    let options = {
        //timeout: 0,//等待 Chrome 实例启动的最长时间。默认为30000（30秒）。如果传入 0 的话则不限制时间
        //headless: false,
        // defaultViewport: {
        //     width: 1920,
        //     height: 1080
        // },
        executablePath: 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
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
            waitUntil: "domcontentloaded"
        });
        let elements = await page.$$('.btn-buy');
        if (elements.length !== 0) {
            date1 = new Date().getTime();
            await elements[0].click();
            console.log('立即购买!');
            await page.evaluate(() => {
                let dataURL = '';
                //通过构造函数来创建的 img 实例，在赋予 src 值后就会立刻下载图片，相比 createElement() 创建 <img> 省去了 append()，也就避免了文档冗余和污染
                let Img = new Image();
                Img.src = document.getElementById("J_attackCode").getAttribute("src");
                Img.crossOrigin = 'Anonymous';//跨域
                Img.onload = function () { //要先确保图片完整获取到，这是个异步事件
                    let canvas = document.createElement("canvas"), //创建canvas元素
                        width = Img.width, //确保canvas的尺寸和图片一样
                        height = Img.height;
                    canvas.width = Img.width;
                    canvas.height = Img.height;
                    canvas.getContext("2d").drawImage(Img, 0, 0, width, height); //将图片绘制到canvas中
                    dataURL = canvas.toDataURL('image/jpeg',1); //转换图片为dataURL,图片质量取值0-1之间,默认0.92
                    let img = document.createElement('img');
                    img.setAttribute('id', 'dataURL_image');
                    img.setAttribute('src', dataURL);
                    document.body.appendChild(img);
                };
            });

            await getImageDataURL();

            async function getImageDataURL() {
                let image = await page.$$('#dataURL_image');
                if (image.length !== 0) {
                    let dataURL = await page.$eval('#dataURL_image', element => element.getAttribute("src"));
                    let base64data = dataURL.toString().split(';base64,')[1];
                    console.log('base64data = ' + base64data);
                    axios.post(apiUrl, {
                        'username': username,
                        'password': password,
                        'typeid': '3',
                        'image': base64data
                    }).then(async function (response) {
                        let d = response.data;
                        if (d.success) {
                            let {id, result} = d.data;
                            console.log(id + '验证码是 :' + result);
                            let inputElement = await page.$('#J_attackCodeVal');
                            await inputElement.focus();
                            await page.keyboard.type(result);
                            let BtnElement = await page.$('.ui-xbox .ui-button-text');
                            await BtnElement.click();
                            date2 = new Date().getTime();
                            console.log(date1);
                            console.log(date2);
                            console.log('抢购完成耗时:' + (date2 - date1) / 1000 + '秒!');
                            //await browser.close();
                        } else {
                            console.log(d.message);
                        }
                    });

                } else {
                    console.log('未获取到拼接图片,继续获取!')
                    await getImageDataURL();
                }
            }
        } else {
            console.log('未检索到立即购买按钮==>重新刷新页面!');
            await re_load();
        }
    }
})()


