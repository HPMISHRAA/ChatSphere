import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { searchUsers, validUser } from '../apis/auth';
import { setActiveUser } from '../redux/activeUserSlice';
import { RiNotificationBadgeFill } from 'react-icons/ri';
import { BsSearch } from 'react-icons/bs';
import { BiNotification } from 'react-icons/bi';
import { IoIosArrowDown } from 'react-icons/io';
import { setShowNotifications, setShowProfile } from '../redux/profileSlice';
import Chat from './Chat';
import Profile from '../components/Profile';
import { acessCreate } from '../apis/chat.js';
import { fetchChats, setNotifications, setActiveChat } from '../redux/chatsSlice';
import { getSender } from '../utils/logics';
import Group from '../components/Group';
import Contacts from '../components/Contacts';
import NotificationBadge, { Effect } from 'react-notification-badge';
import Search from '../components/group/Search';
import ThemeToggle from '../components/ThemeToggle';

function Home() {
  const dispatch = useDispatch();
  const { showProfile, showNotifications } = useSelector((state) => state.profile);
  const { notifications, activeChat } = useSelector((state) => state.chats);
  const { activeUser } = useSelector((state) => state);
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState('');

  const handleSearch = async (e) => {
    setSearch(e.target.value);
  };
  const handleClick = async (e) => {
    await acessCreate({ userId: e._id });
    dispatch(fetchChats());
    setSearch('');
  };
  useEffect(() => {
    const searchChange = async () => {
      setIsLoading(true);
      const { data } = await searchUsers(search);
      setSearchResults(data);
      setIsLoading(false);
    };
    searchChange();
  }, [search]);
  useEffect(() => {
    const isValid = async () => {
      const data = await validUser();
      const user = {
        id: data?.user?._id,
        email: data?.user?.email,
        profilePic: data?.user?.profilePic,
        bio: data?.user?.bio,
        name: data?.user?.name,
      };
      dispatch(setActiveUser(user));
    };
    isValid();
  }, [dispatch]);

  return (
    <div className="h-screen w-full flex bg-bg-primary overflow-hidden">
      {!showProfile ? (
        <div className={`flex flex-col w-full md:w-[350px] lg:w-[400px] h-full bg-bg-secondary border-r border-border-color ${activeChat ? 'hidden md:flex' : 'flex'}`}>
          <div className="flex items-center justify-between p-4 border-b border-border-color">
            <h3 className="text-xl font-bold text-text-primary tracking-wider">ChatSphere</h3>
            <div className="flex items-center gap-3 relative">
              <ThemeToggle />
              <button onClick={() => dispatch(setShowNotifications(!showNotifications))} className="relative">
                <NotificationBadge
                  count={notifications.length}
                  effect={Effect.SCALE}
                  style={{ width: '15px', height: '15px', fontSize: '9px', padding: '4px 2px 2px 2px' }}
                />
                {showNotifications ? (
                  <RiNotificationBadgeFill className="text-accent-color w-6 h-6" />
                ) : (
                  <BiNotification className="text-text-secondary w-6 h-6" />
                )}
              </button>
              {showNotifications && (
                <div className="absolute top-10 right-0 z-20 w-64 bg-bg-secondary border border-border-color rounded-md shadow-lg p-3 max-h-80 overflow-y-auto scrollbar-hide">
                  <div className="text-sm text-text-secondary mb-2 font-semibold">Notifications</div>
                  {!notifications.length && <div className="text-xs text-text-secondary">No new messages</div>}
                  {notifications.map((e, index) => (
                    <div
                      onClick={() => {
                        dispatch(setActiveChat(e.chatId));
                        dispatch(setNotifications(notifications.filter((data) => data !== e)));
                      }}
                      key={index}
                      className="text-sm p-2 hover:bg-bg-primary rounded cursor-pointer text-text-primary"
                    >
                      {e.chatId.isGroup
                        ? `New Message in ${e.chatId.chatName}`
                        : `New Message from ${getSender(activeUser, e.chatId.users)}`}
                    </div>
                  ))}
                </div>
              )}
              <button onClick={() => dispatch(setShowProfile(true))} className="flex items-center gap-1">
                <img 
                  className="w-8 h-8 rounded-full object-cover shadow-sm border border-border-color" 
                  src={activeUser?.profilePic || `https://ui-avatars.com/api/?name=${activeUser?.name || 'User'}&background=random`} 
                  onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${activeUser?.name || 'User'}&background=random`; }}
                  alt="profile" 
                />
                <IoIosArrowDown className="text-text-secondary w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="p-3 relative">
            <div className="relative">
              <BsSearch className="absolute top-1/2 left-3 transform -translate-y-1/2 text-text-secondary" />
              <input
                onChange={handleSearch}
                className="w-full bg-bg-primary text-text-primary pl-10 pr-4 py-2 rounded-lg outline-none border border-transparent focus:border-accent-color transition-colors"
                type="text"
                placeholder="Search users..."
              />
            </div>
            {search && (
              <div className="absolute top-full left-0 w-full bg-bg-secondary z-10 shadow-lg p-4 border border-border-color">
                <Search searchResults={searchResults} isLoading={isLoading} handleClick={handleClick} search={search} />
              </div>
            )}
          </div>
          
          <div className="px-3 pb-2">
            <Group />
          </div>

          <Contacts />
        </div>
      ) : (
        <div className={`w-full md:w-[350px] lg:w-[400px] h-full bg-bg-secondary border-r border-border-color ${activeChat ? 'hidden md:block' : 'block'}`}>
            <Profile />
        </div>
      )}
      
      <div className={`flex-1 h-full bg-bg-primary ${!activeChat ? 'hidden md:flex' : 'flex'} flex-col`}>
        <Chat className="w-full h-full" />
      </div>
    </div>
  );
}

export default Home;