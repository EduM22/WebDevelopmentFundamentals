const express = require('express')
const expressHandlebars = require('express-handlebars')
const bodyParser = require('body-parser')
const bcrypt = require('bcrypt')
var helmet = require('helmet')
const search = require('./search')
var db = require('./db.js')
const session = require('express-session')

const port = 8080
const app = express()

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

app.get('/', function(req, res) {
    const model = {
        title: 'home'
    }
   
    res.render('home.hbs', model)
})

app.get('/about', function(req, res) {
    res.render('about.hbs')
})

app.get('/contact', function(req, res) {
    res.render('contact.hbs')
})

app.get('/search', function(req, res) {
    const searchQuestion = req.query.q

    const model = {
        humans: search.humans
    }
    
    res.render("search.hbs", model)
})

app.get('/portfolio', function(req, res) {
    res.send('portfolio')
})

app.get('/post/:id', function(req, res) {
    res.send(req.params)
});

app.get('/post', function(req, res) {
    res.redirect('/posts')
});

app.get('/posts', function(req, res) {
    res.send({'posts': 'allposts'})
});

app.get('/new/post', isAuthenticated, function(req, res) {
    res.send('post')
})

app.post('/new/post', isAuthenticated, function(req, res) {
    res.send('post')
})

app.get('/admin', isAuthenticated, function(req, res) {
    res.send('look at me')
});

app.get('/login', function(req, res) {
    res.render('login.hbs', { layout: 'clean.hbs' })
})

app.post('/login', function(req, res) {
    const username = req.body.username
    const password = req.body.password

    if(username && password) {

        db.all('SELECT * FROM Users WHERE username = ?', [username], (err, rows) => {
            console.log(rows);
            if (rows.length > 0) {
                bcrypt.compare(password, rows[0].password, function(err, results) {
                    if (err) {
                        console.log('err')
                    } else {
                        if (results) {
                            console.log('jippi')
                            req.session.authenticated = true
                            res.redirect('/admin')
                        } else {
                            console.log('wrong password')
                        }
                    }
                });

            } else {
                res.send({}); // failed, so return an empty object instead of undefined
            }
        });

    } else {
        // no username or password
        res.render('login.hbs', { layout: 'clean.hbs' })
    }
})

/*

app.get('/signup', function(req, res) {
    res.render('signup.hbs', { layout: 'clean.hbs' })
})

app.post('/signup', function(req, res) {
    const username = req.body.username

    if(username && req.body.password) {

        bcrypt.hash(req.body.password, 10, function(err, hash) {
            if (err) {
                console.log(err.message)
                res.status(400).send({'error': 'err'})
            } else {
                console.log(hash)

                db.run('INSERT INTO Users (username, password, created_date) VALUES (?, ?, ?)', [username, hash, Date.now()], (err) => {
                    if (err) {
                        console.log(err.message)
                        res.redirect('/')
                    } else {
                        res.status(200).send({'id': this.lastID})
                    }
                });

            }
        });

    } else {
        // no username or password
        res.render('signup.hbs', { layout: 'clean.hbs' })
    }
})

*/

app.get('/logout', isAuthenticated, function(req, res) {
    req.session.authenticated = false
    res.redirect('/')
});


app.use(function(req, res, next) {
    res.status(404).render('404.hbs', { layout: 'clean.hbs' })
});

function isAuthenticated(req, res, next) {
    if (req.session.authenticated) {
        return next();
    }

    res.redirect('/')
}


app.listen(port, () => console.log(`App is listening on port ${port}!`))

//db.close();

//user => test,test