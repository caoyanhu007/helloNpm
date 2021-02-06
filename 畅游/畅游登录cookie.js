const puppeteer = require('puppeteer');
const fs = require('fs');
(async () => {

    let options = {
        timeout: 0,//等待 Chrome 实例启动的最长时间。默认为30000（30秒）。如果传入 0 的话则不限制时间
        headless: false,
        defaultViewport: {
            width: 1600,
            height: 1200
        },
        executablePath: 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe'
    };

    const browser = await puppeteer.launch(options);
    const page = await browser.newPage();
    await page.setViewport({
        width: 1600,
        height: 1200
    });
    //登录路径
    const loginUrl = 'https://cygsso.changyou.com/loginpage?s=http://tl.cyg.changyou.com/ticketValidation';
    await page.goto(loginUrl, {
        timeout: 0,
        waitUntil: 'networkidle0'//不再有网络连接时触发（至少500毫秒后）
    });

    const cookies = await page.cookies();

    cookies.forEach(cookie => {
        console.log(cookie['value']);
    });

    const ws = fs.createWriteStream('cookie.txt', {flags: 'w', encoding: 'utf-8'});

    ws.on('open', function () {
        console.log('cookie写入文件打开!');
    })

    ws.on('ready', function () {
        console.log('文件写入准备状态中!');
    })

    ws.on('close', function () {
        console.log('文件写入完成,关闭!');
    })

    //JSON.stringify(cookies) 将json对象转换成json对符串
    ws.write(JSON.stringify(cookies), function (err) {
        if (err) {
            console.log(err);
        } else {
            console.log('cookies流入完成!')
        }
    })

    ws.end(function () {
        console.log('流完成,结束!');
    })

    await browser.close();

})()


