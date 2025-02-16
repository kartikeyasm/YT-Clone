import mongoose from "mongoose";
import jwt from "jsonwebtoken"
import bcrypt from 'bcrypt'

//Every instance has it's unique ID
const userSchema = new mongoose.Schema(
    {
        userName: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true           //To make this field searchable in optimized way [costly opperation hence used cautiosly]
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,           
        },
        fullName: {
            type: String,
            required: true,
            trim: true,    
            index: true       
        },
        avatar: {
            type: String,   //cloudinary url
            required: true
        },
        coverImage: {
            type: String
        },
        password: {
            type: String,   //Use bcrypt to hash our passwords
            required: [true,"Password is required"]
        },
        refreshToken: {
            type: String,   //Use JWT (jsonwebtoken) to generate tokens
            default: ""
        },
        watchHistory: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Video"
            }
        ]
    },{timestamps:true}
);

userSchema.pre("save", async function(next){     //Can't use ()=>{} because it does not have this. access
    if(this.isModified("password")){
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
})


//Custom Methods
userSchema.methods.isPasswordCorrect = async function (password){
    return await bcrypt.compare(password, this.password)
}

userSchema.methods.generateAccessToken = function(){
    return jwt.sign({
        _id: this._id,
        email: this.email,
        userName: this.userName,
        fullName: this.fullName,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}
userSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
        _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const User = mongoose.model("User", userSchema);