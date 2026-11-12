
import { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import api from "../../api/axios";
import "./FixiChat.css";

function FixiChat() {
  const location = useLocation();

  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [position, setPosition] = useState(null);

  const messagesEndRef = useRef(null);

  const dragRef = useRef({
    dragging: false,
    moved: false,
    startX: 0,
    startY: 0,
    startLeft: 0,
    startTop: 0,
  });

  const [messages, setMessages] = useState([
    {
      sender: "fixi",
      text: "Hi! I'm Fixi, your personal Fixora assistant. How can I help you today?",
    },
  ]);

  // Get logged-in customer
  const token = localStorage.getItem("token");

  let user = null;

  try {
    user = JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    user = null;
  }

  const isCustomer =
    Boolean(token) &&
    String(user?.role || "").toLowerCase() === "customer";

  // Close chat if customer logs out
  useEffect(() => {
    if (!isCustomer) {
      setIsOpen(false);
    }
  }, [isCustomer, location.pathname]);

  // Scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, isLoading]);

  // Start dragging
  const handlePointerDown = (e) => {
    if (e.button !== 0 && e.pointerType === "mouse") return;

    const rect = e.currentTarget.getBoundingClientRect();

    dragRef.current = {
      dragging: true,
      moved: false,
      startX: e.clientX,
      startY: e.clientY,
      startLeft: rect.left,
      startTop: rect.top,
    };

    e.currentTarget.setPointerCapture(e.pointerId);
  };

  // Move floating button
  const handlePointerMove = (e) => {
    const drag = dragRef.current;

    if (!drag.dragging) return;

    const deltaX = e.clientX - drag.startX;
    const deltaY = e.clientY - drag.startY;

    if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
      drag.moved = true;
    }

    if (!drag.moved) return;

    const buttonSize = 64;

    const newLeft = Math.max(
      0,
      Math.min(
        window.innerWidth - buttonSize,
        drag.startLeft + deltaX
      )
    );

    const newTop = Math.max(
      0,
      Math.min(
        window.innerHeight - buttonSize,
        drag.startTop + deltaY
      )
    );

    setPosition({
      left: newLeft,
      top: newTop,
    });
  };

  const handlePointerUp = (e) => {
    dragRef.current.dragging = false;

    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  };

  // Toggle chat
  const handleToggle = () => {
    if (dragRef.current.moved) {
      dragRef.current.moved = false;
      return;
    }

    setIsOpen((prev) => !prev);
  };

  // Send message to backend AI
  const handleSend = async (e) => {
    e.preventDefault();

    const trimmedMessage = message.trim();

    if (!trimmedMessage || isLoading) return;

    // Add customer message immediately
    const updatedMessages = [
      ...messages,
      {
        sender: "user",
        text: trimmedMessage,
      },
    ];

    setMessages(updatedMessages);
    setMessage("");
    setIsLoading(true);

    try {
      // Convert chat history to backend format
      const history = updatedMessages
        .slice(1, -1)
        .map((item) => ({
          role: item.sender === "user" ? "user" : "assistant",
          content: item.text,
        }));

      const response = await api.post("/chatbot/chat", {
        message: trimmedMessage,
        history,
      });

      const reply = response.data?.reply;

      if (!reply) {
        throw new Error("Fixi returned an empty response.");
      }

      setMessages((prev) => [
        ...prev,
        {
          sender: "fixi",
          text: reply,
        },
      ]);
    } catch (error) {
      console.error(
        "Fixi API Error:",
        error.response?.data || error.message
      );

      const errorMessage =
        error.response?.data?.message ||
        "Sorry, I'm having trouble connecting right now. Please try again.";

      setMessages((prev) => [
        ...prev,
        {
          sender: "fixi",
          text: errorMessage,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Only customers can see Fixi
  if (!isCustomer) return null;

  return (
    <div className="fixi-container">
      {isOpen && (
        <div className="fixi-window">
          <div className="fixi-header">
            <div className="fixi-avatar">
              <span>F</span>
            </div>

            <div className="fixi-header-info">
              <h3>Fixi</h3>
              <span>Your Fixora Assistant</span>
            </div>

            <button
              className="fixi-close"
              onClick={() => setIsOpen(false)}
              aria-label="Close chat"
            >
              ×
            </button>
          </div>

          <div className="fixi-welcome">
            <span className="fixi-welcome-icon">✦</span>

            <div>
              <strong>
                Hello, {user?.name?.split(" ")[0] || "there"}!
              </strong>

              <p>How can I make your day easier?</p>
            </div>
          </div>

          <div className="fixi-messages">
            {messages.map((item, index) => (
              <div
                key={index}
                className={`fixi-message ${item.sender}`}
              >
                {item.text}
              </div>
            ))}

            {isLoading && (
              <div className="fixi-message fixi fixi-typing">
                Fixi is thinking...
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <form
            className="fixi-input-area"
            onSubmit={handleSend}
          >
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask Fixi something..."
              aria-label="Message Fixi"
              disabled={isLoading}
            />

            <button
              type="submit"
              disabled={isLoading || !message.trim()}
              aria-label="Send message"
            >
              <span>Send</span>
              <span>➤</span>
            </button>
          </form>

          <div className="fixi-footer">
            Powered by Fixora
          </div>
        </div>
      )}

      <button
        className="fixi-toggle"
        style={
          position
            ? {
                left: `${position.left}px`,
                top: `${position.top}px`,
                right: "auto",
                bottom: "auto",
              }
            : {}
        }
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onClick={handleToggle}
        aria-label={isOpen ? "Close Fixi chat" : "Open Fixi chat"}
      >
        {isOpen ? (
          <span className="fixi-toggle-close">×</span>
        ) : (
          <>
            <span className="fixi-toggle-icon">✦</span>
            <span className="fixi-toggle-label">Fixi</span>
          </>
        )}
      </button>
    </div>
  );
}

export default FixiChat;
