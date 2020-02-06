const express = require('express');
const router = express.Router();

// View
router.get('/', (req, res) => {
    if(req.user && req.user.username) {
        return res.render('view',{username: req.user.username});
    } else
        return res.redirect('/');
});

module.exports = router;