import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI

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