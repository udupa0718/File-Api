const userRoute = require('express').Router()
const { readAll, changeRole, blockUser, disableUser, validateEmail } = require('../controller/userController')
const auth = require('../middleware/auth') // provides user id
const adminMiddleware = require('../middleware/adminMiddleware') // gng to do role validation(specifically admin)

// admin access
// to read all non-admin users
userRoute.get(`/all`, auth, adminMiddleware, readAll)

// to change role of non-admin users
userRoute.patch(`/change/role/:id`, auth, adminMiddleware, changeRole)

// to block the user
userRoute.patch(`/block/:id`, auth, adminMiddleware, blockUser)

// to disable the user
userRoute.patch(`/disable/:id`, auth, adminMiddleware, disableUser)

// to validate user Email
userRoute.get(`/validate/email`, validateEmail)

module.exports = userRoute