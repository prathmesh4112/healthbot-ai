'use client';

import React, { useEffect, useRef, useState } from "react";
import { Camera, Menu, X, Plus, ChevronLeft, ChevronRight, Sun, Moon, MoreVertical, Send, Mic, Trash2, Copy, Download, MessageSquare, User, Bot, Clock, ThumbsUp, Heart, Smile, AlertCircle, CheckCircle, Info, Shield } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Message = {
  role: "user" | "bot";
  content: string;
  time?: string;
  reactions?: string[];
  id?: string;
};

type ChatHistory = {
  title: string;
  messages: Message[];
  createdAt?: string;
  color?: string;
};

type Toast = {
  id: string;
  message: string;
  type: "success" | "error" | "info";
};

function AnimatedMeshBackground({ darkMode }: { darkMode: boolean }) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
      <motion.div
        className="absolute -top-1/2 -left-1/2 w-full h-full rounded-full blur-3xl"
        style={{
          background: darkMode
            ? "radial-gradient(circle, rgba(255, 255, 255, 0.15) 0%, transparent 70%)"
            : "radial-gradient(circle, rgba(0, 0, 0, 0.15) 0%, transparent 70%)",
        }}
        animate={{
          x: [0, 100, 0],
          y: [0, 50, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute -bottom-1/2 -right-1/2 w-full h-full rounded-full blur-3xl"
        style={{
          background: darkMode
            ? "radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%)"
            : "radial-gradient(circle, rgba(0, 0, 0, 0.1) 0%, transparent 70%)",
        }}
        animate={{
          x: [0, -100, 0],
          y: [0, -50, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </div>
  );
}

function FloatingParticles({ count = 20, darkMode }: { count?: number; darkMode: boolean }) {
  const [particles, setParticles] = useState<{ top: string; left: string; delay: number; duration: number }[]>([]);

  useEffect(() => {
    const positions = Array.from({ length: count }).map(() => ({
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      delay: Math.random() * 5,
      duration: 15 + Math.random() * 10,
    }));
    setParticles(positions);
  }, [count]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map((p, i) => (
        <motion.div
          key={i}
          className={`absolute w-1 h-1 rounded-full ${darkMode ? "bg-white" : "bg-black"}`}
          style={{ top: p.top, left: p.left }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: [0, 0.4, 0],
            scale: [0, 1.5, 0],
            y: [0, -100, -200],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            ease: "easeOut",
            delay: p.delay,
          }}
        />
      ))}
    </div>
  );
}

const STORAGE_KEY = "healthbot_chat_history_v2";

function loadHistory(): ChatHistory[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
    return [];
  } catch {
    return [];
  }
}

function saveHistory(history: ChatHistory[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch {
    // ignore
  }
}

function ToastNotification({ toasts, removeToast }: { toasts: Toast[]; removeToast: (id: string) => void }) {
  return (
    <div className="fixed top-4 right-4 z-[100] space-y-2">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 100, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.8 }}
            className={`px-4 py-3 rounded-xl shadow-2xl backdrop-blur-xl border flex items-center gap-3 min-w-[280px] ${
              toast.type === "success"
                ? "bg-black text-white border-white"
                : toast.type === "error"
                ? "bg-red-600 text-white border-red-400"
                : "bg-gray-800 text-white border-gray-600"
            }`}
          >
            {toast.type === "success" && <CheckCircle className="h-5 w-5" />}
            {toast.type === "error" && <AlertCircle className="h-5 w-5" />}
            {toast.type === "info" && <Info className="h-5 w-5" />}
            <span className="flex-1 text-sm font-medium">{toast.message}</span>
            <button onClick={() => removeToast(toast.id)} className="hover:bg-white/20 rounded p-1">
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

export default function Page() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>("");
  const [history, setHistory] = useState<ChatHistory[]>([]);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [showIntro, setShowIntro] = useState<boolean>(true);
  const [showScrollBtn, setShowScrollBtn] = useState<boolean>(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [showFloatingMenu, setShowFloatingMenu] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);

  const chatBodyRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const addToast = (message: string, type: Toast["type"] = "info") => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => removeToast(id), 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  useEffect(() => {
    const saved = loadHistory();
    if (saved.length > 0) {
      setHistory(saved);
      setActiveIndex(0);
      setMessages(saved[0].messages ?? []);
    } else {
      const initial: ChatHistory[] = [
        {
          title: "Welcome Chat",
          messages: [],
          createdAt: new Date().toISOString(),
          color: "from-black to-gray-800",
        },
      ];
      setHistory(initial);
      setMessages([]);
    }
  }, []);

  useEffect(() => {
    saveHistory(history);
  }, [history]);

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, [darkMode]);

  function formatTimeISO(date = new Date()) {
    return date.toISOString();
  }

  function persistActiveMessages(newMessages: Message[]) {
    setHistory((prev) => {
      const next = [...prev];
      if (!next[activeIndex]) {
        next[activeIndex] = {
          title: `Chat ${activeIndex + 1}`,
          messages: [],
          createdAt: new Date().toISOString(),
          color: "from-black to-gray-800",
        };
      }
      next[activeIndex] = { ...next[activeIndex], messages: newMessages };
      return next;
    });
  }

  function resumeChatFromHistory(index: number) {
    setActiveIndex(index);
    setMessages(history[index]?.messages ?? []);
    addToast("Chat loaded successfully", "success");
  }

  function createNewChat(title = "New Chat") {
    const colors = [
      "from-black to-gray-800",
      "from-gray-900 to-gray-700",
      "from-gray-800 to-black",
    ];
    const newChat: ChatHistory = {
      title,
      messages: [],
      createdAt: new Date().toISOString(),
      color: colors[Math.floor(Math.random() * colors.length)],
    };
    setHistory((prev) => [newChat, ...prev]);
    setActiveIndex(0);
    setMessages([]);
    addToast("New chat created", "success");
  }

  function renameChat(index: number) {
    const newName = prompt("Enter chat title:", history[index]?.title ?? `Chat ${index + 1}`);
    if (!newName) return;
    setHistory((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], title: newName };
      return next;
    });
    addToast("Chat renamed", "success");
  }

  function deleteChat(index: number) {
    if (!confirm("Delete this chat?")) return;
    setHistory((prev) => {
      const next = prev.filter((_, i) => i !== index);
      if (next.length === 0) {
        const defaultChat: ChatHistory = {
          title: "New Chat",
          messages: [],
          createdAt: new Date().toISOString(),
          color: "from-black to-gray-800",
        };
        return [defaultChat];
      }
      const newActive = Math.max(0, Math.min(next.length - 1, activeIndex === index ? 0 : activeIndex));
      setActiveIndex(newActive);
      setMessages(next[newActive]?.messages ?? []);
      return next;
    });
    addToast("Chat deleted", "info");
  }

  async function handleSend(retryCount = 0) {
    const content = input.trim();
    if (!content) return;

    const userMsg: Message = {
      role: "user",
      content,
      time: formatTimeISO(),
      id: Date.now().toString(),
    };
    const next = [...messages, userMsg];

    setMessages(next);
    persistActiveMessages(next);
    setInput("");
    if (showIntro) setShowIntro(false);

    setIsTyping(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: content }),
      });

      if (!res.ok) {
        throw new Error(`Server error: ${res.status} ${res.statusText}`);
      }

      const data = await res.json().catch(() => ({}));
      const replyText = data?.reply ?? data?.error ?? "Sorry — no response from server.";

      const botMsg: Message = {
        role: "bot",
        content: replyText,
        time: formatTimeISO(),
        id: (Date.now() + 1).toString(),
        reactions: [],
      };
      const afterBot = [...next, botMsg];

      setMessages(afterBot);
      persistActiveMessages(afterBot);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error occurred.";
      if (retryCount < 2) {
        addToast(`Request failed, retrying... (${retryCount + 1}/3)`, "error");
        setTimeout(() => handleSend(retryCount + 1), 2000); // Retry after 2 seconds
        return;
      }

      const fallbackReply = "I'm experiencing technical difficulties. Please try again later or consult a healthcare professional for urgent concerns.";
      const botMsg: Message = {
        role: "bot",
        content: fallbackReply,
        time: formatTimeISO(),
        id: (Date.now() + 1).toString(),
      };
      const afterBot = [...next, botMsg];
      setMessages(afterBot);
      persistActiveMessages(afterBot);
      addToast(`Request failed after retries: ${errorMessage}`, "error");
    } finally {
      setIsTyping(false);
      setTimeout(scrollToBottom, 100);
    }
  }

  function goPrevChat() {
    if (history.length === 0) return;
    const idx = Math.max(0, activeIndex - 1);
    setActiveIndex(idx);
    setMessages(history[idx]?.messages ?? []);
  }

  function goNextChat() {
    if (history.length === 0) return;
    const idx = Math.min(history.length - 1, activeIndex + 1);
    setActiveIndex(idx);
    setMessages(history[idx]?.messages ?? []);
  }

  function autoResize() {
    if (!textareaRef.current) return;
    textareaRef.current.style.height = "auto";
    textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    autoResize();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  useEffect(() => {
    if (!chatBodyRef.current) return;
    chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
  }, [messages, isTyping]);

  useEffect(() => {
    const container = chatBodyRef.current;
    if (!container) return;
    const onScroll = () => {
      setShowScrollBtn(container.scrollTop < container.scrollHeight - 600);
    };
    container.addEventListener("scroll", onScroll);
    return () => container.removeEventListener("scroll", onScroll);
  }, []);

  function scrollToBottom() {
    if (!chatBodyRef.current) return;
    chatBodyRef.current.scrollTo({
      top: chatBodyRef.current.scrollHeight,
      behavior: "smooth",
    });
  }

  function addReaction(messageId: string, emoji: string) {
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.id === messageId) {
          const reactions = msg.reactions || [];
          if (reactions.includes(emoji)) {
            return { ...msg, reactions: reactions.filter((r) => r !== emoji) };
          } else {
            return { ...msg, reactions: [...reactions, emoji] };
          }
        }
        return msg;
      })
    );
  }

  function exportChatAsJSON() {
    const dataStr = JSON.stringify(history[activeIndex] ?? { title: "chat", messages: [] }, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(history[activeIndex]?.title || "chat").replace(/\s+/g, "_")}.json`;
    a.click();
    URL.revokeObjectURL(url);
    addToast("Chat exported as JSON", "success");
  }

  function exportChatAsText() {
    const text = messages.map((m) => `${m.role.toUpperCase()}: ${m.content}`).join("\n\n");
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(history[activeIndex]?.title || "chat").replace(/\s+/g, "_")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    addToast("Chat exported as text", "success");
  }

  function copyToClipboard() {
    const text = messages.map((m) => `${m.role}: ${m.content}`).join("\n\n");
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      addToast("Copied to clipboard", "success");
    }
  }

  const activeTitle = history[activeIndex]?.title ?? "AI Health Assistant";
  const activeColor = history[activeIndex]?.color ?? "from-black to-gray-800";

  return (
    <div className={`flex h-screen w-full relative overflow-hidden transition-colors duration-500 ${darkMode ? "bg-black text-white" : "bg-white text-black"}`}>
      <AnimatedMeshBackground darkMode={darkMode} />
      <FloatingParticles count={15} darkMode={darkMode} />

      <ToastNotification toasts={toasts} removeToast={removeToast} />

      <AnimatePresence>
        {showIntro && (
          <motion.div
            className="absolute inset-0 z-50 flex items-center justify-center px-6 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4 }}
          >
            <div className={`absolute inset-0 ${darkMode ? "bg-black" : "bg-white"}`} />
            <FloatingParticles count={40} darkMode={darkMode} />

            <motion.div
              className="relative z-10"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5, type: "spring" }}
            >
              <motion.div
                className="mb-6 inline-block"
                animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.05, 1] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <div className={`w-24 h-24 ${darkMode ? "bg-white/20" : "bg-black/20"} backdrop-blur-xl rounded-3xl flex items-center justify-center shadow-2xl border ${darkMode ? "border-white/30" : "border-black/30"}`}>
                  <Bot className={`w-14 h-14 ${darkMode ? "text-white" : "text-black"}`} />
                </div>
              </motion.div>

              <h1 className={`text-5xl sm:text-6xl lg:text-7xl font-black mb-4 drop-shadow-2xl ${darkMode ? "text-white" : "text-black"}`}>
                Welcome to <span className={darkMode ? "text-gray-400" : "text-gray-600"}>HealthBot AI</span>
              </h1>

              <p className={`text-lg sm:text-xl max-w-3xl mx-auto mb-8 opacity-95 ${darkMode ? "text-white/90" : "text-black/90"} leading-relaxed`}>
                Your intelligent health companion powered by advanced AI. Get quick symptom analysis, health guidance, and
                personalized wellness insights — available 24/7.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
                <motion.button
                  onClick={() => setShowIntro(false)}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-8 py-4 ${darkMode ? "bg-white text-black" : "bg-black text-white"} font-bold rounded-2xl shadow-2xl transition-all flex items-center gap-2 group`}
                >
                  <MessageSquare className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                  Start Chatting
                </motion.button>

                <motion.button
                  onClick={() => {
                    createNewChat("Quick Health Check");
                    setShowIntro(false);
                  }}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-8 py-4 ${darkMode ? "bg-gray-800/80 border-white/30" : "bg-gray-200/80 border-black/30"} backdrop-blur-xl ${darkMode ? "text-white" : "text-black"} font-bold rounded-2xl shadow-2xl border-2 transition-all flex items-center gap-2 group`}
                >
                  <span className="w-5 h-5 group-hover:scale-125 transition-transform">⚡</span>
                  Quick Check
                </motion.button>
              </div>

              <div className="max-w-2xl mx-auto space-y-4">
                <div className={`${darkMode ? "bg-white/10 border-white/20" : "bg-black/10 border-black/20"} backdrop-blur-xl rounded-2xl p-6 border`}>
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 ${darkMode ? "bg-white/20" : "bg-black/20"} rounded-full flex items-center justify-center flex-shrink-0`}>
                      <Shield className={`w-6 h-6 ${darkMode ? "text-white" : "text-black"}`} />
                    </div>
                    <div className="text-left">
                      <h3 className={`font-bold ${darkMode ? "text-white" : "text-black"} mb-2`}>Important Medical Disclaimer</h3>
                      <p className={`text-sm ${darkMode ? "text-white/80" : "text-black/80"} leading-relaxed`}>
                        HealthBot AI provides general health information and guidance only. This is <strong>not</strong> a
                        substitute for professional medical advice, diagnosis, or treatment. Always consult with qualified
                        healthcare providers for medical concerns.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                  <div className={`${darkMode ? "bg-white/10 border-white/20" : "bg-black/10 border-black/20"} backdrop-blur-xl rounded-xl p-4 border`}>
                    <Clock className={`w-8 h-8 ${darkMode ? "text-white" : "text-black"} mb-2 mx-auto`} />
                    <p className={`${darkMode ? "text-white/90" : "text-black/90"} font-semibold`}>24/7 Available</p>
                  </div>
                  <div className={`${darkMode ? "bg-white/10 border-white/20" : "bg-black/10 border-black/20"} backdrop-blur-xl rounded-xl p-4 border`}>
                    <Shield className={`w-8 h-8 ${darkMode ? "text-white" : "text-black"} mb-2 mx-auto`} />
                    <p className={`${darkMode ? "text-white/90" : "text-black/90"} font-semibold`}>Private & Secure</p>
                  </div>
                  <div className={`${darkMode ? "bg-white/10 border-white/20" : "bg-black/10 border-black/20"} backdrop-blur-xl rounded-xl p-4 border`}>
                    <Bot className={`w-8 h-8 ${darkMode ? "text-white" : "text-black"} mb-2 mx-auto`} />
                    <p className={`${darkMode ? "text-white/90" : "text-black/90"} font-semibold`}>AI-Powered</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {sidebarOpen && !showIntro && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
            />

            <motion.aside
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className={`fixed md:static z-50 h-full w-80 flex flex-col border-r ${darkMode ? "border-white/10 bg-gray-900/80" : "border-black/10 bg-white/80"} backdrop-blur-2xl shadow-2xl`}
            >
              <header className={`px-5 py-4 bg-gradient-to-r ${darkMode ? activeColor : "from-white to-gray-200"} ${darkMode ? "text-white" : "text-black"} relative overflow-hidden`}>
                <div className="absolute inset-0 bg-black/10" />
                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <motion.div
                      className={`h-12 w-12 rounded-2xl ${darkMode ? "bg-white/20 border-white/30" : "bg-black/20 border-black/30"} backdrop-blur-xl flex items-center justify-center border`}
                      whileHover={{ rotate: 360, scale: 1.1 }}
                      transition={{ duration: 0.6 }}
                    >
                      <Bot className="h-6 w-6" />
                    </motion.div>
                    <div>
                      <h3 className="font-bold text-base">HealthBot AI</h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => createNewChat()}
                      className={`p-2 rounded-xl ${darkMode ? "hover:bg-white/20" : "hover:bg-black/20"} backdrop-blur-xl transition`}
                      title="New chat"
                    >
                      <Plus className="h-6 w-6" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setSidebarOpen(false)}
                      className={`p-2 rounded-xl ${darkMode ? "hover:bg-white/20" : "hover:bg-black/20"} backdrop-blur-xl transition md:hidden`}
                      title="Close"
                    >
                      <X className="h-6 w-6" />
                    </motion.button>
                  </div>
                </div>
              </header>

              <div className="flex-1 overflow-y-auto px-4 py-5 space-y-3">
                <div className={`text-xs font-bold ${darkMode ? "text-gray-400" : "text-gray-600"} uppercase tracking-wider mb-3`}>
                  Chat History ({history.length})
                </div>

                {history.length === 0 && (
                  <div className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"} text-center py-8`}>
                    No chats yet. Start a new conversation!
                  </div>
                )}

                <AnimatePresence mode="popLayout">
                  {history.map((chat, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      transition={{ duration: 0.2 }}
                      className="group"
                    >
                      <motion.button
                        onClick={() => {
                          resumeChatFromHistory(idx);
                          setSidebarOpen(false);
                        }}
                        whileHover={{ scale: 1.02, x: 4 }}
                        className={`w-full text-left p-4 rounded-2xl transition-all border-2 ${
                          activeIndex === idx
                            ? darkMode 
                              ? "bg-gradient-to-r from-black to-gray-800 text-white border-transparent shadow-xl"
                              : "bg-gradient-to-r from-white to-gray-200 text-black border-transparent shadow-xl"
                            : darkMode
                            ? "bg-gray-800/50 border-transparent hover:border-white/30 hover:shadow-lg"
                            : "bg-white/50 border-transparent hover:border-black/30 hover:shadow-lg"
                        }`}
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                            activeIndex === idx 
                              ? darkMode ? "bg-white/20" : "bg-black/20"
                              : darkMode ? "bg-gradient-to-br from-gray-700 to-gray-600" : "bg-gradient-to-br from-gray-300 to-gray-400"
                          }`}>
                            <MessageSquare className="w-5 h-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-sm truncate">{chat.title}</h4>
                            <p className={`text-xs ${activeIndex === idx ? (darkMode ? "text-white/80" : "text-black/80") : (darkMode ? "text-gray-400" : "text-gray-600")}`}>
                              {chat.messages.length} messages
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className={`text-xs ${activeIndex === idx ? (darkMode ? "text-white/70" : "text-black/70") : (darkMode ? "text-gray-500" : "text-gray-600")}`}>
                            {chat.createdAt ? new Date(chat.createdAt).toLocaleDateString() : ""}
                          </span>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <motion.div
                              role="button"
                              tabIndex={0}
                              whileHover={{ scale: 1.2 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                renameChat(idx);
                              }}
                              className={`p-1.5 rounded-lg ${darkMode ? "hover:bg-white/20" : "hover:bg-black/20"}`}
                              title="Rename"
                            >
                              <span className="text-xs">✏️</span>
                            </motion.div>
                            <motion.div
                              role="button"
                              tabIndex={0}
                              whileHover={{ scale: 1.2 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteChat(idx);
                              }}
                              className="p-1.5 rounded-lg hover:bg-red-500/20"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </motion.div>
                          </div>
                        </div>
                      </motion.button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              <div className={`border-t ${darkMode ? "border-white/10 bg-gray-900/30" : "border-black/10 bg-white/30"} p-4 space-y-2 backdrop-blur-xl`}>
                <div className={`text-xs font-bold ${darkMode ? "text-gray-400" : "text-gray-600"} uppercase tracking-wider mb-3`}>
                  Quick Actions
                </div>
                <motion.button
                  whileHover={{ scale: 1.02, x: 2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={copyToClipboard}
                  className={`w-full px-4 py-3 rounded-xl ${darkMode ? "bg-gradient-to-r from-gray-800 to-gray-700" : "bg-gradient-to-r from-gray-200 to-gray-300"} ${darkMode ? "text-white" : "text-black"} font-medium shadow-lg hover:shadow-xl transition-all flex items-center gap-2`}
                >
                  <Copy className="h-5 w-5" />
                  Copy Chat
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02, x: 2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={exportChatAsJSON}
                  className={`w-full px-4 py-3 rounded-xl ${darkMode ? "bg-gradient-to-r from-gray-700 to-gray-600" : "bg-gradient-to-r from-gray-300 to-gray-400"} ${darkMode ? "text-white" : "text-black"} font-medium shadow-lg hover:shadow-xl transition-all flex items-center gap-2`}
                >
                  <Download className="h-5 w-5" />
                  Export JSON
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02, x: 2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={exportChatAsText}
                  className={`w-full px-4 py-3 rounded-xl ${darkMode ? "bg-gradient-to-r from-gray-600 to-gray-500" : "bg-gradient-to-r from-gray-400 to-gray-500"} ${darkMode ? "text-white" : "text-black"} font-medium shadow-lg hover:shadow-xl transition-all flex items-center gap-2`}
                >
                  <Download className="h-5 w-5" />
                  Export Text
                </motion.button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {!sidebarOpen && !showIntro && (
        <motion.button
          onClick={() => setSidebarOpen(true)}
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          whileHover={{ scale: 1.1, rotate: 5 }}
          whileTap={{ scale: 0.9 }}
          className={`fixed top-5 left-5 z-40 ${darkMode ? "bg-gradient-to-r from-gray-800 to-gray-700" : "bg-gradient-to-r from-gray-200 to-gray-300"} ${darkMode ? "text-white" : "text-black"} p-4 rounded-2xl shadow-2xl`}
          aria-label="Open menu"
        >
          <Menu className="h-6 w-6" />
        </motion.button>
      )}

      <main className={`flex-1 flex flex-col relative transition-all ${showIntro ? "blur-sm pointer-events-none" : ""}`}>
        <header className={`sticky top-0 z-30 h-20 border-b ${darkMode ? "border-white/10 bg-gradient-to-r from-black to-gray-900" : "border-black/10 bg-gradient-to-r from-white to-gray-100"} ${darkMode ? "text-white" : "text-black"} backdrop-blur-2xl shadow-xl`}>
          <div className="h-full px-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.div
                className={`h-12 w-12 rounded-2xl ${darkMode ? "bg-white/20 border-white/30" : "bg-black/20 border-black/30"} backdrop-blur-xl flex items-center justify-center border`}
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                <Bot className="h-7 w-7" />
              </motion.div>
              <div>
                <h1 className="text-lg font-bold">{activeTitle}</h1>
                <div className="flex items-center gap-2 text-sm opacity-90">
                  <motion.div
                    className="w-2 h-2 bg-green-500 rounded-full"
                    animate={{ scale: [1, 1.3, 1], opacity: [1, 0.5, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  <span>Online • Ready to assist</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={goPrevChat}
                disabled={activeIndex <= 0}
                className={`p-2.5 rounded-xl ${darkMode ? "hover:bg-white/20" : "hover:bg-black/20"} disabled:opacity-40 disabled:cursor-not-allowed transition`}
                title="Previous chat"
              >
                <ChevronLeft className="h-6 w-6" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={goNextChat}
                disabled={activeIndex >= history.length - 1}
                className={`p-2.5 rounded-xl ${darkMode ? "hover:bg-white/20" : "hover:bg-black/20"} disabled:opacity-40 disabled:cursor-not-allowed transition`}
                title="Next chat"
              >
                <ChevronRight className="h-6 w-6" />
              </motion.button>

              <div className={`w-px h-6 ${darkMode ? "bg-white/30" : "bg-black/30"} mx-1`} />

              <motion.button
                whileHover={{ scale: 1.1, rotate: 180 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setDarkMode((d) => !d)}
                className={`p-2.5 rounded-xl ${darkMode ? "hover:bg-white/20" : "hover:bg-black/20"} transition`}
                title="Toggle theme"
              >
                {darkMode ? <Sun className="h-6 w-6" /> : <Moon className="h-6 w-6" />}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowFloatingMenu(!showFloatingMenu)}
                className={`p-2.5 rounded-xl ${darkMode ? "hover:bg-white/20" : "hover:bg-black/20"} transition`}
                title="More options"
              >
                <MoreVertical className="h-6 w-6" />
              </motion.button>
            </div>
          </div>
        </header>

        <AnimatePresence>
          {showFloatingMenu && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -10 }}
              className={`absolute top-24 right-6 z-40 ${darkMode ? "bg-gray-900/90 border-white/20" : "bg-white/90 border-black/20"} backdrop-blur-2xl rounded-2xl shadow-2xl border p-2 min-w-[200px]`}
            >
              <motion.button
                whileHover={{ x: 4, backgroundColor: darkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)" }}
                onClick={() => {
                  if (!confirm("Clear all messages in current chat?")) return;
                  setMessages([]);
                  persistActiveMessages([]);
                  setShowFloatingMenu(false);
                  addToast("Chat cleared", "info");
                }}
                className="w-full px-4 py-3 rounded-xl text-left flex items-center gap-3 transition"
              >
                <Trash2 className="h-5 w-5" />
                <span className="font-medium">Clear Chat</span>
              </motion.button>
              <motion.button
                whileHover={{ x: 4, backgroundColor: darkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)" }}
                onClick={() => {
                  copyToClipboard();
                  setShowFloatingMenu(false);
                }}
                className="w-full px-4 py-3 rounded-xl text-left flex items-center gap-3 transition"
              >
                <Copy className="h-5 w-5" />
                <span className="font-medium">Copy All</span>
              </motion.button>
              <motion.button
                whileHover={{ x: 4, backgroundColor: darkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)" }}
                onClick={() => {
                  exportChatAsJSON();
                  setShowFloatingMenu(false);
                }}
                className="w-full px-4 py-3 rounded-xl text-left flex items-center gap-3 transition"
              >
                <Download className="h-5 w-5" />
                <span className="font-medium">Download</span>
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`px-6 py-3 border-b ${darkMode ? "border-white/10 bg-yellow-900/20" : "border-black/10 bg-yellow-100/80"} backdrop-blur-xl`}
        >
          <div className="max-w-5xl mx-auto flex items-center gap-3 text-sm">
            <Shield className={`h-5 w-5 ${darkMode ? "text-yellow-400" : "text-yellow-700"} flex-shrink-0`} />
            <span className={`${darkMode ? "text-gray-300" : "text-gray-800"} flex-1`}>
              <strong>Medical Disclaimer:</strong> AI-generated health information is for educational purposes only. Always
              consult healthcare professionals for medical advice.
            </span>
          </div>
        </motion.div>

        <div
          ref={chatBodyRef}
          className="flex-1 overflow-y-auto p-6 space-y-6"
          style={{
            background: darkMode
              ? "linear-gradient(to bottom right, #000000, #1a1a1a)"
              : "linear-gradient(to bottom right, #ffffff, #f5f5f5)",
          }}
        >
          <AnimatePresence mode="popLayout">
            {messages.length === 0 && !isTyping && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center h-full text-center py-20"
              >
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="mb-6"
                >
                  <div className={`w-32 h-32 ${darkMode ? "bg-gradient-to-br from-gray-800 to-gray-700" : "bg-gradient-to-br from-gray-200 to-gray-300"} rounded-3xl flex items-center justify-center shadow-2xl`}>
                    <MessageSquare className="w-16 h-16" />
                  </div>
                </motion.div>
                <h2 className={`text-3xl font-bold mb-3 ${darkMode ? "text-gray-100" : "text-gray-900"}`}>Start a Conversation</h2>
                <p className={`${darkMode ? "text-gray-400" : "text-gray-600"} max-w-md`}>
                  Describe your symptoms or health concerns, and I'll provide helpful information and guidance.
                </p>
              </motion.div>
            )}

            {messages.map((msg, idx) => (
              <motion.div
                key={msg.id || idx}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, type: "spring" }}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div className={`flex items-start gap-3 max-w-3xl ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.1 }}
                    className={`flex-shrink-0 w-11 h-11 rounded-2xl flex items-center justify-center shadow-lg ${
                      msg.role === "bot"
                        ? darkMode ? "bg-gradient-to-br from-gray-700 to-gray-600" : "bg-gradient-to-br from-gray-300 to-gray-400"
                        : darkMode ? "bg-gradient-to-br from-gray-600 to-gray-500" : "bg-gradient-to-br from-gray-400 to-gray-500"
                    }`}
                  >
                    {msg.role === "bot" ? <Bot className="h-6 w-6" /> : <User className="h-6 w-6" />}
                  </motion.div>

                  <div className="flex flex-col gap-2 max-w-full">
                    <motion.div
                      whileHover={{ scale: 1.01 }}
                      className={`relative group rounded-3xl px-5 py-4 shadow-xl backdrop-blur-xl border ${
                        msg.role === "user"
                          ? darkMode 
                            ? "bg-gradient-to-r from-gray-800 to-gray-700 text-white border-transparent"
                            : "bg-gradient-to-r from-gray-200 to-gray-300 text-black border-transparent"
                          : darkMode
                          ? "bg-gray-800/90 text-gray-100 border-gray-700/50"
                          : "bg-white/90 text-gray-900 border-gray-200/50"
                      }`}
                    >
                      <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{msg.content}</p>

                      <div
                        className={`text-[10px] mt-2 flex items-center gap-2 ${
                          msg.role === "user" 
                            ? darkMode ? "justify-end text-white/70" : "justify-end text-black/70"
                            : darkMode ? "justify-start text-gray-500" : "justify-start text-gray-600"
                        }`}
                      >
                        <Clock className="h-3 w-3" />
                        <span>{msg.time ? new Date(msg.time).toLocaleTimeString() : ""}</span>
                      </div>

                      {msg.role === "bot" && (
                        <div className="absolute -bottom-2 right-4 opacity-0 group-hover:opacity-100 transition-all">
                          <div className={`flex gap-1 ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} rounded-full px-2 py-1 shadow`}>
                            {["👍", "❤️", "🎉", "🤔"].map((emoji) => (
                              <motion.button
                                key={emoji}
                                whileHover={{ scale: 1.3 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => addReaction(msg.id || "", emoji)}
                                className={`text-sm ${darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"} rounded-full w-6 h-6 flex items-center justify-center ${
                                  msg.reactions?.includes(emoji) ? (darkMode ? "bg-gray-700" : "bg-gray-200") : ""
                                }`}
                              >
                                {emoji}
                              </motion.button>
                            ))}
                          </div>
                        </div>
                      )}
                    </motion.div>

                    {msg.reactions && msg.reactions.length > 0 && (
                      <div className="flex gap-1 flex-wrap pl-2">
                        {msg.reactions.map((emoji, i) => (
                          <span
                            key={i}
                            className={`px-2 py-1 ${darkMode ? "bg-gray-800/80" : "bg-white/80"} rounded-full text-xs shadow`}
                          >
                            {emoji}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex justify-start"
            >
              <div className="flex items-start gap-3 max-w-3xl">
                <div className={`flex-shrink-0 w-11 h-11 rounded-2xl ${darkMode ? "bg-gradient-to-br from-gray-700 to-gray-600" : "bg-gradient-to-br from-gray-300 to-gray-400"} flex items-center justify-center shadow-lg`}>
                  <Bot className="h-6 w-6" />
                </div>
                <div className={`rounded-3xl px-6 py-4 ${darkMode ? "bg-gray-800/90 border-gray-700/50" : "bg-white/90 border-gray-200/50"} backdrop-blur-xl border shadow-xl`}>
                  <div className="flex items-center gap-2">
                    <motion.div
                      className={`w-2.5 h-2.5 ${darkMode ? "bg-gray-400" : "bg-gray-600"} rounded-full`}
                      animate={{ scale: [1, 1.3, 1], opacity: [1, 0.5, 1] }}
                      transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                    />
                    <motion.div
                      className={`w-2.5 h-2.5 ${darkMode ? "bg-gray-500" : "bg-gray-700"} rounded-full`}
                      animate={{ scale: [1, 1.3, 1], opacity: [1, 0.5, 1] }}
                      transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                    />
                    <motion.div
                      className={`w-2.5 h-2.5 ${darkMode ? "bg-gray-600" : "bg-gray-800"} rounded-full`}
                      animate={{ scale: [1, 1.3, 1], opacity: [1, 0.5, 1] }}
                      transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                    />
                    <span className={`ml-2 text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>AI is thinking...</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        <AnimatePresence>
          {showScrollBtn && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={scrollToBottom}
              className={`fixed bottom-32 right-8 ${darkMode ? "bg-gradient-to-r from-gray-800 to-gray-700" : "bg-gradient-to-r from-gray-200 to-gray-300"} ${darkMode ? "text-white" : "text-black"} p-4 rounded-2xl shadow-2xl z-30`}
              title="Scroll to bottom"
            >
              <span className="text-2xl">↓</span>
            </motion.button>
          )}
        </AnimatePresence>

        {!showIntro && (
          <div className={`border-t ${darkMode ? "border-white/10 bg-gray-900/80" : "border-black/10 bg-white/80"} backdrop-blur-2xl p-6 shadow-2xl`}>
            <div className="max-w-5xl mx-auto">
              <div className="flex items-end gap-3">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    setIsRecording(!isRecording);
                    addToast(isRecording ? "Recording stopped" : "Recording started", "info");
                  }}
                  className={`flex-shrink-0 p-4 rounded-2xl transition-all shadow-lg ${
                    isRecording
                      ? "bg-gradient-to-r from-red-500 to-pink-500 text-white animate-pulse"
                      : darkMode
                      ? "bg-gradient-to-r from-gray-700 to-gray-600 text-gray-300"
                      : "bg-gradient-to-r from-gray-200 to-gray-300 text-gray-700"
                  }`}
                  title={isRecording ? "Stop recording" : "Start voice input"}
                >
                  <Mic className="h-6 w-6" />
                </motion.button>

                <div className="flex-1 relative">
                  <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    placeholder="Describe your symptoms or health concerns..."
                    disabled={isTyping}
                    className={`w-full min-h-[70px] max-h-48 resize-none rounded-2xl px-5 py-4 pr-14 text-sm border-2 transition-all ${
                      darkMode
                        ? "bg-gray-800/90 text-gray-100 border-gray-700 focus:border-gray-500"
                        : "bg-white/90 text-gray-900 border-gray-200 focus:border-gray-400"
                    } focus:ring-4 ${darkMode ? "focus:ring-gray-500/20" : "focus:ring-gray-400/20"} outline-none shadow-lg backdrop-blur-xl`}
                    aria-label="Message input"
                  />

                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 15 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleSend()}
                    disabled={isTyping || !input.trim()}
                    className={`absolute right-3 bottom-3 h-12 w-12 rounded-xl ${darkMode ? "bg-gradient-to-r from-gray-700 to-gray-600" : "bg-gradient-to-r from-gray-300 to-gray-400"} flex items-center justify-center ${darkMode ? "text-white" : "text-black"} shadow-xl hover:shadow-2xl disabled:opacity-40 disabled:cursor-not-allowed transition-all`}
                    aria-label="Send message"
                  >
                    <Send className="h-6 w-6" />
                  </motion.button>

                  <div className={`absolute bottom-3 left-5 text-xs ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                    {input.length} characters
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    if (!confirm("Clear current chat?")) return;
                    setMessages([]);
                    persistActiveMessages([]);
                  }}
                  className={`flex-shrink-0 px-5 py-4 rounded-2xl ${darkMode ? "bg-gradient-to-r from-red-600 to-red-500" : "bg-gradient-to-r from-red-400 to-red-500"} text-white font-medium shadow-lg hover:shadow-xl transition-all flex items-center gap-2`}
                  title="Clear chat"
                >
                  <Trash2 className="h-5 w-5" />
                  <span className="hidden sm:inline">Clear</span>
                </motion.button>
              </div>

              <div className={`mt-3 flex items-center justify-between text-xs ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                <div className="flex items-center gap-4">
                  <span>Press <kbd className={`px-2 py-1 ${darkMode ? "bg-gray-700" : "bg-gray-200"} rounded`}>Enter</kbd> to send</span>
                  <span>•</span>
                  <span><kbd className={`px-2 py-1 ${darkMode ? "bg-gray-700" : "bg-gray-200"} rounded`}>Shift + Enter</kbd> for new line</span>
                </div>
                <button
                  onClick={() => window.open('/medical-analysis', '_blank')}
                  className={`p-2 ${darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"} rounded`}
                  title="Upload image"
                >
                  <Camera className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}