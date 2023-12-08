const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const { StatusCodes } = require('http-status-codes')
const fileUpload = require('express-fileupload')
const connectDb = require('./db/connect')

require('dotenv').config()

const PORT = process.env.PORT

// instance to express
const app = express()

// middleware
   // body-parser -> string query (form data)
app.use(express.urlencoded({ extended: true }))
   // body-parser -> to accept json
app.use(express.json())
   // cors -> cross origin resource sharing
app.use(cors())
   // cookie-parser -> with access secret (secured) && without access secret (not secured)
app.use(cookieParser(process.env.ACCESS_SECRET))
   // file upload
app.use(fileUpload({ useTempFiles: true }))

// index route
app.get(`/`, async (req, res) => {
    res.status(StatusCodes.OK).json({ msg: `Welcome to REST API`})
})

// custom routes
app.use(`/api/auth`, require('./route/authRoute'))
app.use(`/api/user`, require('./route/userRoute'))
app.use(`/api/category`, require('./route/categoryRoute'))
app.use(`/api/file`, require('./route/uploadRoute'))
app.use(`/api/document`, require('./route/fileRoute'))

// default (Not found) route
app.all('/**', async (req,res) => {
    res.status(StatusCodes.NOT_FOUND).json({ msg: `Requested Path Not Found`})
})

// port listener
app.listen(PORT, async () => {
   await connectDb()
   console.log(`server is started @ http://localhost:${PORT}`)
})
