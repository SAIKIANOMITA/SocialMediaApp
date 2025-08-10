const jwt = require ('jsonwebtoken')
const dotenv = require('dotenv')
dotenv.config()

const createJwtToken = (userId,res)=>{
    const token = jwt.sign({userId},process.env.JWT_SECRET_KEY,{
     expiresIn:"7d"
    })

    console.log("Generated JwT token",token)

    res.cookie('jwt',token,{
        maxAge:7*24*60*60*1000,
        httpOnly:true,
        sameSite:"strict"
    })

    return token
}

module.exports = createJwtToken