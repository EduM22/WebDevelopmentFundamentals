const db = require('../db') 
const bcrypt = require('bcrypt')

exports.login = function(username, password, request, callback) {
	
    const query = "SELECT * FROM Users WHERE username = ?"
	const values = [username]
	
	db.get(query, values, function(error, user) {
        if (error) {
            callback(error, false, null)
        } else {
            if (user) {
                bcrypt.compare(password, user.password, function(error, result) {
                    if (error) {
                        callback(false, true, null)
                    } else {
                        request.session.authenticated = true
                        request.session.user = user
                        callback(false, false, user)
                    }
                });
            } else {
                callback(false, true, null)
            }
        }
	})
}

exports.validateEmail = function(email, callback) {
    if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
        callback(true)
    } else {
        callback(false)
    }
}

exports.logout = function(request, callback) {
    request.session.destroy(function(error) {
        if (error) {
            callback(error)
        } else {
            callback(null)
        }
    })
}

exports.isAuthenticated = function (request, response, next) {
    if (request.session.authenticated && request.session.user != null) {
        return next();
    }

    response.redirect('/')
}

exports.alreadyAuthenticated = function(request, response, next) {
    if (request.session.authenticated && request.session.user != null) {
        return response.redirect('/admin')
    } else {
        return next();
    }
}