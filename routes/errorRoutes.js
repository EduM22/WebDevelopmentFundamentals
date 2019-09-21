var express = require('express');
var errorRouter = express.Router();

errorRouter.use(function(request, response, next) {
    response.status(404).render('404.hbs', { layout: 'clean.hbs' })
});

module.exports = errorRouter;