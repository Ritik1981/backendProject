import mongoose from "mongoose";
import { DB_NAME } from '../constants.js';

const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.DB_URL}/${DB_NAME}`)
        console.log("Database Succesfully Connected...")
        console.log(`\nDB Host: ${connectionInstance.connection.host}`)
    }
    catch(err){
        console.log("Error Connecting Database...: ",err)
        // throw err
        process.exit(1)
    }
}
export default connectDB;


