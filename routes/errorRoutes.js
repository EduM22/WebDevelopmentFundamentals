var express = require('express');
var errorRouter = express.Router();

errorRouter.use(function(request, response, next) {
    response.status(404).render('404.hbs', { layout: 'clean.hbs' })
});

errorRouter.use(function (error, request, response, next) {
    if (error.code !== 'EBADCSRFTOKEN') return next(error)

    response.status(403).send('form tampered with')
  })

module.exports = errorRouter;