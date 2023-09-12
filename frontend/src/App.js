import './App.css';
import React, {useState, useEffect, useRef} from 'react'
import socketIO from 'socket.io-client';
import 'bootstrap/dist/css/bootstrap.min.css'

const socket = socketIO.connect('http://192.168.1.3:3000', { transports: ["websocket"], autoConnect: false });

function App() {
  const [listMessage, setListMessage] = useState([])
  const [message, setMessage] = useState("")
  const [username, setUsername] = useState("")
  const chatBody = useRef(null)


  const [isConnected, setIsConnected] = useState(socket.connected);
  const [fooEvents, setFooEvents] = useState([]);

  const sendMessage = (e) => {
    e.preventDefault()

    // Validation
    if (!username) {
      alert('Username cannot be empty!')
      return false
    }
    

    if (!message) {
      alert('Message cannot be empty!')
      return false
    }
    
    // Sending the message to socket server
    console.log('Sending Message')

    const payload = {
      text: message,
      user: username
    }
    socket.emit('send-message', payload)
    setMessage(prev => '')
  }


  useEffect(() => {
    socket.connect()

    function onConnect() {
      console.log('Connected')
      setIsConnected(true);
    }

    function onDisconnect() {
      setIsConnected(false);
    }

    function onFooEvent(value) {
      setFooEvents(previous => [...previous, value]);
    }

    socket.on('all-message', (data) => {
      console.log('New Message', data)
      setListMessage(data)
      chatBody.current?.scrollIntoView()
    })

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('foo', onFooEvent);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('foo', onFooEvent);
      socket.off('all-message')
    };
  }, []);

  return (
    <div className="App">
       <div className='container mt-4'>
        <div className='row justify-content-center'>
          <div className='col-12 col-md-6'>
            <div className='card'>
              <div className='card-header'>
                <h3>Lets Chat Together!</h3>
              </div>
              <div className='card-body d-flex flex-column'>
                <div className='chat-body' ref={chatBody}>
                  {listMessage.map((item, i) => {
                    return (
                      <div className='chat-bubble-wrap chat-bubble' key={i}>
                        <div className='chat-person'>{item.user} (CID: {item.id})</div>
                        <div className='chat-text'>{item.text}</div>
                      </div>
                    )
                  })}
                </div>
                <div className='chat-form'>
                  <form>
                    <input placeholder='Username' className='form-control' onChange={(e) => setUsername(e.target.value)}/>
                    <input placeholder='Write Message...' className='form-control' value={message} onChange={(e) => setMessage(e.target.value)}/>
                    <button className='btn btn-primary' onClick={sendMessage}>Send</button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
       </div>
    </div>
  );
}

export default App;
