var express = require('express');
var router = express.Router();

var adminRoutes = require('./adminRoutes')
var errorRoutes = require('./errorRoutes')
var normalRoutes = require('./normalRoutes')

router.use(adminRoutes)
router.use(normalRoutes)
router.use(errorRoutes)

module.exports = router;