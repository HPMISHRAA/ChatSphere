import React from 'react'
import SkeletonLoading from '../ui/SkeletonLoading'
import "../../pages/home.css"
function Search({ type, isLoading, searchResults, handleClick, search }) {

  return (
    <div className={`${search ? "scrollbar-hide overflow-y-scroll max-h-[300px] flex flex-col gap-y-2 mt-2" : "hidden"}`}>
      {
        isLoading ? <SkeletonLoading height={55} count={3} /> : (
          searchResults.length > 0 ? searchResults?.map((e) => {
            return (
              <div key={e._id} className='flex items-center justify-between p-3 rounded-xl hover:bg-bg-primary transition-colors border border-transparent hover:border-border-color'>
                <div className='flex items-center gap-x-3'>
                  <img 
                    className='w-11 h-11 rounded-full object-cover border border-border-color shadow-sm' 
                    src={e.profilePic && !e.profilePic.includes('anonymous-avatar-icon') ? e.profilePic : `https://ui-avatars.com/api/?name=${e.name || 'User'}&background=random`} 
                    onError={(event) => { event.target.src = `https://ui-avatars.com/api/?name=${e.name || 'User'}&background=random`; }}
                    alt="avatar" 
                  />
                  <div className='flex flex-col'>
                    <h5 className='text-[15px] text-text-primary tracking-wide font-semibold'>{e.name}</h5>
                    <h5 className='text-xs text-text-secondary tracking-wide'>{e.email}</h5>
                  </div>
                </div>
                <button onClick={() => handleClick(e)} className='bg-accent-color hover:bg-accent-hover text-white px-4 py-1.5 rounded-lg text-xs font-medium tracking-wide shadow-sm transition-colors'>Add</button>
              </div>
            )
          }) : <span className='text-[13px] text-text-secondary p-2 block text-center'>No results found</span>
        )

      }
    </div>
  )
}

export default Search