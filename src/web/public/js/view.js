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
        modeLED: 0,
        modePower: 0,
        delayUpload: 0,
        delayDownload: 0,
        delaySync: 0
    };
    $.ajax({
        type: 'post',
        url: '/device/setting/download',
        data: {device: deviceID},
        dataType: 'json',
        async: false
    }).done((result) => {
        const record = result.data;
        delayObj.modeLED = record.modeLED;
        delayObj.modePower = record.modePower;
        delayObj.delayUpload = record.delayUpload;
        delayObj.delayDownload = record.delayDownload;
        delayObj.delaySync = record.delayDownload;
    });
    return delayObj;
};

const convertStepToMsg = (step) => {
    let msg = '';
    switch (step) {
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
    if (deviceSetting.delaySync !== cDownloadInterval)
        cDownloadInterval = deviceSetting.delaySync;

    setTimeout(airCleanerTimer, cDownloadInterval);
    readDeviceData(() => {
        myChart.destroy();
    });
};
const toggleSettingBtn = () => {
    const settingBtn = $('#settingBtn');
    if (settingBtn.text() === 'Setting-OPEN') {
        const deviceSetting = readDeviceSetting();
        $('.setting-form form input[name=delaySync]').val(deviceSetting.delaySync);

        $('.setting-form form select[name=modeLED] option').prop('selected', false);
        $('.setting-form form select[name=modeLED] option:eq(' + deviceSetting.modeLED + ')').prop('selected', true);
        settingBtn.on('mouseout', () => {
            settingBtn.css('border-color', '#333');
            settingBtn.css('background-color', '#333');
        });
        settingBtn.on('mouseover', () => {
            settingBtn.css('border-color', '#35cebe');
            settingBtn.css('background-color', '#35cebe');
        });

        const powerModeBtn = $('.setting-form span.button.powerMode');
        if (deviceSetting.modePower === 0) {
            powerModeBtn.text('전원 ON');
            powerModeBtn.css('background-color', 'rgb(28, 117, 211)');
            powerModeBtn.css('border-color', 'rgb(28, 117, 211)');
        } else if (deviceSetting.modePower === 1) {
            powerModeBtn.text('수면모드');
            powerModeBtn.css('background-color', 'rgb(59, 140, 62)');
            powerModeBtn.css('border-color', 'rgb(59, 140, 62)');
        } else if (deviceSetting.modePower === 2) {
            powerModeBtn.text('전원 OFF');
            powerModeBtn.css('background-color', 'rgb(213, 47, 47)');
            powerModeBtn.css('border-color', 'rgb(213, 47, 47)');
        }

        settingBtn.text('Setting-CLOSE');
    } else {
        settingBtn.on('mouseout', () => {
            settingBtn.css('border-color', '#35cebe');
            settingBtn.css('background-color', '#35cebe');
        });
        settingBtn.on('mouseover', () => {
            settingBtn.css('border-color', '#333');
            settingBtn.css('background-color', '#333');
        });
        settingBtn.text('Setting-OPEN');
    }
    const settingForm = $('.setting-form');
    settingForm.toggle(400);
};
const saveSetting = (formData) => {
    const deviceID = getDeviceID();
    if (!deviceID) {
        console.log('exit');
        return;
    }
    const powerModeBtnText = $('.setting-form span.button.powerMode').text() === '전원 ON'
        ? 0
        : $('.setting-form span.button.powerMode').text() === '수면모드' ? 1 : 2;

    $.ajax({
        type: 'post',
        url: '/device/setting/upload',
        data: formData.concat('&device=' + deviceID + '&modePower=' + powerModeBtnText),
        dataType: 'json'
    }).done((result) => {
        if (result.state === "SUCCESS") {
            alert(result.properties.Message);
            toggleSettingBtn();
        }
    });
};
$(window).on('load', () => {
    ctx = $('#myChart');
    readDeviceData();
    setTimeout(airCleanerTimer, cDownloadInterval);
    $('#settingBtn').on('click', toggleSettingBtn);

    $('.setting-form span.button.powerMode').on('click', () => {
        const powerModeBtn = $('.setting-form span.button.powerMode');
        if (powerModeBtn.text() === '전원 ON') {
            powerModeBtn.text('수면모드');
            powerModeBtn.css('background-color', 'rgb(59, 140, 62)');
            powerModeBtn.css('border-color', 'rgb(59, 140, 62)');
        } else if (powerModeBtn.text() === '수면모드') {
            powerModeBtn.text('전원 OFF');
            powerModeBtn.css('background-color', 'rgb(213, 47, 47)');
            powerModeBtn.css('border-color', 'rgb(213, 47, 47)');
        } else if (powerModeBtn.text() === '전원 OFF') {
            powerModeBtn.text('전원 ON');
            powerModeBtn.css('background-color', 'rgb(28, 117, 211)');
            powerModeBtn.css('border-color', 'rgb(28, 117, 211)');
        }
    });

    $('.setting-form span.button.settingSave').on('click', () => {
        const formData = $('.setting-form form').serialize();
        saveSetting(formData);
    });
});