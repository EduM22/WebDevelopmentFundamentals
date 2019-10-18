const db = require('../db') 
const Fuse = require('fuse.js')

exports.getLastPost = function(callback) {
	
    const query = "SELECT * FROM BlogPosts ORDER BY id DESC LIMIT 1;"
	
	db.get(query, function(error, lastPost) {
        callback(error, lastPost)
	})
}

exports.newPost = function(userId, slug, content, category, callback) {

    const date = new Date()
    const query = "INSERT INTO BlogPosts (user, slug, content, category, post_date) VALUES (?, ?, ?, ?, ?)"
    const values = [userId, slug, content, category, date]
	
	db.run(query, values, function(error) {
        callback(error, this.lastID)
	})
}

exports.getAllPosts = function(offsetUser, callback) {

    const offset = (parseInt(offsetUser) - 1)
    const nextPageIdPlusValue = 2

    const numberOffPostsToGet = 5
    const queryGetPosts = "SELECT * FROM BlogPosts ORDER BY id DESC LIMIT 5 OFFSET ?"
    const values = [(offset * numberOffPostsToGet)]

    const queryNumberOfRows = "SELECT COUNT(*) FROM BlogPosts"

    db.all(queryGetPosts, values, function(error, Posts) {
        if (error) {
            callback(error, null, null, null)
        } else {
            if (Posts.length > 0) {
                db.get(queryNumberOfRows, function(error, amount) {
                    if (error) {
                        callback(null, Posts, null, null)
                    } else {
                        if (amount['COUNT(*)'] > (parseInt(offset)+1)*numberOffPostsToGet) {
                            if (parseInt(offset) > 0) {
                                if ((parseInt(offset)-1) <= 0) {
                                    callback(null, Posts, "/posts", "/posts?page="+(parseInt(offset)+nextPageIdPlusValue))
                                } else {
                                    callback(null, Posts, "/posts?page="+(parseInt(offset)), "/posts?page="+(parseInt(offset)+nextPageIdPlusValue))
                                }
                            } else {
                                callback(null, Posts, null, "/posts?page="+(parseInt(offset)+nextPageIdPlusValue))
                            }
                        } else {
                            if (parseInt(offset) > 0) {
                                if ((parseInt(offset)-1) <= 0) {
                                    callback(null, Posts, "/posts", null)
                                } else {
                                    callback(null, Posts, "/posts?page="+(parseInt(offset)), null)
                                }
                            } else {
                                callback(null, Posts, null, null)
                            }
                        }
                    }
                })
            } else {
                callback(null, null, null, null)
            }
        }
    })
}

exports.getPost = function(slug, callback) {
	
    const query = "SELECT * FROM BlogPosts WHERE slug = ?"
    const values = [slug]
	
	db.get(query, values, function(error, Post) {
        callback(error, Post)
	})
}

exports.getPostSlugFromId = function(id, callback) {
	
    const query = "SELECT slug FROM BlogPosts WHERE id = ?"
    const values = [id]
	
	db.get(query, values, function(error, slug) {
        callback(error, slug)
	})
}

exports.getPostsFromSearch = function(searchQuestion, dateOne, dateTwo,  callback) {

    if (dateOne != null || dateTwo != null) {
        var options = {
            shouldSort: true,
            threshold: 0.3,
            location: 0,
            distance: 100,
            maxPatternLength: 32,
            minMatchCharLength: 3,
            keys: [
              "slug",
              "content",
              "category"
            ]
        };
    
        const query = "SELECT * FROM BlogPosts WHERE post_date BETWEEN ? AND ? ORDER BY id DESC"
        const values = [Date.parse(dateOne), Date.parse(dateTwo)]
    
        db.all(query, values, function(error, posts) {
            if (searchQuestion == null || !searchQuestion) {
                callback(error, posts)
            } else {
                if (error) {
                    callback(error, null)
                } else {
                    var fuse = new Fuse(posts, options)
                    var result = fuse.search(searchQuestion)
              
                    callback(null, result)
                }
            }

        })
    } else {
        if (!isNaN(Date.parse(searchQuestion))) {
            const yearInMs = 31557600000
            const query = "SELECT * FROM BlogPosts WHERE post_date BETWEEN ? AND ? ORDER BY id DESC"
            const inAYearFromDate = Date.parse(searchQuestion) + yearInMs
            const values = [Date.parse(searchQuestion), inAYearFromDate]
    
            db.all(query, values, function(error, Posts) {
                callback(error, Posts)
            })
        } else {
            var options = {
                shouldSort: true,
                threshold: 0.3,
                location: 0,
                distance: 100,
                maxPatternLength: 32,
                minMatchCharLength: 3,
                keys: [
                  "slug",
                  "content",
                  "category"
                ]
            };
        
            const query = "SELECT * FROM BlogPosts"
        
            db.all(query, function(error, posts) {
                if (error) {
                    callback(error, null)
                } else {
                    var fuse = new Fuse(posts, options)
                    var result = fuse.search(searchQuestion)
              
                    callback(null, result)
                }
            })
        }
    }

}

exports.updatePost = function(userId, slug, oldSlug, content, category, callback) {

    const query = "UPDATE BlogPosts SET user = ?, slug = ?, content = ?, category = ? WHERE slug = ?"
    const values = [userId, slug, content, category, oldSlug]
	
	db.run(query, values, function(error) {
        callback(error, this.lastID)
	})
}

exports.deletePost = function(slug, callback) {

    const query = "DELETE FROM BlogPosts WHERE slug = ?"
    const values = [slug]

	db.run(query, values, function(error, id) {
        callback(error, id)
	})
}

exports.getAllGuestbookEntries = function(callback) {

    const query = "SELECT * FROM GuestbookEntries ORDER BY id DESC LIMIT 5"
    
    db.all(query, function(error, entries) {
        callback(error, entries)
    })
}

exports.getGuestbookEntry = function(id, callback) {

    const query = "SELECT * FROM GuestbookEntries WHERE id = ?"
    const values = [id]
    
    db.get(query, values, function(error, entry) {
        callback(error, entry)
    })
}


exports.updateGuestbookEntry = function(id, name, content, callback) {

    const query = "UPDATE GuestbookEntries SET name = ?, content = ? WHERE id = ?"
    const values = [name, content, id]
	
	db.run(query, values, function(error) {
        callback(error, this.lastID)
	})
}

exports.newGuestbookEntry = function(name, content, callback) {

    const date = new Date()
    const query = "INSERT INTO GuestbookEntries (name, content, post_date) VALUES (?, ?, ?)"
    const values = [name, content, date]
	
	db.run(query, values, function(error) {
        callback(error, this.lastID)
	})
}

exports.deleteGuestbookEntry = function(id, callback) {

    const query = "DELETE FROM GuestbookEntries WHERE id = ?"
    const values = [id]
	
	db.run(query, values, function(error) {
        callback(error)
	})
}

exports.getWebpageContent = function(webpage, callback) {

    const query = "SELECT * FROM PageContent WHERE name = ? LIMIT 1"
    const values = [webpage]
	
	db.get(query, values, function(error, content) {
        callback(error, content)
	})
}

exports.editWebpageContent = function(webpage, content, callback) {

    const query = "UPDATE PageContent SET content = ? WHERE name = ?"
    const values = [content, webpage]

	db.run(query, values, function(error) {
        callback(error)
	})
}

exports.getAllComments = function(postId, callback) {

    const query = "SELECT * FROM BlogPostComments WHERE post_id = ? ORDER BY id DESC"
    const values = [postId]
	
	db.all(query, values, function(error, Comments) {
        callback(error, Comments)
	})
}

exports.getComment = function(commentId, callback) {

    const query = "SELECT * FROM BlogPostComments WHERE id = ?"
    const values = [commentId]
	
	db.get(query, values, function(error, comment) {
        callback(error, comment)
	})
}

exports.updateComment = function(id, username, content, callback) {

    const query = "UPDATE BlogPostComments SET username = ?, content = ? WHERE id = ?"
    const values = [username, content, id]
	
	db.run(query, values, function(error) {
        callback(error, this.lastID)
	})
}

exports.newComment = function(postId, email, username, content, callback) {
    const date = new Date()
    const query = "INSERT INTO BlogPostComments (post_id, email, username, content, post_date) VALUES (?, ?, ?, ?, ?)"
    const values = [postId, email, username, content, date]
	
	db.run(query, values, function(error) {
        callback(error)
	})
}

exports.deleteComment = function(id, callback) {

    const query = "DELETE FROM BlogPostComments WHERE id = ?"
    const values = [id]
	
	db.run(query, values, function(error) {
        callback(error)
	})
}

exports.deleteAllComments = function(id, callback) {

    const query = "DELETE FROM BlogPostComments WHERE post_id = ?"
    const values = [id]
	
	db.run(query, values, function(error) {
        callback(error)
	})
}

exports.newContactRequest = function(email, content, callback) {
    const date = new Date()
    const query = "INSERT INTO ContactRequests (email, content, post_date) VALUES (?, ?, ?)"
    const values = [email, content, date]
	
	db.run(query, values, function(error) {
        callback(error)
	})
}

exports.getContactRequest = function(id, callback) {

    const query = "SELECT * FROM ContactRequests WHERE id = ?"
    const values = [id]
	
	db.get(query, values, function(error, ContactRequest) {
        callback(error, ContactRequest)
	})
}

exports.getAllContactRequests = function(callback) {

    const query = "SELECT * FROM ContactRequests ORDER BY id DESC"
	
	db.all(query, function(error, rows) {
        callback(error, rows)
	})
}

exports.getAllContactRequestsSeenOrNot = function(seenOrNot, callback) {

    if (seenOrNot == 0) {
        const query = "SELECT * FROM ContactRequests WHERE seenIt = ? ORDER BY id DESC"
        const values = [0]
	
        db.all(query, values, function(error, rows) {
            callback(error, rows)
        })
    } else {
        const query = "SELECT * FROM ContactRequests WHERE seenIt = ? ORDER BY id DESC"
        const values = [1]
	
        db.all(query, values, function(error, rows) {
            callback(error, rows)
        })
    }
}

exports.markContactRequestAsSeen = function(id, callback) {

    const query = "UPDATE ContactRequests SET seenIt = ? WHERE id = ?"
    const values = [1, id]
	
	db.run(query, values, function(error) {
        callback(error)
	})
}

exports.deleteContactRequest = function(id, callback) {

    const query = "DELETE FROM ContactRequests WHERE id = ?"
    const values = [id]
	
	db.run(query, values, function(error) {
        callback(error)
	})
}

exports.checkFileLocation = function(id, callback) {

    const query = "SELECT location FROM FileUploads WHERE name = ? LIMIT 1"
    const values = [id]
	
	db.get(query, values, function(error, filelocation) {
        callback(error, filelocation)
	})
}

exports.uploadFileLocation = function(name, location, callback) {

    const query = "INSERT INTO FileUploads (name, location) VALUES (?, ?)"
    const values = [name, location]
	
	db.run(query, values, function(error) {
        callback(error)
	})
}

exports.getAllUploadedFiles = function(callback) {

    const query = "SELECT name FROM FileUploads"
    
    db.all(query, function(error, entries) {
        callback(error, entries)
    })
}