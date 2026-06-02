import React, { useState } from 'react'
import { TbEdit } from "react-icons/tb"
import { BsCheck2 } from "react-icons/bs"
function InputEdit({ type, handleChange, input, handleSubmit }) {
  const [editable, setEditable] = useState(false)
  // const [showPicker, setShowPicker] = useState(false)
  const submitButton = () => {
    handleSubmit()
    setEditable(false)
  }
  return (
    <div className='flex flex-col py-4 bg-bg-secondary shadow-sm px-6 gap-y-2 border-y border-border-color'>
      <p className='text-xs text-accent-color font-semibold tracking-wide uppercase'>{type === 'name' ? 'Your name' : 'About'}</p>
      {!editable ? (
        <div className='flex justify-between items-center group'>
          <p className='text-[15px] text-text-primary break-words max-w-[85%]'>
            {input}
          </p>
          <button onClick={() => setEditable(!editable)} className='text-text-secondary hover:text-accent-color transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100'>
            <TbEdit className='w-[20px] h-[20px]' />
          </button>
        </div>
      ) : (
        <div className='flex items-center justify-between border-b-2 border-accent-color pb-1'>
          <div className='flex-1 pr-4'>
            <input name={type} onChange={handleChange} className='text-[15px] text-text-primary bg-transparent outline-none w-full' type="text" value={input} autoFocus />
          </div>
          <div className='flex items-center gap-x-4'>
            <button onClick={submitButton} className='text-text-secondary hover:text-green-500 transition-colors'>
              <BsCheck2 className='w-[22px] h-[22px]' />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default InputEdit