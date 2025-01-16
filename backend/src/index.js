//require('dotenv').config()
import connectDB from "./db/index.js";
import { app } from "./app.js";
import dotenv from "dotenv";
dotenv.config({
    path : "./env"
})

connectDB()
.then(()=>{
    app.on("Error", (error)=>{
        console.log("Error", error);
        throw error;
    })
    app.listen(process.env.PORT || 8000, ()=>{
        console.log(`App is listening on ${process.env.PORT || 8000}`);    
    });
})
.catch((err)=>{
    console.log("Mongo DB connection failed!!!", err);
    
})


















/* 
const connectDB =async () => {
    await mongoose.connect(process.env.MONGODB_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(console.log("DB Connection Successful"))
    .catch((error)=>{
        console.log("DB Connection Issues");
        console.error(error);
        process.exit(1);
    })
}
*/

/* //first approach of over polluting the index.js
import express from "express";

const app = express();

(async ()=>{
    try{
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        app.on("Error", (error)=>{
            console.log("Error", error);
            throw error;
        })
        app.listen(process.env.PORT, ()=>{
            console.log(`APP is listening on port: ${process.env.PORT}`);
        });


    }catch(error){
        console.error("Error:", error);
        throw error;
    }
})()
*/
/* 
const connectDB = async()=>{
    try{
        await mongoose.connect(`${process.env.MONGODB_URI}`)

    }catch(error){
        console.error("Error": error);
        throw error;
    }
}
connectDB();
 */