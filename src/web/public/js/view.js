const leadingZeros = (n, digits) => {
    let zero = '';
    n = n.toString();

    if (n.length < digits) {
        for (let i = 0; i < digits - n.length; i++)
            zero += '0';
    }
    return zero + n;
};

$(window).on('load', () => {

    $.ajax({
        type: 'post',
        url: '/device/data/download',
        data: {device: 1},
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
        const value_pm25 = record.map((rec) => {
            return rec.value_pm25;
        }).reverse();
        const value_pm100 = record.map((rec) => {
            return rec.value_pm100;
        }).reverse();

        const ctx = $('#myChart');
        const myChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: name,
                datasets: [
                    {
                        label: 'PM 2.5',
                        borderColor: 'rgb(255, 101, 108)',
                        backgroundColor: 'rgb(255, 101, 108)',
                        fill: false,
                        data: value_pm25
                    },
                    {
                        label: 'PM 10.0',
                        borderColor: 'rgb(54, 162, 235)',
                        backgroundColor: 'rgb(54, 162, 235)',
                        fill: false,
                        borderDash: [5, 5],
                        data: value_pm100
                    }
                ]
            },
            options: {
                responsive: true,
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
        });
    }).fail((xhr, status, responseObj) => {
        console.log('fail promise');
    }).then(r => {
        // console.log('then promise');
    });
});