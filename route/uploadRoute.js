const uploadRoute = require('express').Router()
const { uploadFile, removeFile } = require('../controller/uploadController')
const auth = require('../middleware/auth')

// upload file
uploadRoute.post(`/upload`, auth, uploadFile)

// delete file
uploadRoute.post(`/delete/:id`, auth, removeFile)

module.exports = uploadRoute