const mongoose = require('mongoose');

const notificationSchema = mongoose.Schema({
    //this user is the one who liked or commented on the post
    from:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'user',
        required:true

    },
    //these is the user who created the post and whose post is liked or commented;
    to:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'user',
        required:true

    },
    type:{
        type:String,
        required:true,
        enum:['follow','like','comment','reply']
    },
    read:{
        type:Boolean,
        default:false
    }
},{timestamps:true})

const Notification = mongoose.model('notification',notificationSchema )
module.exports = Notification ;