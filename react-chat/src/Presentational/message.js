import React from 'react';
import '../App.css'

function Message(props) {
    // Was the message sent by the current user. If so, add a css class
    // const fromMe = this.props.fromMe ? 'from-me' : '';
    return (
        <div className='row'>
            {props.fromMe ? <div className='col-sm-12'>
                <span className='pull-right from-me-container'>{props.message} : You</span>
            </div> : <div className='col-sm-12'>
                    <span className='from-others-container'>{props.username ? props.username : ''}{props.message ? ` : ${props.message}` : ''}</span>
                </div>}
        </div>
    );
}

export default Message;