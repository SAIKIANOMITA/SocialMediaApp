const express = require('express')
const { checkForAuthentication } = require('../middleware/auth');
const User = require('../models/user');
const Notification = require('../models/notification');
const bcrypt = require('bcryptjs')
const router= express.Router()
const cloudinary = require('cloudinary').v2;

router.get('/:username',checkForAuthentication, async (req,res)=>{
    const {username}= req.params;
    try{
        const user = await User.findOne({username}).select('-password');
        if(!user){
            return res.status(404).json({error:"User not found"})
        }

        res.status(200).json(user);

    }catch(error){
        console.log("Error while fetching profiles",error.message)
        res.status(500).json({error:"Internal Server Error"})
    }


})

//get suggestions of other users except ourselves on the right side of the app
router.get('/sugestions',checkForAuthentication, async(req,res)=>{
  try{
    const userId = req.user._id;
    const usersThatIamFollowing = await User.findById(userId).select('following')

    const followingIds = await User.aggregate([{
      $match:{_id:{$ne:userId}}
    },{
      $sample:{size:10}
    }])

    const filteredUsers = followingIds.filter(user=>! usersThatIamFollowing.following.includes(user._id))
    const suggestedUsers = filteredUsers.slice(0,4)

    suggestedUsers.forEach(user=>user.password = null)
    res.status(200).json(suggestedUsers)

  }catch(error){
    console.log("Error while fetching suggestions",error.message)
    res.status(500).json({error:"Internal Server Error"})

  }
  


})

//follow or unfollow a user 
//follower : who follows me
//following: who I am following

router.post('/followUnfollow/:id',checkForAuthentication,async (req,res)=>{
  const {id} = req.params;
  const targetUser = await User.findById(id); //user who is following me 
  const currentUser = await User.findById(req.user._id); //me
  if(id === req.user._id.toString()){
    return res.status(400).json({error:"You cannot follow yourself"})
  }
  if(!targetUser || !currentUser){
    return res.status(404).json({error:"User not found"})
  }

  const isFollowing = currentUser.following.includes(id)
  //If the user is already following we unfollow then if the not we follow
  if(isFollowing){
    //Unfollow the user
    await User.findByIdAndUpdate(id,{$pull:{followers:req.user._id}})
    await User.findByIdAndUpdate(req.user._id,{$pull:{following:id}})
    res.status(200).json({message:"Unfollowed user successfully"})
     
  }else{
     //follow the user
    await User.findByIdAndUpdate(id,{$push :{followers:req.user._id}})
    await User.findByIdAndUpdate(req.user._id,{$push:{following:id}})


    const newNotification = new Notification({
    from:req.user._id,
    to:targetUser._id,
    type:'follow'
  })

  await newNotification.save()
  res.status(200).json({message:"Followed user successfully"})
  }

 
})

//Here we will update the user ptofile like we update in instagram type of ptofile
router.post('/update',checkForAuthentication, async(req,res)=>{

  const {name,username,email,currentpassword,updatedpassword,bio,link}=req.body;
  let {coverImage,profileImage}= req.body

  const userId = req.user._id;
  try{
    let user = await User.findById(userId);
    if(!user){
      return res.status(404).json({error:"User not found"})
    }

    

    if((!currentpassword && updatedpassword)||(!updatedpassword && currentpassword))
      return res.status(400).json({error:"Please provide both current and updated password"})

    if(currentpassword && updatedpassword ){
      const isMatchedPassword = await bcrypt.compare(currentpassword,user.password)
      if(!isMatchedPassword){
        return res.status(400).json({error:"Current password doesnot match with the password of the user"})
      }

    const salt = await bcrypt.genSalt(10)
    //now we update the user password in the database with encrypted updated password
    user.password = await bcrypt.hash(updatedpassword,salt)
    }

  
    
    if(coverImage){
      if(user.coverImage){
        const publicId = user.coverImage.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(publicId)
      }
      const coverImageUpload = await cloudinary.uploader.upload(coverImage)
      coverImage=coverImageUpload.secure_url;

    }

    if(profileImage){
       if(user.profileImage){
        const publicId = user.profileImage.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(publicId)
      }
      const profileImageUpload = await cloudinary.uploader.upload(profileImage)
      profileImage=profileImageUpload.secure_url;

    }

    //either we will update with the new "name" from req.body in database or use the same "user.name"
    user.name = name|| user.name;
    user.username = username||user.username;
    user.email = email || user.email;
    user.bio = bio|| user.bio;
    user.link = link || user.link;
    user.coverImage = coverImage || user.coverImage;
    user.profileImage = profileImage || user.profileImage

    await user.save();
    

    
    //password will not show in the return response
    user.password = null;
    return res.status(200).json(user)

  }catch(error){
    console.log("Error while updating profile",error.message)
    res.status(500).json({error:"Internal Server Error"})
  }

})

module.exports=router