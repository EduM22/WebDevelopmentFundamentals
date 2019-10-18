const express = require('express')
const expressHandlebars = require('express-handlebars')
const bodyParser = require('body-parser')
const helmet = require('helmet')
const session = require('express-session')
const SQLiteStore = require('connect-sqlite3')(session)
const fileUpload = require('express-fileupload');

const routes = require('./routes/routes')

const port = 8080
const app = express()

app.engine('hbs', expressHandlebars({
    defaultLayout: 'main.hbs'
}))

app.use(helmet())

app.use(fileUpload({
    safeFileNames: true 
}));

app.use(express.static('public'))

app.use(session({
    secret: 'MySuperSecret%&Dsyur7632udhkef478g3fg657i34girew65784frig7w',
    resave: false,
    saveUninitialized: false,
    store: new SQLiteStore(),
    cookie: {
        secure: false,
    }
}))

app.use(bodyParser.urlencoded({
    extended: false
}))

app.use(function(request, response, next){
	
    response.locals.signedIn = request.session.authenticated
	next()
	
})

app.use(routes)

app.listen(port, () => console.log(`App is listening on port ${port}!`))

//user => root, toor123