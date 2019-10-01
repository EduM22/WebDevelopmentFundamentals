var express = require('express');
var blogRouter = express.Router();

var blog = require('../models/blog')

function isAuthenticated(request, response, next) {
    if (request.session.authenticated && request.session.user != null) {
        return next();
    }

    response.redirect('/')
}


blogRouter.get('/new/post', isAuthenticated, function(request, response) {
    response.render('new_post.hbs', { layout: 'clean.hbs' })
})

blogRouter.post('/new/post', isAuthenticated, function(request, response) {
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

blogRouter.get('/edit/post/:slug', isAuthenticated, function(request, response) {
    blog.getPost(request.params.slug, function(error, Post) {
        if (error) {
            response.send(error)
        } else {
            const model = {
                title: 'Home',
                Post
            }
            response.render('edit_post.hbs', model)
        }
    })
})

blogRouter.post('/edit/post/:slug', isAuthenticated, function(request, response) {
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
                console.log("test")
                response.redirect("/post/"+validateSlug)
            }
        })

    }
})

blogRouter.get('/delete/post/:slug', isAuthenticated, function(request, response) {
    blog.deletePost(request.params.slug, function(error) {
        if (error) {
            response.send(error)
        } else {
            response.redirect('/posts')
        }
    })
})

blogRouter.get('/post/:slug', function(request, response) {

    blog.getPost(request.params.slug, function(error, Post) {
        if (error) {
            response.send(error)
        } else {
            const model = {
                title: 'Home',
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
    if (page == null) {
        page = 0
    }

    blog.getAllPosts(page, function(error, Posts) {
        if (error) {
            //response.status(404).send(error, "error")
            response.render("posts.hbs")
        } else {
            if (Posts == null) {
                const last_url = parseInt(page) - 1
                /*if (last_url <= 0 || last_url == null) {
                    last_url = ""
                }*/
                const model = {
                    title: 'Posts',
                    last_url
                }
                response.render("posts.hbs", model)
            } else {
                const next_url = parseInt(page) + 1
                const last_url = parseInt(page) - 1
                /*if (last_url <= 0 || last_url == null) {
                    last_url = ""
                }*/
               
                const model = {
                    title: 'Posts',
                    Posts,
                    next_url,
                    last_url
                }
                response.render("posts.hbs", model)
            }
        }
    })
});

module.exports = blogRouter;