import { useState, useRef, useEffect } from 'react';
import { FaCommentDots, FaTimes } from 'react-icons/fa';
import 'react-toastify/dist/ReactToastify.css';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Hello! I can help with M-Pesa payments. Ask me anything!' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Knowledge base remains the same
  const paymentKnowledgeBase = {
    'payment failed': 'Check if: 1) Your phone has enough funds 2) You entered correct PIN 3) Network is stable',
    'invalid phone': 'M-Pesa numbers must start with 254 followed by 9 digits (e.g., 254712345678)',
    'default': "I'm still learning about M-Pesa payments. For immediate help, call 0700123456"
  };

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    setTimeout(() => {
      const botResponse = generateResponse(input);
      setMessages(prev => [...prev, botResponse]);
      setIsLoading(false);
    }, 1000);
  };

  const generateResponse = (query) => {
    const lowerQuery = query.toLowerCase();
    let responseText = paymentKnowledgeBase.default;

    Object.entries(paymentKnowledgeBase).forEach(([key, value]) => {
      if (lowerQuery.includes(key)) {
        responseText = value;
      }
    });

    return { sender: 'bot', text: responseText };
  };

  return (
    <>
      {/* Chatbot Toggle Button */}
      <button 
        className="chatbot-toggle"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <FaTimes /> : <FaCommentDots />}
      </button>

      {/* Chatbot Container */}
      {isOpen && (
        <div className="chatbot-container">
          <div className="chatbot-header">
            <h3>M-Pesa Payment Assistant</h3>
            <button onClick={() => setIsOpen(false)}>
              <FaTimes />
            </button>
          </div>
          
          <div className="chatbot-messages">
            {messages.map((msg, index) => (
              <div key={index} className={`message ${msg.sender}`}>
                {msg.text.split('\n').map((line, i) => (
                  <p key={i}>{line}</p>
                ))}
              </div>
            ))}
            {isLoading && (
              <div className="message bot">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="chatbot-input">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about M-Pesa..."
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            />
            <button onClick={handleSend} disabled={isLoading}>
              {isLoading ? '...' : 'Send'}
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;