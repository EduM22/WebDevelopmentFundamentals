const express = require('express')
const expressHandlebars = require('express-handlebars')
const bodyParser = require('body-parser')
const db = require('./db')
const bcrypt = require('bcrypt')
var helmet = require('helmet')
const search = require('./search')

const port = 8080
const app = express()

app.engine('hbs', expressHandlebars({
    defaultLayout: 'main.hbs'
}))

app.use(helmet())

app.use(express.static(__dirname + '/public'));  

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


app.get('/login', function(req, res) {
    res.render('login.hbs', { layout: 'auth.hbs' })
})

app.post('/login', function(req, res) {
    const error = ''

    const username = req.body.username
    const password = req.body.password

    if(username && password) {
        db.query('SELECT * FROM accounts WHERE username = ?', [username], function(error, results) {
            if (error) {
                //no user
            } else {
                bcrypt.compare(password ,results.password).then(function(res) {
                    if (res) {
                        //login
                        res.redirect('/admin')
                    } else {
                        //failed login
                    }
                })
            }
        })
    } else {
        // no username or password
        res.render('login.hbs', error)
    }
})


app.get('/register', function(req, res) {
    res.render('login.hbs', { layout: 'auth.hbs' })
})

app.post('/register', function(req, res) {
    const error = ''

    const username = req.body.username
    const password = req.body.password
    if(username && password) {
        db.query('SELECT * FROM accounts WHERE username = ?', [username], function(error) {
            if (error) {
                bcrypt.hash(password, 12).then(function(hash) {
                    if (hash) {
                        // succesful hash
                        // try db insert
                        // redirect to login
                        res.redirect('/login')
                    } else {
                        // error with hashing
                    }
                })
            } else {
                //user already exsists
            }
        })
    } else {
        // no username or password
        res.render('login.hbs', error)
    }
})

app.use(function(req, res, next) {
    res.status(404).render('404.hbs')
});

app.listen(port, () => console.log(`App is listening on port ${port}!`))