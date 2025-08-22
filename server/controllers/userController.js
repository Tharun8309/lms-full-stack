import Course from "../models/Course.js"
import { CourseProgress } from "../models/CourseProgress.js"
import { Purchase } from "../models/Purchase.js"
import User from "../models/User.js"
import stripe from "stripe"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { v2 as cloudinary } from 'cloudinary'

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    })
}

const isValidEmail = (email) => /[^\s@]+@[^\s@]+\.[^\s@]+/.test(email)

// Register User
export const registerUser = async (req, res) => {
    try {
        const name = (req.body.name || '').trim()
        const email = (req.body.email || '').trim().toLowerCase()
        const password = (req.body.password || '')
        const role = (req.body.role || 'student').trim()

        // Basic validation
        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: 'Name, email and password are required' })
        }
        if (!isValidEmail(email)) {
            return res.status(400).json({ success: false, message: 'Invalid email format' })
        }
        if (password.length < 6) {
            return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' })
        }
        if (!['student', 'educator'].includes(role)) {
            return res.status(400).json({ success: false, message: 'Invalid role' })
        }

        // Check if user exists
        const userExists = await User.findOne({ email })
        if (userExists) {
            return res.status(400).json({ success: false, message: 'User already exists' })
        }

        // Hash password
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        // Optional image upload to Cloudinary
        let imageUrl = process.env.DEFAULT_USER_IMAGE_URL || ''
        try {
            if (req.file) {
                const uploadRes = await cloudinary.uploader.upload(req.file.path)
                imageUrl = uploadRes.secure_url
            }
        } catch (uploadErr) {
            return res.status(400).json({ success: false, message: uploadErr.message || 'Image upload failed' })
        }

        // Create user
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role,
            imageUrl
        })

        if (user) {
            res.status(201).json({
                success: true,
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    imageUrl: user.imageUrl
                },
                token: generateToken(user._id)
            })
        } else {
            res.status(400).json({ success: false, message: 'Invalid user data' })
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}

// Login User
export const loginUser = async (req, res) => {
    try {
        const email = (req.body.email || '').trim().toLowerCase()
        const password = req.body.password || ''

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Email and password are required' })
        }
        if (!isValidEmail(email)) {
            return res.status(400).json({ success: false, message: 'Invalid email format' })
        }

        // Check for user email
        const user = await User.findOne({ email })

        if (user && user.password && (await bcrypt.compare(password, user.password))) {
            res.json({
                success: true,
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    imageUrl: user.imageUrl
                },
                token: generateToken(user._id)
            })
        } else {
            res.status(401).json({ success: false, message: 'Invalid email or password' })
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}

// Get User Data
export const getUserData = async (req, res) => {
    try {
        const userId = req.user._id

        const user = await User.findById(userId)

        if (!user) {
            return res.status(404).json({ success: false, message: 'User Not Found' })
        }

        res.json({ success: true, user })

    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}

// Purchase Course 
export const purchaseCourse = async (req, res) => {

    try {

        const { courseId } = req.body
        const { origin } = req.headers

        const userId = req.user._id

        const courseData = await Course.findById(courseId)
        const userData = await User.findById(userId)

        if (!userData || !courseData) {
            return res.status(404).json({ success: false, message: 'Data Not Found' })
        }

        const purchaseData = {
            courseId: courseData._id,
            userId,
            amount: Number((courseData.coursePrice - (courseData.discount * courseData.coursePrice) / 100).toFixed(2)),
        }

        const newPurchase = await Purchase.create(purchaseData)

        // Stripe Gateway Initialize
        const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY)

        const currency = process.env.CURRENCY.toLocaleLowerCase()

        // Creating line items to for Stripe
        const line_items = [{
            price_data: {
                currency,
                product_data: {
                    name: courseData.courseTitle
                },
                unit_amount: Math.round(Number(newPurchase.amount) * 100)
            },
            quantity: 1
        }]

        const session = await stripeInstance.checkout.sessions.create({
            success_url: `${origin}/loading/my-enrollments`,
            cancel_url: `${origin}/`,
            line_items: line_items,
            mode: 'payment',
            metadata: {
                purchaseId: newPurchase._id.toString()
            }
        })

        res.json({ success: true, session_url: session.url });


    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

// Users Enrolled Courses With Lecture Links
export const userEnrolledCourses = async (req, res) => {

    try {

        const userId = req.user._id

        const userData = await User.findById(userId)
            .populate('enrolledCourses')

        res.json({ success: true, enrolledCourses: userData.enrolledCourses })

    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }

}

// Update User Course Progress
export const updateUserCourseProgress = async (req, res) => {

    try {

        const userId = req.user._id

        const { courseId, lectureId } = req.body

        const progressData = await CourseProgress.findOne({ userId, courseId })

        if (progressData) {

            if (progressData.lectureCompleted.includes(lectureId)) {
                return res.json({ success: true, message: 'Lecture Already Completed' })
            }

            progressData.lectureCompleted.push(lectureId)
            await progressData.save()

        } else {

            await CourseProgress.create({
                userId,
                courseId,
                lectureCompleted: [lectureId]
            })

        }

        res.json({ success: true, message: 'Progress Updated' })

    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }

}

// get User Course Progress
export const getUserCourseProgress = async (req, res) => {

    try {

        const userId = req.user._id

        const { courseId } = req.body

        const progressData = await CourseProgress.findOne({ userId, courseId })

        res.json({ success: true, progressData })

    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }

}

// Add User Ratings to Course
export const addUserRating = async (req, res) => {

    const userId = req.user._id;
    const { courseId, rating } = req.body;

    // Validate inputs
    if (!courseId || !userId || !rating || rating < 1 || rating > 5) {
        return res.status(400).json({ success: false, message: 'InValid Details' });
    }

    try {
        // Find the course by ID
        const course = await Course.findById(courseId);

        if (!course) {
            return res.status(404).json({ success: false, message: 'Course not found.' });
        }

        const user = await User.findById(userId);

        if (!user || !user.enrolledCourses.includes(courseId)) {
            return res.status(403).json({ success: false, message: 'User has not purchased this course.' });
        }

        // Check is user already rated
        const existingRatingIndex = course.courseRatings.findIndex(r => r.userId === userId);

        if (existingRatingIndex > -1) {
            // Update the existing rating
            course.courseRatings[existingRatingIndex].rating = rating;
        } else {
            // Add a new rating
            course.courseRatings.push({ userId, rating });
        }

        await course.save();

        return res.json({ success: true, message: 'Rating added' });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};