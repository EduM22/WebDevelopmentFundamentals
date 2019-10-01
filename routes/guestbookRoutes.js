var express = require('express');
var guestbookRouter = express.Router();

var blog = require('../models/blog')

guestbookRouter.get('/guestbook', function(request, response) {
    var page = 0
    if (request.params.page == null) {
        page = 0
    } else {
        page = request.params.page
    }

    blog.getAllGuestbookEntries(page, function(error, entries) {
        if (error) {
            response.render("500.hbs")
        } else {
            if (entries == null) {
                response.render('guestbook.hbs')
                //response.send("no entries")
            } else {
                const model = {
                    row: entries
                }
                response.render('guestbook.hbs', model)
                //response.send(entries)
            }
        }
    })

});


guestbookRouter.post('/guestbook', function(request, response) {
    response.status(200).send("post to guestbook")
    /*
    var page = request.query.page
    if (page == null) {
        page = 0
    }

    blog.getAllGuestbookEntries(page, function(error, entries) {
        if (error) {
            response.send(error, "error")
        } else {
            if (entries == null) {
                response.send("no entries")
            } else {
                response.send(entries)
            }
        }
    })*/
});

module.exports = guestbookRouter;