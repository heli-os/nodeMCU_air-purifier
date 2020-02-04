const express = require('express');
const router = express.Router();

// Device
router.get('/', (req, res) => {
    res.send('Device');
});

module.exports = router;