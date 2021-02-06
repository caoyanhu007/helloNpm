let sed =10;
let times = setInterval(() => {
    console.log('剩余' + --sed + '秒');
    if (Number(sed) === 0) {
        clearInterval(times);
    }
}, 1000);