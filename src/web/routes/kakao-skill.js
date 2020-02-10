const express = require('express');
const router = express.Router();

router.post('/v1', (req, res, next) => {
    console.log(req.body.intent.name);
    console.log(req.body.intent.name==='폴백 블록');
    res.json(req.body);
});

module.exports = router;