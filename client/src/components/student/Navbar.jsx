import React, { useContext } from 'react';
import { assets } from '../../assets/assets';
import { Link, useLocation } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import { toast } from 'react-toastify';
import axios from 'axios';

const Navbar = () => {

  const location = useLocation();

  const isCoursesListPage = location.pathname.includes('/course-list');

  const { 
    backendUrl, 
    isEducator, 
    setIsEducator, 
    navigate, 
    getToken, 
    isAuthenticated, 
    userData, 
    logout
  } = useContext(AppContext)

  const becomeEducator = async () => {

    try {

      if (isEducator) {
        navigate('/educator')
        return;
      }

      const token = getToken()
      const { data } = await axios.get(backendUrl + '/api/educator/update-role', { 
        headers: { Authorization: `Bearer ${token}` } 
      })
      
      if (data.success) {
        toast.success(data.message)
        setIsEducator(true)
      } else {
        toast.error(data.message)
      }

    } catch (error) {
      toast.error(error.message)
    }
  }

  return (
    <>
      <div className={`flex items-center justify-between px-4 sm:px-10 md:px-14 lg:px-36 border-b border-gray-500 py-4 ${isCoursesListPage ? 'bg-white' : 'bg-cyan-100/70'}`}>
        <img onClick={() => navigate('/')} src={assets.logo} alt="Logo" className="w-28 lg:w-32 cursor-pointer" />
        <div className="md:flex hidden items-center gap-5 text-gray-500">
          <div className="flex items-center gap-5">
            {
              isAuthenticated && <>
                <button onClick={becomeEducator}>
                  {isEducator ? 'Educator Dashboard' : 'Become Educator'}
                </button>
                | <Link to='/my-enrollments' >My Enrollments</Link>
              </>
            }
          </div>
          {isAuthenticated
            ? <div className="flex items-center gap-3">
                <span className="text-sm text-gray-700">Hi, {userData?.name}</span>
                <button 
                  onClick={logout} 
                  className="bg-red-600 text-white px-4 py-2 rounded-full text-sm hover:bg-red-700"
                >
                  Logout
                </button>
              </div>
            : <div className="flex items-center gap-3">
                <button 
                  onClick={() => navigate('/login')} 
                  className="text-gray-700"
                >
                  Login
                </button>
                <button 
                  onClick={() => navigate('/register')} 
                  className="bg-blue-600 text-white px-5 py-2 rounded-full hover:bg-blue-700"
                >
                  Create Account
                </button>
              </div>}
        </div>
        {/* For Phone Screens */}
        <div className='md:hidden flex items-center gap-2 sm:gap-5 text-gray-500'>
          <div className="flex items-center gap-1 sm:gap-2 max-sm:text-xs">
            <button onClick={becomeEducator}>
              {isEducator ? 'Educator Dashboard' : 'Become Educator'}
            </button>
            | {
              isAuthenticated && <Link to='/my-enrollments' >My Enrollments</Link>
            }
          </div>
          {isAuthenticated
            ? <div className="flex flex-col items-center gap-1">
                <span className="text-xs text-gray-700">Hi, {userData?.name}</span>
                <button 
                  onClick={logout} 
                  className="bg-red-600 text-white px-3 py-1 rounded-full text-xs hover:bg-red-700"
                >
                  Logout
                </button>
              </div>
            : <div className="flex items-center gap-3">
                <button onClick={() => navigate('/login')} className="text-gray-700 text-sm">Login</button>
                <button onClick={() => navigate('/register')}>
                  <img src={assets.user_icon} alt="" />
                </button>
              </div>}
        </div>
      </div>
    </>
  );
};

export default Navbar