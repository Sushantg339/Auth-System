import "dotenv/config"
import express from "express"
import cookieParser from "cookie-parser"
import cors from "cors"

import connectToDB from "./config/db.config.js"
import mainRouter from "./routes/main.routes.js"
import errorHandler from "./middlewares/error.middleware.js"
import client from "./config/redis.config.js"

const app = express()

const PORT = process.env.PORT || 5000

app.use(express.json())
app.use(cookieParser())
app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
    methods: ["GET", "POST", "DELETE", "PUT", "OPTIONS"]
}))

app.use('/api/v1', mainRouter)


app.use(errorHandler);

const main = async ()=>{
    try {
        await connectToDB()
        await client.connect()

        app.listen(PORT, ()=>{
            console.log(`server is running on port ${PORT}`)
        })
    } catch (error) {
        console.log("internal server error", error)

        process.exit(1)
    }
}

main()