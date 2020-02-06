const express = require('express');
const router = express.Router();

router.get('/', (req, res, next) => {
    if (req.user && req.user.username)
        return res.redirect('/view');
    else
        return res.render('index');
    next();
});

module.exports = router;