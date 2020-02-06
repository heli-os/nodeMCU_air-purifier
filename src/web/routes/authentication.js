const express = require('express');
const router = express.Router();

// Util
const {body, validationResult} = require('express-validator');
const passport = require('passport');
const pbkdf2Password = require('pbkdf2-password');
const hasher = pbkdf2Password();
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

const validateProcess = (req, res, next) => {
    const errors = validationResult(req);
    // console.log('Error:',errors.array());

    if (!errors.isEmpty())
        return res.status(200).json(responseJSON.create('FAIL', '입력 값이 유효하지 않음', '입력 값이 유효하지 않습니다.'));
    else
        next();
};

const usernameExistCheck = (req, res, next) => {
    const username = req.body.username;
    mysqlClient.query("SELECT * FROM users WHERE username=?", username, (err, data) => {
        if (err) {
            // console.log(err);
            return res.status(500).json(responseJSON.create('FAIL', '에러 발생', 'username 중복 확인 쿼리 실행 중 오류가 발생하였습니다.'));
        }
        if (data.length === 0)
            next();
        else
            return res.status(200).json(responseJSON.create('FAIL', 'username 중복', '이미 등록된 username입니다.'));

    });
};

const emailExistCheck = (req, res, next) => {
    const email = req.body.email;
    mysqlClient.query("SELECT * FROM users WHERE email=?", email, (err, data) => {
        if (err) {
            // console.log(err);
            return res.status(500).json(responseJSON.create('FAIL', '에러 발생', 'email 중복 확인 쿼리 실행 중 오류가 발생하였습니다.'));
        }
        if (data.length === 0)
            next();
        else
            return res.status(200).json(responseJSON.create('FAIL', 'email 중복', '이미 등록된 email입니다.'));
    });
};
const signupAction = (req, res, next) => {
    // hasher(..)
    hasher({password: req.body.password}, (err, pass, salt, hash) => {
        // INSERT ...
        const sql = "INSERT INTO users (username,email,password,salt,device) VALUES(?,?,?,?,?)";
        const params = [
            req.body.username,
            req.body.email,
            hash,
            salt,
            req.body.device
        ];
        mysqlClient.query(sql, params, (err, rows, fileds) => {
            if (!err) {
                const user = {
                    no: rows.insertId,
                    username: req.body.username,
                    email: req.body.email,
                    password: hash,
                    salt: salt,
                    device: req.body.device
                };
                req.login(user, (err) => {
                    req.session.save(() => {
                        return res.status(200).json(responseJSON.create('SUCCESS', '회원등록 성공', '회원등록에 성공하였습니다.'));
                    });
                });
            } else
                return res.status(500).json(responseJSON.create('FAIL', '에러 발생', '회원 등록 쿼리 실행 중 오류가 발생하였습니다.'));
        });
    });


};

// SignUp
router.post('/new', [
    body('username')
        .isLength({min: 4, max: 16})
        .trim()
        .escape(),
    body('email')
        .isLength({min: 8, max: 254})
        .isEmail()
        .normalizeEmail(),
    body('password')
        .isLength({min: 8, max: 32})
        .custom((value, {req, loc, path}) => {
            return value === req.body.password_confirm;
        }),
    body('password_confirm')
        .isLength({min: 8, max: 32})
        .custom((value, {req, loc, path}) => {
            return value === req.body.password;
        }),
    body('device')
        .not().isEmpty()
], [validateProcess, usernameExistCheck, emailExistCheck, signupAction]);

const signinAction = (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err)
            console.log(err);
        if (!user)
            return res.status(200).json(responseJSON.create('FAIL', '로그인 실패', '로그인에 실패하였습니다.'));
        req.login(user, (err) => {
            if (err) console.log(err);
            req.session.save(() => {
                return res.status(200).json(responseJSON.create('SUCCESS', '로그인 성공', '로그인에 성공하였습니다.'));
            });
        });
    })(req, res, next);
};

// SignIn
router.post('/', [
    body('username')
        .isLength({min: 4, max: 16})
        .trim()
        .escape(),
    body('password')
        .isLength({min: 8, max: 32})
], [signinAction]);


// Signout
router.get('/signout', (req, res) => {
    req.logout();
    req.session.save(() => {
        res.redirect('/');
    });
});

module.exports = router;