const express = require('express');
const blogRouter = express.Router();

const blog = require('../models/blog')
const auth = require('../models/auth')

const csurf = require('csurf')

const csrfProtection = csurf()


/*
function isAuthenticated(request, response, next) {
    if (request.session.authenticated && request.session.user != null) {
        return next();
    }

    response.redirect('/')
}
*/

blogRouter.get('/new/post', auth.isAuthenticated, csrfProtection, function(request, response) {
    response.render('new_post.hbs', { layout: 'clean.hbs', csrfToken: request.csrfToken() })
})

blogRouter.post('/new/post', auth.isAuthenticated, csrfProtection, function(request, response) {
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

blogRouter.get('/edit/post/:slug', auth.isAuthenticated, csrfProtection, function(request, response) {
    blog.getPost(request.params.slug, function(error, Post) {
        if (error) {
            response.send(error)
        } else {
            const model = {
                title: 'Home',
                csrfToken: request.csrfToken(),
                Post
            }
            response.render('edit_post.hbs', model)
        }
    })
})

blogRouter.post('/edit/post/:slug', auth.isAuthenticated, csrfProtection, function(request, response) {
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

        response.render('edit_post.hbs', model)
        
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

blogRouter.post('/delete/post/:slug', auth.isAuthenticated, csrfProtection, function(request, response) {
    blog.deletePost(request.params.slug, function(error) {
        if (error) {
            response.send(error)
        } else {
            response.redirect('/posts')
        }
    })
})

blogRouter.get('/post/:slug', csrfProtection, function(request, response) {

    blog.getPost(request.params.slug, function(error, Post) {
        if (error) {
            response.send(error)
        } else {
            const model = {
                title: 'Home',
                csrfToken: request.csrfToken(),
                Post,
            }
            response.render('post.hbs', model)
        }
    })
});

blogRouter.get('/post', function(request, response) {
    response.redirect('/posts')
});

blogRouter.get('/posts', function(request, response) {

    var page = request.query.page
    if (page == "" || page == null) {
        page = 0
    }

    blog.getAllPosts(page, function(error, Posts, lastUrl, nextUrl) {
        if (error) {
            //response.status(404).send(error, "error")
            response.render("posts.hbs")
        } else {
            if (Posts == null) {

                const model = {
                    title: 'Posts',
                    lastUrl
                }

                response.render("posts.hbs", model)

            } else {
                var model = {
                    title: 'Posts',
                    Posts,
                    lastUrl,
                    nextUrl
                }

                response.render("posts.hbs", model)
            }
        }
    })
});

module.exports = blogRouter;