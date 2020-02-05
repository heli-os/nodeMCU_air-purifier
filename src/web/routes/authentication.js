const express = require('express');
const router = express.Router();

const mysql = require('mysql');
const db_config = require('../secure-configure.json').db_config;
const mysqlClient = mysql.createConnection({
    host: db_config.host,
    user: db_config.user,
    password: db_config.password,
    database: db_config.database
});
mysqlClient.connect();

const responseJSON = (state, title, message) => {
    return {
        state: state,
        properties: {
            Title: title,
            Message: message
        }
    };
};

const usernameExistCheck = (req, res, next) => {
    const username = req.body.username;
    mysqlClient.query("SELECT * FROM users WHERE username=?", username, (err, data) => {
        if (err) {
            console.log(err);
            return res.status(500).json(responseJSON('FAIL','에러 발생','멤버 중복 확인 쿼리 실행 중 오류가 발생하였습니다.'));
        }
        if (data.length === 0)
            next();
        else
            return res.status(200).json(responseJSON('FAIL','username 중복','이미 등록된 username입니다.'));

    });
};

const emailExistCheck = (req, res, next) => {
    const email = req.body.email;
    mysqlClient.query("SELECT * FROM users WHERE email=?", email, (err, data) => {
        if (err) {
            console.log(err);
            return res.status(500).json(responseJSON('FAIL','에러 발생','멤버 중복 확인 쿼리 실행 중 오류가 발생하였습니다.'));
        }
        if (data.length === 0)
            next();
        else
            return res.status(200).json(responseJSON('FAIL','email 중복','이미 등록된 email입니다.'));
    });
};
const signupAction = (req, res, next) => {
    const user = {
        username: req.body.username,
        email: req.body.email,
        password: req.body.password,
        password_repeat: req.body.password_repeat,
        device: req.body.device
    };
    // INSERT ...
    return res.status(200).json(responseJSON('SUCCESS','회원등록 성공','회원등록에 성공하였습니다.'));
};

// SignUp
router.post('/new', [usernameExistCheck, emailExistCheck, signupAction]);


const signinAction = (req, res, next) => {
    const username = req.body.username;
    const email = req.body.email;
    console.log('first Route');
    next();
};

// SignIn
router.post('/', (req, res) => {
    res.send('test');
});


module.exports = router;