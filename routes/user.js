const express= require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const User = require('../models/user')
const createJwtToken = require('../service/auth')
const { checkForAuthentication } = require('../middleware/auth')

router.post('/register', async (req,res)=>{
    const { username,name,email,password } = req.body;
    try{
       if(password.length<6){
        return res.status(400).json({error:"Password must be atleast 6 characters"})
       }
       const userUsername = await User.findOne({username})
       if(userUsername){
          return res.status(400).json({message:"Username already exists"})
       }

       const userEmail = await User.findOne({email})
       if(userEmail ){
          return res.status(400).json({message:"Email already exists"})
       }

       const salt = await bcrypt.genSalt(10)
       const hashPassword = await bcrypt.hash(password,salt )
       const newUser = await new User({
        name,
        username,
        email,
        password:hashPassword
    })
     
    if(newUser){
        createJwtToken(newUser._id,res)
        await newUser.save();

        res.status(202).json({
         _id:newUser._id,
         username:newUser.username,
         name:newUser.name,
         email:newUser.email,
         followers:newUser.followers,
         following:newUser.following,
         coverImage:newUser.coverImage,
         
        })

    }


    }catch(error){
        console.log("Error while register controller",error.message)
        res.status(500).json({Error:"Internal Server Error"})

    }
  
})

router.post('/login',async (req,res)=>{
   try{
       const {username,password}=req.body;
       const user = await User.findOne({username})
       if(!user){
         return res.status(400).json({error:"Invalid username"})
       }
       const isMatchedPassword= await bcrypt.compare(password,user.password)
       if(!isMatchedPassword){
         return res.status(400).json({error:"Invalid Credentials"})
       }
        createJwtToken (user._id,res)
        res.status(200).json({
         message:"User logged in successfully",
         _id:user._id,
         username:user.username,
         name:user.name,
         email:user.email,
         followers:user.followers,
         following:user.following


        })


   }catch(error){
      console.log("Error while loging in",error.message)
      res.status(500).json({error:"Internal Server Error"})
   }

    
})

router.post('/logout', async(req,res)=>{
   try{
      res.cookie('jwt','',{
         maxAge:0,
         httpOnly:true,
         sameSite:"strict"
      })
      res.status(200).json({message:"User Logged out successfully"})
   }catch(error){
      console.log("Error while logging out",error.message)
      res.status(500).json({error:"Internal Server Error"})
   }

   
})

router.get('/authUser',checkForAuthentication, async (req,res)=>{
   try{
      const user = await User.findById(req.user._id).select("-password")
      res.status(200).json(user)

   }catch(error){
    console.log("Error in authUser route",error.message)
    res.status(500).json({error:"Internal Server Error"})
   }

})

module.exports = router;

