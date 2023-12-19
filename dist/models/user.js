import mongoose from "mongoose";
const UserShema = new mongoose.Schema({
    name: {
        type: String,
        require: true,
    },
    email: {
        type: String,
        require: true,
        unique: true,
    },
    passwordHash: {
        type: String,
        require: true,
    },
    gender: {
        type: String,
        require: true,
    },
    date_of_birth: {
        type: String,
        require: true,
    },
    avatar: {
        public_id: {
            type: String,
            require: true,
        },
        url: {
            type: String,
            require: true,
        },
    },
}, { timestamps: true });
export const UserModel = mongoose.model("User", UserShema);
