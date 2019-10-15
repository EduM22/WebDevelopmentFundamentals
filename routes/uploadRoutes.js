const express = require('express');
const uploadRouter = express.Router();

const fs = require('fs')

const blog = require('../models/blog')
const auth = require('../models/auth')

const csurf = require('csurf')

const csrfProtection = csurf()

uploadRouter.get('/upload', auth.isAuthenticated, csrfProtection, function(request, response) {
    response.render('upload.hbs', {csrfToken: request.csrfToken()})
})

uploadRouter.post('/upload', auth.isAuthenticated, csrfProtection, function(request, response) {
    const validationErrors = []

    const name = request.body.filename

    if (name == "") {
        validationErrors.push("name is empty")
    }

    if (!request.files || Object.keys(request.files).length === 0) {
        validationErrors.push("file is empty")
    }
    
    if (validationErrors.length > 0) {
        const model = {
            validationErrors,
            name,
            csrfToken: request.csrfToken(),
        }
        response.render('upload.hbs', model) 
    } else {
        let uploadedFile = request.files.uploadedFile;

        const fileType = uploadedFile.mimetype
        const fileEnd = fileType.replace('image/', '')

        if (uploadedFile.mimetype == 'image/png' || uploadedFile.mimetype == 'image/jpg' || uploadedFile.mimetype == 'image/jpeg' || uploadedFile.mimetype == 'image/webp') {
            const hash = Date.now() + uploadedFile.md5
            const path = ('/../public/img/'+hash+'.'+fileEnd)

            uploadedFile.mv(__dirname + path, function(error) {
                if (error) {
                    response.render('500.hbs')
                } else {
                    blog.uploadFileLocation(name, path, function(error) {
                        if (error) {
                            if (error.code == 'SQLITE_CONSTRAINT') {
                                validationErrors.push("You cant choose that slug name it already exsists")
                                const model = {
                                    validationErrors,
                                    name,
                                    csrfToken: request.csrfToken(),
                                }
                                response.render('upload.hbs', model) 
                            } else {
                                response.render('500.hbs')
                            }
                        } else {
                            response.redirect('/admin')
                        }
                    })
                }
            });
        } else {
            validationErrors.push('we cant support that file type')
            const model = {
                validationErrors,
                name,
                csrfToken: request.csrfToken(),
            }
    
            response.render('upload.hbs', model)
        }
    }
})

uploadRouter.get('/file/:fileId', function(request, response) {

    const fileId = request.params.fileId

    blog.checkFileLocation(fileId, function(error, fileLocation) {
        if (error) {
            response.render('404.hbs')
        } else {
            if (fileLocation == null) {
                response.render('404.hbs', {message: "No file with that id"})
            } else {
                fs.readFile(__dirname + fileLocation['location'], function(error, fileContent) {
                    if (error) {
                        response.render('404.hbs')
                    } else {
                        response.setHeader('Content-type', 'image/png')
                        response.send(fileContent)
                    }
                })
            }

        }
    })
})

module.exports = uploadRouter;