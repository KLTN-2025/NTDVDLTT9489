import React from "react";
import "./chatbox.css";

const ChatIcon = ({ toggleChat, isOpen }) => {
  return (
    <div className="chat-icon-container">
      <button className="chat-icon" onClick={toggleChat}>
        <span className="chat-icon-symbol">💬</span>
      </button>
      {!isOpen && (
        <span className="chat-label">Bạn có thể gửi tư vấn ở đây</span>
      )}
    </div>
  );
};

export default ChatIcon;