const express = require('express');
const guestbookRouter = express.Router();

const blog = require('../models/blog')
const csurf = require('csurf')

const csrfProtection = csurf()

guestbookRouter.get('/guestbook', csrfProtection, function(request, response) {
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
                response.render('guestbook.hbs', {csrfToken: request.csrfToken()})
                //response.send("no entries")
            } else {
                const model = {
                    csrfToken: request.csrfToken(),
                    row: entries
                }
                response.render('guestbook.hbs', model)
                //response.send(entries)
            }
        }
    })

});


guestbookRouter.post('/guestbook', csrfProtection, function(request, response) {
    const validationErrors = []

    const validateContent = request.body.content
    const validateName = request.body.name

    if (validateContent == "") {
        validationErrors.push("content is empty")
    }

    if (validateName == "") {
        validationErrors.push("name is empty")
    }

    if (validationErrors.length > 0) {
        const model = {
            validationErrors,
            layout: 'clean.hbs'
        }

        response.render('guestbook.hbs', model)
        
    } else {

        blog.newGuestbookEntry(validateName, validateContent, function(error, post) {
            if (error) {
                response.send(error)
            } else {
                response.redirect("/guestbook")
            }
        })

    }

});

module.exports = guestbookRouter;