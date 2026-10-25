import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, HardHat, User, Lightbulb, RotateCcw } from 'lucide-react';
import { sendChatMessage } from '../api';
import toast from 'react-hot-toast';

const WELCOME_MSG = {
  role: 'ai',
  content: `👋 Hello! I'm **ConstructAI**, your expert construction intelligence assistant.

I can help you with:
- 📐 **Indian construction standards** (IS codes, BIS)
- 💰 **Cost estimates** in ₹ INR for any project type
- 🦺 **Safety regulations** (Factories Act, BOCW Act)
- 🏗️ **Structural engineering** and design queries
- 📅 **Project management** (PERT, CPM, EVM)
- 🔧 **Material selection** and procurement advice

What would you like to know?`,
  suggestions: [
    'What is the cost per sq.ft for a residential building in Mumbai?',
    'What PPE is mandatory on an Indian construction site?',
    'Explain the IS 456 standard for concrete mix design',
    'How do I calculate EVM for my project?',
  ],
};

function formatMessage(text) {
  // Basic markdown: bold, line breaks
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br />');
}

export default function AIChat() {
  const [messages, setMessages] = useState([WELCOME_MSG]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text) => {
    const msg = text || input.trim();
    if (!msg || loading) return;
    setInput('');

    const userMsg = { role: 'user', content: msg };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await sendChatMessage(msg);
      const data = res.data;
      setMessages(prev => [...prev, {
        role: 'ai',
        content: data.answer,
        suggestions: data.follow_up_suggestions || [],
        confidence: data.confidence,
        dataPoints: data.data_points || [],
      }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'ai',
        content: '❌ Unable to get a response. Please ensure the backend is running and your API key is configured.',
        suggestions: [],
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const reset = () => {
    setMessages([WELCOME_MSG]);
    setInput('');
  };

  return (
    <div>
      <div className="page-header">
        <div className="flex items-center gap-sm mb-sm">
          <MessageCircle size={24} style={{ color: '#a78bfa' }} />
          <h1 className="page-title" style={{ marginBottom: 0 }}>AI Construction Assistant</h1>
        </div>
        <p className="page-subtitle">Expert AI assistant powered by Groq Llama-3.3-70B. Ask anything about Indian construction, costs, safety, and standards.</p>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 180px)', maxHeight: 700 }}>
        {/* Chat Header */}
        <div style={{
          padding: '14px 20px',
          borderBottom: '1px solid var(--color-border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'rgba(139,92,246,0.08)',
        }}>
          <div className="flex items-center gap-sm">
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: 'linear-gradient(135deg, #7c3aed, #a78bfa)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <HardHat size={18} color="white" />
            </div>
            <div>
              <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>ConstructAI</p>
              <p style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
                {loading ? '⟳ Thinking...' : '● Online · Llama-3.3-70B'}
              </p>
            </div>
          </div>
          <button className="btn btn-secondary btn-icon" onClick={reset} title="Clear chat" id="clear-chat-btn">
            <RotateCcw size={15} />
          </button>
        </div>

        {/* Messages */}
        <div className="chat-messages" style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
          {messages.map((msg, i) => (
            <div key={i}>
              <div className={`chat-message ${msg.role}`}>
                <div className="chat-avatar" style={{
                  background: msg.role === 'ai'
                    ? 'linear-gradient(135deg, #7c3aed, #a78bfa)'
                    : 'linear-gradient(135deg, #1d4ed8, #3b82f6)',
                }}>
                  {msg.role === 'ai' ? <HardHat size={16} color="white" /> : <User size={16} color="white" />}
                </div>
                <div className={`chat-bubble ${msg.role === 'ai' ? 'ai' : 'user'}`}>
                  <span dangerouslySetInnerHTML={{ __html: formatMessage(msg.content) }} />
                  {msg.confidence && (
                    <p style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginTop: 8 }}>
                      Confidence: {(msg.confidence * 100).toFixed(0)}%
                    </p>
                  )}
                </div>
              </div>

              {/* Suggestions */}
              {msg.suggestions?.length > 0 && (
                <div className="flex" style={{ flexWrap: 'wrap', gap: 8, marginTop: 10, marginLeft: 44 }}>
                  {msg.suggestions.map((s, j) => (
                    <button
                      key={j}
                      onClick={() => sendMessage(s)}
                      disabled={loading}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        background: 'rgba(139,92,246,0.1)',
                        border: '1px solid rgba(139,92,246,0.25)',
                        color: '#c4b5fd', borderRadius: 20,
                        padding: '5px 12px', fontSize: '0.78rem', cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                    >
                      <Lightbulb size={12} />
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="chat-message">
              <div className="chat-avatar" style={{ background: 'linear-gradient(135deg, #7c3aed, #a78bfa)' }}>
                <HardHat size={16} color="white" />
              </div>
              <div className="chat-bubble ai" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ display: 'flex', gap: 4 }}>
                  {[0, 1, 2].map(k => (
                    <div key={k} style={{
                      width: 8, height: 8, borderRadius: '50%',
                      background: '#a78bfa', opacity: 0.6,
                      animation: `bounce 1.2s ${k * 0.2}s infinite`,
                    }} />
                  ))}
                </div>
                <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>ConstructAI is thinking...</span>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div style={{
          padding: '14px 20px',
          borderTop: '1px solid var(--color-border)',
          display: 'flex', gap: 10, alignItems: 'flex-end',
        }}>
          <textarea
            ref={inputRef}
            className="form-control chat-input"
            placeholder="Ask about costs, safety, materials, IS codes... (Shift+Enter for new line)"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            style={{ flex: 1, minHeight: 44, maxHeight: 120, resize: 'none' }}
            id="chat-input"
          />
          <button
            className="btn btn-primary"
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
            id="send-chat-btn"
            style={{ height: 44, minWidth: 44 }}
          >
            <Send size={16} />
          </button>
        </div>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.6; }
          30% { transform: translateY(-6px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
