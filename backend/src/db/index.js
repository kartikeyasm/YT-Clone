import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";



const connectDB =async () => {
    await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
    .then(console.log("DB Connection Successful"))
    .catch((error)=>{
        console.log("DB Connection Issues");
        console.error(error);
        process.exit(1);
    })
}

export default connectDB;


/* //Error
const connectDB = async ()=>{
    try{
        const connectionInstance = await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log(`\n MongoDB connected!!! DB HOST: ${connectionInstance}`);
    }catch(error){
        console.error("MongoDB connection error", error);
        process.exit(1);
    }

}
*/




