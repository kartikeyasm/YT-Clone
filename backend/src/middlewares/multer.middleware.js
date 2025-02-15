import multer from "multer";
import fs from 'fs';
import path from "path";


//Ensure Directory exist
const uploadDir = path.resolve("public/temp");
if(!fs.existsSync(uploadDir)){
  fs.mkdirSync(uploadDir, {recursive: true})
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir)     //cb = call back
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});
  
export const upload = multer({storage});