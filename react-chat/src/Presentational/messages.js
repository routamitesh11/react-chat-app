import React, { useState } from 'react';
import Message from './message';
import '../App.css';
function Messages(props) {
    // Loop through all the messages in the state and create a Message component
    const messages = props.messages.map((message, i) => {
        let fromMe = props.user.toLowerCase() === message.username.toLowerCase();
        return (
            <Message
                key={i}
                username={message.username}
                message={message.message}
                fromMe={fromMe} />
        );
    });
    return (
        <div id='messageList'>
            {messages}
        </div>
    );
}

export default Messages;
