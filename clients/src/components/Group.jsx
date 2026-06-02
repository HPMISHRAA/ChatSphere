import React, { useState, useEffect } from 'react';
import { BsPlusLg } from "react-icons/bs";
import { Modal, Box } from "@mui/material";
import { searchUsers } from '../apis/auth';
import { RxCross2 } from "react-icons/rx";
import { createGroup } from '../apis/chat';
import { fetchChats } from '../redux/chatsSlice';
import { useDispatch } from 'react-redux';
import Search from './group/Search';

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

function Group() {
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  const [chatName, setChatName] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedUser, setSelectedUsers] = useState([]);

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setSearch("");
    setSelectedUsers([]);
    setChatName("");
  };

  const handleFormSearch = async (e) => {
    setSearch(e.target.value);
  };

  const handleClick = (e) => {
    if (selectedUser.includes(e)) {
      return;
    }
    setSelectedUsers([...selectedUser, e]);
  };

  const deleteSelected = (ele) => {
    setSelectedUsers(selectedUser.filter((e) => e._id !== ele._id));
  };

  const handleSubmit = async () => {
    if (selectedUser.length >= 1 && chatName) {
      await createGroup({
        chatName,
        users: JSON.stringify(selectedUser.map((e) => e._id))
      });
      dispatch(fetchChats());
      handleClose();
    }
  };

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
      <button className="w-full mt-2 transition duration-150 ease-in-out" onClick={handleOpen}>
        <div className="flex justify-center">
          <div className="text-sm font-medium tracking-wide flex justify-center items-center gap-x-2 bg-accent-color text-white py-2 px-4 rounded-lg w-full hover:bg-accent-hover transition-colors shadow-sm">
            Create Room <BsPlusLg />
          </div>
        </div>
      </button>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <h5 className="text-xl font-bold mb-4 text-center">Create A Room</h5>
          <form onSubmit={(e) => e.preventDefault()} className="flex flex-col gap-y-4">
            <input 
              onChange={(e) => setChatName(e.target.value)} 
              className="bg-bg-primary text-text-primary border border-border-color rounded-lg text-sm py-2 px-3 w-full outline-none focus:border-accent-color transition-colors" 
              type="text" 
              name="chatName" 
              placeholder="Room Name" 
              required 
              value={chatName}
            />
            <input 
              onChange={handleFormSearch} 
              className="bg-bg-primary text-text-primary border border-border-color rounded-lg text-sm py-2 px-3 w-full outline-none focus:border-accent-color transition-colors" 
              type="text" 
              name="users" 
              placeholder="Add users (e.g. John)" 
              value={search}
            />
            
            <div className="flex flex-wrap gap-2 mt-1">
              {selectedUser?.map((e) => (
                <button 
                  key={e._id} 
                  onClick={() => deleteSelected(e)} 
                  className="flex items-center gap-x-1 bg-accent-color text-white text-xs font-medium px-2.5 py-1 rounded-md hover:bg-red-500 transition-colors"
                >
                  <span>{e.name}</span>
                  <RxCross2 />
                </button>
              ))}
            </div>

            <div className="max-h-40 overflow-y-auto scrollbar-hide border border-border-color rounded-md">
              <Search isLoading={isLoading} handleClick={handleClick} search={search} searchResults={searchResults} />
            </div>

            <div className="flex justify-end mt-2">
              <button 
                onClick={handleSubmit} 
                className="bg-accent-color hover:bg-accent-hover text-white text-sm font-bold px-4 py-2 rounded-lg transition-colors shadow-md disabled:opacity-50" 
                type="submit"
                disabled={!chatName || selectedUser.length === 0}
              >
                Create
              </button>
            </div>
          </form>
        </Box>
      </Modal>
    </>
  );
}

export default Group;