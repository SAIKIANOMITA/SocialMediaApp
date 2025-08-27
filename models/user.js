const mongoose = require('mongoose')

const userSchema =  mongoose.Schema({
     username:{
        type:String,
        required:true,
        unique:true
    },
    name:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true,
        minLength:6
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    followers:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:'user',
            default:[]
        }
    ],
    following:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:'user',
            default:[]
        }
    ],
    coverImage:{
        type:String,
        default:""
    },
    profileImage:{
        type:String,
        default:""
    },
    bio:{
        type:String,
        default:""
    },
    link:{
        type:String,
        default:""
    },
    likedPost:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:'post',
            default:[]
        }
    ]

},{timestamps:true})

const User = mongoose.model('user',userSchema)
module.exports=User