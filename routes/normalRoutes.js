const express = require('express');
const normalRouter = express.Router();

const blog = require('../models/blog')
const auth = require('../models/auth')

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
            const model = {
                title: content.name,
                content
            }
            response.render('about.hbs', model)
        }
    })
})

normalRouter.get('/portfolio', function(request, response) {
    blog.getWebpageContent("portfolio", function(error, content) {
        if (error) {
            response.render('500.hbs')
        } else {
            const model = {
                title: content.name,
                content
            }
            response.render('portfolio.hbs', model)
        }
    })
    
})

normalRouter.get('/edit/:page', auth.isAuthenticated, csrfProtection, function(request, response) {
    const page = request.params.page

    if (page == "") {
        response.send("no id")
    } else {
        blog.getWebpageContent(page, function(error, content) {
            if (error) {
                response.render('500.hbs')
            } else {
                if (content) {
                    const model = {
                        title: content.name,
                        csrfToken: request.csrfToken(),
                        page: content
                    }
                    response.render('edit_pages.hbs', model)
                } else {
                    response.redirect('/')
                }
            }
        })
    }
})

normalRouter.post('/edit/:page', auth.isAuthenticated, csrfProtection, function(request, response) {
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

normalRouter.get('/search', function(request, response) {
    const searchQuestion = request.query.q
    let dateOne = request.query.d1
    let dateTwo = request.query.d2
    
    if (!dateOne) {
        dateOne = null
    }
    if (!dateTwo) {
        dateTwo = null
    }

    blog.getPostsFromSearch(searchQuestion, dateOne, dateTwo, function(error, Posts) {
        if (error) {
            response.render('500.hbs')
        } else {
            if (Posts.length > 0) {
                const model = {
                    title: "Posts from search",
                    Posts
                }
                response.render("posts.hbs", model)
            } else {
                response.render('search.hbs', {errorMessage: "No posts on that search"})
            }
        }
    })

})

normalRouter.get('/get-all-uploaded-files', auth.isAuthenticated, function(request, response) {

    blog.getAllUploadedFiles(function (error, files) {
        if (error) {
            response.render('500.hbs')
        } else {
            response.render('all_uploded_files.hbs', {files})
        }
    })

})

module.exports = normalRouter;