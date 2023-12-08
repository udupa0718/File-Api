const jwt = require('jsonwebtoken')

// generate login token
// expressed in seconds or a string describing a time span zeit/ms. ex: 60m, "2 days", "10hrs", "7d"
const createAuthToken = (user) => {
    // jwt.sign method -> (userId, secret, session time(optional))
    return jwt.sign(user, process.env.ACCESS_SECRET, { expiresIn: '1d'}) // 1day -> 24hrs (session)
}

module.exports = createAuthToken