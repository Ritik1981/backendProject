import mongoose, {Schema} from "mongoose";
import bcrypt from "bcrypt"
import jwt from 'jsonwebtoken'
const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        index: true // to enable faster searching
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    fullName: {
        type: String,
        required: true,
        trim: true,
        index: true
    },
    avatar: {
        type: String,  // cloudanary, aws third party api to store images,videos,files,etc.
        required: true        
    },
    coverImage: {
        type: String,
    },
    watchHistory: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Video'
        }
    ],
    password: {
        type: String,
        required: [true, 'Password is Mandatory...']
    },
    refreshToken: {
        type: String // we will talk about refreshToken, accessToken, jwt, wtc..
    }



},{timestamps:true})


// use of mongoose middlewares so that before saving data password got encrypted

userSchema.pre("save", async function (next) {
    // to check whether the password has been upadted or not
    if(!this.isModified("password")) { return next(); }
    this.password = await bcrypt.hash(this.password, 10) // kya encrpyt karoon aur kitne hash round lagaun
    next() // since acting as middleware before saving user's details
})

// comparing whether password is correct or not
// definig our own custom method to check password

userSchema.methods.isPassCorrect = async function (password) {
    return await bcrypt.compare(password, this.password)
    // takes two args password entered by user and it's hashed version 
    // if both are equal then password is correct means returns true
    // if both are unequal then password is incorrect means returns false
}

// defining more custom methods to generate jwt

userSchema.methods.generateAccessToken = function () {
    console.log("Generating tokens")
    console.log(this._id)
    return jwt.sign(
        {
            // payload
            _id: this._id,
            username: this.username // more payload can be given
        },
        // 2nd arg is ACCESS_token_secret
        process.env.ACCESS_TOKEN_SECRET,
        
        // 3rd arg is expiry within {}
        {
             expiresIn: '10m' // process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

// similarly refreshToken is generated

userSchema.methods.generateRefreshToken = function () {
    console.log(this._id)
    return jwt.sign(
        {
            // payload, here we provide less no. of payloads as compared to access token
            _id: this._id,
        },
        // 2nd arg is refresh_token_secret
        process.env.REFRESH_TOKEN_SECRET,
        
        // 3rd arg is expiry within {}
        {
            expiresIn: '1d' // process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}



export const User = mongoose.model("User", userSchema)