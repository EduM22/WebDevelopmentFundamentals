const express = require('express');
const contactrequestRouter = express.Router();

const auth = require('../models/auth')
const blog = require('../models/blog')

const csurf = require('csurf')

const csrfProtection = csurf()

contactrequestRouter.get('/contact-requests', auth.isAuthenticated, function(request, response) {

    const queryGetSeenOrNot = request.query.seenit

    if (queryGetSeenOrNot == null) {
        blog.getAllContactRequests(function(error, requests) {
            if (error) {
                response.render('500.hbs')
            } else {
                const model = {
                    requests
                }
                response.render('contact_requests.hbs', model)
            }
        })
    } else {
        blog.getAllContactRequestsSeenOrNot(queryGetSeenOrNot, function(error, requests) {
            if (error) {
                response.render('500.hbs')
            } else {
                const model = {
                    requests
                }
                response.render('contact_requests.hbs', model)
            }
        })
    }

});

contactrequestRouter.get('/contact-request', auth.isAuthenticated, function(request, response) {
    response.redirect('/contact-requests')
});

contactrequestRouter.get('/contact-request/:id', auth.isAuthenticated, csrfProtection, function(request, response) {

    const id = request.params.id
    
    if (id == "") {
        response.redirect('/contact-requests')
    } else {
        blog.getContactRequest(id, function(error, ContactRequest) {
            if (error) {
                response.render('500.hbs')
            } else {
                const model = {
                    request: ContactRequest,
                    csrfToken: request.csrfToken()
                }
                response.render('contact_request.hbs', model)
            }
        })
    }
});

contactrequestRouter.post('/delete/contact-request/:id', auth.isAuthenticated, csrfProtection, function(request, response) {

    const id = request.params.id
    
    if (id == "") {
        response.redirect('/contact-requests', {csrfToken: request.csrfToken()})
    } else {
        blog.deleteContactRequest(id, function(error) {
            if (error) {
                response.render('500.hbs')
            } else {
                response.redirect('/contact-requests')
            }
        })
    }
});


contactrequestRouter.post('/contact-request/mark-as-seen/:id', auth.isAuthenticated, csrfProtection, function(request, response) {

    const id = request.params.id
    
    if (id == "") {
        response.redirect('/contact-requests', {csrfToken: request.csrfToken()})
    } else {
        blog.markContactRequestAsSeen(id, function(error) {
            if (error) {
                response.render('500.hbs')
            } else {
                response.redirect('/contact-requests')
            }
        })
    }
});

contactrequestRouter.get('/contact', csrfProtection, function(request, response) {
    response.render('contact.hbs', {csrfToken: request.csrfToken()})
})

contactrequestRouter.post('/contact', csrfProtection, async function(request, response) {
    const validationErrors = []

    const validateContent = request.body.message
    const validateEmail = request.body.email

    if (validateContent == "") {
        validationErrors.push("content is empty")
    }

    if (validateEmail == "") {
        validationErrors.push("email is empty")
    }

    await auth.validateEmail(validateEmail, function(status) {
        if (!status) {
            validationErrors.push("Email is not a valid email")
        }
    })

    if (validationErrors.length > 0) {
        const model = {
            validationErrors,
            validateContent,
            validateEmail,
            csrfToken: request.csrfToken()
        }

        response.render('contact.hbs', model)
        
    } else {

        blog.newContactRequest(validateEmail, validateContent, function(error) {
            if (error) {
                response.render('500.hbs')
            } else {
                const model = {
                    message: "Success",
                    csrfToken: request.csrfToken()
                }
                response.render('contact.hbs', model)
            }
        })

    }
})

module.exports = contactrequestRouter;