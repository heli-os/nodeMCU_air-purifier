const express = require('express');
const router = express.Router();

// View
router.get('/', (req, res) => {
    res.send('view page');
});

module.exports = router;