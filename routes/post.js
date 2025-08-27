const express = require('express');
const { checkForAuthentication } = require('../middleware/auth');
const User = require('../models/user')
const router = express.Router();
const cloudinary = require('cloudinary').v2;
const Post = require('../models/post');
const Notification = require('../models/notification');

router.post('/create',checkForAuthentication, async (req,res)=>{
    try{

        const {content} = req.body;
        let {image} = req.body;
    const userId = req.user._id;
    
    const user = await User.findById(userId)
    if(!user){
        return res.status(404).json({messsage:"User not found"})
    }
    if(!content && !image){
        return res.status(400).json({message:"Content or image is not provided"})
    }

    if(image){
        const uploadResponse = await cloudinary.uploader.upload(image);
        image = uploadResponse.secure_url;
    }

    const postData = new Post({
         user:userId,
         content,
         image

    })

    await postData.save();
    res.status(202).json(postData)

    }catch(error){
        console.log("Error while creating a post:",error.message)
        res.status(500).json({error:"Internal Server Error"})

    }
    





})

router.post('/like/:id',checkForAuthentication, async (req,res)=>{
try{

    const postId = req.params.id;
    const userId = req.user._id;

    const post = await Post.findById(postId);
    if(!post){
        return res.json(404).json({message:"Post not found"})
    }

    const updatelikedpost = post.likes.includes(userId);
    if(updatelikedpost  ){
        //If the post is already liked we will unlike it on Post n User model
        await Post.updateOne({_id:postId},{$pull:{likes:userId}})
        await User.updateOne({_id: userId},{$pull:{likedPost:postId}})
        res.status(200).json({message:"Post unliked successfully"})

    }else{
        //If you have not liked the post we might want to like it
        post.likes.push(userId);
        await User.updateOne({_id:userId},{$push:{likedPost:postId}})
        await post.save();
        const notification = new Notification({
            from:userId,
            to:post.user,
            type:'like'
        })

        await notification.save();
        res.status(200).json({message:"Post liked successfully"})

    }



}catch(error){
    console.log("Error while liking a post",error.message)
    res.status(500).json({error:"Internal Server Error"})

}
    
})

router.post('/commemt/:id',checkForAuthentication, async (req,res)=>{
    try{

        const {text}= req.body;
        const postId = req.params.id;
        const userId = req.user._id;

        if(!text){
            return res.status(400).json({message:"Comment is required"})
        }
        const post = await Post.findById( postId);
        if(!post){
            return res.status(404).json({message:"Post not found"})
        }
        const comment ={text: text , user:userId}
        post.comments.push(comment)

        await post.save();
        res.status(200).json(post)

    }catch(error){
      console.log("Error while adding a comment",error.message)
      res.status(500).json({error:"Internal Server Error"})

    }

})

router.get('/allPosts',checkForAuthentication,async(req,res)=>{
    try{
        const post = await Post.find()
                           .sort({createdAt:-1})
                           .populate({path:'user', select:'-password'})
                           .populate({path:'comments.user',select:'-password'})
                        
        if(post.length === 0 ){
            return res.status(404).json([])
        } 
        
        res.status(200).json(post)

    }catch(error){
      console.log("Error while fetching all posts",error.messsage)
      res.status(500).json({error:"Internal Server Error"})

    }

})

router.get('/likePost/:id',checkForAuthentication, async(req,res)=>{
    const userId = req.params.id;
   
    try{
        const user = await User.findById(userId);
        if(!user){
            return res.status(404).json({message:"User not found"})
        }
        //Let us retieve each post from user.likedPost and populate them each
        const likedPosts = await Post.find({_id:{$in:user.likedPost}})
                                     .populate({
                                        path:'user',
                                        select:'-password'})
                                     .populate({
                                        path:'comments.user',
                                        select:'-password'
                                    })
        res.status(200).json(likedPosts)
                                                    
        }catch(error){
            console.log("Error while fetching liked posts",error.message)
            res.status(500).json({error:"Internal Server Error while fetching liked posts"})
    }
   
})

router.get('/followPost/:id',checkForAuthentication, async(req,res)=>{
    const userId = req.params.id;
    try{
        const user = await User.findById(userId );
        if(!user){
        return res.status(404).json({message:"User not found"})
        }
        const followersFeed = await Post.find({user:{$in:user.following}})
                                        .sort({createdAt:-1})
                                        .populate({
                                            path:'user',
                                            select:'-password'
                                        }).populate({
                                            path:'comments.user',
                                            select:'-password'
                                        })
        res.status(200).json(followersFeed)
                                         

    }catch(error){
        console.log("Error while fetching posts of followed users",error.message);
        res.status(500).json({error:"Internal Server Error while fetching followers feed posts"})
        
    }
    
})

router.get('/user/:username',checkForAuthentication, async(req,res)=>{
    try{
        const {username} = req.params;
        const user = await User.findOne({username});
        if(!user){
            return res.status(404).json({message:"User not found"})
        }
        //find all the posts where user field in the PostSchema is equal to user._id
        const userPosts = await Post.find({user:user._id})
                                    .sort({createdAt:-1})
                                    .populate({
                                        path:'user',
                                        select:'-password'
                                    }).populate({
                                        path:'comments.user',
                                        select:'-password'
                                    })
                                    res.status(200).json(userPosts)

    }catch(error){
        console.log("Error while fetching posts of the user",error.message);
        res.status(500).json({error:"Internal Server error while fetching the posts of the user"})
    }
})

router.delete('/:id',checkForAuthentication,async (req,res)=>{
    try{
        const paramId = req.params.id;
        const userId = req.user._id;
        const post = await Post.findById(paramId)
        if(!post){
            return res.status(404).json({message:"Post not found"})
        }
        if(post.user.toString() !== userId.toString()){
            return res.status(404).json({message:"You are not authorized to delete this post"})
        }
        if(post.image){
            const imageId = post.image.split('/').pop().split('.')[0];
            await cloudinary.uploader.destroy(imageId )
        }

        await Post.findByIdAndDelete(paramId);
        res.status(200).json({message:"Post deleted successfully"})


    }catch(error){
        console.log("Error while deleting a post",error.message)
        res.status(500).json({error:"Internal Serve Error while deleting"})

}
})

module.exports = router;