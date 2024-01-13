import { Router } from "express";
import registerUser, { loginUser, logoutUser } from "../controllers/user.controllers.js";
import {upload} from '../middlewares/multer.middleware.js'
import { verifyJWT } from "../middlewares/auth.middleware.js";


const userRouter = Router();  // creating a route using express

// here we are creating /register route where we call the registerUser function/method with post request
// userRouter.route("/register").post(registerUser)

// injecting middleware for taking avatar and coverImage using multor
userRouter.route("/register").post(

    // ab /register page visit kare time 
    upload.fields([{
        name: 'avatar',
        maxCount: 1 // kitna lena hai i.e., amount
    },
    {
        name: 'coverImage',
        maxCount: 1
    }
])
    ,
    
    registerUser)


// defining /login route
// userRouter.route("/login").post(login)
userRouter.route('/login').post(loginUser)

// secured route since user is loggedIn

userRouter.route("/logout").post(verifyJWT, logoutUser)



export {userRouter};  