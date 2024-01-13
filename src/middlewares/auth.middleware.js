import { User } from "../models/user.models.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import jwt from 'jsonwebtoken';



export const verifyJWT = asyncHandler(async (req,res,next) => { // res not used '_'

    // req.header because sometimes user may send their tokens in form of header
    // usually via mobile application as there is no source for cookie since no browser
    // can be sended via postman
    // key-> Auhtorization   value-> Bearer tokenName 
    // tokenName can be either accessToken or refreshToken
    try {
        const userToken = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer", "")
    
        if(!userToken){
            throw new ApiError(401, "Unauthorized Request...") // means user is not logged in and trying to logout
        }
    
        // verifying whether userToken is correct or not
        const decodedToken = jwt.verify(userToken, process.env.ACCESS_TOKEN_SECRET)
    
        const user = await User.findById(decodedToken._id)
    
        if(!user){
            // Here some discussion about frontend...
            throw new ApiError(401, "Invalid Access Token...")
        }

        req.user = user  // inject a new property called user in req object
        next()


    } catch (error) {
        throw new ApiError(400, 'User Not found...')
        
    }

    // Till Now we verified that USer is successfully existing as a logged In User in our app
})