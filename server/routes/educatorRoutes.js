import express from 'express'
import { addCourse, educatorDashboardData, getEducatorCourses, getEnrolledStudentsData, updateRoleToEducator } from '../controllers/educatorController.js';
import upload from '../configs/multer.js';
import { protect, protectEducator } from '../middlewares/authMiddleware.js';

const educatorRouter = express.Router()

// Add Educator Role 
educatorRouter.get('/update-role', protect, updateRoleToEducator)

// Add Courses 
educatorRouter.post('/add-course', protect, protectEducator, upload.single('image'), addCourse)

// Get Educator Courses 
educatorRouter.get('/courses', protect, protectEducator, getEducatorCourses)

// Get Educator Dashboard Data
educatorRouter.get('/dashboard', protect, protectEducator, educatorDashboardData)

// Get Educator Students Data
educatorRouter.get('/enrolled-students', protect, protectEducator, getEnrolledStudentsData)

export default educatorRouter;