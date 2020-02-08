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
        url: '/view/deviceID',
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
                        borderColor: 'rgb(0,255,145)',
                        backgroundColor: 'rgb(0,255,145)',
                        borderDash: [5, 5],
                        fill: false,
                        data: pm1_0_value
                    }
                ]
            },
            options: {
                responsive: true,
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
    if(deviceSetting.delayDownload !== cDownloadInterval)
        cDownloadInterval = deviceSetting.delayDownload;

    setTimeout(airCleanerTimer, cDownloadInterval);
    readDeviceData(() => {
        myChart.reset();
    });
};
$(window).on('load', () => {
    ctx = $('#myChart');
    readDeviceData();
    setTimeout(airCleanerTimer, cDownloadInterval);
});