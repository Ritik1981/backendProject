import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser';

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({limit: "20kb"})) // Saying ki data json format mein bhi aa sakta hai magar limit 20kb hai usse jayda json data accept nhu karna hai..

// url se accepting data +, %20 so need of encoding

app.use(express.urlencoded({extended: true, limit: "20kb"})) // extended to accept object inside object

// now for keeping public images favicons, files, etc..
app.use(express.static("public"))
 
// using cookie parser

app.use(cookieParser())



// routes import

import {userRouter} from './routes/user.routes.js';


// routes declaration
// we used app.get because initially we were decaring route and the task to do at this route here
// but now since our task is in different file so we use app.use using middleware

// instead os /users we should use /api/v1/users it;s a good practice

app.use("/users", userRouter) // kis route pe koun sa router ko activate karna hai

// yahan /users route pe "Router" router ko execute karwana hai.
// Now as soon as the user enters the /user url control will automatically go to userRouter which is in users.routes.js file

// https://localhost:8000/users/login or /register ya ohir koii bhi route ho

export default app;