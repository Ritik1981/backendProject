import  asyncHandler  from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js'
import {User} from '../models/user.models.js'
import uploadOnCloudinary from '../utils/cloudinary.js'
import ApiResponse from '../utils/ApiResponse.js';

const generateTokens = async(userId) => {
    try {
        // finding logged in user by it's Id to generate access and refresh tokens for him/her.
        console.log("User Id: ",userId)
        const user = await User.findById(userId)
        console.log("UserName: ",user.username)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()
        console.log("Token generated")
        // console.log(accessToken)
        // saving refreshToken to db
        user.refreshToken = refreshToken;
        await user.save({validateBeforeSave: false})  // since all the fields are kicked in once we save the any user so it is necessary to pass all the required fields, but we don't want to pass all the rquired fields again. So, use of validateBeforeSave : false

        // returning access and refresh Tokens so that can se send to user
        console.log("Saved Refresh token Successfully to db...")
        return {accessToken, refreshToken}

    } catch (error) {
        throw new ApiError(500, "Internal Server Error while generating tokens..")
    }
}



const registerUser = asyncHandler( async (req,res) => {
    // the below code is just for testing whether my registerUser function is being called or not when user enters /users/register page
    // res.status(200).json({
    //     message: "ok registered successfully"
    // })

    // steps involved in registering a user
    // 1. get user details from frontend (make use of postman for sample data)
    // 2. valdation succh as email must be in correct format, email must not be empty and so on.
    // 3. check if user already exists: using username and email.
    // 4. check for required images and files.
    // 5.  upload on cloudinary
    // 6. check on cloudinary whether successfully uploaded or not
    // 7.  create user's object since mongodb is nosql so usually we store data in object format i.e., create entry in db
    // 8. check for succeeful user creation
    // 9. return response
    // 10. after successful entry on db we gave the response to frontend or user but after removing password and refreshtoken

    // to get data from frontend we use req.body, req.url, etc.

    const {username, fullName, email, password} = req.body
    console.log("email: ", email)

    // validation
    // 1st way): 
    // if(username === ''){
    //     throw new Error  // but it's a clumsy way of validation as there will be a lot of if-else for each field to be checked.
    // }

    // 2nd way).
    if(
        [username, fullName, email, password].some((dataField) => dataField?.trim() === '')
    ){
        // if it's true means one of the dataField is empty
        throw new ApiError(400, "All Fields are Required")
    }

    // we can do email verifcation as well where we check whther the mail conatins @ symbol or not using string methods in js


    // Now checking all the unique fields whether same fieldValue is taken by any other user or not
    // import User modle to check

    const userExists = await User.findOne({
        $or: [{username},{email}]  // we can also check other unique fields if exists
    })

    if(userExists){
        throw new ApiError(409, ' User Already Exists...')
    }

    // receiving required images and files using multor
    // multor gives us req.files similar to express which gives us req.body and others.

    const avatarLocalPath = req.files?.avatar[0]?.path
    // const coverImageLocalPath = req.files?.coverImage[0]?.path
    // above code is commented because what if user don't send coverImage then it will throw error 
    // solution for it id: 
    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage)){
        coverImageLocalPath=req.files.coverImage[0].path;
        // isArray methid checks whether the arg received by it is an array or not
    }


    // console.log(avatarLocalPath)  for debugging purpose only
    // since avatar is a required image field so it need to be checked whether it;s uploaded on local server or not

    if(!avatarLocalPath){
        throw new ApiError(400, 'Avatar is Required.')

    }

    // uploading avatar and coverImage on cloudinary

    const avatar = await uploadOnCloudinary(avatarLocalPath)  // await since it may take some times to store on cloudinary as file size may be larger than expected.

    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    // checking whether avatar uploaded succeessfullly on cloudinary or not

    if(!avatar){
        throw new ApiError(200, "Avatar Image is Required...")
    }

    // creating user object in db - create user entry

     const user = await User.create({
        // pass all the field with which you want to craete entry for User object in db
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || '',  // since it may or maynot uploaded on cloudinary by user as not a required field
        email,
        password,
        username: username.toLowerCase()

    })

    // checking whether successful entered on db or not
    // thereafter returning response to user without password and refreshToken
    const userSucceefullyEntered = await User.findById(user._id).select(
        // kya kya userSucceefullyEntered se nhi chahiye by default sare slected rhte hain
        "-password -refreshToken"


    ) // _id by mongoDb

    if(!userSucceefullyEntered){
        throw new ApiError(500, "Something went wrong while registering user")
    }
    else{
        return res.status(201).json(
            new ApiResponse(200, userSucceefullyEntered, "User Succefully registered...")
        )
    }

} )

const loginUser = asyncHandler(async (req,res) =>{
    // algorithm for logging-in user
    // 1. Get user data from req.body
    // 2. We can either authenticate via username or email depending upon us
    // 3. Check User with eneterd email or username exists or not in db
    // 4. password check eneterd by user with password stired in db helps bcrypt.compare method
    // 5. send access and refresh Tokens to User via cookies
    // 6. send response You are Successfully logged in

    // Taking user data

    const {email,username, password} = req.body

    if(!(email || username)){
        throw new ApiError(400, "Username or Email is Required...")
    }

    // Checking whether User Exists or not i.e, finding user

    const isExist = await User.findOne({  //{email} directly
        $or: [{email},{username}] // means if anyone either email ou usernaem is sent by user we can find him/her. 
        // $or is mongoose operator
    })

    if(!isExist){
        throw new ApiError(404, "User Not Found...")
    }

    // password checking using bcryot.compare

    const isPasswordCorrect = await isExist.isPassCorrect(password)
    if(!isPasswordCorrect){
        throw new ApiError(401, "Incorrect Password...")
    }

    // generataing access and refresh tokens

    const {accessToken, refreshToken} = await generateTokens(isExist._id)

    // sending access and refresh token in form of cookies
    // right now isExist user don't have access to access and refresh Tokens

    const loggedInUser = User.findById(isExist._id).select("-password -refreshToken")
    // means loggedInUser contains everything except password and refreshtoken

    // for sending cookies we need to design some option
    // console.log(loggedInUser)
    const options = {
        httpOnly: true,  // By default anyone can modify cookies in frontend
        // but using these methods cookie can be upadated only via server 
        secure: true
    }
                          //          key           value
    return res.status(200).cookie("accessToken", accessToken, options).cookie("refreshToken",refreshToken,options).json(
        new ApiResponse(
            200, // {
            //    loggedInUser,
            //    accessToken, 
            //    refreshToken // no need of passing access and refresh tokens here. But if user wants to save acceess and refresh Tokens in local storage then need to be sebded from here as well
            // },
            // {isExist: loggedInUser},
            // {
            //     userdata: loggedInUser,accessToken,refreshToken
            // },
            {
                // user: loggedInUser,
                accessToken,refreshToken},
            "User Logged In Successfully..."  // message to user
        )
    )

    // we can send as many cookie as we want using .cookie() method


})

const logoutUser = asyncHandler(async (req,res) => {
    // algorithm for logout user
    // user must be logged in order to be logout
    // we can check whether user is logged in or not using access token
    // thus defining a middleware for taking access token from user in auth.middleware.js file
    // from the verified loggedIn User we can delete it's refreshToken to logout user
    // once user logsIn back we generate a new refresh and acess tokens and guve it to user
    // now clear the cookies sent to user at the time of login


    await User.findByIdAndUpdate(
        req.user._id, // kis basis be find karo
        // kya kya update karoon 
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            // get the updated stored values of user in db
            new: true
        }
        
        )

        // clearing cookies
        const options = {
            httpOnly: true,
            secure: true
        }

        return res.status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(
            new ApiResponse(200, {}, 'User Logged Out Successfully...')
        )
})


export {
    loginUser,
    logoutUser
}
export default registerUser;