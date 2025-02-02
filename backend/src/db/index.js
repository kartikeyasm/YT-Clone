import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";


const connectDB = async () => {
        try {
            await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
            console.log("Connected to MongoDB Atlas");
        } catch (err) {
            console.error("Error connecting to MongoDB Atlas", err);
            process.exit(1); // Exit the application if the database connection fails
        }
    };
export default connectDB;
    /*
const connectDB =async ()=> {
        await mongoose.connect("mongodb+srv://bhavyapopli2003:R4etVijGdzVSQ9pw@bhavya.8bzk9im.mongodb.net/YT")
    .then((client) => {
          console.log("Connected to MongoDB Atlas");
          
          app.listen(PORT, () => {
              console.log(`Server is running on http://localhost:${PORT}`);
            });
        })
        .catch((err) => {
            console.error("Error connecting to MongoDB Atlas", err);
        });
    }    
export default connectDB;
*/

/*
const connectDB =async () => {
    try{
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        console.log("DB Connection Successful");
    }
    catch(error){
        console.log("DB Connection Issues");
        console.error(error);
        process.exit(1);
    }
}
*/


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




