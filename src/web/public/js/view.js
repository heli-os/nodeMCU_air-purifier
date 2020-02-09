const leadingZeros = (n, digits) => {
    let zero = '';
    n = n.toString();

    if (n.length < digits) {
        for (let i = 0; i < digits - n.length; i++)
            zero += '0';
    }
    return zero + n;
};
let ctx;
let myChart;
let chartOptions;
const getDeviceID = () => {
    let deviceID = null;
    $.ajax({
        type: 'get',
        url: '/device/getID',
        async: false
    }).done((result) => {
        deviceID = result;
    });
    return deviceID;
};

const readDeviceSetting = () => {
    const deviceID = getDeviceID();
    if (!deviceID) {
        console.log('exit');
        return;
    }
    let delayObj = {
        delayUpload: 0,
        delayDownload: 0
    };
    $.ajax({
        type: 'post',
        url: '/device/setting/download',
        data: {device: deviceID},
        dataType: 'json',
        async: false
    }).done((result) => {
        const record = result.data;
        delayObj.delayUpload = record.delayUpload;
        delayObj.delayDownload = record.delayDownload;
    });
    return delayObj;
};

const convertStepToMsg = (step) => {
    let msg = '';
    switch(step) {
        case 0:
            msg = '최고';
            break;
        case 1:
            msg = '좋음';
            break;
        case 2:
            msg = '양호';
            break;
        case 3:
            msg = '보통';
            break;
        case 4:
            msg = '나쁨';
            break;
        case 5:
            msg = '상당히 나쁨';
            break;
        case 6:
            msg = '매우 나쁨';
            break;
        case 7:
            msg = '최악';
            break;
    }
    return msg;
};

const setStepClass = (pm_step) => {
    const pm1_0_step = pm_step.pm1_0_step
    const pm2_5_step = pm_step.pm2_5_step;
    const pm10_0_step = pm_step.pm10_0_step;

    const pm10_0_section = $('.pm_section .card:nth-child(1)');
    const pm2_5_section = $('.pm_section .card:nth-child(2)');
    const pm1_0_section = $('.pm_section .card:nth-child(3)');

    pm1_0_section.removeClass();
    pm2_5_section.removeClass();
    pm10_0_section.removeClass();

    pm1_0_section.addClass('card color-step' + pm1_0_step);
    pm2_5_section.addClass('card color-step' + pm2_5_step);
    pm10_0_section.addClass('card color-step' + pm10_0_step);

    pm1_0_section.children('.card-block').children('div').text(convertStepToMsg(pm1_0_step));
    pm2_5_section.children('.card-block').children('div').text(convertStepToMsg(pm2_5_step));
    pm10_0_section.children('.card-block').children('div').text(convertStepToMsg(pm10_0_step));
};

const readDeviceData = (callback) => {
    const deviceID = getDeviceID();
    if (!deviceID) {
        console.log('exit');
        return;
    }
    $.ajax({
        type: 'post',
        url: '/device/data/download',
        data: {device: deviceID},
        dataType: 'json'
    }).done((result) => {
        const record = result.data;
        const name = record.map((rec) => {
            const cDate = new Date(rec.time);
            const cTime =
                leadingZeros(cDate.getHours(), 2) + ':' +
                leadingZeros(cDate.getMinutes(), 2) + ':' +
                leadingZeros(cDate.getSeconds(), 2);
            return cTime;
        }).reverse();
        const pm1_0_value = record.map((rec) => {
            return rec.pm1_0_value;
        }).reverse();
        const pm2_5_value = record.map((rec) => {
            return rec.pm2_5_value;
        }).reverse();
        const pm10_0_value = record.map((rec) => {
            return rec.pm10_0_value;
        }).reverse();

        const pm_step = {
            pm1_0_step: record[0].pm1_0_step,
            pm2_5_step: record[0].pm2_5_step,
            pm10_0_step: record[0].pm10_0_step
        };

        setStepClass(pm_step);

        chartOptions = {
            type: 'line',
            data: {
                labels: name,
                datasets: [
                    {
                        label: '미세먼지',
                        borderColor: 'rgb(54, 162, 235)',
                        backgroundColor: 'rgb(54, 162, 235)',
                        fill: false,
                        // borderDash: [5, 5],
                        data: pm10_0_value
                    },
                    {
                        label: '초미세먼지',
                        borderColor: 'rgb(255, 101, 108)',
                        backgroundColor: 'rgb(255, 101, 108)',
                        fill: false,
                        data: pm2_5_value
                    },
                    {
                        label: '극미세먼지',
                        borderColor: 'rgb(53, 206, 190)',
                        backgroundColor: 'rgb(53, 206, 190)',
                        borderDash: [5, 5],
                        fill: false,
                        data: pm1_0_value
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: false,
                title: {
                    display: true,
                    text: 'AirCleaner - JupiterFlow'
                },
                tooltips: {
                    mode: 'index',
                    intersect: false
                },
                hover: {
                    mode: 'nearest',
                    intersect: true
                },
                scales: {
                    xAxes: [{
                        display: true,
                        scaleLabel: {
                            display: true,
                            labelString: 'Time'
                        }
                    }],
                    yAxes: [{
                        display: true,
                        scaleLabel: {
                            display: true,
                            labelString: 'Value'
                        },
                        ticks: {
                            beginAtZero: true
                        }
                    }]
                }
            }
        };
        if (callback)
            callback();
        myChart = new Chart(ctx, chartOptions);
    });
};

let cDownloadInterval = 5000;
const airCleanerTimer = () => {
    const deviceSetting = readDeviceSetting();
    if (deviceSetting.delayDownload !== cDownloadInterval)
        cDownloadInterval = deviceSetting.delayDownload;

    setTimeout(airCleanerTimer, cDownloadInterval);
    readDeviceData(() => {
        myChart.destroy();
    });
};
$(window).on('load', () => {
    ctx = $('#myChart');
    readDeviceData();
    setTimeout(airCleanerTimer, cDownloadInterval);
});