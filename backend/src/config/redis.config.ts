import { createClient } from "redis";
import { config } from "./env.config.js"

const REDIS_URL = config.REDIS_URL

if(!REDIS_URL){
    throw new Error("Cache DB Url missing")
}

const client = createClient({
    url : REDIS_URL
})

client.on('error', err => console.log('Redis Client Error', err));
client.on('connect', ()=>console.log('redis connected'))

export default client