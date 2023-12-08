const { StatusCodes } = require('http-status-codes')
const User = require('../model/userModel')
const bcrypt = require('bcryptjs')
const createAuthToken = require('../util/createToken')
const jwt = require('jsonwebtoken')
const createPassToken = require('../util/createPassToken')
const PassToken = require('../model/passTokenModel')
const mailConfig = require('../util/sendEmail')
const pass_template = require('../util/pass_temp')

// register for new user
const signUp = async(req, res) => {
    try {
        const data = req.body // receive the data from  front end
      
        // validate emailn or mobile
        const extEmail = await User.findOne({ email: data.email })
        const extMobile = await User.findOne({ mobile: data.mobile })

        if(extEmail) {
            return res.status(StatusCodes.CONFLICT).json({ msg: `${data.email} already exists`})
        } else if(extMobile) {
            return res.status(StatusCodes.CONFLICT).json({ msg: `${data.mobile} already exists`})
        }

        // password encryption hash(string,length)
        const encpass = await bcrypt.hash(data.password,10)

        // validate with model and save data in db collection
        const newUser = await User.create({
            name: data.name,
            email: data.email,
            mobile: data.mobile,
            password: encpass,
            role: data.role
        })

        res.status(StatusCodes.OK).json({ msg: `New User Registered successfully`, newUser})
    } catch (err) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: err })
    }
}
// login
const login = async(req, res) => {
    try {
        const data = req.body
        let extEmail, extMobile;

        // validate email 
        if(data.email) {
            extEmail = await User.findOne({ email: data.email })
        
        // if email id not exists
        if(!extEmail) {
            return res.status(StatusCodes.NOT_FOUND).json({ msg: `${data.email} not found`})
        } else if (extEmail.isActive === false) {
            return res.status(StatusCodes.CONFLICT).json({ msg: `Sorry.. login access denied..`})     
        } else if (extEmail.isBlocked === true) {
            return res.status(StatusCodes.CONFLICT).json({ msg: `Sorry.. Your account is blocked..`})    
        } 

        // authenticate through email
        let isMatch = await bcrypt.compare(data.password,extEmail.password)
        if(!isMatch)
            return res.status(StatusCodes.UNAUTHORIZED).json({ msg: `Passwords are not matched`})
            
            // login token
            const authToken = createAuthToken({ id: extEmail._id })

            // cookie
            res.cookie('loginToken', authToken, {
                httpOnly: true,
                signed: true,
                path: `/api/auth/signin/token`, 
                maxAge: 1 * 24 * 60 * 60 * 1000
            })
               return res.status(StatusCodes.OK).json({ msg: "Login Success (email)", authToken })
        }  
        else {
        // validate mobile
        extMobile = await User.findOne({ mobile: data.mobile })
            
        if(!extMobile) {
            return res.status(StatusCodes.NOT_FOUND).json({ msg: `${data.mobile} number not found`})
        } else if (extMobile.isActive === false) {
            return res.status(StatusCodes.CONFLICT).json({ msg: `Sorry.. login access denied..`})     
        } else if (extMobile.isBlocked === true) {
            return res.status(StatusCodes.CONFLICT).json({ msg: `Sorry.. Your account is blocked..`})    
        } 

        // authenticate through mobile
        let isMatch = await bcrypt.compare(data.password,extMobile.password)
        if(!isMatch)
            return res.status(StatusCodes.UNAUTHORIZED).json({ msg: `Passwords are not matched`})
           
            // login token
            const authToken = createAuthToken({ id: extMobile._id })

            // cookie
            res.cookie('loginToken', authToken, {
                httpOnly: true,
                signed: true,
                path: `/api/auth/signin/token`, 
                maxAge: 1 * 24 * 60 * 60 * 1000
            })
                return res.status(StatusCodes.OK).json({ msg: "Login Success (Mobile)", authToken })
        }
    } catch (err) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: err })
    }
}
// logout
const logout = async(req, res) => {
    try {
        res.clearCookie('loginToken', { path: `/api/auth/signin/token`})

        res.json({ msg: `Logout Successful` })
    } catch (err) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: err })
    }
}
// login auth token
const authToken = async (req, res) => {
    try {
        // session management 
        const rToken = req.signedCookies.loginToken

        if(!rToken)
            return res.status(StatusCodes.CONFLICT).json({ msg: 'Token not available, login again..'})

        // validate the user id
        await jwt.verify(rToken, process.env.ACCESS_SECRET, (err, user) => {
            if(err)
                return res.status(StatusCodes.UNAUTHORIZED).json({ msg: `Invalid token or Expired.. Login Again..`})

            res.status(StatusCodes.OK).json({ authToken: rToken })
        })   
    } catch (err) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: err })
    }
}
// to get current active user information
const getUserInfo = async (req, res) => {
    try {
        let id = req.userId

        let user = await User.findById({ _id: id }).select('-password')
            if(!user) 
                return res.status(StatusCodes.NOT_FOUND).json({ msg: `Requested user id not found`})

            res.status(StatusCodes.ACCEPTED).json({ user })
    } catch (err) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: err.message })
    }
}

// generate forgot password link
const generatePassLink = async (req, res) => {
    try {
        let { email } = req.body

        let extUser = await User.findOne({ email })
            if(!extUser) 
                return res.status(StatusCodes.NOT_FOUND).json({ msg: `req user data not found`})

            let passToken = createPassToken({ id: extUser._id })
            
            let extEmail = await PassToken.findOne({ user_email: email })
                if(extEmail)
                    return res.status(StatusCodes.CONFLICT).json({ msg: `Password token link already generated..Check your email inbox/spam folder`})
            // save data into db
            let savedToken = await PassToken.create({ user_email: email, token: passToken })
            // generate template
            let template = pass_template(email, passToken, "https://rest.api-project.vercel.com")
            // send email
            let emailRes = await mailConfig(email, "New Password Generate Link", template)

        res.status(StatusCodes.ACCEPTED).json({ msg: `Token sent successfully..check your email inbox/spam folder`, savedToken, emailRes })

    } catch (err) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: err.message })
    }
}

// validate password link and update password logic
const updatePassword = async (req, res) => {
    try {
        let { email, token, password } = req.body

        // read the token from passtoken
        let extData = await PassToken.findOne({ user_email: email })
            if(!extData)
                return res.status(StatusCodes.NOT_FOUND).json({msg: `Requested email id not found`})
        
        // token compare logic
        await jwt.verify(token, process.env.ACCESS_SECRET, async (err, user) => {
            if(err)
                return res.status(StatusCodes.UNAUTHORIZED).json({ msg: `Invalid Token..`})
        
            // update password
            // password encryption hash(string,length)
            const encPass = await bcrypt.hash(password,10)

            await User.findByIdAndUpdate({ _id: user.id }, { password: encPass }) 
            await PassToken.findByIdAndDelete({ _id: extData._id })

                res.status(StatusCodes.OK).json({ msg: `Password updated successfully` })
        })  
    } catch (err) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: err.message })
    }
}

module.exports = { signUp, login, logout, authToken, getUserInfo, generatePassLink, updatePassword }

