import mongoose from "mongoose";
import { config } from "./env.config.js"

const MONGODB_URI = config.mongodbUri

if(!MONGODB_URI){
    throw new Error("DB Url is missing")
}

const connectToDB = async()=>{
    try {
        await mongoose.connect(MONGODB_URI)
        console.log("connected to db")
    } catch (error) {
        console.log("error connecting to db ", error)
        process.exit(1)
    }
}

export default connectToDB