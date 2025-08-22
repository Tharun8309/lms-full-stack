import axios from "axios";
import { createContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import humanizeDuration from "humanize-duration";

export const AppContext = createContext()

export const AppContextProvider = (props) => {

    const backendUrl = import.meta.env.VITE_BACKEND_URL
    const currency = import.meta.env.VITE_CURRENCY

    const navigate = useNavigate()

    const [showLogin, setShowLogin] = useState(false)
    const [isEducator, setIsEducator] = useState(false)
    const [allCourses, setAllCourses] = useState([])
    const [userData, setUserData] = useState(null)
    const [enrolledCourses, setEnrolledCourses] = useState([])
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [token, setToken] = useState(localStorage.getItem('token'))

    // Check if user is authenticated on mount
    useEffect(() => {
        if (token) {
            setIsAuthenticated(true)
            fetchUserData()
        }
    }, [token])

    // Login function
    const login = async (email, password) => {
        try {
            const { data } = await axios.post(backendUrl + '/api/user/login', {
                email,
                password
            })

            if (data.success) {
                localStorage.setItem('token', data.token)
                setToken(data.token)
                setUserData(data.user)
                setIsAuthenticated(true)
                setIsEducator(data.user.role === 'educator')
                setShowLogin(false)
                toast.success('Login successful!')
                // Redirect based on role
                if (data.user.role === 'educator') {
                    navigate('/educator')
                } else {
                    navigate('/course-list')
                }
                return true
            } else {
                toast.error(data.message)
                return false
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Login failed')
            return false
        }
    }

    // Register function (supports JSON or FormData)
    const register = async (payload, isFormData = false) => {
        try {
            const config = isFormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : undefined
            const { data } = await axios.post(backendUrl + '/api/user/register', payload, config)

            if (data.success) {
                localStorage.setItem('token', data.token)
                setToken(data.token)
                setUserData(data.user)
                setIsAuthenticated(true)
                setIsEducator(data.user.role === 'educator')
                setShowLogin(false)
                toast.success('Registration successful!')
                // Redirect based on role
                if (data.user.role === 'educator') {
                    navigate('/educator')
                } else {
                    navigate('/course-list')
                }
                return true
            } else {
                toast.error(data.message)
                return false
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Registration failed')
            return false
        }
    }

    // Logout function
    const logout = () => {
        localStorage.removeItem('token')
        setToken(null)
        setUserData(null)
        setIsAuthenticated(false)
        setIsEducator(false)
        setEnrolledCourses([])
        navigate('/')
        toast.success('Logged out successfully')
    }

    // Get auth token for API calls
    const getToken = () => {
        return localStorage.getItem('token')
    }

    // Fetch All Courses
    const fetchAllCourses = async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/course/all');

            if (data.success) {
                setAllCourses(data.courses)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    // Fetch UserData 
    const fetchUserData = async () => {
        try {
            if (!token) return

            const { data } = await axios.get(backendUrl + '/api/user/data',
                { headers: { Authorization: `Bearer ${token}` } })

            if (data.success) {
                setUserData(data.user)
                setIsEducator(data.user.role === 'educator')
                fetchUserEnrolledCourses()
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            if (error.response?.status === 401) {
                logout()
            } else {
                toast.error(error.message)
            }
        }
    }

    // Fetch User Enrolled Courses
    const fetchUserEnrolledCourses = async () => {
        if (!token) return

        try {
            const { data } = await axios.get(backendUrl + '/api/user/enrolled-courses',
                { headers: { Authorization: `Bearer ${token}` } })

            if (data.success) {
                setEnrolledCourses(data.enrolledCourses.reverse())
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            if (error.response?.status === 401) {
                logout()
            } else {
                toast.error(error.message)
            }
        }
    }

    // Function to Calculate Course Chapter Time
    const calculateChapterTime = (chapter) => {
        let time = 0
        chapter.chapterContent.map((lecture) => time += lecture.lectureDuration)
        return humanizeDuration(time * 60 * 1000, { units: ["h", "m"] })
    }

    // Function to Calculate Course Duration
    const calculateCourseDuration = (course) => {
        let time = 0
        course.courseContent.map(
            (chapter) => chapter.chapterContent.map(
                (lecture) => time += lecture.lectureDuration
            )
        )
        return humanizeDuration(time * 60 * 1000, { units: ["h", "m"] })
    }

    const calculateRating = (course) => {
        if (course.courseRatings.length === 0) {
            return 0
        }
        let totalRating = 0
        course.courseRatings.forEach(rating => {
            totalRating += rating.rating
        })
        return Math.floor(totalRating / course.courseRatings.length)
    }

    const calculateNoOfLectures = (course) => {
        let totalLectures = 0;
        course.courseContent.forEach(chapter => {
            if (Array.isArray(chapter.chapterContent)) {
                totalLectures += chapter.chapterContent.length;
            }
        });
        return totalLectures;
    }

    useEffect(() => {
        fetchAllCourses()
    }, [])

    const value = {
        showLogin, setShowLogin,
        backendUrl, currency, navigate,
        userData, setUserData, getToken,
        allCourses, fetchAllCourses,
        enrolledCourses, fetchUserEnrolledCourses,
        calculateChapterTime, calculateCourseDuration,
        calculateRating, calculateNoOfLectures,
        isEducator, setIsEducator,
        isAuthenticated, login, register, logout
    }

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )
}
