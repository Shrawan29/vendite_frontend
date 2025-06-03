import dotenv from "dotenv"
import connectDB from "./db/index.js"
import { app } from "./app.js"

connectDB()
    .then(() => {
        app.listen(process.env.PORT || 8001, () => {
            console.log(`Server is running at port :${process.env.PORT}`);
        })
    })
    .catch((error)=>{
        console.log('MongoDB Connection error !!! ',error);
    })

dotenv.config({
    path: '.env'
})