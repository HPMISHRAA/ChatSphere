import React, { useState } from 'react'
import { IoArrowBack } from "react-icons/io5"
import { useDispatch, useSelector } from 'react-redux'
import { setShowProfile } from '../redux/profileSlice'
import { IoMdLogOut } from "react-icons/io"
import InputEdit from './profile/InputEdit'
import { updateUser } from '../apis/auth'
import { toast } from 'react-toastify'
import { setUserNameAndBio } from '../redux/activeUserSlice'
function Profile(props) {
  const dispatch = useDispatch()
  const { showProfile } = useSelector((state) => state.profile)
  const activeUser = useSelector((state) => state.activeUser)
  const [formData, setFormData] = useState({
    name: activeUser.name,
    bio: activeUser.bio
  })
  const logoutUser = () => {
    toast.success("Logout Successfull!")
    localStorage.removeItem("userToken")
    window.location.href = "/login"
  }
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }
  const submit = async () => {

    dispatch(setUserNameAndBio(formData))
    toast.success("Updated!")
    await updateUser(activeUser.id, formData)

  }

  return (
    <div style={{ transition: showProfile ? "0.3s ease-in-out" : "" }} className={`${props.className} h-full bg-bg-primary flex flex-col relative`}>
      <div className='bg-bg-secondary flex items-center p-4 border-b border-border-color shadow-sm h-[70px] shrink-0'>
        <button onClick={() => dispatch(setShowProfile(false))} className='flex items-center gap-3 text-text-primary hover:text-accent-color transition-colors'>
          <IoArrowBack className='w-6 h-6' />
          <h6 className='text-lg font-bold tracking-wide'>Profile</h6>
        </button>
      </div>

      <div className='flex-1 overflow-y-auto scrollbar-hide flex flex-col'>
        <div className='flex items-center justify-center py-8 bg-bg-secondary border-b border-border-color'>
          <div className="w-36 h-36 rounded-full bg-accent-color/10 flex items-center justify-center border-4 border-bg-primary shadow-lg overflow-hidden ring-4 ring-accent-color/20">
            <img 
              className='w-full h-full object-cover' 
              src={activeUser?.profilePic || `https://ui-avatars.com/api/?name=${activeUser?.name || 'User'}&background=random`} 
              onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${activeUser?.name || 'User'}&background=random`; }}
              alt="Profile" 
            />
          </div>
        </div>
        
        <div className='flex flex-col gap-2 mt-4'>
          <InputEdit type="name" handleChange={handleChange} input={formData.name} handleSubmit={submit} />

          <div className='px-6 py-2'>
            <p className='text-xs tracking-wide text-text-secondary'>
              This is not your username or pin. This name will be visible to your ChatSphere contacts.
            </p>
          </div>

          <InputEdit type="bio" handleChange={handleChange} input={formData.bio} handleSubmit={submit} />
        </div>

        <div className='mt-auto p-6'>
          <button onClick={logoutUser} className='w-full flex items-center justify-center gap-2 py-3 px-4 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 text-red-500 rounded-xl transition-colors font-semibold border border-red-200 dark:border-red-500/30 shadow-sm'>
            <IoMdLogOut className='w-5 h-5' />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default Profile