import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import { useDispatch, useSelector } from 'react-redux';
import { RxCross2 } from "react-icons/rx";
import { searchUsers } from '../apis/auth';
import { addToGroup, removeUser, renameGroup } from '../apis/chat';
import { fetchChats } from '../redux/chatsSlice';
import Search from './group/Search';
import { getChatName, getChatPhoto } from '../utils/logics';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  minWidth: { xs: 300, sm: 400 },
  bgcolor: 'var(--bg-secondary)',
  color: 'var(--text-primary)',
  boxShadow: 24,
  p: 4,
  borderRadius: '12px',
  outline: 'none',
  border: '1px solid var(--border-color)',
};

function Model(props) {
  const [open, setOpen] = useState(false);
  const dispatch = useDispatch();
  const [searchResults, setSearchResults] = useState([]);
  const [name, setName] = useState("");
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [members, setMembers] = useState([]);
  const { activeChat } = useSelector((state) => state.chats);
  const activeUser = useSelector((state) => state.activeUser);

  const handleOpen = () => {
    setOpen(true);
    setName(getChatName(activeChat, activeUser));
  };
  
  const handleClose = () => {
    setOpen(false);
    setSearch("");
    setSearchResults([]);
  };

  const handleClick = async (e) => {
    if (members.find(m => m._id === e._id)) {
      return;
    }
    await addToGroup({ userId: e?._id, chatId: activeChat?._id });
    setMembers([...members, e]);
  };

  const updateBtn = async () => {
    if (name) {
      let data = await renameGroup({ chatId: activeChat._id, chatName: name });
      if (data) {
        dispatch(fetchChats());
        setOpen(false);
      }
    }
    setOpen(false);
  };

  const deleteSelected = async (ele) => {
    const res = await removeUser({ chatId: activeChat._id, userId: ele._id });
    if (res._id) {
      setMembers(members.filter((e) => e._id !== ele._id));
      dispatch(fetchChats());
    }
  };

  const leaveGroup = async () => {
    const res = await removeUser({ chatId: activeChat._id, userId: activeUser.id });
    if (res._id) {
      dispatch(fetchChats());
      setOpen(false);
      window.location.reload(); 
    }
  };

  useEffect(() => {
    setMembers(activeChat?.users || []);
  }, [activeChat]);

  useEffect(() => {
    const searchChange = async () => {
      if (!search) {
        setSearchResults([]);
        return;
      }
      setIsLoading(true);
      const { data } = await searchUsers(search);
      setSearchResults(data);
      setIsLoading(false);
    };
    searchChange();
  }, [search]);

  return (
    <>
      <button onClick={handleOpen} className="hover:opacity-80 transition-opacity flex items-center justify-center">
        <img 
          className="w-10 h-10 rounded-full object-cover border border-border-color shadow-sm" 
          alt="Profile" 
          src={getChatPhoto(activeChat, activeUser) && !getChatPhoto(activeChat, activeUser).includes('anonymous-avatar-icon') ? getChatPhoto(activeChat, activeUser) : `https://ui-avatars.com/api/?name=${getChatName(activeChat, activeUser) || 'User'}&background=random`}
          onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${getChatName(activeChat, activeUser) || 'User'}&background=random`; }}
        />
      </button>
      
      <Modal open={open} onClose={handleClose}>
        <Box sx={style}>
          {activeChat?.isGroup ? (
            <div>
              <h5 className="text-2xl font-bold tracking-wide text-center text-text-primary mb-4">{getChatName(activeChat, activeUser)}</h5>
              
              <div className="mb-4">
                <h6 className="text-sm text-text-secondary font-semibold mb-2">Members ({members.length})</h6>
                <div className="flex flex-wrap gap-2">
                  {members.map((e) => (
                    <div key={e._id} className="flex items-center gap-x-1 bg-accent-color text-white text-xs font-medium px-2.5 py-1 rounded-md">
                      <span>{e._id === activeUser.id ? "You" : e.name}</span>
                      {activeChat.groupAdmin === activeUser.id && e._id !== activeUser.id && (
                        <RxCross2 className="cursor-pointer hover:text-red-300" onClick={() => deleteSelected(e)} />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {activeChat.groupAdmin === activeUser.id && (
                <form className="mt-4 flex flex-col gap-y-3" onSubmit={(e) => e.preventDefault()}>
                  <div className="flex gap-2">
                     <input onChange={(e) => setName(e.target.value)} value={name} className="flex-1 bg-bg-primary text-text-primary border border-border-color rounded-lg text-sm py-2 px-3 outline-none focus:border-accent-color" type="text" placeholder="Room Name" required />
                     <button onClick={updateBtn} className="bg-accent-color hover:bg-accent-hover px-4 py-2 text-sm text-white rounded-lg transition-colors shadow-sm">Update</button>
                  </div>
                  <input onChange={(e) => setSearch(e.target.value)} className="w-full bg-bg-primary text-text-primary border border-border-color rounded-lg text-sm py-2 px-3 outline-none focus:border-accent-color" type="text" placeholder="Add users to room" />
                </form>
              )}

              {search && (
                <div className="max-h-40 overflow-y-auto mt-2 border border-border-color rounded-md">
                  <Search isLoading={isLoading} handleClick={handleClick} search={search} searchResults={searchResults} />
                </div>
              )}

              <div className="flex justify-end gap-x-3 mt-6">
                <button onClick={leaveGroup} className="bg-red-500 hover:bg-red-600 transition-colors px-4 py-2 text-sm font-medium text-white rounded-lg shadow-sm">Leave Room</button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-4">
              <img 
                className="w-24 h-24 rounded-full shadow-lg border-4 border-accent-color/20 object-cover mb-4" 
                alt="User" 
                src={getChatPhoto(activeChat, activeUser) && !getChatPhoto(activeChat, activeUser).includes('anonymous-avatar-icon') ? getChatPhoto(activeChat, activeUser) : `https://ui-avatars.com/api/?name=${getChatName(activeChat, activeUser) || 'User'}&background=random`}
                onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${getChatName(activeChat, activeUser) || 'User'}&background=random`; }}
              />
              <h2 className="text-xl font-bold text-text-primary mb-1">{getChatName(activeChat, activeUser)}</h2>
              <h3 className="text-sm font-semibold text-accent-color mb-3">
                {activeChat?.users.find((u) => u._id !== activeUser.id)?.email}
              </h3>
              <p className="text-sm text-text-secondary text-center">
                {activeChat?.users.find((u) => u._id !== activeUser.id)?.bio || "Available"}
              </p>
            </div>
          )}
        </Box>
      </Modal>
    </>
  );
}

export default Model;