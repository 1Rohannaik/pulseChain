import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiMessageSquare, FiX, FiSend } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: "bot",
      text: "Hello! How can I help you with PulseChain today?",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const { userRole, isLoggedIn } = useAuth();

  const toggleChat = () => setIsOpen(!isOpen);

  const handleInputChange = (e) => setInputValue(e.target.value);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMessage = inputValue;

    // Show user's message
    setMessages((prev) => [
      ...prev,
      { id: Date.now(), type: "user", text: userMessage },
    ]);
    setInputValue("");

    // Show typing indicator
    const typingId = Date.now() + 1;
    setMessages((prev) => [
      ...prev,
      { id: typingId, type: "bot", text: "..." },
    ]);

    try {
      const response = await axios.post(
        "https://pulsechain.onrender.com/api/v1/chat-bot",
        { question: userMessage },
        { withCredentials: true } // ⚠️ Important: includes JWT cookie
      );

      const botMessage =
        response.data?.answer || "No response from AI service.";
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === typingId ? { ...msg, text: botMessage } : msg
        )
      );
    } catch (err) {
      const errorMsg =
        err.response?.data?.error || "Unable to reach medical assistant.";
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === typingId ? { ...msg, text: errorMsg } : msg
        )
      );
    }
  };

  return (
    <>
      {/* Floating Button */}
      <motion.button
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary-500 text-white shadow-lg hover:bg-primary-600"
        onClick={toggleChat}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label={isOpen ? "Close chat" : "Open chat"}
      >
        {isOpen ? (
          <FiX className="h-6 w-6" />
        ) : (
          <FiMessageSquare className="h-6 w-6" />
        )}
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed bottom-24 right-6 z-50 w-80 overflow-hidden rounded-lg bg-white shadow-xl dark:bg-neutral-800 sm:w-96"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <div className="bg-primary-500 px-4 py-3 text-white">
              <h3 className="text-lg font-medium">
                PulseChain Medical Assistant
              </h3>
              <p className="text-xs opacity-80">
                Ask me your health questions.
              </p>
            </div>

            <div className="h-96 overflow-y-auto p-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`mb-4 flex ${
                    msg.type === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-2 ${
                      msg.type === "user"
                        ? "bg-primary-500 text-white"
                        : "bg-neutral-100 text-neutral-800 dark:bg-neutral-700 dark:text-neutral-100"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-line">{msg.text}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            <div className="border-t border-neutral-200 bg-white p-3 dark:border-neutral-700 dark:bg-neutral-800">
              <form onSubmit={handleSubmit} className="flex items-center gap-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={handleInputChange}
                  placeholder="Ask your medical question..."
                  className="flex-1 rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-neutral-600 dark:bg-neutral-700 dark:text-white"
                />
                <button
                  type="submit"
                  className="rounded-full bg-primary-500 p-2 text-white hover:bg-primary-600"
                >
                  <FiSend className="h-4 w-4" />
                </button>
              </form>

              {/* Quick prompts */}
              <div className="mt-2 flex flex-wrap gap-2">
                <button
                  onClick={() =>
                    setInputValue("What are symptoms of diabetes?")
                  }
                  className="rounded-full bg-neutral-100 px-3 py-1 text-xs hover:bg-neutral-200 dark:bg-neutral-700 dark:hover:bg-neutral-600"
                >
                  Diabetes symptoms
                </button>
                <button
                  onClick={() =>
                    setInputValue("How to treat high blood pressure?")
                  }
                  className="rounded-full bg-neutral-100 px-3 py-1 text-xs hover:bg-neutral-200 dark:bg-neutral-700 dark:hover:bg-neutral-600"
                >
                  Blood pressure
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Chatbot;
