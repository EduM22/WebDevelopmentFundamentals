var sqlite3 = require('sqlite3').verbose()

let db =  new sqlite3.Database('db-blog.db', (error) => {
    if (error) {
        console.log(error.message)
    } else {
        db.run("CREATE TABLE IF NOT EXISTS Users (\
            uid INTEGER PRIMARY KEY AUTOINCREMENT,\
            username CHAR(50) UNIQUE NOT NULL,\
            password VARCHAR(255) NOT NULL,\
            created_date DATE NOT NULL)", function(error) {
            if (error) {
                console.log(error)
            }
        });


        db.run("CREATE TABLE IF NOT EXISTS Posts (\
            postid INTEGER PRIMARY KEY AUTOINCREMENT,\
            post_user INT NOT NULL,\
            post_slug CHAR(50) NOT NULL UNIQUE,\
            post_content TEXT NOT NULL,\
            post_category char(50) NOT NULL,\
            post_date DATE NOT NULL,\
            FOREIGN KEY (post_user) REFERENCES Users(uid))", function(error) {
            if (error) {
                console.log(error)
            }
        });


        db.run("CREATE TABLE IF NOT EXISTS Comments (\
            commentid INTEGER PRIMARY KEY AUTOINCREMENT,\
            post_id INT NOT NULL,\
            comment_username CHAR(50) NOT NULL,\
            comment_content VARCHAR(255) NOT NULL,\
            comment_date DATE NOT NULL,\
            FOREIGN KEY (post_id) REFERENCES Posts(postid))", function(error) {
            if (error) {
                console.log(error)
            }
        });
            

        db.run("CREATE TABLE IF NOT EXISTS Pages (\
            id INTEGER PRIMARY KEY AUTOINCREMENT,\
            page CHAR(15) NOT NULL,\
            content TEXT NOT NULL)", function(error) {
            if (error) {
                console.log(error)
            }
        });


        db.run("CREATE TABLE IF NOT EXISTS Guestbook (\
            id INTEGER PRIMARY KEY AUTOINCREMENT,\
            name CHAR(50) NOT NULL,\
            content VARCHAR(255) NOT NULL,\
            created_date DATE NOT NULL)", function(error) {
            if (error) {
                console.log(error)
            }
        });
            

        db.run("CREATE TABLE IF NOT EXISTS Contact (\
            id INTEGER PRIMARY KEY AUTOINCREMENT,\
            mail VARCHAR(255) UNIQUE NOT NULL,\
            content TEXT NOT NULL,\
            created_date DATE NOT NULL)", function(error) {
            if (error) {
                console.log(error)
            }
        });



    }
});

module.exports = db