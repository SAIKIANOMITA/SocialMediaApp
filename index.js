const express = require("express")
const app = express();
const userRoute = require('./routes/user')
const mongoose= require('mongoose')
const dotenv = require('dotenv');
const cookieParser = require("cookie-parser");
dotenv.config()
const PORT=process.env.PORT

app.get('/',(req,res)=>{
    res.send("Hellp from Social Media Server")
})

app.use(express.json())
app.use(express.urlencoded({extended:false}))

app.use(cookieParser())

app.use('/user',userRoute)

mongoose
.connect(process.env.MONGO_URL)
.then((e)=>console.log("MongoDB for Social Media App is connected"))
.catch((error)=>console.log("MongoDN Error",error))

app.listen(PORT,()=>{
    console.log(`Server connected at PORT ${PORT}`)
})