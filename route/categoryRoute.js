const categoryRoute = require('express').Router()
const { readAll, readSingle, create, update, deleteCategory } = require('../controller/categoryController')
const auth = require('../middleware/auth')
const adminAuth = require('../middleware/adminMiddleware')

// read request
categoryRoute.get(`/all`, auth, readAll) // read all category
categoryRoute.get(`/single/:id`, auth,  readSingle) // read single category

// create new category
categoryRoute.post(`/add`, auth, adminAuth, create)

// update existing category
categoryRoute.patch(`/update/:id`, auth, adminAuth, update)

// remove existing category
categoryRoute.delete(`/delete/:id`, auth, adminAuth, deleteCategory)

module.exports = categoryRoute