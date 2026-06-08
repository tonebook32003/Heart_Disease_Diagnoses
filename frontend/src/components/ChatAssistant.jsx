import { useEffect, useRef, useState } from "react";
import {
  Expand,
  Loader2,
  MessageCircle,
  Send,
  Shrink,
  Sparkles,
  X,
} from "lucide-react";
import { chatWithAssistant } from "../utils/api";
import chatbotImage from "../assets/image/chatbot_image.jpg";

const STARTER_MESSAGES = [
  {
    role: "assistant",
    content:
      "Xin chào, mình là trợ lý AI của SmartHeartDiagnosis. Bạn có thể hỏi mình về cách dùng app, ý nghĩa các chỉ số, kết quả phần trăm nguy cơ hoặc cách triển khai dự án.",
  },
];

const QUICK_PROMPTS = [
  "Giải thích kết quả nguy cơ",
  "Tư vấn cách đọc chỉ số",
  "Hỏi về mô hình ML",
];

const renderInlineMarkdown = (text) => {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    return <span key={index}>{part}</span>;
  });
};

const renderMessageContent = (content) => {
  return content.split(/\r?\n/).map((line, index) => {
    const trimmed = line.trim();
    if (!trimmed) {
      return <div key={index} className="chat-line-spacer" />;
    }

    const numberedMatch = trimmed.match(/^(\d+)[.)]\s+(.+)$/);
    if (numberedMatch) {
      return (
        <div key={index} className="chat-numbered-line">
          <span className="chat-number">{numberedMatch[1]}</span>
          <p>{renderInlineMarkdown(numberedMatch[2])}</p>
        </div>
      );
    }

    const bulletMatch = trimmed.match(/^[-–]\s+(.+)$/);
    if (bulletMatch) {
      return (
        <div key={index} className="chat-bullet-line">
          <span className="chat-bullet-dot"></span>
          <p>{renderInlineMarkdown(bulletMatch[1])}</p>
        </div>
      );
    }

    return <p key={index}>{renderInlineMarkdown(trimmed)}</p>;
  });
};

export default function ChatAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState(STARTER_MESSAGES);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const chatRef = useRef(null);
  const inputRef = useRef(null);
  const messagesRef = useRef(null);

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages, loading]);

  useEffect(() => {
    if (!isOpen) return;

    const handleOutsideClick = (event) => {
      if (!chatRef.current?.contains(event.target)) {
        closeChat();
      }
    };

    document.addEventListener("pointerdown", handleOutsideClick);

    return () => {
      document.removeEventListener("pointerdown", handleOutsideClick);
    };
  }, [isOpen]);

  const sendMessage = async (content) => {
    const trimmed = content.trim();
    if (!trimmed || loading) return;

    const nextMessages = [...messages, { role: "user", content: trimmed }];
    setMessages(nextMessages);
    setInput("");
    setError("");
    setLoading(true);

    try {
      const data = await chatWithAssistant(nextMessages);
      setMessages([
        ...nextMessages,
        { role: "assistant", content: data.reply },
      ]);
    } catch (err) {
      setError(err.message || "Không thể kết nối OpenRouter API.");
    } finally {
      setLoading(false);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  const closeChat = () => {
    setIsOpen(false);
    setIsExpanded(false);
  };

  return (
    <div
      ref={chatRef}
      className={`chat-assistant ${isOpen ? "chat-assistant-open" : ""} ${
        isExpanded ? "chat-assistant-expanded" : ""
      }`}
    >
      {isOpen && (
        <section
          className={`chat-panel fade-in ${isExpanded ? "chat-panel-expanded" : ""}`}
          aria-label="SmartHeartDiagnosis AI assistant"
        >
          <div className="chat-panel-glow" aria-hidden="true"></div>
          <div className="chat-header">
            <div className="chat-title">
              <span className="chat-avatar">
                <img src={chatbotImage} alt="AI Assistant avatar" />
              </span>
              <div>
                <strong>AI Assistant</strong>
                <span>SmartHeartDiagnosis</span>
              </div>
            </div>
            <div className="chat-header-actions">
              <button
                type="button"
                className="chat-icon-btn"
                onClick={() => setIsExpanded((prev) => !prev)}
                aria-label={isExpanded ? "Thu nhỏ chatbot" : "Mở rộng chatbot"}
                title={isExpanded ? "Thu nhỏ" : "Mở rộng"}
              >
                {isExpanded ? <Shrink size={18} /> : <Expand size={18} />}
              </button>
              <button
                type="button"
                className="chat-icon-btn"
                onClick={closeChat}
                aria-label="Đóng trợ lý AI"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          <div className="chat-hero-status">
            <div>
              <span className="chat-status-chip">
                <Sparkles size={14} />
                Chatbot active
              </span>
              <h3>Trợ lý AI cho báo cáo tim mạch</h3>
            </div>
          </div>
          <div className="chat-messages" ref={messagesRef}>
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`chat-message chat-message-${message.role}`}
              >
                <div className="chat-message-content">
                  {renderMessageContent(message.content)}
                </div>
              </div>
            ))}
            {loading && (
              <div className="chat-message chat-message-assistant chat-message-loading">
                <Loader2 size={16} className="loading-spinner" />
                <p>Đang phân tích câu hỏi...</p>
              </div>
            )}
          </div>

          {messages.length === STARTER_MESSAGES.length && (
            <div className="chat-prompts">
              {QUICK_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => sendMessage(prompt)}
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}

          {error && <div className="chat-error">{error}</div>}

          <form className="chat-form" onSubmit={handleSubmit}>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Hỏi về app, chỉ số, mô hình..."
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              aria-label="Gửi tin nhắn"
            >
              {loading ? (
                <Loader2 size={18} className="loading-spinner" />
              ) : (
                <Send size={18} />
              )}
            </button>
          </form>
        </section>
      )}

      <button
        type="button"
        className="chat-fab"
        onClick={() => {
          if (isOpen) {
            closeChat();
          } else {
            setIsOpen(true);
          }
        }}
        aria-label={isOpen ? "Đóng trợ lý AI" : "Mở trợ lý AI"}
      >
        {isOpen ? <X size={22} /> : <MessageCircle size={23} />}
      </button>
    </div>
  );
}
