const express = require('express');
const guestbookRouter = express.Router();

const blog = require('../models/blog')
const auth = require('../models/auth')
const csurf = require('csurf')

const csrfProtection = csurf()

guestbookRouter.get('/guestbook', csrfProtection, function(request, response) {

    blog.getAllGuestbookEntries(function(error, entries) {
        if (error) {
            response.render("500.hbs")
        } else {
            if (entries == null) {
                response.render('guestbook.hbs', {csrfToken: request.csrfToken()})
            } else {
                const model = {
                    csrfToken: request.csrfToken(),
                    row: entries,
                    signedIn: true
                }
                response.render('guestbook.hbs', model)
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
                response.render('500.hbs')
            } else {
                response.redirect("/guestbook")
            }
        })

    }

});

guestbookRouter.get('/guestbook-entry/:id', csrfProtection, function(request, response) {
    const id = request.params.id

    if (id == "") {
        response.render('guestbook_entry.hbs', {message: "You must specifie an id"})
    } else {
        blog.getGuestbookEntry(id, function(error, entry) {
            if (error) {
                response.render('500.hbs')
            } else {
                const model = {
                    title: "Guestbook | entry",
                    csrfToken: request.csrfToken(),
                    entry
                }
                response.render('guestbook_entry.hbs', model)
            }
        })
    }

});

guestbookRouter.post('/delete/guestbook-entry/:id', auth.isAuthenticated, csrfProtection, function(request, response) {
    const id = request.params.id

    if (id == "") {
        response.render('guestbook.hbs')
    } else {
        blog.deleteGuestbookEntry(id, function(error) {
            if (error) {
                response.render('500.hbs')
            } else {
                response.redirect("/guestbook")
            }
        })
    }

});

guestbookRouter.get('/edit/guestbook-entry/:id', auth.isAuthenticated, csrfProtection, function(request, response) {

    const id = request.params.id

    if (id == "") {
        const model = {
            csrfToken: request.csrfToken(),
            errorMessage: "No guestbook entry with that id"
        }
        response.render('edit_guestbook_entry.hbs', model)
    } else {
        blog.getGuestbookEntry(id, function(error, entry) {
            if (error) {
                response.render('500.hbs')
            } else {
                const model = {
                    csrfToken: request.csrfToken(),
                    entry
                }
            
                response.render('edit_guestbook_entry.hbs', model)
            }

        })
    }

})

guestbookRouter.post('/edit/guestbook-entry/:id', auth.isAuthenticated, csrfProtection, function(request, response) {
    const validationErrors = []

    const id = request.params.id

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
            validateName,
            validateContent,
        }
        response.render('edit_guestbook_entry.hbs', model) 
    } else {
        blog.updateGuestbookEntry(id, validateName, validateContent, function(error, guestbookId) {
            if (error) {
                response.render('500.hbs')
            } else {
                response.redirect('/guestbook')
            }
        })  
    }
})

module.exports = guestbookRouter;