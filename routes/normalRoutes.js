const express = require('express');
const normalRouter = express.Router();

const blog = require('../models/blog')
const csurf = require('csurf')

const csrfProtection = csurf()

normalRouter.get('/', function(request, response) {

    blog.getLastPost(function(error, Post) {
        if (error) {
            response.render('500.hbs')
        } else {
            if (Post) {
                const model = {
                    title: 'Home',
                    Post,
                }
                response.render('home.hbs', model)
            } else {
                const model = {
                    title: 'Home',
                }
                response.render('home.hbs', model)
            }
        }
    })
    
})

normalRouter.get('/about', function(request, response) {
    blog.getWebpageContent("about", function(error, content) {
        if (error) {
            response.render('500.hbs')
        } else {
            if (content) {
                response.send(content)
            } else {
                response.send("Hi my name is johan and this is my blog<br>Default content<br>if you are the admin you can change it in the admin area")
            }
        }
    })
})

normalRouter.get('/edit/:page', function(request, response) {
    const page = request.params.page

    if (page == "") {
        response.send("no id")
    } else {
        blog.getWebpageContent(page, function(error, content) {
            if (error) {
                response.render('500.hbs')
            } else {
                if (content) {
                    response.send(content)
                } else {
                    response.send("no content")
                }
            }
        })
    }
})

normalRouter.post('/edit/:page', function(request, response) {
    const page = request.params.page
    const validationErrors = []

    const validateContent = request.body.content

    if (page == "") {
        response.send("no id")
    } else {
        if (validateContent == "") {
            validationErrors.push("content is empty")
        }
    
        if (validationErrors.length > 0) {
            const model = {
                validationErrors,
                layout: 'clean.hbs'
            }
    
            response.render('edit_post.hbs', model)
            
        } else {

            blog.editWebpageContent(page, validateContent, function(error) {
                if (error) {
                    response.render('500.hbs')
                } else {
                    response.redirect("/"+page)
                }
            })
    
        }   
    }

})


normalRouter.get('/contact', csrfProtection, function(request, response) {
    response.render('contact.hbs', {csrfToken: request.csrfToken()})
})

normalRouter.post('/contact', csrfProtection, function(request, response) {
    const validationErrors = []

    const validateContent = request.body.message
    const validateEmail = request.body.email

    if (validateContent == "") {
        validationErrors.push("content is empty")
    }

    if (validateEmail == "") {
        validationErrors.push("email is empty")
    }

    if (validationErrors.length > 0) {
        const model = {
            validationErrors,
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


normalRouter.get('/search', function(request, response) {
    const searchQuestion = request.query.q

    if (searchQuestion == "") {
        response.send("No search question")
    } else {
        blog.getPostsFromSearch(searchQuestion, function(error, Posts) {
            if (error) {
                response.render('500.hbs')
            } else {
                const model = {
                    title: "Posts from search",
                    Posts
                }
                response.render("posts.hbs", model)
            }
        })
    }
})

normalRouter.get('/portfolio', function(request, response) {
    response.render('portfolio.hbs')
})

module.exports = normalRouter;