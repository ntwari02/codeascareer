import { useState, useRef } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';
import { useClickOutside } from '../hooks/useClickOutside';

export function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Array<{ text: string; sender: 'user' | 'bot' }>>([
    { text: 'Hi! How can I help you today?', sender: 'bot' }
  ]);

  const chatRef = useRef<HTMLDivElement>(null);
  useClickOutside(chatRef, () => setIsOpen(false));

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setMessages(prev => [...prev, { text: message, sender: 'user' }]);

    setTimeout(() => {
      setMessages(prev => [...prev, {
        text: 'Thank you for your message! Our support team will assist you shortly.',
        sender: 'bot'
      }]);
    }, 1000);

    setMessage('');
  };

  return (
    <>
      {isOpen && (
        <div ref={chatRef} className="fixed bottom-24 right-6 w-96 max-w-[calc(100vw-3rem)] bg-white dark:bg-dark-card rounded-2xl shadow-2xl border border-gray-200 dark:border-dark z-50 overflow-hidden animate-scaleIn">
          <div className="bg-gradient-to-r from-red-600 to-orange-600 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <MessageCircle className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Support Chat</h3>
                <p className="text-white/80 text-xs">We're here to help!</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-white/20 p-2 rounded-lg transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="h-96 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-slideUp`}
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-r from-orange-600 to-orange-800 text-white'
                      : 'bg-gray-100 dark:bg-dark-primary text-gray-900 dark:text-gray-100'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleSend} className="p-4 border-t border-gray-200 dark:border-dark">
            <div className="flex gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 px-4 py-2 bg-gray-100 dark:bg-dark-primary border border-gray-200 dark:border-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 dark:text-white transition"
              />
              <button
                type="submit"
                className="bg-gradient-to-r from-orange-600 to-orange-800 text-white p-2 rounded-lg hover:from-orange-700 hover:to-orange-900 transition hover:scale-105 active:scale-95"
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
          </form>
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-orange-600 to-orange-800 rounded-full shadow-lg flex items-center justify-center text-white z-50 hover:from-orange-700 hover:to-orange-900 transition hover:scale-110 active:scale-90"
      >
        {isOpen ? (
          <X className="h-6 w-6 transition-transform" />
        ) : (
          <MessageCircle className="h-6 w-6 transition-transform" />
        )}
      </button>
    </>
  );
}
