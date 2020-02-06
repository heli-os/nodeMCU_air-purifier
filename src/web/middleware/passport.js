const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy;

const pbkdf2Password = require('pbkdf2-password');
const hasher = pbkdf2Password();

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
module.exports = () => {
    // Passport Strategy Logic
    passport.serializeUser((user, done) => {
        done(null, user.no);
    });

    passport.deserializeUser((no, done) => {
        const sql = "SELECT * FROM users WHERE no=?";
        mysqlClient.query(sql, no, (err, rows, fields) => {
            if (err)
                done(err, false);

            if (rows.length > 0) {
                const user = {
                    no: rows[0].no,
                    username: rows[0].username,
                    email: rows[0].email,
                    device: rows[0].device
                };
                done(null, user);
            } else
                done(null, false);
        });
    });

    passport.use(new LocalStrategy({
            usernameField: 'username',
            passwordField: 'password'
        },
        (username, password, done) => {
            const uname = username;
            const pwd = password;

            const sql_username = "SELECT * FROM users WHERE username=?";
            mysqlClient.query(sql_username, uname, (err, rows, fields) => {
                if (err)
                    done(err, false);

                if (rows.length > 0) {
                    const user = {
                        no: rows[0].no,
                        username: rows[0].username,
                        password: rows[0].password,
                        salt: rows[0].salt,
                        email: rows[0].email,
                        device: rows[0].device
                    };
                    return hasher({password: pwd, salt: user.salt}, (err, pass, salt, hash) => {
                        if (hash === user.password)
                            done(null, user);
                        else
                            done(null, false);
                    });
                } else
                    done(null, false);
            });
        }
    ));
};
