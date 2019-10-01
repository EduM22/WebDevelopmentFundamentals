var express = require('express');
var normalRouter = express.Router();

var blog = require('../models/blog')

normalRouter.get('/', function(request, response) {

    blog.getLastPost(function(error, Post) {
        if (error) {
            const model = {
                title: 'Home',
            }
            response.render('home.hbs', model)
        } else {
            if (Post) {
                const signedIn = request.session.authenticated
                const model = {
                    title: 'Home',
                    Post,
                    signedIn
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

normalRouter.get('/contact', function(request, response) {
    response.render('contact.hbs')
})

normalRouter.get('/search', function(request, res) {
    const searchQuestion = request.query.q
    
    //res.render("search.hbs")
    res.send(searchQuestion)
})

normalRouter.get('/portfolio', function(request, response) {
    response.send('portfolio')
})

normalRouter.get('/guestbook', function(request, response) {
    var page = 0
    if (request.params.page == null) {
        page = 0
    } else {
        page = request.params.page
    }

    blog.getAllGuestbookEntries(page, function(error, entries) {
        if (error) {
            response.send(error, "error")
        } else {
            if (entries == null) {
                response.render('guestbook.hbs')
                //response.send("no entries")
            } else {
                const model = {
                    row: entries
                }
                response.render('guestbook.hbs', model)
                //response.send(entries)
            }
        }
    })

});


normalRouter.post('/guestbook', function(request, response) {
    response.status(200).send("post to guestbook")
    /*
    var page = request.query.page
    if (page == null) {
        page = 0
    }

    blog.getAllGuestbookEntries(page, function(error, entries) {
        if (error) {
            response.send(error, "error")
        } else {
            if (entries == null) {
                response.send("no entries")
            } else {
                response.send(entries)
            }
        }
    })*/
});

module.exports = normalRouter;