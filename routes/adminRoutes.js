var express = require('express');
var adminRouter = express.Router();

var auth = require('../models/auth')

function isAuthenticated(request, response, next) {
    if (request.session.authenticated && request.session.user != null) {
        return next();
    }

    response.redirect('/')
}

function alreadyAuthenticated(request, response, next) {
    if (request.session.authenticated && request.session.user != null) {
        return response.redirect('/admin')
    } else {
        return next();
    }
}

adminRouter.get('/admin', isAuthenticated, function(request, response) {
    const model = {
        user: request.session.user
    }

    response.render('admin.hbs', model)
});

adminRouter.get('/login', alreadyAuthenticated, function(request, response) {
    response.render('login.hbs', { layout: 'clean.hbs' })
})

adminRouter.post('/login', alreadyAuthenticated, function(request, response) {
    const validationErrors = []

    const valdateUsername = request.body.username
    const validatePassword = request.body.password

    if (validatePassword === "" || valdateUsername === "") {
        validationErrors.push("No password/username")

        const model = {
            validationErrors,
            username: valdateUsername,
            layout: 'clean.hbs'
        }
        
        response.render('login.hbs', model)
    } else {
        if(validatePassword.length >= 6) {

            auth.login(valdateUsername, validatePassword, request, function(sqlError, authError){
                if(sqlError){
                    response.render("500.hbs")
                } else if(authError) {
                    validationErrors.push("Wrong username/password")
                    
                    const model = {
                        validationErrors,
                        username: valdateUsername,
                        layout: 'clean.hbs'
                    }
                    response.render('login.hbs', model)

                } else{
                    response.redirect('/admin')
                }
                
            })

        } else {
            validationErrors.push("Password must be 6 charcters or longer")

            const model = {
                validationErrors,
                username: valdateUsername,
                layout: 'clean.hbs'
            }
            
            response.render('login.hbs', model)
        }
    }
})

adminRouter.get('/logout', isAuthenticated, function(request, response) {

    auth.logout(request, function(error) {
        if (error) {
            response.send("something went wrong with the sign out")
        } else {
            response.redirect('/')
        }
    })
});


module.exports = adminRouter;