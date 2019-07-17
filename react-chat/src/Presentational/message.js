import React from 'react';
import '../App.css'

function Message (props) {
    // Was the message sent by the current user. If so, add a css class
    // const fromMe = this.props.fromMe ? 'from-me' : '';
    return (
        <div>
            {props.username?props.username:''}{props.message?` : ${props.message}`:''}
        </div>
    );
}

export default Message;