import express from 'express'
import { 
    addUserRating, 
    getUserCourseProgress, 
    getUserData, 
    purchaseCourse, 
    updateUserCourseProgress, 
    userEnrolledCourses,
    registerUser,
    loginUser
} from '../controllers/userController.js';
import { protect } from '../middlewares/authMiddleware.js';
import upload from '../configs/multer.js'

const userRouter = express.Router()

// Public routes (no authentication required)
userRouter.post('/register', upload.single('image'), registerUser)
userRouter.post('/login', loginUser)

// Protected routes (authentication required)
userRouter.get('/data', protect, getUserData)
userRouter.post('/purchase', protect, purchaseCourse)
userRouter.get('/enrolled-courses', protect, userEnrolledCourses)
userRouter.post('/update-course-progress', protect, updateUserCourseProgress)
userRouter.post('/get-course-progress', protect, getUserCourseProgress)
userRouter.post('/add-rating', protect, addUserRating)

export default userRouter;