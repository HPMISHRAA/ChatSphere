import React from 'react';
import { useSelector } from 'react-redux';
import ScrollableFeed from "react-scrollable-feed";
import { isSameSender, isSameSenderMargin, isSameUser, isLastMessage } from '../utils/logics';
import { Tooltip } from "@chakra-ui/tooltip";
import { Avatar } from "@chakra-ui/avatar";

function MessageHistory({ messages }) {
  const activeUser = useSelector((state) => state.activeUser);

  return (
    <ScrollableFeed className='scrollbar-hide'>
      {messages && messages.map((m, i) => {
        if (m.isSystemMessage) {
          return (
            <div key={m._id} className="flex justify-center my-2">
              <span className="text-xs text-text-secondary bg-bg-secondary px-3 py-1 rounded-full border border-border-color">
                {m.message}
              </span>
            </div>
          );
        }

        return (
          <div className='flex items-end gap-2 mb-2' key={m._id}>
            {(isSameSender(messages, m, i, activeUser.id) || isLastMessage(messages, i, activeUser.id)) && (
              <Tooltip label={m.sender?.name} placement="bottom-start" hasArrow>
                <div className="mb-4">
                  <Avatar
                    style={{ width: "28px", height: "28px" }}
                    cursor="pointer"
                    name={m.sender?.name}
                    src={m.sender?.profilePic}
                  />
                </div>
              </Tooltip>
            )}
            <div className={`flex flex-col ${m.sender._id === activeUser.id ? 'items-end ml-auto' : 'items-start'}`}
                 style={{ marginLeft: isSameSenderMargin(messages, m, i, activeUser.id), marginTop: isSameUser(messages, m, i, activeUser.id) ? 2 : 10 }}
            >
              <div 
                className={`px-4 py-2 text-sm shadow-sm max-w-[460px] break-words ${
                  m.sender._id === activeUser.id 
                    ? 'bg-message-sent text-text-primary rounded-l-2xl rounded-tr-2xl rounded-br-sm' 
                    : 'bg-message-received text-text-primary rounded-r-2xl rounded-tl-2xl rounded-bl-sm'
                }`}
              >
                {m.message}
              </div>
              <span className="text-[10px] text-text-secondary mt-1 px-1">
                {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        );
      })}
    </ScrollableFeed>
  );
}

export default MessageHistory;