import React, { useState } from 'react';
import Chatbot from 'react-chatbot-kit';
import 'react-chatbot-kit/build/main.css';
import { createChatBotMessage } from 'react-chatbot-kit';
import MessageParser from './ProcessMess';
import ActionProvider from './Actions';
import { BsRobot } from 'react-icons/bs';

const config = {
  botName: 'Trợ Lý Ảo',
  initialMessages: [
    createChatBotMessage('Xin chào! Tôi  là mi lu có thể giúp gì cho bạn hôm nay 😊'),
  ],
};

function ChatBots() {
  const [isOpen, setIsOpen] = useState(false); // State to manage chatbot visibility

  const toggleChatbot = () => {
    setIsOpen(!isOpen); // Toggle the visibility state
  };

  return (
    <div className="chatbot-container">
      <BsRobot onClick={toggleChatbot} style={{ cursor: 'pointer' }} fontSize={35} />
      {isOpen && (
        <div className="chatbot">
          <Chatbot
            config={config}
            messageParser={MessageParser}
            actionProvider={ActionProvider}
            headerText='🤖'
          />
        </div>
      )}
    </div>
  );
}

export default ChatBots;
