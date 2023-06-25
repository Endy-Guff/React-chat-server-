const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.send('qwer')
})

module.exports = router