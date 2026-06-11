import React, { useEffect, useState } from 'react'
import { FaRegEyeSlash } from "react-icons/fa6";
import { FaRegEye } from "react-icons/fa6";
// import toast from 'react-hot-toast';
// import Axios from '../utils/Axios';
// import SummaryApi from '../common/SummaryApi';
// import AxiosToastError from '../utils/AxiosToastError';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';

const ForgotPassword = () => {
    const [data, setData] = useState({
        email: "",
    })

    console.log(useParams().email)
    const location = useParams().email;
    //const location = useLocation().pathname
    const navigate = useNavigate()

    const handleChange = (e) => {
        const { name, value } = e.target

        setData((preve) => {
            return {
                ...preve,
                [name]: value
            }
        })
    }

    const valideValue = Object.values(data).every(el => el)


    const handleSubmit = async(e)=>{
        e.preventDefault()

        // try {
        //     const response = await Axios({
        //         ...SummaryApi.forgot_password,
        //         data : data
        //     })
            
        //     if(response.data.error){
        //         toast.error(response.data.message)
        //     }

        //     if(response.data.success){
        //         toast.success(response.data.message)
        //         navigate("/verification-otp",{
        //           state : data
        //         })
        //         setData({
        //             email : "",
        //         })
                
        //     }

        // } catch (error) {
        //     AxiosToastError(error)
        // }
    }

    useEffect(()=>{
        setData({...data,email:location})
    },[])

    return (
        <section className='w-full container mx-auto px-2'>
  <div className='bg-white dark:bg-gray-900 my-4 w-full max-w-lg mx-auto rounded p-7 shadow-md text-gray-800 dark:text-gray-100'>
    
    <p className='font-semibold text-lg'>Forgot Password </p>

    <form className='grid gap-4 py-4' onSubmit={handleSubmit}>
      
      <div className='grid gap-1'>
        <label htmlFor='email' className='text-gray-700 dark:text-gray-300'>
          Email :
        </label>

        <input
          type='email'
          id='email'
          className='bg-blue-50 dark:bg-gray-800 p-2 border border-gray-300 dark:border-gray-700 rounded outline-none focus:border-primary-200 dark:focus:border-red-500 text-gray-800 dark:text-gray-100 placeholder-gray-400'
          name='email'
          value={data.email}
          onChange={handleChange}
          placeholder='Enter your email'
        />
      </div>

      <button
        onClick={() => navigate("/otpverify")}
        disabled={!valideValue}
        className={`${
          valideValue
            ? "bg-green-800 hover:bg-green-700"
            : "bg-gray-500 dark:bg-gray-700"
        } text-white py-2 rounded font-semibold my-3 tracking-wide transition-colors`}
      >
        Send Otp
      </button>

    </form>

    <p className='text-gray-700 dark:text-gray-300'>
      Already have account?{" "}
      <Link
        to={"/login"}
        className='font-semibold text-green-700 dark:text-green-500 hover:text-green-800 dark:hover:text-green-400'
      >
        Login
      </Link>
    </p>

  </div>
</section>
    )
}

export default ForgotPassword


