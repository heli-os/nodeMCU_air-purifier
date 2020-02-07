const express = require('express');
const router = express.Router();

// View
router.get('/', (req, res) => {
    if(req.user && req.user.username) {
        return res.render('view',{username: req.user.username});
    } else
        return res.redirect('/');
});

// get DeviceID
router.get('/deviceID',(req,res)=>{
    if(req.user && req.user.device) {
        return res.send(req.user.device);
    } else
        return res.send(null);
});

module.exports = router;