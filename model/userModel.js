const mongoose = require('mongoose')

// Schema(db Schema, collection)
const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    mobile: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        trim: true
    },
    role: {
        type: String,
        default: "user",
        enum: ["user", "admin"]
    }, 
    isActive: {
        type: Boolean,
        default: true
    },
    isBlocked: {
        type: Boolean,
        default: false
    }
}, {
    collection: "users",
    timestamps: true
})

module.exports = mongoose.model("User", UserSchema)