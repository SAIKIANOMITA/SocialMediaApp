  Working with user profiles
-Fetcing the profile of a new user '/profile/:username',
-Route for suggesting users '/profile/sugestions'
-Route for follow/unfollow users '/profile/followers/:id'
-Route to update the profile  '/profile/update'

Notification Model
-Implementing "Suggested for You” feature

Adding profile routes
-/:username : User is accessing the target user by using the username.
-/sugestions: User is displaying the suggested users list from the db who are already registered into our app
-/followUnfollow/:id : Controlling the following and unfollowing of users
-/update : User can update each field of the model