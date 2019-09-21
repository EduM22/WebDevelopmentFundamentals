var express = require('express');
var adminRouter = express.Router();

var db = require('../db')
var auth = require('../models/auth')
var blog = require('../models/blog')

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
        if(validatePassword.length >= 3) {

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
                    //request.session.authenticated = true
                    //request.session.user = user
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
    //request.session.authenticated = false
    //request.session.user = null
    //response.redirect('/')
});


adminRouter.get('/new/post', isAuthenticated, function(request, response) {
    response.render('new_post.hbs', { layout: 'clean.hbs' })
})

adminRouter.post('/new/post', isAuthenticated, function(request, response) {
    const validationErrors = []

    const validateContent = request.body.content
    const validateSlug = request.body.slug
    const validateCategory = request.body.category

    if (validateContent == "") {
        validationErrors.push("content is empty")
    }

    if (validateSlug == "") {
        validationErrors.push("slug is empty")
    }

    if (validateCategory == "") {
        validationErrors.push("Choose an category ")
    }

    if (validationErrors.length > 0) {
        const model = {
            validationErrors,
            layout: 'clean.hbs'
        }

        response.render('new_post.hbs', model)
        
    } else {

        blog.newPost(request.session.user.uid, validateSlug, validateContent, validateCategory, function(error, post) {
            if (error) {
                response.send(error)
            } else {
                response.redirect("/post/"+validateSlug)
            }
        })

    }
})

adminRouter.get('/edit/post/:slug', isAuthenticated, function(request, response) {
    blog.getPost(request.params.slug, function(error, Post) {
        if (error) {
            response.send(error)
        } else {
            const model = {
                title: 'Home',
                Post
            }
            response.render('post.hbs', model)
        }
    })
})

adminRouter.post('/edit/post/:slug', isAuthenticated, function(request, response) {
    const oldSlug = request.params.slug
    const validationErrors = []

    const validateContent = request.body.content
    const validateSlug = request.body.slug
    const validateCategory = request.body.category

    if (validateContent == "") {
        validationErrors.push("content is empty")
    }

    if (validateSlug == "") {
        validationErrors.push("slug is empty")
    }

    if (validateCategory == "") {
        validationErrors.push("Choose an category ")
    }

    if (validationErrors.length > 0) {
        const model = {
            validationErrors,
            layout: 'clean.hbs'
        }

        response.render('new_post.hbs', model)
        
    } else {

        blog.updatePost(request.session.user.uid, validateSlug, oldSlug, validateContent, validateCategory, function(error, post) {
            if (error) {
                response.send(error)
            } else {
                response.redirect("/post/"+validateSlug)
            }
        })

    }
})

adminRouter.get('/delete/post/:slug', isAuthenticated, function(request, response) {
    blog.deletePost(request.params.slug, function(error) {
        if (error) {
            response.send(error)
        } else {
            response.redirect('/posts')
        }
    })
})

module.exports = adminRouter;