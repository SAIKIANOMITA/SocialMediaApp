const mongoose = require('mongoose');

const notificationSchema = mongoose.Schema({
    from:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'user',
        required:true

    },
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