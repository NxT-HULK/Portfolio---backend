const express = require('express')
const router = express.Router();

router.get('/', (req, res) => {
    res.status(200).json(`Portfolio Server is curretly active`);
})

module.exports = router