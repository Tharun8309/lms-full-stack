import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    imageUrl: { type: String, default: "" },
    role: { type: String, enum: ['student', 'educator'], default: 'student' },
    enrolledCourses: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Course'
        }
    ],
}, { timestamps: true });

const User = mongoose.model("User", userSchema);

export default User