const File = require('../model/fileModel')
const { StatusCodes } = require('http-status-codes')

// read all
const getAll = async (req, res) => {
    try {
        const files = await File.find({})
        res.status(StatusCodes.ACCEPTED).json({ length: files.length, files })
    } catch (err) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: err.message })    
    }
}

// read single
const getSingle = async (req, res) => {
    try {
        let id = req.params.id

        let single = await File.findById({ _id: id })
            if(!single)
                return res.status(StatusCodes.NOT_FOUND).json({ msg: `Requested file not found`})

        res.status(StatusCodes.ACCEPTED).json({ file: single })
    } catch (err) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: err.message })    
    }
}

// create
const createFile = async (req, res) => {
    try {
        let { public_id } = req.body

        let extFile = await File.findOne({ public_id })
            if(extFile)
                return res.status(StatusCodes.CONFLICT).json({ msg: `Public file id already exists`})

        let newFile = await File.create(req.body)

        res.status(StatusCodes.OK).json({ msg: 'New document created successfully', file: newFile })
    } catch (err) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: err.message })    
    }
}

// update
const updateFile = async (req, res) => {
    try {
        let id = req.params.id

        let single = await File.findById({ _id: id })
            if(!single)
            return res.status(StatusCodes.NOT_FOUND).json({ msg: `Requested file not found`})

        await File.findByIdAndUpdate({ _id: id }, req.body)

        res.status(StatusCodes.ACCEPTED).json({ msg: 'Document updated successfully' })
    } catch (err) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: err.message })    
    }
}

// delete
const deleteFile = async (req, res) => {
    try {
        let id = req.params.id

        let single = await File.findById({ _id: id })
            if(!single)
            return res.status(StatusCodes.NOT_FOUND).json({ msg: `Requested file not found`})

        await File.findByIdAndDelete({ _id: id })

        res.status(StatusCodes.OK).json({ msg: 'Document deleted successfully' })
    } catch (err) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: err.message })    
    }
}

module.exports = { getAll, getSingle, createFile, updateFile, deleteFile }