import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Model from '../components/Model';
import { BsEmojiSmile, BsFillEmojiSmileFill } from "react-icons/bs";
import { fetchMessages, sendMessage } from '../apis/messages';
import MessageHistory from '../components/MessageHistory';
import io from "socket.io-client";
import { fetchChats, setNotifications, updateUserPresence } from '../redux/chatsSlice';
import Loading from '../components/ui/Loading';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import { getChatName, timeSince } from '../utils/logics';
import Typing from '../components/ui/Typing';
import { validUser } from '../apis/auth';

const ENDPOINT = process.env.REACT_APP_SERVER_URL || "http://localhost:8000";
let socket, selectedChatCompare;

function Chat(props) {
  const { activeChat, notifications } = useSelector((state) => state.chats);
  const dispatch = useDispatch();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [socketConnected, setSocketConnected] = useState(false);
  const [typing, setTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const activeUser = useSelector((state) => state.activeUser);

  const keyDownFunction = async (e) => {
    if ((e.key === "Enter" || e.type === "click") && (message)) {
      setMessage("");
      socket.emit("stop typing", activeChat._id);
      const data = await sendMessage({ chatId: activeChat._id, message });
      socket.emit("new message", data);
      setMessages([...messages, data]);
      dispatch(fetchChats());
    }
  };

  useEffect(() => {
    socket = io(ENDPOINT);
    socket.on("typing", () => setIsTyping(true));
    socket.on("stop typing", () => setIsTyping(false));
  }, []);

  useEffect(() => {
    if (activeUser?.id) {
      socket.emit("setup", activeUser);
      socket.on("connected", () => {
        setSocketConnected(true);
      });
    }
  }, [activeUser]);

  useEffect(() => {
    const fetchMessagesFunc = async () => {
      if (activeChat) {
        setLoading(true);
        const data = await fetchMessages(activeChat._id);
        setMessages(data);
        socket.emit("join room", activeChat._id);
        setLoading(false);
      }
      return;
    };
    fetchMessagesFunc();
    selectedChatCompare = activeChat;
  }, [activeChat]);

  useEffect(() => {
    const handleMessageReceived = (newMessageRecieved) => {
      if (!selectedChatCompare || selectedChatCompare._id !== newMessageRecieved.chatId._id) {
        // Prevent duplicate notifications by checking message ID
        if (!notifications.some(n => n._id === newMessageRecieved._id)) {
          dispatch(setNotifications([newMessageRecieved, ...notifications]));
        }
      } else {
        // Prevent duplicate messages in the active chat
        if (!messages.some(m => m._id === newMessageRecieved._id)) {
          setMessages([...messages, newMessageRecieved]);
        }
      }
      dispatch(fetchChats());
    };

    const handleUserOnline = (userId) => {
      dispatch(updateUserPresence({ userId, isOnline: true, lastSeen: null }));
    };

    const handleUserOffline = (userId) => {
      dispatch(updateUserPresence({ userId, isOnline: false, lastSeen: new Date().toISOString() }));
    };

    const handleGroupUpdated = () => {
      dispatch(fetchChats());
    };

    socket.on("message recieved", handleMessageReceived);
    socket.on("user online", handleUserOnline);
    socket.on("user offline", handleUserOffline);
    socket.on("group updated", handleGroupUpdated);

    return () => {
      socket.off("message recieved", handleMessageReceived);
      socket.off("user online", handleUserOnline);
      socket.off("user offline", handleUserOffline);
      socket.off("group updated", handleGroupUpdated);
    };
  }, [messages, notifications, selectedChatCompare, dispatch]);

  useEffect(() => {
    const isValid = async () => {
      const data = await validUser();
      if (!data?.user) {
        window.location.href = "/login";
      }
    };
    isValid();
  }, []);

  if (loading) {
    return (
      <div className={`${props.className} flex items-center justify-center`}>
        <Loading />
      </div>
    );
  }

  // Calculate Last Seen / Member Count
  const getSubTitle = () => {
    if (activeChat.isGroup) {
      return `${activeChat.users.length} Members`;
    } else {
      const otherUser = activeChat.users.find((u) => u._id !== activeUser.id);
      if (!otherUser) return "";
      if (otherUser.isOnline) return "Online";
      return `Last seen ${timeSince(new Date(otherUser.lastSeen || new Date()))}`;
    }
  };

  return (
    <>
      {activeChat ? (
        <div className={`${props.className} flex flex-col h-full bg-bg-primary relative`}>
          <div className="flex justify-between items-center p-4 bg-bg-secondary border-b border-border-color shadow-sm z-10 h-[70px]">
            <div className="flex items-center gap-x-3">
              <div className="flex flex-col items-start justify-center">
                <h5 className="text-lg text-text-primary font-bold tracking-wide">{getChatName(activeChat, activeUser)}</h5>
                <p className="text-xs text-text-secondary">{getSubTitle()}</p>
              </div>
            </div>
            <div>
              <Model />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto scrollbar-hide p-4 bg-bg-primary mb-[80px]">
            <MessageHistory typing={isTyping} messages={messages} />
            <div className="ml-7 mt-2">
              {isTyping && <Typing width="40" height="40" />}
            </div>
          </div>
          
          <div className="absolute bottom-0 left-0 right-0 bg-bg-secondary border-t border-border-color p-3 z-10 flex flex-col items-center">
             {showPicker && (
               <div className="absolute bottom-20 left-4 z-50">
                 <Picker data={data} onEmojiSelect={(e) => setMessage(message + e.native)} theme="auto" />
               </div>
             )}
             <div className="flex items-center w-full max-w-4xl gap-2">
                <button className="text-text-secondary hover:text-accent-color transition-colors p-2" onClick={() => setShowPicker(!showPicker)}>
                  {showPicker ? <BsFillEmojiSmileFill className="w-6 h-6 text-yellow-500" /> : <BsEmojiSmile className="w-6 h-6" />}
                </button>
                <form className="flex-1" onKeyDown={(e) => keyDownFunction(e)} onSubmit={(e) => e.preventDefault()}>
                  <input 
                    onChange={(e) => {
                      setMessage(e.target.value);
                      if (!socketConnected) return;
                      if (!typing) {
                        setTyping(true);
                        socket.emit('typing', activeChat._id);
                      }
                      let lastTime = new Date().getTime();
                      var time = 3000;
                      setTimeout(() => {
                        var timeNow = new Date().getTime();
                        var timeDiff = timeNow - lastTime;
                        if (timeDiff >= time && typing) {
                          socket.emit("stop typing", activeChat._id);
                          setTyping(false);
                        }
                      }, time);
                    }} 
                    className="w-full bg-bg-primary text-text-primary border border-border-color focus:border-accent-color focus:ring-1 focus:ring-accent-color rounded-full px-4 py-2 outline-none transition-all" 
                    type="text" 
                    name="message" 
                    placeholder="Type your message..." 
                    value={message} 
                  />
                </form>
                <button onClick={(e) => keyDownFunction(e)} className="bg-accent-color hover:bg-accent-hover text-white font-medium rounded-full px-5 py-2 transition-colors disabled:opacity-50" disabled={!message.trim()}>
                  Send
                </button>
             </div>
          </div>
        </div>
      ) : (
        <div className={`${props.className} flex flex-col items-center justify-center h-full bg-bg-secondary border-l border-border-color w-full relative overflow-hidden`}>
          {/* Subtle Background Pattern */}
          <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
          
          <div className="flex flex-col items-center z-10 p-8 text-center animate-blob">
            <div className="w-28 h-28 rounded-full mb-6 bg-accent-color/10 flex items-center justify-center border-4 border-white dark:border-bg-secondary shadow-xl overflow-hidden ring-4 ring-accent-color/20">
              <img 
                className="w-full h-full object-cover" 
                alt="User profile" 
                src={activeUser?.profilePic || `https://ui-avatars.com/api/?name=${activeUser?.name || 'User'}&background=random`} 
                onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${activeUser?.name || 'User'}&background=random`; }}
              />
            </div>
            <h3 className="text-text-primary text-3xl md:text-4xl font-bold tracking-tight mb-3">
              Welcome to ChatSphere, <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500">{activeUser?.name}</span>
            </h3>
            <p className="text-text-secondary text-lg max-w-md">
              Select an existing conversation from the sidebar or search for users to start messaging.
            </p>
          </div>
        </div>
      )}
    </>
  );
}

export default Chat;