
Post Model
-Introducing post Schema which contains the userId of the post,content written by the user,which user liked the post,which user commented the post
-The controllers includes
:/create -> to create the post
:/like/:id -> collect those users in an array who liked the post  
:/comment/:id -> collect those users in an array who commented on the post
:/allPosts/ -> get all the Post of all users.
:/likePost/:id -> get the likedPost array in the users
:/followPost/:id -> get the following array of users in the user
:/user/:username ->get all the post of the particular user whose username = user._id
:/delete/:id -> delete a particular user

