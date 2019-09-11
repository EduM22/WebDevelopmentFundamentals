const express = require('express')
const expressHandlebars = require('express-handlebars')
const bodyParser = require('body-parser')
const bcrypt = require('bcrypt')
var helmet = require('helmet')
const search = require('./search')
var db = require('./db.js')
const session = require('express-session')
var csurf = require('csurf')

const port = 8080
const app = express()

//var csrfProtection = csurf({ cookie: true })

app.engine('hbs', expressHandlebars({
    defaultLayout: 'main.hbs'
}))

app.use(helmet())

app.use(express.static(__dirname + '/public'));  

app.use(session({
    secret: 'MySuperSecret%&Dsyur7632udhkef478g3fg657i34girew65784frig7w',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
    }
}))

app.use(bodyParser.urlencoded({
    extended: false
}))

app.get('/', function(request, response) {
    const model = {
        title: 'Home',
    }

    db.all('SELECT * FROM Posts DESC LIMIT 1', (err, row) => {
        if (err) {
            console.log(err.message)
            response.send(500)
        } else {
            if (row.length > 0) {
                model.push(row)
                response.render('home.hbs', model)
            } else {
                response.render('home.hbs', model)
        
            }
        }
    });
})

app.get('/about', function(request, res) {
    res.render('about.hbs')
})

app.get('/contact', function(request, res) {
    res.render('contact.hbs')
})

app.get('/search', function(request, res) {
    const searchQuestion = request.query.q

    const model = {
        humans: search.humans
    }
    
    res.render("search.hbs", model)
})

app.get('/portfolio', function(request, response) {
    response.send('portfolio')
})

app.get('/guestbook', function(request, response) {
    //get all guestbook
    db.all('SELECT * FROM Guestbook', (err, rows) => {
        if (err) {
            console.log(err.message)
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
    });

});

app.get('/post/:id', function(request, response) {
    response.send(request.params)
});

app.get('/post', function(request, response) {
    response.redirect('/posts')
});

app.get('/posts/:page', function(request, response) {
    response.send({'posts': 'allposts'})
});

app.get('/new/post', isAuthenticated, function(request, response) {
    response.render('new_post.hbs')
})

app.post('/new/post', isAuthenticated, function(request, response) {
    const content = request.body.content
    const slug = request.body.slug
    const category = request.body.category

    if (content == '') {

    }

    if (slug == '') {

    }

    if (category == '') {

    }


    if (content && slug && category) {

        db.run('INSERT INTO Posts ', [username, hash, Date.now()], (err) => {
            if (err) {
                console.log(err.message)
                response.redirect('/')
            } else {
                response.status(200).send({'id': this.lastID})
            }
        });
        
    } else {

    }

    response.send('post')
})

app.get('/admin', isAuthenticated, function(request, response) {
    response.send('look at me')
});

app.get('/login', alreadyAuthenticated, function(request, response) {
    response.render('login.hbs', { layout: 'clean.hbs' })
})

app.post('/login', alreadyAuthenticated, function(request, response) {
    const username = request.body.username
    const password = request.body.password

    if(username && password) {

        db.all('SELECT * FROM Users WHERE username = ?', [username], (err, row) => {
            if (err) {
                console.log(err.message)
                response.send(500)
            } else {
                if (row.length > 0) {
                    bcrypt.compare(password, row[0].password, function(err, results) {
                        if (err) {
                            console.log(err.message)
                            response.send(500)
                        } else {
                            if (results) {
                                console.log('jippi')
                                request.session.authenticated = true
                                request.session.id = row.uid
                                response.redirect('/admin')
                            } else {
                                console.log('wrong password')
                                response.send('wrong password')
                            }
                        }
                    });
    
                } else {
                    response.send({}); // failed, so return an empty object instead of undefined
                }
            }
        });

    } else {
        // no username or password
        response.render('login.hbs', { layout: 'clean.hbs' })
    }
})

/*

app.get('/signup', function(request, response) {
    response.render('signup.hbs', { layout: 'clean.hbs' })
})

app.post('/signup', function(request, response) {
    const username = request.body.username

    if(username && request.body.password) {

        bcrypt.hash(request.body.password, 10, function(err, hash) {
            if (err) {
                console.log(err.message)
                response.status(400).send({'error': 'err'})
            } else {
                console.log(hash)

                db.run('INSERT INTO Users (username, password, created_date) VALUES (?, ?, ?)', [username, hash, Date.now()], (err) => {
                    if (err) {
                        console.log(err.message)
                        response.redirect('/')
                    } else {
                        response.status(200).send({'id': this.lastID})
                    }
                });

            }
        });

    } else {
        // no username or password
        response.render('signup.hbs', { layout: 'clean.hbs' })
    }
})

*/

app.get('/logout', isAuthenticated, function(request, response) {
    request.session.authenticated = false
    request.session.id = null
    response.redirect('/')
});


app.use(function(request, response, next) {
    response.status(404).render('404.hbs', { layout: 'clean.hbs' })
});

app.use(function(request, response, next) {
    response.status(500).render('500.hbs', { layout: 'clean.hbs' })
});

function isAuthenticated(request, response, next) {
    if (request.session.authenticated) {
        return next();
    }

    response.redirect('/')
}

function alreadyAuthenticated(request, response, next) {
    if (request.session.authenticated) {
        return response.redirect('/admin')
    } else {
        return next();
    }
}


app.listen(port, () => console.log(`App is listening on port ${port}!`))

//db.close();

//user => test,test