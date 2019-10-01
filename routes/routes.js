var express = require('express');
var router = express.Router();

var adminRoutes = require('./adminRoutes')
var errorRoutes = require('./errorRoutes')
var normalRoutes = require('./normalRoutes')
var blogRoutes = require('./blogRoutes')
var guestbookRoutes = require('./guestbookRoutes')

router.use(adminRoutes)
router.use(normalRoutes)
router.use(blogRoutes)
router.use(guestbookRoutes)

/*
error routes must be last or they will overide the other routes
*/
router.use(errorRoutes)

module.exports = router;