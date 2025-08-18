const express = require("express")
const app = express();
const userRoute = require('./routes/user')
const profileRoute=require('./routes/profiles')
const mongoose= require('mongoose')
const dotenv = require('dotenv');
const cookieParser = require("cookie-parser");
const cloudinary =require('cloudinary').v2;

dotenv.config()
cloudinary.config({
     cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
     api_key:process.env.CLOUDINARY_API_KEY,
     api_secret:process.env.CLOUDINARY_API_SECRET
     
    })

const PORT=process.env.PORT

app.get('/',(req,res)=>{
    res.send("Hellp from Social Media Server")
})

app.use(express.json())
app.use(express.urlencoded({extended:false}))

app.use(cookieParser())

app.use('/user',userRoute)
app.use('/profile',profileRoute)

mongoose
.connect(process.env.MONGO_URL)
.then((e)=>console.log("MongoDB for Social Media App is connected"))
.catch((error)=>console.log("MongoDN Error",error))

app.listen(PORT,()=>{
    console.log(`Server connected at PORT ${PORT}`)
})