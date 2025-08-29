const express = require('express')
const { checkForAuthentication } = require('../middleware/auth')
const Notification = require('../models/notification')
const router = express.Router()

router.get('/displayNotifications',checkForAuthentication, async(req,res)=>{
    try{
         
         const notification = await Notification.find({to:req.user._id}).populate({
            path:'from',
            select:'username profileImage'
         })

         await Notification.updateMany({to:req.user._id},{read:true}) 
         res.status(200).json(notification)
    }catch(error){
        console.log("Error while sending notification", error.message)
        res.status(500).json({error:"Internal Server Error"})
        
    }
} )

router.delete('/deleteNotification',checkForAuthentication, async (req,res)=>{
    try{
         const userId = req.user._id;
         await Notification.deleteMany({to:userId})
         res.status(200).json({message:"Notification deleted successfully"})

    }catch(error){
        console.log("Error while deleting notification",error.message)
        res.status(500).json({error:"Internal Server Error"})
    }
})

router.delete('/deleteOneNotification/:id',checkForAuthentication, async(req,res)=>{
    try{
        const userId = req.user._id;
        const notificationId = req.params.id;

        const notification = await Notification.findById(notificationId);
        if(!notification){
            return res.status(404).json({error:"Notification not found"})
        }
        if(notification.to.toString()!== userId.toString()){
            return res.status(401).json({error:"You are not authorized to delete this notification"})
        }
        await Notification.findByIdAndDelete(notificationId)

      res.status(200).json({message:"Notification deleted successfully"})

    }catch(error){
        console.log("Error while deleting one notification",error.message)
        res.status(500).json({error:"Internal Server Error"})

    }

})

module.exports = router