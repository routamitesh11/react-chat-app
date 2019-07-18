import React, { Component } from 'react';
import io from 'socket.io-client';
import Messages from '../Presentational/messages';
import '../App.css';

class ChatWindow extends Component {
    constructor(props) {
        super(props);
        this.state = {
            chatInput: '',
            messages: [],
            status:{message:''}
        };
        this.socketClient = io(`http://localhost:4000/?username=${props.user}`).connect();

    }

    componentDidMount() {
        this.socketClient.on('server:message', message => {
            this.addMessage(message);
        });
        this.socketClient.on('cleared', message => {
            this.setState({ messages: [] });
        });
        this.socketClient.on('status',(status)=>{
            this.setState({status:status},()=>{
                setInterval(() => {
                    this.setState({status:{message:''}})
                }, 2000);
            });
        })
    }

    addMessage = (messages) => {
        const newmessages = [...this.state.messages, ...messages];
        this.setState({ messages: newmessages });
    }
    onSend = (message) => {
        const messageObject = {
            username: this.props.user,
            message
        };
        // console.log(props.user);

        // Emit the message to the server
        this.socketClient.emit('client:message', messageObject);
        // messageObject.fromMe = true;
        // this.addMessage([messageObject]);
    }

    clear = () => {
        this.socketClient.emit('clear');
    };

    textChangeHandler = (text) => {
        this.setState({ chatInput: text });
    }

    submitHandler = (e) => {
        e.preventDefault();
        this.onSend(this.state.chatInput);
        // console.log(chatInput);
        this.textChangeHandler('');
    }

    render() {
        return (
            <div>
                <div className='row app-welcome'>
                    <div className='offset-sm-3 col-sm-6 offset-sm-3 text-center'>Welcome {this.props.user}</div>
                </div>
                <div className='row'>
                    <div className='offset-sm-3 col-sm-6 offset-sm-3'>
                        <div className='app-messages'>
                            <Messages messages={this.state.messages} user={this.props.user} />
                            <div className='app-status'>
                                {this.state.status.message}
                            </div>
                        </div>
                    </div>
                </div>
                <div className='row'>
                    <div className='offset-sm-3 col-sm-6 offset-sm-3'>
                        <form onSubmit={this.submitHandler}>
                            <input className='form-control app-input' type="text"
                                onChange={(e) => { this.textChangeHandler(e.target.value) }}
                                value={this.state.chatInput}
                                placeholder="Write a message..."
                                required />
                        </form>
                        <button className='btn btn-info col-sm-12' onClick={this.clear}>CLEAR</button>
                    </div>
                </div>
            </div>
        );
    }
}

export default ChatWindow;