const express = require('express');
const app = express();

// session
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);

// Router
const indexRouter = require('./routes/index');
const authenticationRouter = require('./routes/authentication');
const viewRouter = require('./routes/view');
const deviceRouter = require('./routes/device');

// Passport
const passport = require('passport');

// Configure
const db_config = require('./secure-configure.json').db_config;
const passportConfig = require('./middleware/passport');

/* URL Rule
-------------------------------------------------
| index           GET /                         |
-------------------------------------------------
| SignIn          POST /authentication          |
| SignUp          POST /authentication/new      |
-------------------------------------------------
| view            GET /view                     |
-------------------------------------------------
| DataUpload      POST /device/data/upload      |
| DataDownload    POST /device/data/download    |
| SettingUpload   POST /device/setting/upload   |
| SettingDownload POST /device/setting/download |
-------------------------------------------------
 */


// Global
if (app.get('env') === 'development')
    app.locals.pretty = true;

app.set('view engine', 'pug');
app.set('views', './views');

app.use('/static', express.static(__dirname + '/public'));
app.use(express.urlencoded({extended: true}));
app.use(express.json());

// Util
const sessionStore = new MySQLStore({
    host: db_config.host,
    port: db_config.port,
    user: db_config.user,
    password: db_config.password,
    database: db_config.database
});
app.use(session({
    key: 'AirCleaner CMS - jupiterFlow',
    secret: "SE`rnv6te9wH-15iXJ;h*Ma'LY^$bB:!gp%izQia3;Bz:7bgl&$fO8[&)0=W2t}",
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 60 * 60 * 24
    }
}));

app.use(passport.initialize(undefined));
app.use(passport.session(undefined));
passportConfig();


app.listen(9600, () => {
    console.log('9600 port connected!');
});


app.use('/', indexRouter);
app.use('/authentication', authenticationRouter);
app.use('/view', viewRouter);
app.use('/device', deviceRouter);