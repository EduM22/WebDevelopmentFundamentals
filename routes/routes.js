const express = require('express');
const router = express.Router();

const adminRoutes = require('./adminRoutes')
const errorRoutes = require('./errorRoutes')
const normalRoutes = require('./normalRoutes')
const blogRoutes = require('./blogRoutes')
const guestbookRoutes = require('./guestbookRoutes')
const commentRoutes = require('./commentsRoutes')

router.use(adminRoutes)
router.use(normalRoutes)
router.use(blogRoutes)
router.use(guestbookRoutes)
router.use(commentRoutes)

/*
error routes must be last or they will overide the other routes
*/
router.use(errorRoutes)

module.exports = router;