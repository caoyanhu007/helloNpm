const puppeteer = require('puppeteer');
const fs = require('fs');
const axios = require('axios').default;
const apiUrl = 'http://api.ttshitu.com/base64';
const username = 'caoyanhu007';
const password = '1qaz2wsx';
let imagePath = 'C:/Users/caoyanhu007/Downloads/image.jpg';
(async () => {
    let options = {
        timeout: 0,//等待 Chrome 实例启动的最长时间。默认为30000（30秒）。如果传入 0 的话则不限制时间
        headless: false,
        defaultViewport: {
            width: 1920,
            height: 1080
        },
        executablePath: 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
        //slowMo: 50
    };
    const browser = await puppeteer.launch(options);
    const page = await browser.newPage();
    await page.setViewport({
        width: 1200,
        height: 900
    });
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
            timeout: 60 * 1000,
            waitUntil: "domcontentloaded"
        });
        let elements = await page.$$('.btn-buy');
        if (elements.length !== 0) {
            await elements[0].click();
            console.log('已检索到立即购买按钮==>触发点击!');
            await page.evaluate(() => {
                //通过构造函数来创建的 img 实例，在赋予 src 值后就会立刻下载图片，相比 createElement() 创建 <img> 省去了 append()，也就避免了文档冗余和污染
                let Img = new Image();
                let dataURL = '';
                Img.src = document.getElementById("J_attackCode").getAttribute("src");
                Img.crossOrigin = 'Anonymous';//跨域
                Img.onload = function () { //要先确保图片完整获取到，这是个异步事件
                    let canvas = document.createElement("canvas"), //创建canvas元素
                        width = Img.width, //确保canvas的尺寸和图片一样
                        height = Img.height;
                    canvas.width = Img.width;
                    canvas.height = Img.height;
                    canvas.getContext("2d").drawImage(Img, 0, 0, width, height); //将图片绘制到canvas中
                    dataURL = canvas.toDataURL('image/jpeg'); //转换图片为dataURL
                    console.log('dataURL : ' + dataURL);
                    const downloadElement = document.createElement('a');  // 创建下载的链接
                    let parts = dataURL.split(';base64,');
                    let contentType = parts[0].split(':')[1];
                    let raw = window.atob(parts[1]);
                    let rawLength = raw.length;
                    let uInt8Array = new Uint8Array(rawLength);
                    for (let i = 0; i < rawLength; ++i) {
                        uInt8Array[i] = raw.charCodeAt(i);
                    }
                    let blob = new Blob([uInt8Array], {type: contentType}) // new Blob([content]);
                    const href = window.URL.createObjectURL(blob);
                    downloadElement.href = href;
                    //let time = new Date().getTime();
                    downloadElement.download = 'image.jpg';// 下载后的文件名
                    document.body.appendChild(downloadElement);
                    downloadElement.click();// 下载
                    document.body.removeChild(downloadElement);// 下载完成 移除 a
                    window.URL.revokeObjectURL(href);// 释放blob对象
                    console.log("验证码图片下载完成!");
                };
            });
            console.log('*******************');
            disposeCodeImageAndCommit(imagePath);//识别处理验证码并提交

        } else {
            console.log('未检索到立即购买按钮==>重新刷新页面!');
            await re_load();
        }
    }

    function disposeCodeImageAndCommit(imagePath) {
        // 检查文件是否存在于当前目录中。
        fs.access(imagePath, fs.constants.F_OK, (err) => {
            try {
                let buff = fs.readFileSync(imagePath);
                let base64data = buff.toString('base64');
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
                        console.log('抢购完成!');
                    } else {
                        console.log(d.message);
                    }
                });
            } catch (e) {
                if (err) {
                    console.log('验证码图片不存在!');
                }
                disposeCodeImageAndCommit(imagePath);
            }
        });

    }

    // await browser.close();

})()


