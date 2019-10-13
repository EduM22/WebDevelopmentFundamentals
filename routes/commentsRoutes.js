const express = require('express');
const commentRouter = express.Router();

const blog = require('../models/blog')
const auth = require('../models/auth')

const csurf = require('csurf')

const csrfProtection = csurf()

commentRouter.get('/comments/:postId', csrfProtection, function(request, response) {

    const postId = request.params.postId

    blog.getAllComments(postId, function(error, Comments) {
        if (error) {
            response.render('500.hbs')
        } else {
            if (Comments == null) {
                const model = {
                    title: 'Comments',
                    layout: 'clean.hbs',
                    csrfToken: request.csrfToken()
                }
                response.render("comments.hbs", model)
            } else {
                const model = {
                    title: 'Comments',
                    Comments: Comments,
                    signedIn: true,
                    layout: 'clean.hbs',
                    csrfToken: request.csrfToken()
                }
                response.render("comments.hbs", model)
            }
        }
    })
    
})

commentRouter.get('/comment/:commentId', csrfProtection, function(request, response) {

    const commentId = request.params.commentId

    if (commentId == " ") {
        response.send("you must specifie an id")
    } else {
        blog.getComment(commentId, function(error, comment) {
            if (error) {
                response.render('500.hbs')
            } else {
                if (comment == null) {
                    response.render('comment.hbs', {errorMessage: "Cant find a comment with that id"})
                } else {
                    const model = {
                        csrfToken: request.csrfToken(),
                        comment
                    }
                    response.render('comment.hbs', model)
                }
            }
        })
    }
    
})

commentRouter.post('/delete/comment/:id', auth.isAuthenticated, csrfProtection, function(request, response) {

    const id = request.params.id

    if (id == "") {
        response.redirect('/')
    } else {
        blog.deleteComment(id, function(error) {
            if (error) {
                response.render('500.hbs')
            } else {
                response.redirect('/posts')
            }
        })
    }
})

commentRouter.get('/new/comment/:postId', csrfProtection, function(request, response) {

    const postId = request.params.postId

    if (postId == " ") {
        const model = {
            title: 'New Comment',
            message: 'You must specifie a id',
            layout: 'clean.hbs'
        }
        response.render("404.hbs", model)
    } else {
        blog.getAllComments(postId, function(error, Comments) {
            if (error) {
                response.render('500.hbs')
            } else {
                const model = {
                    title: 'New Comment',
                    Comments,
                    csrfToken: request.csrfToken(),
                    layout: 'clean.hbs'
                }
                response.render("new_comment.hbs", model)
            }
        })    
    }
})

commentRouter.post('/new/comment/:postId', csrfProtection, async function(request, response) {
    const validationErrors = []

    const postId = request.params.postId

    const validateContent = request.body.content
    const validateUsername = request.body.username
    const validateEmail = request.body.email

    if (postId == "") {
        response.render('404.hbs')
    } else {
        if (validateContent == "") {
            validationErrors.push("content is empty")
        }
    
        if (validateUsername == "") {
            validationErrors.push("Name is empty")
        }
    
        if (validateEmail == "") {
            validationErrors.push("Email is empty")
        }

        await auth.validateEmail(validateEmail, function(status) {
            if (!status) {
                validationErrors.push("Email is not a valid email")
            }
        })
    
        if (validationErrors.length > 0) {

            const model = {
                csrfToken: request.csrfToken(),
                validationErrors,
                email: validateEmail,
                content: validateContent,
                username: validateUsername,
                layout: 'clean.hbs'
            }
    
            response.render('new_comment.hbs', model)
            
        } else {
    
            blog.newComment(postId, validateEmail, validateUsername, validateContent, function(error, post) {
                if (error) {
                    response.render('500.hbs')
                } else {
                    blog.getPostSlugFromId(postId, function(error, slug) {
                        if (error) {
                            response.redirect("/")
                        } else {
                            response.redirect("/post/"+slug['slug'])
                        }
                    })

                }
            })
        }
    }
    
})

module.exports = commentRouter;