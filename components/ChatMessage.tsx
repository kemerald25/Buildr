import React from 'react';
import type { ChatMessage as ChatMessageType } from '../types';

interface ChatMessageProps {
  message: ChatMessageType;
  isSender: boolean;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, isSender }) => {
  // Determine the alignment of the entire message row
  const alignment = isSender ? 'justify-end' : 'justify-start';

  // Define the distinct styles for the sender's and receiver's bubbles.
  // This is where the magic happens for the "speech bubble" look.
  const bubbleStyles = isSender
    ? 'bg-base-blue text-white rounded-t-2xl rounded-bl-2xl' // Sender bubble: sharp on the bottom-right
    : 'bg-white text-slate-700 rounded-t-2xl rounded-br-2xl border border-slate-200/80'; // Receiver bubble: sharp on the bottom-left

  return (
    // The parent flex container that aligns the bubble left or right.
    // The margin-bottom (mb-4) has been removed, as this is better handled
    // by a `space-y-4` class on the parent container in ChatPage.tsx for more consistent spacing.
    <div className={`flex ${alignment}`}>
      <div className={`max-w-md lg:max-w-lg px-4 py-3 transition-all duration-300 ${bubbleStyles}`}>
        {/* The message text */}
        <p className="text-base leading-relaxed">{message.text}</p>
        
        {/* 
          BONUS: An example of how to add a timestamp.
          Uncomment this block if your `message` object has a timestamp.
        */}
        {/* {message.timestamp && (
          <div className={`text-xs mt-1.5 text-right ${isSender ? 'text-blue-200' : 'text-slate-400'}`}>
            {new Date(message.timestamp.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        )} */}
      </div>
    </div>
  );
};

export default ChatMessage;