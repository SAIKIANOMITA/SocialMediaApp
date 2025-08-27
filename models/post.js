const mongoose = require('mongoose');

const postSchema = mongoose.Schema({
    //this user is the one who created the post
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'user',
        required:true
    },
    //This the content of the user who created the post
    content:{
        type:String,
    },
    //This is the image of the user who created the post
    image:{
        type:String,
        default:""
    },
    //these are the authenticated users who liked the post
    likes:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:'user',
            defauly:[]
        }
    ],
    //these are the authenticated users who commented on the post .
    comments:[
        {
            text:{
                type:String,
                required:true
            },
            user:{
                type:mongoose.Schema.Types.ObjectId,
                ref:'user',
                required:true
            }
        }

    ]

},{timeStamps:true})

const Post  = mongoose.model('post',postSchema);
module.exports=Post;
