const express = require('express');
const adminRouter = express.Router();

const auth = require('../models/auth')
const blog = require('../models/blog')

const csurf = require('csurf')

const csrfProtection = csurf()

adminRouter.get('/admin', auth.isAuthenticated, function(request, response) {
    const model = {
        user: request.session.user
    }

    response.render('admin.hbs', model)
});

adminRouter.get('/contact-requests', auth.isAuthenticated, function(request, response) {
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
});

adminRouter.get('/contact-request', auth.isAuthenticated, function(request, response) {
    response.redirect('/contact-requests')
});

adminRouter.get('/contact-request/:id', auth.isAuthenticated, csrfProtection, function(request, response) {

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

adminRouter.post('/delete/contact-request/:id', auth.isAuthenticated, csrfProtection, function(request, response) {

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

adminRouter.get('/login', auth.alreadyAuthenticated, csrfProtection, function(request, response) {
    response.render('login.hbs', { layout: 'clean.hbs', csrfToken: request.csrfToken()})
})

adminRouter.post('/login', auth.alreadyAuthenticated, csrfProtection, function(request, response) {
    const validationErrors = []

    const valdateUsername = request.body.username
    const validatePassword = request.body.password

    if (validatePassword === "" || valdateUsername === "") {
        validationErrors.push("No password/username")

        const model = {
            validationErrors,
            username: valdateUsername,
            csrfToken: request.csrfToken(),
            layout: 'clean.hbs'
        }
        
        response.render('login.hbs', model)
    } else {
        if(validatePassword.length >= 6) {

            auth.login(valdateUsername, validatePassword, request, function(sqlError, authError, user){
                
                if(sqlError){
                    response.render("500.hbs")
                } else if(authError) {
                    validationErrors.push("Wrong username/password")
                    
                    const model = {
                        validationErrors,
                        username: valdateUsername,
                        csrfToken: request.csrfToken(),
                        layout: 'clean.hbs'
                    }
                    response.render('login.hbs', model)

                } else if(user){
                    response.redirect('/admin')
                } else {
                    validationErrors.push("Wrong username/password")
                    
                    const model = {
                        validationErrors,
                        username: valdateUsername,
                        csrfToken: request.csrfToken(),
                        layout: 'clean.hbs'
                    }
                    response.render('login.hbs', model)
                }
                
            })

        } else {
            validationErrors.push("Wrong username/password")
            const model = {
                validationErrors,
                username: valdateUsername,
                csrfToken: request.csrfToken(),
                layout: 'clean.hbs'
            }
            
            response.render('login.hbs', model)
        }
    }
})

adminRouter.get('/logout', auth.isAuthenticated, csrfProtection, function(request, response) {
    response.render('logout.hbs', {csrfToken: request.csrfToken()})
});

adminRouter.post('/logout', auth.isAuthenticated, csrfProtection, function(request, response) {

    auth.logout(request, function(error) {
        if (error) {
            response.render('500.hbs')
        } else {
            response.redirect('/')
        }
    })
});


module.exports = adminRouter;