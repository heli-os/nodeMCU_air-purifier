const express = require('express');
const router = express.Router();

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

const convertStepToImgURL = (step) => {
    return 'https://genie.jupiterflow.com/static/images/kakao/img_step_'+step+'.jpg';
};

const responseSimpleText = (text) => {
    return {
        "version": "2.0",
        "template": {
            "outputs": [
                {
                    "simpleText": {
                        "text": text
                    }
                }
            ]
        }
    };
};

const responseBasicCard = (title, desc, buttons) => {
    return {
        "version": "2.0",
        "template": {
            "outputs": [
                {
                    "basicCard": {
                        "title": title,
                        "description": desc,
                        "buttons": buttons
                    }
                }
            ]
        }
    };
};

const responseCarousel = (pm10_0, pm2_5, pm1_0) => {
    return {
        "version": "2.0",
        "template": {
            "outputs": [
                {
                    "carousel": {
                        "type": "basicCard",
                        "items": [
                            {
                                "title": "미세먼지",
                                "description": pm10_0.value,
                                "thumbnail": {
                                    "imageUrl": pm10_0.step
                                }
                            },
                            {
                                "title": "초미세먼지",
                                "description": pm2_5.value,
                                "thumbnail": {
                                    "imageUrl": pm2_5.step
                                }
                            },
                            {
                                "title": "극미세먼지",
                                "description": pm1_0.value,
                                "thumbnail": {
                                    "imageUrl": pm1_0.step
                                }
                            }
                        ]
                    }
                }
            ]
        }
    };
};
router.post('/welcome', (req, res, next) => {
    console.log(req.body.intent.name);
    res.json(req.body);
});

router.post('/v1', (req, res, next) => {
    console.log(req.body.intent.name);
    res.json(req.body);
});

router.post('/deviceSetting', (req, res, next) => {
    const userid = req.body.userRequest.user.id;
    const device = req.body.action.params.device;

    const re = new RegExp('^(LoRaHam-[a-z,A-Z,0-9]{4})$');
    if (re.test(device)) {
        mysqlClient.query("SELECT * FROM kakaoUser WHERE userid=?", userid, (err, rows, fields) => {
            if (err) {
                return res.json(responseSimpleText('userid 조회 쿼리 실패'));
            }
            if (rows.length === 0) {
                mysqlClient.query("INSERT INTO kakaoUser (userid, device) VALUES (?,?)", [userid, device], (err, rows, fields) => {
                    if (err) {
                        return res.json(responseSimpleText('user 등록 쿼리 실패'));
                    } else {
                        return res.json(responseSimpleText('[' + device + ']\r\n디바이스 등록 성공'));
                    }
                });
            } else {
                mysqlClient.query("UPDATE kakaoUser SET device=? WHERE userid=?", [device, userid], (err, rows, fields) => {
                    if (err) {
                        return res.json(responseSimpleText('user 업데이트 쿼리 실패'));
                    } else {
                        return res.json(responseSimpleText('[' + device + ']\r\n디바이스 변경 성공'));
                    }
                });
            }
        });
    } else {
        return res.json(responseBasicCard('비정상적인 deviceID입니다.', '정상적인 deviceID를 입력해주세요.', [
            {
                "action": "message",
                "label": "디바이스 설정",
                "messageText": "디바이스 설정"
            }
        ]));
    }

});

const dateFormat = (date, fstr, utc) => {
    utc = utc ? 'getUTC' : 'get';
    return fstr.replace(/%[YmdHMS]/g, (m) => {
        switch (m) {
            case '%Y':
                return date[utc + 'FullYear'](); // no leading zeros required
            case '%m':
                m = 1 + date[utc + 'Month']();
                break;
            case '%d':
                m = date[utc + 'Date']();
                break;
            case '%H':
                m = date[utc + 'Hours']();
                break;
            case '%M':
                m = date[utc + 'Minutes']();
                break;
            case '%S':
                m = date[utc + 'Seconds']();
                break;
            default:
                return m.slice(1); // unknown code, remove %
        }
        // add leading zero if required
        return ('0' + m).slice(-2);
    });
}

router.post('/readData', (req, res, next) => {
    const userid = req.body.userRequest.user.id;
    mysqlClient.query("SELECT * FROM kakaoUser WHERE userid=?", userid, (err, rows, fields) => {
        if (err) {
            return res.json(responseSimpleText('userid 조회 쿼리 실패'));
        }
        if (rows.length === 0) {
            return res.json(responseBasicCard('디바이스 설정 필요', '디바이스 설정이 되어있지 않습니다.\r\n디바이스 설정을 해주세요.', [
                {
                    "action": "message",
                    "label": "디바이스 설정",
                    "messageText": "디바이스 설정"
                }
            ]));
        } else {
            const device = rows[0].device;
            mysqlClient.query("SELECT * FROM device_data WHERE device=? ORDER BY no desc LIMIT 1", device, (err, rows, fields) => {
                if (err) {
                    return res.json(responseSimpleText('device_data 조회 쿼리 실패'));
                } else {
                    const cDate = new Date(rows[0].time);
                    return res.json(responseCarousel({
                            value : rows[0].pm10_0_value + '㎍/㎥',
                            step: convertStepToImgURL(rows[0].pm10_0_step)
                        },
                        {
                            value : rows[0].pm2_5_value  + '㎍/㎥',
                            step: convertStepToImgURL(rows[0].pm2_5_step)
                        }, {
                            value : rows[0].pm1_0_value + '㎍/㎥',
                            step: convertStepToImgURL(rows[0].pm1_0_step)
                        }
                    ));
                }
            });
        }
    });
// return res.json(responseSimpleText(userid));
});

module.exports = router;