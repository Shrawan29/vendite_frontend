import mongoose,{Schema} from "mongoose";

const categorySchema = new Schema(
    {
        name:{
            type: String,
            required: true,
            trim: true,
            index: true
        },
        description:{
            type: String
        },
        parentCategory:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
        },
    },
    {
        timestamps: true
    }
)

export const Category = mongoose.model("Category", categorySchema)