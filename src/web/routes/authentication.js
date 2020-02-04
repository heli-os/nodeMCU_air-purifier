const express = require('express');
const router = express.Router();

// SignIn
router.post('/', (req, res) => {
    res.send(req.body);
});

// SignUp
router.post('/new', (req, res) => {
    res.send(req.body);
});

module.exports = router;