let dataURL = '';
let url = 'http://tl.cyg.changyou.com/transaction/captcha-image?goods_serial_num=20210121201305964&amp;t=1611771813300';

getBase64(url, getDataURL_downloadFiles);

//把图片转为Base64编码形式
function getBase64(url, callback) {
    let Img = new Image();
    Img.src = url;
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
        callback ? callback(dataURL) : null; //调用回调函数
    };
}

//getBase64()方法的回调函数让全局变量dataURL有值
function getDataURL_downloadFiles(toDataURL) {
    dataURL = toDataURL;
    this.downloadFiles(dataURL);
}

// 下载
function downloadFiles(content) {
    const downloadElement = document.createElement('a')  // 创建下载的链接
    let blob = this.base64ToBlob(content) // new Blob([content]);
    const href = window.URL.createObjectURL(blob)
    downloadElement.href = href
    downloadElement.download = '测试的下载图片.jpg'  // 下载后的文件名
    document.body.appendChild(downloadElement)
    downloadElement.click() // 下载
    document.body.removeChild(downloadElement) // 下载完成 移除 a
    window.URL.revokeObjectURL(href) // 释放blob对象
}

// base64转blob
function base64ToBlob(code) {
    let parts = code.split(';base64,')
    let contentType = parts[0].split(':')[1]
    let raw = window.atob(parts[1])
    let rawLength = raw.length
    let uInt8Array = new Uint8Array(rawLength)
    for (let i = 0; i < rawLength; ++i) {
        uInt8Array[i] = raw.charCodeAt(i)
    }
    return new Blob([uInt8Array], {type: contentType})
}