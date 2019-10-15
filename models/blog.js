const db = require('../db') 
const Fuse = require('fuse.js')

exports.getLastPost = function(callback) {
	
    const query = "SELECT * FROM BlogPosts ORDER BY id DESC LIMIT 1;"
	
	db.get(query, function(error, lastPost) {
        if (error) {
            callback(error, null)
        } else {
            callback(null, lastPost)
        }
	})
}

exports.newPost = function(userId, slug, content, category, callback) {

    const date = new Date()
    const query = "INSERT INTO BlogPosts (user, slug, content, category, post_date) VALUES (?, ?, ?, ?, ?)"
    const values = [userId, slug, content, category, date]
	
	db.run(query, values, function(error) {
        if (error) {
            callback(error, null)
        } else {
            callback(null, this.lastID)
        }
	})
}

exports.getAllPosts = function(offset, callback) {

    const query = "SELECT * FROM BlogPosts ORDER BY id DESC LIMIT 5 OFFSET ?"
    const values = [(offset * 5)]

    const query2 = "SELECT COUNT(*) FROM BlogPosts"

    
    db.all(query, values, function(error, Posts) {
        if (error) {
            callback(error, null, null, null)
        } else {
            if (Posts.length > 0) {
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
                                if (parseInt(offset)-1 <= 0) {
                                    callback(null, Posts, "/posts", null)
                                } else {
                                    callback(null, Posts, "/posts?page="+(parseInt(offset)-1), null)
                                }
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

exports.getPost = function(slug, callback) {
	
    const query = "SELECT * FROM BlogPosts WHERE slug = ?"
    const values = [slug]
	
	db.get(query, values, function(error, Post) {
        if (error) {
            callback(error, null)
        } else {
            callback(null, Post)
        }
	})
}

exports.getPostSlugFromId = function(id, callback) {
	
    const query = "SELECT slug FROM BlogPosts WHERE id = ?"
    const values = [id]
	
	db.get(query, values, function(error, slug) {
        if (error) {
            callback(error, null)
        } else {
            callback(null, slug)
        }
	})
}

exports.getPostsFromSearch = function(searchQuestion,  callback) {

    /*
    var options = {
        shouldSort: true,
        threshold: 0.3,
        location: 0,
        distance: 100,
        maxPatternLength: 32,
        minMatchCharLength: 2,
        keys: [
          "slug",
          "content",
          "category",
          "post_date"
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
    })*/
    
    if (!isNaN(Date.parse(searchQuestion))) {
        const yearInMs = 31557600000
        const query = "SELECT * FROM BlogPosts WHERE post_date BETWEEN ? AND ? ORDER BY id DESC"
        const inAYearFromDate = Date.parse(searchQuestion) + yearInMs
        const values = [Date.parse(searchQuestion), inAYearFromDate]

        db.all(query, values, function(error, Posts) {
            if (error) {
                callback(error, null)
            } else {
                if (Posts.length > 0) {
                    callback(null, Posts)
                } else {
                    callback(null, null)
                }
            }
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

    /*

    if (!isNaN(Date.parse(searchQuestion))) {
        const yearInMs = 31557600000
        const query = "SELECT * FROM BlogPosts WHERE post_date >= ? AND post_date <= ? ORDER BY id DESC"
        const inAYearFromDate = searchQuestion + yearInMs
        const values = [Date.parse(searchQuestion), inAYearFromDate]

        db.all(query, values, function(error, Posts) {
            if (error) {
                callback(error, null)
            } else {
                if (Posts.length > 0) {
                    callback(null, Posts)
                } else {
                    callback(null, null)
                }
            }
        })
    } else {
        const querySearchSlugOrContent = "SELECT * FROM BlogPosts WHERE slug OR content OR category LIKE ?"
        const string = new String(searchQuestion+'_')
        console.log(string)
        const values = [string]

        db.all(querySearchSlugOrContent, values, function(error, Posts) {
            console.log(Posts)
            console.log(error)
            if (error) {
                callback(error, null)
            } else {
                if (Posts.length > 0) {
                    callback(null, Posts)
                } else {
                    callback(null, null)
                }
            }
        })
    }*/

    /*

    if (dateSearchOrCategory == 0) {
        const query = "SELECT * FROM BlogPosts WHERE category = ? ORDER BY id DESC"
        const values = [category]

        db.all(query, values, function(error, Posts) {
            if (error) {
                callback(error, null)
            } else {
                if (Posts.length > 0) {
                    callback(null, Posts)
                } else {
                    callback(null, null)
                }
            }
        })
    } else if (dateSearchOrCategory == 1) {
        const yearInMs = 31556952000
        const query = "SELECT * FROM BlogPosts WHERE post_date >= ? AND post_date <= ? ORDER BY id DESC"
        const d2 = category + yearInMs
        const values = [category, d2]

        db.all(query, values, function(error, Posts) {
            if (error) {
                callback(error, null)
            } else {
                if (Posts.length > 0) {
                    callback(null, Posts)
                } else {
                    callback(null, null)
                }
            }
        })
    } else {
        callback(null, null)
    }*/
}

exports.updatePost = function(userId, slug, oldSlug, content, category, callback) {

    const query = "UPDATE BlogPosts SET user = ?, slug = ?, content = ?, category = ? WHERE slug = ?"
    const values = [userId, slug, content, category, oldSlug]
	
	db.run(query, values, function(error) {
        if (error) {
            callback(error, null)
        } else {
            callback(null, this.lastID)
        }
	})
}

exports.deletePost = function(slug, callback) {

    const query = "DELETE FROM BlogPosts WHERE slug = ?"
    const values = [slug]

	db.run(query, values, function(error, id) {
        if (error) {
            callback(error, null)
        } else {
            callback(null, this.lastID)
        }
	})
}

exports.getAllGuestbookEntries = function(callback) {

    const query = "SELECT * FROM GuestbookEntries ORDER BY id DESC LIMIT 5"
    
    db.all(query, function(error, entries) {
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

exports.getGuestbookEntry = function(id,callback) {

    const query = "SELECT * FROM GuestbookEntries WHERE id = ?"
    const values = [id]
    
    db.get(query, values, function(error, entry) {
        if (error) {
            callback(error, null)
        } else {
            callback(null, entry)
        }
    })
}


exports.updateGuestbookEntry = function(id, name, content, callback) {

    const query = "UPDATE GuestbookEntries SET name = ?, content = ? WHERE id = ?"
    const values = [name, content, id]
	
	db.run(query, values, function(error) {
        if (error) {
            callback(error, null)
        } else {
            callback(null, this.lastID)
        }
	})
}

exports.newGuestbookEntry = function(name, content, callback) {

    const date = new Date()
    const query = "INSERT INTO GuestbookEntries (name, content, post_date) VALUES (?, ?, ?)"
    const values = [name, content, date]
	
	db.run(query, values, function(error) {
        if (error) {
            callback(error, null)
        } else {
            callback(null, this.lastID)
        }
	})
}

exports.deleteGuestbookEntry = function(id, callback) {

    const query = "DELETE FROM GuestbookEntries WHERE id = ?"
    const values = [id]
	
	db.run(query, values, function(error) {
        if (error) {
            callback(error)
        } else {
            callback(null)
        }
	})
}

exports.getWebpageContent = function(webpage, callback) {

    const query = "SELECT * FROM PageContent WHERE name = ? LIMIT 1"
    const values = [webpage]
	
	db.get(query, values, function(error, content) {
        if (error) {
            callback(error, null)
        } else {
            callback(null, content)
        }
	})
}

exports.editWebpageContent = function(webpage, content, callback) {

    const query = "UPDATE PageContent SET content = ? WHERE name = ?"
    const values = [content, webpage]

	db.run(query, values, function(error) {
        if (error) {
            callback(error)
        } else {
            callback(null)
        }
	})
}

exports.getAllComments = function(postId, callback) {

    const query = "SELECT * FROM BlogPostComments WHERE post_id = ? ORDER BY id DESC"
    const values = [postId]
	
	db.all(query, values, function(error, Comments) {
        if (error) {
            callback(error, null)
        } else {
            callback(null, Comments)
        }
	})
}

exports.getComment = function(commentId, callback) {

    const query = "SELECT * FROM BlogPostComments WHERE id = ?"
    const values = [commentId]
	
	db.get(query, values, function(error, comment) {
        if (error) {
            callback(error, null)
        } else {
            callback(null, comment)
        }
	})
}

exports.updateComment = function(id, username, content, callback) {

    const query = "UPDATE BlogPostComments SET username = ?, content = ? WHERE id = ?"
    const values = [username, content, id]
	
	db.run(query, values, function(error) {
        if (error) {
            callback(error, null)
        } else {
            callback(null, this.lastID)
        }
	})
}

exports.newComment = function(postId, email, username, content, callback) {
    const date = new Date()
    const query = "INSERT INTO BlogPostComments (post_id, email, username, content, post_date) VALUES (?, ?, ?, ?, ?)"
    const values = [postId, email, username, content, date]
	
	db.run(query, values, function(error) {
        if (error) {
            callback(error, null)
        } else {
            callback(null, this)
        }
	})
}

exports.deleteComment = function(id, callback) {

    const query = "DELETE FROM BlogPostComments WHERE id = ?"
    const values = [id]
	
	db.run(query, values, function(error) {
        if (error) {
            callback(error)
        } else {
            callback(null)
        }
	})
}

exports.deleteAllComments = function(id, callback) {

    const query = "DELETE FROM BlogPostComments WHERE post_id = ?"
    const values = [id]
	
	db.run(query, values, function(error) {
        if (error) {
            callback(error)
        } else {
            callback(null)
        }
	})
}

exports.newContactRequest = function(email, content, callback) {
    const date = new Date()
    const query = "INSERT INTO ContactRequests (email, content, post_date) VALUES (?, ?, ?)"
    const values = [email, content, date]
	
	db.run(query, values, function(error) {
        if (error) {
            callback(error)
        } else {
            callback(null)
        }
	})
}

exports.getContactRequest = function(id, callback) {

    const query = "SELECT * FROM ContactRequests WHERE id = ?"
    const values = [id]
	
	db.get(query, values, function(error, ContactRequest) {
        if (error) {
            callback(error, null)
        } else {
            callback(null, ContactRequest)
        }
	})
}

exports.getAllContactRequests = function(callback) {

    const query = "SELECT * FROM ContactRequests ORDER BY id DESC"
	
	db.all(query, function(error, rows) {
        if (error) {
            callback(error, null)
        } else {
            callback(null, rows)
        }
	})
}

exports.getAllContactRequestsSeenOrNot = function(seenOrNot, callback) {

    if (seenOrNot == 0) {
        const query = "SELECT * FROM ContactRequests WHERE seenIt = ? ORDER BY id DESC"
        const values = [0]
	
        db.all(query, values, function(error, rows) {
            if (error) {
                callback(error, null)
            } else {
                callback(null, rows)
            }
        })
    } else {
        const query = "SELECT * FROM ContactRequests WHERE seenIt = ? ORDER BY id DESC"
        const values = [1]
	
        db.all(query, values, function(error, rows) {
            if (error) {
                callback(error, null)
            } else {
                callback(null, rows)
            }
        })
    }
}

exports.markContactRequestAsSeen = function(id, callback) {

    const query = "UPDATE ContactRequests SET seenIt = ? WHERE id = ?"
    const values = [1, id]
	
	db.run(query, values, function(error) {
        if (error) {
            callback(error)
        } else {
            callback(null)
        }
	})
}

exports.deleteContactRequest = function(id, callback) {

    const query = "DELETE FROM ContactRequests WHERE id = ?"
    const values = [id]
	
	db.run(query, values, function(error) {
        if (error) {
            callback(error)
        } else {
            callback(null)
        }
	})
}

exports.checkFileLocation = function(id, callback) {

    const query = "SELECT location FROM FileUploads WHERE name = ? LIMIT 1"
    const values = [id]
	
	db.get(query, values, function(error, filelocation) {
        if (error) {
            callback(error, null)
        } else {
            callback(null, filelocation)
        }
	})
}

exports.uploadFileLocation = function(name, location, callback) {

    const query = "INSERT INTO FileUploads (name, location) VALUES (?, ?)"
    const values = [name, location]
	
	db.run(query, values, function(error) {
        if (error) {
            callback(error)
        } else {
            callback(null)
        }
	})
}