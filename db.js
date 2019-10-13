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


        db.run("CREATE TABLE IF NOT EXISTS BlogPosts (\
            id INTEGER PRIMARY KEY AUTOINCREMENT,\
            user INT NOT NULL,\
            slug TEXT NOT NULL UNIQUE,\
            content TEXT NOT NULL,\
            category TEXT NOT NULL,\
            post_date DATE NOT NULL,\
            FOREIGN KEY (user) REFERENCES Users(uid))", function(error) {
            if (error) {
                console.log(error.message)
            }
        });


        db.run("CREATE TABLE IF NOT EXISTS BlogPostComments (\
            id INTEGER PRIMARY KEY AUTOINCREMENT,\
            post_id INT NOT NULL,\
            email TEXT NOT NULL,\
            username TEXT NOT NULL,\
            content TEXT NOT NULL,\
            post_date DATE NOT NULL,\
            FOREIGN KEY (post_id) REFERENCES BlogPosts(id))", function(error) {
            if (error) {
                console.log(error.message)
            }
        });
            

        db.run("CREATE TABLE IF NOT EXISTS PageContent (\
            id INTEGER PRIMARY KEY AUTOINCREMENT,\
            name TEXT NOT NULL,\
            content TEXT NOT NULL)", function(error) {
            if (error) {
                console.log(error.message)
            } else {
                const queryPortfolio = "INSERT INTO PageContent (name, content) VALUES (?, ?)"
                const valuePortfolio = ['portfolio', 'default content']
                db.run(queryPortfolio, valuePortfolio, function(error) {
                    if (error) {
                        console.log(error.message)
                        console.log('No default content')
                    } else {
                        
                    }
                })
                const queryAbout = "INSERT INTO PageContent (name, content) VALUES (?, ?)"
                const valueAbout = ['about', 'default content']
                db.run(queryAbout, valueAbout, function(error) {
                    if (error) {
                        console.log(error.message)
                        console.log('No default content')
                    } else {
                       
                    }
                })
            }
        });


        db.run("CREATE TABLE IF NOT EXISTS GuestbookEntries (\
            id INTEGER PRIMARY KEY AUTOINCREMENT,\
            name TEXT NOT NULL,\
            content TEXT NOT NULL,\
            post_date DATE NOT NULL)", function(error) {
            if (error) {
                console.log(error.message)
            }
        });
            

        db.run("CREATE TABLE IF NOT EXISTS ContactRequests (\
            id INTEGER PRIMARY KEY AUTOINCREMENT,\
            email TEXT NOT NULL,\
            content TEXT NOT NULL,\
            post_date DATE NOT NULL)", function(error) {
            if (error) {
                console.log(error.message)
            }
        })

        db.run("CREATE TABLE IF NOT EXISTS FileUploads (\
            id INTEGER PRIMARY KEY AUTOINCREMENT,\
            name TEXT NOT NULL UNIQUE,\
            location TEXT NOT NULL)", function(error) {
            if (error) {
                console.log(error.message)
            }
        })
    }

    /*
    const queryCheckIfExsistsPortfolio = "SELECT * FROM PageContent WHERE name='portfolio' LIMIT 1"
    db.get(queryCheckIfExsistsPortfolio, function(error, row) {
        if (error) {
            const queryPortfolio = "INSERT INTO PageContent (name, content) VALUES (?, ?)"
            const valuePortfolio = ['portfolio', 'default content']
            db.run(queryPortfolio, valuePortfolio, function(error) {
                if (error) {
                    console.log(error.message)
                    console.log('No default content')
                } else {
                    console.log('Portfolio default content')
                }
            })
        } else {
            // nothing
            console.log('error portfolio')
        }
    })*/

    /*
    const queryCheckIfExsistsAbout = "SELECT * FROM PageContent WHERE name='about' LIMIT 1"
    db.get(queryCheckIfExsistsAbout, function(error, row) {
        if (error) {
            const queryAbout = "INSERT INTO PageContent (name, content) VALUES (?, ?)"
            const valueAbout = ['about', 'default content']
            db.run(queryAbout, valueAbout, function(error) {
                if (error) {
                    console.log(error.message)
                    console.log('No default content')
                } else {
                    console.log('About default content')
                }
            })
        } else {
            // nothing
            console.log('error about')
        }
    })
    */

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
           })
       } else {
           console.log("you can now login with username: root, password: toor123")
       }
   })

})

module.exports = db