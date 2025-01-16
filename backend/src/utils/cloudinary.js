import {v2 as cloudinary} from "cloudinary";
import fs from "fs"    //File system of node

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.envCLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET
});

const uploadCloudinary = async (localFilePath)=>{
    try{
        if(!localFilePath) return null
        //Upload file
        const res = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        console.log("File is uploaded on cloudinary", res.url);
        return res;
    }catch(error){
        fs.unlinkSync(localFilePath)   //Delete the locally saved file as the upload operation got faile
        return null;
    }
}

export {uploadCloudinary}