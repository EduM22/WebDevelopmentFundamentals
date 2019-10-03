var db = require('../db') 
const bcrypt = require('bcrypt')

exports.login = function(username, password, request, callback){
	
    const query = "SELECT * FROM Users WHERE username = ?"
	const values = [username]
	
	db.get(query, values, function(error, user){
        if (error) {
            callback(true, false)
        } else {
            if (user) {
                bcrypt.compare(password, user.password).then(function(result) {
                    if (result) {
                        //true
                        request.session.authenticated = true
                        request.session.user = user
                        callback(false, false, user)
                    } else {
                        //false
                        callback(false, true, null)
                    }
                });
            } else {
                callback(false, true, null)
            }
        }
	})
}

exports.logout = function(request, callback){
    request.session.authenticated = false
    request.session.user = null
    callback(null)
}


exports.changePassword = function(username, oldPassword, newPassword, callback){
	
    const firstQuery = "SELECT * FROM Users WHERE username = ?"
    const secondQuery = "UPDATE Users SET password = ? WHERE username = ?"
    const firstValues = [username]
	
	db.get(firstQuery, firstValues, function(error, user) {
        if (error) {
            callback(true, false, false)
        } else {
            bcrypt.compare(oldPassword, user.password, function(error) {
                if (error) {
                    callback(false, true, false)
                } else {
                    bcrypt.hash(newPassword, 10, function(error, hash) {
                        if (error) {
                            callback(false, true, false)
                        } else {
                            const secondValues = [hash]
                            db.run(secondQuery, secondValues, function(error) {
                                if (error) {
                                    callback(true, false, false)
                                } else {
                                    callback(false, false, true)
                                }
                            })
                        }
                    });
                }
            });
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