var express = require('express');
var normalRouter = express.Router();

var db = require('../db')
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
                const model = {
                    title: 'Home',
                    Post
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

normalRouter.get('/about', function(request, res) {
    res.render('about.hbs')
})

normalRouter.get('/contact', function(request, res) {
    res.render('contact.hbs')
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
            if (entries.length > 0) {
                response.send(entries)
            } else {
                response.send("no entries")
            }
        }
    })

    /*
    //get all guestbook
    db.all('SELECT * FROM Guestbook', (err, rows) => {
        if (err) {
            response.send(500)
        } else {
            if (rows.length > 0) {
                const model = {
                    rows
                }
                response.render('guestbook.hbs', model)
            } else {
                response.render('guestbook.hbs')
            }
        }
    });*/

});

normalRouter.get('/post/:slug', function(request, response) {

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
});

normalRouter.get('/post', function(request, response) {
    response.redirect('/posts')
});

/*
normalRouter.get('/posts', function(request, response) {
    blog.getAllPosts(0, function(error, Posts) {
        if (error) {
            response.send(error, "error")
        } else {
            response.send(Posts)
        }
    })
});
*/

normalRouter.get('/posts', function(request, response) {

    var page = 0
    if (request.params.page == null) {
        page = 0
    } else {
        page = request.params.page
    }

    blog.getAllPosts(page, function(error, Posts) {
        if (error) {
            response.send(error, "error")
        } else {
            if (Posts.length > 0) {
                const model = {
                    title: 'Posts',
                    Posts
                }
                response.render("posts.hbs", model)
            } else {
                const model = {
                    title: 'Home',
                }
                response.render('home.hbs', model)
            }
        }
    })
});

module.exports = normalRouter;