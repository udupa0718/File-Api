const { StatusCodes } = require('http-status-codes')
const cloudinary = require('cloudinary')
const fs = require('fs')

// delete temp files
const deleteTemp = (path) => {
    fs.unlinkSync(path)
} 

// settings
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET
})

const uploadFile = async (req, res) => {
    try {
        let pdf = "application/pdf"
        let png = "image/png"
        let jpeg = "image/jpeg"
        
        // if file is not linked
        if(!req.files || Object.keys(req.files).length === 0)
            return res.status(StatusCodes.NOT_FOUND).json({ msg: `No file is linked..`})

        // read file object
        const { myFile } = req.files

        // validate size
        if(myFile.size > 25 * 1024 * 1024) {
                deleteTemp(myFile.tempFilePath)
            return res.status(StatusCodes.FORBIDDEN).json({ msg: `File size must be less than 25Mb`})
        }

        // validate file types
        if(myFile.mimetype !== pdf && myFile.mimetype !== png && myFile.mimetype !== jpeg) {
            deleteTemp(myFile.tempFilePath)
            return res.status(StatusCodes.CONFLICT).json({ msg: `File format not supported, Allow only (pdf)`})
        }

        // upload logic
        await cloudinary.v2.uploader.upload(myFile.tempFilePath, { "folder": "documents" }, (err, result) => {
            if(err)
                return res.status(StatusCodes.CONFLICT).json({ msg: err })
                    deleteTemp(myFile.tempFilePath)
                return res.status(StatusCodes.OK).json({ result })
        })

        // res.json({ myFile })
    } catch (err) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: err.message })
    }
}

const removeFile = async (req, res) => {
    try {
        const { public_id } = req.body

        if(!public_id)
            return res.status(StatusCodes.NOT_FOUND).json({ msg: `Requested file id not found`})

        await cloudinary.v2.uploader.destroy(public_id, (err, result) => {
            if(err) 
                return res.status(StatusCodes.CONFLICT).json({ msg: err })

            res.status(StatusCodes.OK).json({ msg: `Document deleted successfully`})
        })
    } catch (err) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: err.message })
    }
}

module.exports = { uploadFile, removeFile }