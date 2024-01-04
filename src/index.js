// require('dotenv').config({
//     path: './env'
// })
import dotenv from 'dotenv'
import connectDB from "./db/connect.js";


dotenv.config({ // Here we should focus on execute dotenv as early as possible so all the files/directories which are associated with index.js should get hold of all the environment variables  
    path: './env'
})

connectDB();