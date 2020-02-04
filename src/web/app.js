const express = require('express');
const app = express();

// Router
const indexRouter = require('./routes/index');
const authenticationRouter = require('./routes/authentication');
const viewRouter = require('./routes/view');
const deviceRouter = require('./routes/device');

/* URL Rule
-----------------------------------------------
| index           GET /                       |
-----------------------------------------------
| SignIn          POST /authentication        |
| SignUp          POST /authentication/new    |
-----------------------------------------------
| view            GET /view                   |
-----------------------------------------------
| DataUpload      POST /device/upload         |
| SettingSave     POST /device/setting/save   |
| SettingRead     POST /device/setting/read   |
-----------------------------------------------
 */

if (app.get('env') === 'development')
    app.locals.pretty = true;

app.set('view engine', 'pug');
app.set('views', './views');

app.use(express.static('public'));
app.use(express.urlencoded({extended: false}));

app.listen(9600,()=>{
    console.log('9600 port connected!');
});


app.use('/',indexRouter);
app.use('/authentication',authenticationRouter);
app.use('/view',viewRouter);
app.use('/device',deviceRouter);