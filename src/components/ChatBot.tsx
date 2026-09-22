import { useState, useRef, useEffect } from 'react';
import type { ChatMessage } from '../types';

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // 새 메시지 올 때마다 자동 스크롤
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = { role: 'user', content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    // assistant 빈 말풍선 먼저 추가 (타이핑 효과용)
    setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: messages,
        }),
      });

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split('\n\n');
        buffer = parts.pop() ?? '';

        for (const part of parts) {
          const line = part.replace(/^data: /, '').trim();
          if (line === '[DONE]') break;
          if (!line) continue;

          try {
            const parsed = JSON.parse(line);
            if (parsed.error) {
              setMessages(prev => {
                const updated = [...prev];
                updated[updated.length - 1].content = '오류가 발생했습니다. 다시 시도해주세요.';
                return updated;
              });
              break;
            }
            if (parsed.token) {
              setMessages(prev => {
                const updated = [...prev];
                updated[updated.length - 1] = {
                  ...updated[updated.length - 1],
                  content: updated[updated.length - 1].content + parsed.token,
                };
                return updated;
              });
            }
          } catch {}
        }
      }
    } catch {
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1].content = '서버에 연결할 수 없습니다.';
        return updated;
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* 플로팅 버튼 */}
      <button
        className="chatbot-toggle"
        onClick={() => setIsOpen(prev => !prev)}
        aria-label="챗봇 열기"
      >
        {isOpen ? '✕' : '🎮'}
      </button>

      {/* 챗봇 창 */}
      {isOpen && (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <span>🎮 게임 추천 AI</span>
          </div>

          <div className="chatbot-messages">
            {messages.length === 0 && (
              <div className="chatbot-empty">
                게임 추천이 필요하신가요?<br />무엇이든 물어보세요!
              </div>
            )}
            {messages.map((msg, i) => (
              <div key={i} className={`chatbot-bubble ${msg.role}`}>
                {msg.content || (msg.role === 'assistant' && isLoading ? '▋' : '')}
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          <div className="chatbot-input-area">
            <textarea
              className="chatbot-input"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="메시지를 입력하세요..."
              rows={1}
              disabled={isLoading}
            />
            <button
              className="chatbot-send"
              onClick={sendMessage}
              disabled={isLoading || !input.trim()}
            >
              ↑
            </button>
          </div>
        </div>
      )}
    </>
  );
}