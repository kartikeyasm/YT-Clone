import express from "express";
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express();


//1 Cors Setup
// app.use(cors())     //We need not to do anything else

app.use(cors({
    origin: process.env.CORS_ORIGIN,    //Not necessary
    credentials: true                   //Not necessary
}))

//Express Setup
app.use(express.json({limit: "16kb"}));  //To handle JSON data from forms
app.use(express.urlencoded({extended: true, limit: "16kb"})); //To handle URL data
app.use(express.static("public"))   //It is made to handle if there are any temp files are required and those files can be placed in ./public/temp


//Cookie Setup
app.use(cookieParser())

export {app};