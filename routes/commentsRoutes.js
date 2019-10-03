const express = require('express');
const commentRouter = express.Router();

const blog = require('../models/blog')

commentRouter.get('/comments/:postId', function(request, response) {

    const postId = request.params.postId

    blog.getAllComments(postId, function(error, Comments) {
        if (error) {
            response.send(error.message)
        } else {
            if (Comments == null) {
                const model = {
                    title: 'Comments',
                    layout: 'clean.hbs'
                }
                response.render("comments.hbs", model)
            } else {
                const model = {
                    title: 'Comments',
                    Comments: Comments,
                    layout: 'clean.hbs'
                }
                response.render("comments.hbs", model)
            }
        }
    })
    
})

commentRouter.get('/new/comment/:postId', function(request, response) {

    const postId = request.params.postId

    if (postId == "") {
        const model = {
            title: 'New Comment',
            message: 'You must specifie a id',
            layout: 'clean.hbs'
        }
        response.render("404.hbs", model)
    } else {
        blog.getAllComments(postId, function(error, Comments) {
            if (error) {
    
            } else {
                const model = {
                    title: 'New Comment',
                    Comments,
                    layout: 'clean.hbs'
                }
                response.render("new_comment.hbs", model)
            }
        })    
    }
})

commentRouter.post('/new/comment/:postId', function(request, response) {
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
            validationErrors.push("slug is empty")
        }
    
        if (validateEmail == "") {
            validationErrors.push("Choose an category ")
        }
    
        if (validationErrors.length > 0) {

            const model = {
                validationErrors,
                email: validateEmail,
                content: validateContent,
                username: validateUsername,
                layout: 'clean.hbs'
            }
    
            response.render('new_post.hbs', model)
            
        } else {
    
            blog.newComment(postId, validateEmail, validateUsername, validateContent, function(error, post) {
                if (error) {
                    response.send(error)
                } else {
                    console.log(post)
                    response.redirect("/posts/")
                }
            })
        }
    }

    /*
    blog.newComment(postId, function(error, Comments) {
        if (error) {

        } else {
            const model = {
                title: 'Comments',
                Comments,
                layout: 'clean.hbs'
            }
            response.render("comments.hbs", model)
        }
    })*/
    
})

module.exports = commentRouter;