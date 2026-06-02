import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { setActiveChat, fetchChats } from '../redux/chatsSlice'
import { useEffect } from 'react'
import { getChatName, getChatPhoto, timeSince } from '../utils/logics'
import NoContacts from './ui/NoContacts'
// import SkeletonLoading from './ui/SkeletonLoading'
var aDay = 24 * 60 * 60 * 1000;
function Contacts() {
  const { chats, activeChat } = useSelector((state) => state.chats)
  const dispatch = useDispatch()
  const activeUser = useSelector((state) => state.activeUser)
  useEffect(() => {
    dispatch(fetchChats())
  }, [dispatch])
  return (
    <>
      <div className='flex flex-col -space-y-1 overflow-y-scroll scrollbar-hide h-[87vh] pb-10'>
        {
          chats?.length > 0 ? chats?.map((e) => {
            return (
              <div onClick={() => {
                dispatch(setActiveChat(e))
              }} key={e._id} className={`flex items-center justify-between gap-x-3 mt-2 ${activeChat?._id === e._id ? "bg-bg-primary" : "bg-bg-secondary"} hover:bg-bg-primary cursor-pointer py-3 px-3 rounded-xl border border-transparent hover:border-border-color transition-colors`}>
                <div className='flex items-center gap-x-3'>
                  <img 
                    className='w-12 h-12 rounded-full object-cover border border-border-color shadow-sm' 
                    src={getChatPhoto(e, activeUser) && !getChatPhoto(e, activeUser).includes('anonymous-avatar-icon') ? getChatPhoto(e, activeUser) : `https://ui-avatars.com/api/?name=${getChatName(e, activeUser) || 'User'}&background=random`} 
                    onError={(event) => { event.target.src = `https://ui-avatars.com/api/?name=${getChatName(e, activeUser) || 'User'}&background=random`; }}
                    alt="avatar" 
                  />
                  <div className='flex flex-col'>
                    <div className='flex items-center gap-2'>
                      <h5 className='text-[15px] text-text-primary font-bold tracking-wide'>{getChatName(e, activeUser)}</h5>
                      {e.isGroup && <span className='text-[10px] bg-accent-color/10 border border-accent-color/20 text-accent-color px-2 py-0.5 rounded-full font-medium'>{e.users.length} Members</span>}
                    </div>
                    <p className='text-xs font-medium text-text-secondary mt-0.5 tracking-wide'>
                      {e.latestMessage?.message?.length > 30
                        ? e.latestMessage?.message.slice(0, 30) + "..."
                        : e.latestMessage?.message || "No messages yet"
                      }
                    </p>
                  </div>
                </div>
                <div className='flex flex-col items-end gap-y-[8px]'>
                  <p className='text-[11px] font-medium text-text-secondary tracking-wide'>{e.latestMessage ? timeSince(new Date(Date.parse(e.updatedAt) - aDay)) : ''}</p>
                </div>
              </div>
            )
          }) : <NoContacts />
        }
      </div>

    </>
  )
}

export default Contacts