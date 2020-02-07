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

const readDeviceData = (callback) => {
    $.ajax({
        type: 'get',
        url: '/view/deviceID'
    }).done((result) => {
        console.log(result);
        if (!result) {
            console.log('exit');
            return;
        }
        const deviceID = result;
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
            const value_pm1_0 = record.map((rec) => {
                return rec.value_pm1_0;
            }).reverse();
            const value_pm2_5 = record.map((rec) => {
                return rec.value_pm2_5;
            }).reverse();
            const value_pm10_0 = record.map((rec) => {
                return rec.value_pm10_0;
            }).reverse();

            chartOptions = {
                type: 'line',
                data: {
                    labels: name,
                    datasets: [
                        {
                            label: 'PM 1.0',
                            borderColor: 'rgb(255, 101, 108)',
                            backgroundColor: 'rgb(255, 101, 108)',
                            fill: false,
                            data: value_pm1_0
                        },
                        {
                            label: 'PM 2.5',
                            borderColor: 'rgb(54, 162, 235)',
                            backgroundColor: 'rgb(54, 162, 235)',
                            fill: false,
                            borderDash: [5, 5],
                            data: value_pm2_5
                        },
                        {
                            label: 'PM 10.0',
                            borderColor: 'rgb(0,235,68)',
                            backgroundColor: 'rgb(0,235,68)',
                            fill: false,
                            data: value_pm10_0
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
            if(callback)
                callback();
            myChart = new Chart(ctx, chartOptions);

        });
    }).fail((xhr, status, responseObj) => {
        console.log('fail promise');
    }).then(r => {
        // console.log('then promise');
    });
};

$(window).on('load', () => {
    ctx = $('#myChart');
    readDeviceData();
    setInterval(() => {
        readDeviceData(()=>{myChart.reset();});
    }, 5000);

});