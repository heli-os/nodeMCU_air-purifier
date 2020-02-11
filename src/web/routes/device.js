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

// get DeviceID
router.get('/getID', (req, res) => {
    if (req.user && req.user.device) {
        return res.send(req.user.device);
    } else
        return res.send(null);
});

// DataUpload
router.post('/data/upload', (req, res) => {
    const device = req.body.device;
    const pm1_0_value = req.body.pm1_0_value;
    const pm1_0_step = req.body.pm1_0_step;
    const pm2_5_value = req.body.pm2_5_value;
    const pm2_5_step = req.body.pm2_5_step;
    const pm10_0_value = req.body.pm10_0_value;
    const pm10_0_step = req.body.pm10_0_step;
    const params = [device, pm1_0_value, pm1_0_step, pm2_5_value, pm2_5_step, pm10_0_value, pm10_0_step];
    console.log(req.body);
    mysqlClient.query("INSERT INTO device_data (device,pm1_0_value,pm1_0_step,pm2_5_value,pm2_5_step,pm10_0_value,pm10_0_step) VALUES(?,?,?,?,?,?,?)", params, (err, rows, fields) => {
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
    const device = req.body.device;
    const modeLED = parseInt(req.body.modeLED);
    const delayUpload = parseInt(req.body.delaySync);
    const delayDownload = parseInt(req.body.delaySync);
    const modePower = parseInt(req.body.modePower);

    mysqlClient.query("SELECT * FROM device_setting WHERE device=?", device, (err, rows, fields) => {
        if (err) {
            return res.status(500).json(responseJSON.create('FAIL', '에러 발생', 'device setting upload 쿼리 실행 중 오류가 발생하였습니다.'));
        }
        if (rows.length === 0) {
            mysqlClient.query("INSERT INTO device_setting device VALUES ?", device, (err, rows, fields) => {
                if (err) {
                    return res.status(500).json(responseJSON.create('FAIL', '에러 발생', 'device setting upload 초기화 쿼리 실행 중 오류가 발생하였습니다.'));
                } else {
                    return res.status(200).json(responseJSON.create('SUCCESS', '설정 저장 성공', '설정을 저장하였습니다.'));
                }
            });
        } else {
            mysqlClient.query("UPDATE device_setting SET modeLED=?, modePower=?, delayUpload=?, delayDownload=? WHERE device=?", [modeLED, modePower, delayUpload, delayDownload, device], (err, rows, fields) => {
                if (err) {
                    return res.status(500).json(responseJSON.create('FAIL', '에러 발생', 'device setting upload 업데이트 쿼리 실행 중 오류가 발생하였습니다.'));
                } else {
                    return res.status(200).json(responseJSON.create('SUCCESS', '설정 저장 성공', '설정을 저장하였습니다.'));
                }
            });
        }
    });
});

// SettingDownload
router.post('/setting/download', (req, res, next) => {
    const device = req.body.device;
    mysqlClient.query("SELECT * FROM device_setting WHERE device=?", device, (err, rows, fields) => {
        if (err) {
            return res.status(500).json(responseJSON.create('FAIL', '에러 발생', 'device setting download 쿼리 실행 중 오류가 발생하였습니다.'));
        }
        if (rows.length === 0) {
            mysqlClient.query("INSERT INTO device_setting (device) VALUES(?)", device, (err, rows, fields) => {
                if (err) {
                    return res.status(500).json(responseJSON.create('FAIL', '에러 발생', 'device setting download 초기화 쿼리 실행 중 오류가 발생하였습니다.'));
                } else {;
                    return res.status(200).json({
                        state: 'SUCCESS',
                        data: {
                            modeLED: 0,
                            modePower: 0,
                            delayUpload: 5000,
                            delayDownload: 5000
                        }
                    });
                }
            });
        } else {
            return res.status(200).json({
                state: 'SUCCESS',
                data: rows[0]
            });
        }
    });
});

module.exports = router;