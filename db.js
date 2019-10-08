const sqlite3 = require('sqlite3').verbose()
const bcrypt = require('bcrypt')

const db = new sqlite3.Database('db-blog.db', (error) => {
    if (error) {
        console.log(error.message)
    } else {
        db.run("CREATE TABLE IF NOT EXISTS Users (\
            uid INTEGER PRIMARY KEY AUTOINCREMENT,\
            username TEXT UNIQUE NOT NULL,\
            password TEXT NOT NULL,\
            created_date DATE NOT NULL)", function(error) {
            if (error) {
                console.log(error.message)
            }
        });


        db.run("CREATE TABLE IF NOT EXISTS Posts (\
            post_id INTEGER PRIMARY KEY AUTOINCREMENT,\
            post_user INT NOT NULL,\
            post_slug TEXT NOT NULL UNIQUE,\
            post_content TEXT NOT NULL,\
            post_category TEXT NOT NULL,\
            post_date DATE NOT NULL,\
            FOREIGN KEY (post_user) REFERENCES Users(uid))", function(error) {
            if (error) {
                console.log(error.message)
            }
        });


        db.run("CREATE TABLE IF NOT EXISTS Comments (\
            comment_id INTEGER PRIMARY KEY AUTOINCREMENT,\
            post_id INT NOT NULL,\
            comment_email TEXT NOT NULL,\
            comment_username TEXT NOT NULL,\
            comment_content TEXT NOT NULL,\
            comment_date DATE NOT NULL,\
            FOREIGN KEY (post_id) REFERENCES Posts(post_id))", function(error) {
            if (error) {
                console.log(error.message)
            }
        });
            

        db.run("CREATE TABLE IF NOT EXISTS Pages (\
            id INTEGER PRIMARY KEY AUTOINCREMENT,\
            name TEXT NOT NULL,\
            content TEXT NOT NULL)", function(error) {
            if (error) {
                console.log(error.message)
            }
        });


        db.run("CREATE TABLE IF NOT EXISTS Guestbook (\
            guestbook_id INTEGER PRIMARY KEY AUTOINCREMENT,\
            guestbook_name TEXT NOT NULL,\
            guestbook_content TEXT NOT NULL,\
            created_date DATE NOT NULL)", function(error) {
            if (error) {
                console.log(error.message)
            }
        });
            

        db.run("CREATE TABLE IF NOT EXISTS Contact (\
            contact_id INTEGER PRIMARY KEY AUTOINCREMENT,\
            contact_email TEXT NOT NULL,\
            contact_content TEXT NOT NULL,\
            created_date DATE NOT NULL)", function(error) {
            if (error) {
                console.log(error.message)
            }
        });


        const query = "SELECT * FROM Users WHERE username = ? LIMIT 1"
        const values = ["root"]
	
        db.get(query, values, function(error, user){
            if (error) {

                bcrypt.hash("toor123", 10, function(error, hash) {
                    if (error) {
                        console.log("error with bcrypt hash creation please delete db and try again")
                    } else {
                        const query = "INSERT INTO Users (username, password, created_date) VALUES (?, ?, ?)"
                        const values = ["root", hash, Date.now()]
        
                        db.run(query, values, function(error){
                            if (error) {
                                console.log(error.message)
                                console.log("error with account creation please delete db and try again")
                            } else {
                                console.log("you can now login with username: root, password: toor123")
                            }
                        })
                    }
                });
        
            } else {
                console.log("you can now login with username: root, password: toor123")
            }
        })

    }
});

module.exports = db