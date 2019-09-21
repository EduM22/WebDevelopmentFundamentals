var db = require('../db') 

exports.getLastPost = function(callback){
	
    const query = "SELECT * FROM Posts ORDER BY postid DESC LIMIT 1;"
	
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
	
    const query = "SELECT * FROM Posts ORDER BY postid DESC LIMIT 5 OFFSET ?"
    const values = [offset]
	
	db.all(query, values, function(error, Posts){
        if (error) {
            callback(error, null)
        } else {
            callback(null, Posts)
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

    const query = "SELECT * FROM Guestbook ORDER BY id DESC LIMIT 5 OFFSET ?"
    const values = [offset]
	
	db.all(query, values, function(error, entries){
        if (error) {
            callback(error, null)
        } else {
            callback(null, entries)
        }
	})
}