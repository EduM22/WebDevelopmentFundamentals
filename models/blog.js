var db = require('../db') 

exports.getLastPost = function(callback){
	
    const query = "SELECT * FROM Posts ORDER BY post_id DESC LIMIT 1;"
	
	db.get(query, function(error, lastPost){
        if (error) {
            callback(error, null)
        } else {
            callback(null, lastPost)
        }
	})
}

exports.newPost = function(userId, slug, content, category, callback) {

    const query = "INSERT INTO Posts (post_user, post_slug, post_content, post_category, post_date) VALUES (?, ?, ?, ?, ?)"
    const values = [userId, slug, content, category, Date.now()]
	
	db.run(query, values, function(error){
        if (error) {
            callback(error, null)
        } else {
            callback(null, this.lastID)
        }
	})
}

exports.getAllPosts = function(offset, callback){

    const query = "SELECT * FROM Posts ORDER BY post_id DESC LIMIT 5 OFFSET ?"
    const values = [(offset * 5)]

    const query2 = "SELECT COUNT(*) FROM Posts"

    
    db.all(query, values, function(error, Posts){
        if (error) {
            callback(error, null, null, null)
        } else {
            if (Posts.length > 0) {
                //new pagination button logic
                db.get(query2, function(error, amount) {
                    if (error) {
                        callback(null, Posts, null, null)
                    } else {
                        if (amount['COUNT(*)'] > (parseInt(offset)+1)*5) {
                            if (parseInt(offset) > 0) {
                                callback(null, Posts, "/posts?page="+(parseInt(offset)-1), "/posts?page="+(parseInt(offset)+1))
                            } else {
                                callback(null, Posts, null, "/posts?page="+(parseInt(offset)+1))
                            }
                        } else {
                            if (parseInt(offset) > 0) {
                                callback(null, Posts, "/posts?page="+(parseInt(offset)-1), null)
                            } else {
                                callback(null, Posts, null, null)
                            }
                        }
                    }
                })
                // old = callback(null, Posts)
            } else {
                callback(null, null, null, null)
            }
        }
    })
}

exports.getPost = function(slug, callback){
	
    const query = "SELECT * FROM Posts WHERE post_slug = ?"
    const values = [slug]
	
	db.get(query, values, function(error, Post){
        if (error) {
            callback(error, null)
        } else {
            callback(null, Post)
        }
	})
}

exports.updatePost = function(userId, slug, oldSlug, content, category, callback) {

    const query = "UPDATE Posts SET post_user = ?, post_slug = ?, post_content = ?, post_category = ? WHERE post_slug = ?"
    const values = [userId, slug, content, category, oldSlug]
	
	db.run(query, values, function(error){
        if (error) {
            callback(error, null)
        } else {
            callback(null, this.lastID)
        }
	})
}

exports.deletePost = function(slug, callback) {

    const query = "DELETE FROM Posts WHERE post_slug = ?;"
    const values = [slug]
	
	db.run(query, values, function(error){
        if (error) {
            callback(error, null)
        } else {
            callback(null, this.lastID)
        }
	})
}

exports.getAllGuestbookEntries = function(offset,callback) {

    const query = "SELECT * FROM Guestbook ORDER BY guestbook_id DESC LIMIT 5 OFFSET ?"
    const values = [(offset * 5)]
    
    db.all(query, values, function(error, entries){
        if (error) {
            callback(error, null)
        } else {
            if (entries.length > 0) {
                callback(null, entries)
            } else {
                callback(null, null)
            }
        }
    })
}

exports.newGuestbookEntry = function(name, content, callback) {

    const query = "INSERT INTO Guestbook (guestbook_name, guestbook_content, created_date) VALUES (?, ?, ?)"
    const values = [name, content, Date.now()]
	
	db.run(query, values, function(error){
        if (error) {
            callback(error, null)
        } else {
            callback(null, this.lastID)
        }
	})
}

exports.deleteGuestbookEntry = function(id, callback) {

    const query = "DELETE FROM Guestbook WHERE guestbook_id = ?;"
    const values = [id]
	
	db.run(query, values, function(error){
        if (error) {
            callback(error, null)
        } else {
            callback(null, true)
        }
	})
}

exports.getWebpageContent = function(webpage, callback) {

    const query = "SELECT * FROM Pages WHERE page = ? LIMIT 1"
    const values = [webpage]
	
	db.get(query, values, function(error, content){
        if (error) {
            callback(error, null)
        } else {
            callback(null, content)
        }
	})
}

exports.getAllComments = function(postId, callback) {

    const query = "SELECT * FROM Comments WHERE post_id = ?"
    const values = [postId]
	
	db.all(query, values, function(error, Comments){
        if (error) {
            callback(error, null)
        } else {
            callback(null, Comments)
        }
	})
}

exports.newComment = function(postId, email, username, content, callback) {
    const query = "INSERT INTO Comments (post_id, comment_email, comment_username, comment_content, comment_date) VALUES (?, ?, ?, ?, ?)"
    const values = [postId, email, username, content, Date.now()]
	
	db.run(query, values, function(error){
        if (error) {
            callback(error, null)
        } else {
            callback(null, this.lastID)
        }
	})
}