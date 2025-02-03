import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from '../utils/ApiError.js'
import {User} from "../models/user.model.js"
import { uploadCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";


const registerUser = asyncHandler(async (req, res)=>{
    //Get user details from frontend
    const {fullName, email, username, password} = req.body
    
    //Validations
    if(fullName === ""){
        throw new ApiError(400, "Full Name is Required");
    }
    if(email === ""){
        throw new ApiError(400, "Email is Required");
    }
    if(username === ""){
        throw new ApiError(400, "Username is Required");
    }
    if(password === ""){
        throw new ApiError(400, "Password is Required");
    }
    
    //Check if user already exist: username and email
    if(User.findOne({userName})){
        throw new ApiError(409, "Username already exist")
    }
    if(User.findOne({email})){
        throw new ApiError(409, "Acount already exist with this email")
    }
    

    //Check avtar and cover image (if empty then default) (else upload on cloudinary)
    const avtarLocalPath = req.files?.avatar[0]?.path
    const coverImageLocalPath = req.files?.coverImage[0]?.path
    
    if(!avtarLocalPath){
        throw new ApiError(400, "Avatar file is req.");
    }
    const coverImage = await uploadCloudinary(coverImageLocalPath);
    const avtar = await uploadCloudinary(avtarLocalPath);
    if(!avtar){
        throw new ApiError(400, "Avatar file is req.");
    }
    
    //create user object and create entry in DB
    const user =await User.create({
        fullName,
        avatar: avatar?.url || "",
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()

    })
    
    
    //remove password and refresh token from response field
    const isUserExist = await User.findById(user._id).select(
        "-password -refreshToken"                                //removed password and refreshToken from the fields
    )                          
    
    //check if user is created or not
    if(!isUserExist){
        throw new ApiError(500, "Something went wrong, try again later");
    }
    
    //return res
    return res.status(201).json(
        new ApiResponse(200, isUserExist, "User registered successfully")
    )


})


export {registerUser};