const express = require('express');
const router = express.Router();

const responseJSON = require('../middleware/responseJSON');


const mysql = require('mysql');
const db_config = require('../secure-configure.json').db_config;
const mysqlClient = mysql.createConnection({
    host: db_config.host,
    port: db_config.port,
    user: db_config.user,
    password: db_config.password,
    database: db_config.database
});
mysqlClient.connect();

// Device
router.get('/', (req, res) => {
    res.send('Device');
});

// DataUpload
router.post('/data/upload', (req, res) => {
    const device = req.body.device;
    const pm1_0 = req.body.pm1_0;
    const pm2_5 = req.body.pm2_5;
    const pm10_0 = req.body.pm10_0;
    // console.log(req.body);
    // console.log(req.headers);

    const params = [device, pm1_0, pm2_5, pm10_0];
    mysqlClient.query("INSERT INTO device_data (device,value_pm1_0,value_pm2_5,value_pm10_0) VALUES(?,?,?,?)", params, (err, rows, fields) => {
        // console.log(data);
        if (err) {
            // console.log(err);
            return res.status(500).json(responseJSON.create('FAIL', '에러 발생', 'device data download 쿼리 실행 중 오류가 발생하였습니다.'));
        } else {
            return res.status(200).json(responseJSON.create('SUCCESS', '데이터 업로드 성공', '데이터를 정상적으로 업로드하였습니다.'));
        }
    });

});

// DataDownload
/*
--------------------------------------------------------------
| no | device | time | value_pm10 | value_pm25 | value_pm100 |
--------------------------------------------------------------
 */
router.post('/data/download', (req, res) => {
    const device = req.body.device;
    mysqlClient.query("SELECT * FROM device_data WHERE device=? ORDER BY time DESC LIMIT 12", device, (err, rows, fields) => {
        // console.log(data);
        if (err) {
            // console.log(err);
            return res.status(500).json(responseJSON.create('FAIL', '에러 발생', 'device data download 쿼리 실행 중 오류가 발생하였습니다.'));
        }
        if (rows.length !== 0) {
            return res.status(200).json({
                state: 'SUCCESS',
                data: rows
            });
        } else
            return res.status(200).json(responseJSON.create('FAIL', '데이터 없음', '일치하는 device data가 존재하지 않습니다.'));
    });
});

// SettingUpload
router.post('/setting/upload', (req, res) => {
    res.send('/setting/upload');
});

// SettingDownload
router.post('/setting/download', (req, res) => {
    res.send('/setting/download');
});

module.exports = router;