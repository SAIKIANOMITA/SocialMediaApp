const jwt = require("jsonwebtoken")
const User = require('../models/user')
const dotenv =require('dotenv')

dotenv.config()

const checkForAuthentication = async (req,res,next)=>{
  try{
      const token = req.cookies.jwt;
      console.log("Token", token)
      if(!token){
        return res.status(401).json({error:"No token present"})
      }
    const decodedCookie = jwt.verify(token ,process.env.JWT_SECRET_KEY )  
    if(!decodedCookie){
        return res.status(401).json({error:"Invalid cookie"})
    }
    
    const user = await User.findById(decodedCookie.userId).select("-password")
    if(!user){
        return res.status(401).json({error:"No users found"})
    }
    
    req.user = user;
    next();

  }catch(error){
    console.log("Error in AuthRoute",error.message)
    res.status(500).json({error:"Internal Server Error"})
  }
}

module.exports = {checkForAuthentication}