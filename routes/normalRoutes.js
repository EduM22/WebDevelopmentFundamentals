const express = require('express');
const normalRouter = express.Router();

const blog = require('../models/blog')
const csurf = require('csurf')

const csrfProtection = csurf()

normalRouter.get('/', function(request, response) {

    blog.getLastPost(function(error, Post) {
        if (error) {
            const model = {
                title: 'Home',
            }
            response.render('home.hbs', model)
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
            response.send("sql error")
        } else {
            if (content) {
                response.send(content)
            } else {
                response.send("no content")
            }
        }
    })
})

normalRouter.get('/contact', csrfProtection, function(request, response) {
    response.render('contact.hbs', {csrfToken: request.csrfToken()})
})

normalRouter.post('/contact', csrfProtection, function(request, response) {
    response.render('contact.hbs')
})


normalRouter.get('/search', function(request, res) {
    const searchQuestion = request.query.q
    
    //res.render("search.hbs")
    res.send(searchQuestion)
})

normalRouter.get('/portfolio', function(request, response) {
    response.render('portfolio.hbs')
})

module.exports = normalRouter;