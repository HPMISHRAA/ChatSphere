import React, { useState, useEffect } from 'react';
import { GoogleLogin } from "react-google-login";
import { gapi } from "gapi-script";
import { googleAuth, loginUser, validUser } from '../apis/auth';
import { Link } from 'react-router-dom';
import { BsEye, BsEyeSlash } from "react-icons/bs";
import { FcGoogle } from "react-icons/fc";
import { toast } from 'react-toastify';

const defaultData = {
  email: "",
  password: ""
};

function Login() {
  const [formData, setFormData] = useState(defaultData);
  const [isLoading, setIsLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);


  const googleSuccess = async (res) => {
    if (res?.profileObj) {
      setIsLoading(true);
      const response = await googleAuth({ tokenId: res.tokenId });
      setIsLoading(false);
      if (response && response.data && response.data.token) {
        localStorage.setItem("userToken", response.data.token);
        window.location.href = "/chats";
      } else {
        alert("Google Login Failed! Response: " + JSON.stringify(response ? response.data : "Network Error / CORS / Backend 500"));
      }
    } else {
      alert("Google profile missing from response!");
    }
  };

  const googleFailure = (error) => {
    // console.log("Google Login Failed", error);
  };

  const handleOnChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const formSubmit = async (e) => {
    e.preventDefault();
    if (formData.email.includes("@") && formData.password.length >= 6) {
      setIsLoading(true);
      try {
        const response = await loginUser(formData);
        if (response?.data?.token) {
          localStorage.setItem("userToken", response.data.token);
          toast.success("Successfully logged in!");
          window.location.href = "/chats";
        } else {
          toast.error(response?.data?.error || response?.data?.message || "Invalid Credentials!");
          setFormData({ ...formData, password: "" });
        }
      } catch (error) {
        toast.error("Login failed. Please try again.");
      } finally {
        setIsLoading(false);
      }
    } else {
      toast.warning("Provide valid Credentials!");
    }
  };

  useEffect(() => {
    const initClient = () => {
      gapi.client.init({
        clientId: process.env.REACT_APP_GOOGLE_CLIENT_ID,
        scope: ''
      });
    };
    gapi.load('client:auth2', initClient);
    
    const isValid = async () => {
      const data = await validUser();
      if (data?.user) {
        window.location.href = "/chats";
      }
    };
    isValid();
  }, []);

  return (
    <div className='min-h-screen w-full flex justify-center items-center font-sans px-4 relative overflow-hidden'>
      {/* Premium Background Elements */}
      <div className='absolute top-0 left-0 w-full h-full bg-bg-primary'></div>
      <div className='absolute -top-40 -left-40 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob'></div>
      <div className='absolute top-20 -right-20 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob' style={{ animationDelay: '2s' }}></div>
      <div className='absolute -bottom-40 left-20 w-80 h-80 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob' style={{ animationDelay: '4s' }}></div>

      <div className='relative z-10 w-full max-w-md p-8 md:p-10 bg-bg-secondary/90 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-white/20 dark:border-border-color'>
        <div className='text-center mb-8'>
          <h2 className='text-3xl font-bold text-text-primary tracking-tight mb-2'>Welcome Back</h2>
          <p className='text-text-secondary text-sm'>
            Don't have an account? <Link className='text-accent-color font-semibold hover:underline transition-all' to="/register">Sign up</Link>
          </p>
        </div>

        <form className='flex flex-col gap-5' onSubmit={formSubmit}>
          <div className='flex flex-col gap-1'>
             <label className='text-sm font-medium text-text-secondary ml-1'>Email</label>
             <input 
               className='w-full bg-bg-primary text-text-primary border border-border-color focus:border-accent-color focus:ring-1 focus:ring-accent-color rounded-xl px-4 py-3 outline-none transition-all' 
               onChange={handleOnChange} 
               name="email" 
               type="email" 
               placeholder='you@example.com' 
               value={formData.email} 
               required 
             />
          </div>

          <div className='flex flex-col gap-1 relative'>
            <label className='text-sm font-medium text-text-secondary ml-1'>Password</label>
            <div className='relative'>
               <input 
                 className='w-full bg-bg-primary text-text-primary border border-border-color focus:border-accent-color focus:ring-1 focus:ring-accent-color rounded-xl px-4 py-3 outline-none transition-all' 
                 onChange={handleOnChange} 
                 type={showPass ? "text" : "password"} 
                 name="password" 
                 placeholder='••••••••' 
                 value={formData.password} 
                 required 
               />
               <button type='button' onClick={() => setShowPass(!showPass)} className='absolute top-1/2 right-4 transform -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors'>
                 {showPass ? <BsEyeSlash size={20} /> : <BsEye size={20} />}
               </button>
            </div>
          </div>

          <button 
            type='submit'
            disabled={isLoading}
            className='mt-2 w-full bg-accent-color hover:bg-accent-hover text-white font-bold py-3.5 rounded-xl transition-colors shadow-lg shadow-accent-color/30 flex justify-center items-center'
          >
            {isLoading ? (
               <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                 <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                 <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
               </svg>
            ) : "Log In"}
          </button>
          
          <div className='flex items-center my-4'>
            <div className='flex-grow border-t border-border-color'></div>
            <span className='px-4 text-xs text-text-secondary font-medium uppercase tracking-wider'>Or continue with</span>
            <div className='flex-grow border-t border-border-color'></div>
          </div>

          <GoogleLogin
            clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}
            render={(renderProps) => (
              <button 
                onClick={renderProps.onClick} 
                disabled={renderProps.disabled} 
                type="button"
                className="w-full bg-bg-primary hover:bg-bg-secondary border border-border-color text-text-primary font-medium py-3.5 px-4 rounded-xl flex items-center justify-center gap-3 transition-colors shadow-sm"
              >
                <FcGoogle size={24} />
                <span>Google</span>
              </button>
            )}
            onSuccess={googleSuccess}
            onFailure={googleFailure}
            cookiePolicy={'single_host_origin'}
          />
        </form>
      </div>
    </div>
  );
}

export default Login;