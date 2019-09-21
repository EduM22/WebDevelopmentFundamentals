const express = require('express')
const expressHandlebars = require('express-handlebars')
const bodyParser = require('body-parser')
var helmet = require('helmet')
const session = require('express-session')

var csurf = require('csurf')

var routes = require('./routes/routes')

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

app.use(routes)

app.listen(port, () => console.log(`App is listening on port ${port}!`))

//db.close();

//user => test,test