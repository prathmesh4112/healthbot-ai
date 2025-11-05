"use client";

/**
 * Enhanced HealthBot AI Chat UI (TypeScript, React + Framer Motion)
 * 
 * New Features:
 * - Advanced glassmorphism design with blur effects
 * - Gradient mesh background animations
 * - Smooth micro-interactions throughout
 * - Enhanced message bubbles with avatars and reactions
 * - Voice input indicator (UI only)
 * - Advanced typing animations
 * - Message reaction emojis
 * - Chat export with multiple formats
 * - Enhanced mobile responsiveness
 * - Floating action menu
 * - Advanced scroll animations
 * - Loading skeleton states
 * - Toast notifications
 * - Advanced dark mode with smooth transitions
 */

import React, { useEffect, useRef, useState } from "react";
import { Icon } from "@iconify/react";
import { motion, AnimatePresence, useAnimation } from "framer-motion";

/* ----------------------------- Types ----------------------------- */

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
  avatar?: string;
  color?: string;
};

type Toast = {
  id: string;
  message: string;
  type: "success" | "error" | "info";
};

/* ------------------------ Animated Background Mesh ------------------------- */

function AnimatedMeshBackground({ darkMode }: { darkMode: boolean }) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
      <motion.div
        className="absolute -top-1/2 -left-1/2 w-full h-full rounded-full blur-3xl"
        style={{
          background: darkMode
            ? "radial-gradient(circle, rgba(99, 102, 241, 0.3) 0%, transparent 70%)"
            : "radial-gradient(circle, rgba(139, 92, 246, 0.3) 0%, transparent 70%)",
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
            ? "radial-gradient(circle, rgba(236, 72, 153, 0.3) 0%, transparent 70%)"
            : "radial-gradient(circle, rgba(244, 114, 182, 0.3) 0%, transparent 70%)",
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

/* ------------------------ Floating Particles ------------------------- */

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
          className={`absolute w-1 h-1 rounded-full ${darkMode ? "bg-purple-400" : "bg-indigo-400"}`}
          style={{ top: p.top, left: p.left }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: [0, 0.6, 0],
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

/* ------------------------- Storage Helpers ------------------------ */

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

/* ------------------------- Toast Notification ------------------------ */

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
                ? "bg-green-500/90 text-white border-green-400"
                : toast.type === "error"
                ? "bg-red-500/90 text-white border-red-400"
                : "bg-blue-500/90 text-white border-blue-400"
            }`}
          >
            <Icon
              icon={
                toast.type === "success"
                  ? "mdi:check-circle"
                  : toast.type === "error"
                  ? "mdi:alert-circle"
                  : "mdi:information"
              }
              className="h-5 w-5"
            />
            <span className="flex-1 text-sm font-medium">{toast.message}</span>
            <button onClick={() => removeToast(toast.id)} className="hover:bg-white/20 rounded p-1">
              <Icon icon="mdi:close" className="h-4 w-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

/* ----------------------------- Main Page ------------------------------ */

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

  /* -------------------- Toast System -------------------- */

  const addToast = (message: string, type: Toast["type"] = "info") => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => removeToast(id), 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  /* -------------------- Initial Load -------------------- */

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
          color: "from-indigo-500 to-purple-500",
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

  /* ------------------------- Chat Helpers ------------------------- */

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
          color: "from-indigo-500 to-purple-500",
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
      "from-indigo-500 to-purple-500",
      "from-pink-500 to-rose-500",
      "from-cyan-500 to-blue-500",
      "from-green-500 to-emerald-500",
      "from-orange-500 to-red-500",
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
          color: "from-indigo-500 to-purple-500",
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

  /* ------------------------- Sending Flow ------------------------- */

  async function handleSend() {
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
      const botMsg: Message = {
        role: "bot",
        content: "Network error: could not contact the server.",
        time: formatTimeISO(),
        id: (Date.now() + 1).toString(),
      };
      const afterBot = [...next, botMsg];
      setMessages(afterBot);
      persistActiveMessages(afterBot);
      addToast("Failed to send message", "error");
    } finally {
      setIsTyping(false);
      setTimeout(scrollToBottom, 100);
    }
  }

  /* -------------------- Navigation -------------------- */

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

  /* --------------------- Textarea Helpers --------------------- */

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

  /* -------------------- Scroll Effects -------------------- */

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

  /* -------------------- Quick Suggestions -------------------- */

  const quickSuggestions = [
    { text: "Headache for 2 days", icon: "mdi:head-question" },
    { text: "High fever and chills", icon: "mdi:thermometer" },
    { text: "Stomach pain after meals", icon: "mdi:stomach" },
    { text: "Sore throat and cough", icon: "mdi:lungs" },
    { text: "Dizziness and nausea", icon: "mdi:motion-sensor" },
  ];

  function applyQuickSuggestion(text: string, sendImmediately = false) {
    setInput(text);
    setTimeout(() => {
      autoResize();
      if (sendImmediately) handleSend();
    }, 10);
  }

  /* -------------------- Message Reactions -------------------- */

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

  /* -------------------- Export Functions -------------------- */

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

  /* -------------------- UI Helpers -------------------- */

  const activeTitle = history[activeIndex]?.title ?? "AI Health Assistant";
  const activeColor = history[activeIndex]?.color ?? "from-indigo-500 to-purple-500";

  /* -------------------- Render -------------------- */

  return (
    <div className={`flex h-screen w-full relative overflow-hidden transition-colors duration-500 ${darkMode ? "bg-gray-950 text-white" : "bg-gray-50 text-black"}`}>
      {/* Animated Background */}
      <AnimatedMeshBackground darkMode={darkMode} />
      <FloatingParticles count={15} darkMode={darkMode} />

      {/* Toast Notifications */}
      <ToastNotification toasts={toasts} removeToast={removeToast} />

      {/* -------------------- Intro Hero -------------------- */}
      <AnimatePresence>
        {showIntro && (
          <motion.div
            className="absolute inset-0 z-50 flex items-center justify-center px-6 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4 }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600" />
            <FloatingParticles count={40} darkMode={false} />

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
                <div className="w-24 h-24 bg-white/20 backdrop-blur-xl rounded-3xl flex items-center justify-center shadow-2xl border border-white/30">
                  <Icon icon="mdi:robot-love" className="w-14 h-14 text-white" />
                </div>
              </motion.div>

              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black mb-4 drop-shadow-2xl text-white">
                Welcome to <span className="text-yellow-300">HealthBot AI</span>
              </h1>

              <p className="text-lg sm:text-xl max-w-3xl mx-auto mb-8 opacity-95 text-white/90 leading-relaxed">
                Your intelligent health companion powered by advanced AI. Get quick symptom analysis, health guidance, and
                personalized wellness insights — available 24/7.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
                <motion.button
                  onClick={() => setShowIntro(false)}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-white text-indigo-700 font-bold rounded-2xl shadow-2xl hover:shadow-white/20 transition-all flex items-center gap-2 group"
                >
                  <Icon icon="mdi:chat" className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                  Start Chatting
                </motion.button>

                <motion.button
                  onClick={() => {
                    createNewChat("Quick Health Check");
                    setShowIntro(false);
                    setTimeout(() => applyQuickSuggestion("I have a persistent headache", true), 300);
                  }}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-indigo-800/80 backdrop-blur-xl text-white font-bold rounded-2xl shadow-2xl border-2 border-white/30 hover:bg-indigo-700/80 transition-all flex items-center gap-2 group"
                >
                  <Icon icon="mdi:lightning-bolt" className="w-5 h-5 group-hover:scale-125 transition-transform" />
                  Quick Check
                </motion.button>
              </div>

              <div className="max-w-2xl mx-auto space-y-4">
                <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-amber-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <Icon icon="mdi:shield-alert" className="w-6 h-6 text-amber-300" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-bold text-white mb-2">Important Medical Disclaimer</h3>
                      <p className="text-sm text-white/80 leading-relaxed">
                        HealthBot AI provides general health information and guidance only. This is <strong>not</strong> a
                        substitute for professional medical advice, diagnosis, or treatment. Always consult with qualified
                        healthcare providers for medical concerns.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                  <div className="bg-white/10 backdrop-blur-xl rounded-xl p-4 border border-white/20">
                    <Icon icon="mdi:clock-fast" className="w-8 h-8 text-white mb-2 mx-auto" />
                    <p className="text-white/90 font-semibold">24/7 Available</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-xl rounded-xl p-4 border border-white/20">
                    <Icon icon="mdi:shield-check" className="w-8 h-8 text-white mb-2 mx-auto" />
                    <p className="text-white/90 font-semibold">Private & Secure</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-xl rounded-xl p-4 border border-white/20">
                    <Icon icon="mdi:brain" className="w-8 h-8 text-white mb-2 mx-auto" />
                    <p className="text-white/90 font-semibold">AI-Powered</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* -------------------- Sidebar -------------------- */}
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
              className="fixed md:static z-50 h-full w-80 flex flex-col border-r border-white/10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-2xl shadow-2xl"
            >
              <header className={`px-5 py-4 bg-gradient-to-r ${activeColor} text-white relative overflow-hidden`}>
                <div className="absolute inset-0 bg-black/10" />
                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <motion.div
                      className="h-12 w-12 rounded-2xl bg-white/20 backdrop-blur-xl flex items-center justify-center border border-white/30"
                      whileHover={{ rotate: 360, scale: 1.1 }}
                      transition={{ duration: 0.6 }}
                    >
                      <Icon icon="mdi:hospital-box" className="h-6 w-6 text-white" />
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
                      className="p-2 rounded-xl hover:bg-white/20 backdrop-blur-xl transition"
                      title="New chat"
                    >
                      <Icon icon="mdi:plus-circle" className="h-6 w-6" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setSidebarOpen(false)}
                      className="p-2 rounded-xl hover:bg-white/20 backdrop-blur-xl transition md:hidden"
                      title="Close"
                    >
                      <Icon icon="mdi:close" className="h-6 w-6" />
                    </motion.button>
                  </div>
                </div>
              </header>

              <div className="flex-1 overflow-y-auto px-4 py-5 space-y-3">
                <div className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                  Chat History ({history.length})
                </div>

                {history.length === 0 && (
                  <div className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
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
                            ? "bg-gradient-to-r " + (chat.color || activeColor) + " text-white border-transparent shadow-xl"
                            : "bg-white/50 dark:bg-gray-800/50 border-transparent hover:border-indigo-500/30 hover:shadow-lg"
                        }`}
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                            activeIndex === idx ? "bg-white/20" : "bg-gradient-to-br " + (chat.color || "from-indigo-500 to-purple-500")
                          }`}>
                            <Icon icon="mdi:chat" className={`w-5 h-5 ${activeIndex === idx ? "text-white" : "text-white"}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-sm truncate">{chat.title}</h4>
                            <p className={`text-xs ${activeIndex === idx ? "text-white/80" : "text-gray-500 dark:text-gray-400"}`}>
                              {chat.messages.length} messages
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className={`text-xs ${activeIndex === idx ? "text-white/70" : "text-gray-400 dark:text-gray-500"}`}>
                            {chat.createdAt ? new Date(chat.createdAt).toLocaleDateString() : ""}
                          </span>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <motion.button
                              whileHover={{ scale: 1.2 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                renameChat(idx);
                              }}
                              className="p-1.5 rounded-lg hover:bg-white/20 dark:hover:bg-gray-700"
                              title="Rename"
                            >
                              <Icon icon="mdi:pencil" className="h-4 w-4" />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.2 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteChat(idx);
                              }}
                              className="p-1.5 rounded-lg hover:bg-red-500/20"
                              title="Delete"
                            >
                              <Icon icon="mdi:delete" className="h-4 w-4 text-red-500" />
                            </motion.button>
                          </div>
                        </div>
                      </motion.button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              <div className="border-t border-white/10 p-4 space-y-2 bg-white/30 dark:bg-gray-900/30 backdrop-blur-xl">
                <div className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-3">
                  Quick Actions
                </div>
                <motion.button
                  whileHover={{ scale: 1.02, x: 2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={copyToClipboard}
                  className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-medium shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                >
                  <Icon icon="mdi:content-copy" className="h-5 w-5" />
                  Copy Chat
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02, x: 2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={exportChatAsJSON}
                  className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-medium shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                >
                  <Icon icon="mdi:code-json" className="h-5 w-5" />
                  Export JSON
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02, x: 2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={exportChatAsText}
                  className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                >
                  <Icon icon="mdi:text-box" className="h-5 w-5" />
                  Export Text
                </motion.button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Floating Sidebar Toggle */}
      {!sidebarOpen && !showIntro && (
        <motion.button
          onClick={() => setSidebarOpen(true)}
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          whileHover={{ scale: 1.1, rotate: 5 }}
          whileTap={{ scale: 0.9 }}
          className="fixed top-5 left-5 z-40 bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 rounded-2xl shadow-2xl hover:shadow-indigo-500/50"
          aria-label="Open menu"
        >
          <Icon icon="mdi:menu" className="h-6 w-6" />
        </motion.button>
      )}

      {/* -------------------- Main Chat Area -------------------- */}
      <main className={`flex-1 flex flex-col relative transition-all ${showIntro ? "blur-sm pointer-events-none" : ""}`}>
        {/* Header */}
        <header className={`sticky top-0 z-30 h-20 border-b border-white/10 bg-gradient-to-r ${activeColor} text-white backdrop-blur-2xl shadow-xl`}>
          <div className="h-full px-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.div
                className="h-12 w-12 rounded-2xl bg-white/20 backdrop-blur-xl flex items-center justify-center border border-white/30"
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                <Icon icon="mdi:robot" className="h-7 w-7 text-white" />
              </motion.div>
              <div>
                <h1 className="text-lg font-bold">{activeTitle}</h1>
                <div className="flex items-center gap-2 text-sm opacity-90">
                  <motion.div
                    className="w-2 h-2 bg-green-400 rounded-full"
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
                className="p-2.5 rounded-xl hover:bg-white/20 disabled:opacity-40 disabled:cursor-not-allowed transition"
                title="Previous chat"
              >
                <Icon icon="mdi:chevron-left" className="h-6 w-6" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={goNextChat}
                disabled={activeIndex >= history.length - 1}
                className="p-2.5 rounded-xl hover:bg-white/20 disabled:opacity-40 disabled:cursor-not-allowed transition"
                title="Next chat"
              >
                <Icon icon="mdi:chevron-right" className="h-6 w-6" />
              </motion.button>

              <div className="w-px h-6 bg-white/30 mx-1" />

              <motion.button
                whileHover={{ scale: 1.1, rotate: 180 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setDarkMode((d) => !d)}
                className="p-2.5 rounded-xl hover:bg-white/20 transition"
                title="Toggle theme"
              >
                <Icon icon={darkMode ? "mdi:white-balance-sunny" : "mdi:moon-waning-crescent"} className="h-6 w-6" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowFloatingMenu(!showFloatingMenu)}
                className="p-2.5 rounded-xl hover:bg-white/20 transition"
                title="More options"
              >
                <Icon icon="mdi:dots-vertical" className="h-6 w-6" />
              </motion.button>
            </div>
          </div>
        </header>

        {/* Floating Action Menu */}
        <AnimatePresence>
          {showFloatingMenu && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -10 }}
              className="absolute top-24 right-6 z-40 bg-white/90 dark:bg-gray-900/90 backdrop-blur-2xl rounded-2xl shadow-2xl border border-white/20 p-2 min-w-[200px]"
            >
              <motion.button
                whileHover={{ x: 4, backgroundColor: "rgba(99, 102, 241, 0.1)" }}
                onClick={() => {
                  if (!confirm("Clear all messages in current chat?")) return;
                  setMessages([]);
                  persistActiveMessages([]);
                  setShowFloatingMenu(false);
                  addToast("Chat cleared", "info");
                }}
                className="w-full px-4 py-3 rounded-xl text-left flex items-center gap-3 transition"
              >
                <Icon icon="mdi:broom" className="h-5 w-5" />
                <span className="font-medium">Clear Chat</span>
              </motion.button>
              <motion.button
                whileHover={{ x: 4, backgroundColor: "rgba(99, 102, 241, 0.1)" }}
                onClick={() => {
                  copyToClipboard();
                  setShowFloatingMenu(false);
                }}
                className="w-full px-4 py-3 rounded-xl text-left flex items-center gap-3 transition"
              >
                <Icon icon="mdi:content-copy" className="h-5 w-5" />
                <span className="font-medium">Copy All</span>
              </motion.button>
              <motion.button
                whileHover={{ x: 4, backgroundColor: "rgba(99, 102, 241, 0.1)" }}
                onClick={() => {
                  exportChatAsJSON();
                  setShowFloatingMenu(false);
                }}
                className="w-full px-4 py-3 rounded-xl text-left flex items-center gap-3 transition"
              >
                <Icon icon="mdi:download" className="h-5 w-5" />
                <span className="font-medium">Download</span>
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Disclaimer Banner */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-6 py-3 border-b border-white/10 bg-amber-500/10 backdrop-blur-xl"
        >
          <div className="max-w-5xl mx-auto flex items-center gap-3 text-sm">
            <Icon icon="mdi:shield-alert" className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
            <span className="text-gray-700 dark:text-gray-300 flex-1">
              <strong>Medical Disclaimer:</strong> AI-generated health information is for educational purposes only. Always
              consult healthcare professionals for medical advice.
            </span>
            <span className="text-xs opacity-70 hidden sm:block"></span>
          </div>
        </motion.div>

        {/* Quick Suggestions */}
        <div className="px-6 py-4 border-b border-white/10 bg-white/30 dark:bg-gray-900/30 backdrop-blur-xl overflow-x-auto">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center gap-3 mb-3">
              <Icon icon="mdi:lightning-bolt" className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Quick Suggestions</span>
            </div>
            <div className="flex gap-2 flex-wrap">
              {quickSuggestions.map((s, i) => (
                <motion.button
                  key={i}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => applyQuickSuggestion(s.text, true)}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-sm font-medium shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                >
                  <Icon icon={s.icon} className="h-4 w-4" />
                  {s.text}
                </motion.button>
              ))}
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div
          ref={chatBodyRef}
          className="flex-1 overflow-y-auto p-6 space-y-6"
          style={{
            background: darkMode
              ? "linear-gradient(to bottom right, #0f172a, #1e1b4b)"
              : "linear-gradient(to bottom right, #f8fafc, #e0e7ff)",
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
                  <div className="w-32 h-32 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-3xl flex items-center justify-center shadow-2xl">
                    <Icon icon="mdi:chat-plus" className="w-16 h-16 text-white" />
                  </div>
                </motion.div>
                <h2 className="text-3xl font-bold mb-3 text-gray-800 dark:text-gray-100">Start a Conversation</h2>
                <p className="text-gray-600 dark:text-gray-400 max-w-md">
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
                  {/* Avatar */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.1 }}
                    className={`flex-shrink-0 w-11 h-11 rounded-2xl flex items-center justify-center shadow-lg ${
                      msg.role === "bot"
                        ? "bg-gradient-to-br from-indigo-500 to-purple-500"
                        : "bg-gradient-to-br from-pink-500 to-rose-500"
                    }`}
                  >
                    <Icon
                      icon={msg.role === "bot" ? "mdi:robot" : "mdi:account-circle"}
                      className="h-6 w-6 text-white"
                    />
                  </motion.div>

                  {/* Message Bubble */}
                  <div className="flex flex-col gap-2 max-w-full">
                    <motion.div
                      whileHover={{ scale: 1.01 }}
                      className={`relative group rounded-3xl px-5 py-4 shadow-xl backdrop-blur-xl border ${
                        msg.role === "user"
                          ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white border-transparent"
                          : darkMode
                          ? "bg-gray-800/90 text-gray-100 border-gray-700/50"
                          : "bg-white/90 text-gray-900 border-gray-200/50"
                      }`}
                    >
                      <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{msg.content}</p>

                      {/* Timestamp */}
                      <div
                        className={`text-[10px] mt-2 flex items-center gap-2 ${
                          msg.role === "user" ? "justify-end text-white/70" : "justify-start text-gray-500"
                        }`}
                      >
                        <Icon icon="mdi:clock-outline" className="h-3 w-3" />
                        <span>{msg.time ? new Date(msg.time).toLocaleTimeString() : ""}</span>
                      </div>

                      {/* Reactions */}
                      {msg.role === "bot" && (
                        <div className="absolute -bottom-2 right-4 opacity-0 group-hover:opacity-100 transition-all">
                          <div className="flex gap-1 bg-white dark:bg-gray-800 rounded-full px-2 py-1 shadow-lg border border-gray-200 dark:border-gray-700">
                            {["👍", "❤️", "🎉", "🤔"].map((emoji) => (
                              <motion.button
                                key={emoji}
                                whileHover={{ scale: 1.3 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => addReaction(msg.id || "", emoji)}
                                className={`text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full w-6 h-6 flex items-center justify-center ${
                                  msg.reactions?.includes(emoji) ? "bg-indigo-100 dark:bg-indigo-900" : ""
                                }`}
                              >
                                {emoji}
                              </motion.button>
                            ))}
                          </div>
                        </div>
                      )}
                    </motion.div>

                    {/* Show reactions if any */}
                    {msg.reactions && msg.reactions.length > 0 && (
                      <div className="flex gap-1 flex-wrap pl-2">
                        {msg.reactions.map((emoji, i) => (
                          <span
                            key={i}
                            className="px-2 py-1 bg-white/80 dark:bg-gray-800/80 rounded-full text-xs shadow"
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

          {/* Typing Indicator */}
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex justify-start"
            >
              <div className="flex items-start gap-3 max-w-3xl">
                <div className="flex-shrink-0 w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg">
                  <Icon icon="mdi:robot" className="h-6 w-6 text-white" />
                </div>
                <div className="rounded-3xl px-6 py-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 shadow-xl">
                  <div className="flex items-center gap-2">
                    <motion.div
                      className="w-2.5 h-2.5 bg-indigo-500 rounded-full"
                      animate={{ scale: [1, 1.3, 1], opacity: [1, 0.5, 1] }}
                      transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                    />
                    <motion.div
                      className="w-2.5 h-2.5 bg-purple-500 rounded-full"
                      animate={{ scale: [1, 1.3, 1], opacity: [1, 0.5, 1] }}
                      transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                    />
                    <motion.div
                      className="w-2.5 h-2.5 bg-pink-500 rounded-full"
                      animate={{ scale: [1, 1.3, 1], opacity: [1, 0.5, 1] }}
                      transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                    />
                    <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">AI is thinking...</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Scroll to Bottom Button */}
        <AnimatePresence>
          {showScrollBtn && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={scrollToBottom}
              className="fixed bottom-32 right-8 bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 rounded-2xl shadow-2xl hover:shadow-indigo-500/50 z-30"
              title="Scroll to bottom"
            >
              <Icon icon="mdi:arrow-down" className="h-6 w-6" />
            </motion.button>
          )}
        </AnimatePresence>

        {/* Input Area */}
        {!showIntro && (
          <div className="border-t border-white/10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-2xl p-6 shadow-2xl">
            <div className="max-w-5xl mx-auto">
              <div className="flex items-end gap-3">
                {/* Voice Recording Button */}
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
                      : "bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 text-gray-700 dark:text-gray-300"
                  }`}
                  title={isRecording ? "Stop recording" : "Start voice input"}
                >
                  <Icon icon={isRecording ? "mdi:stop" : "mdi:microphone"} className="h-6 w-6" />
                </motion.button>

                {/* Text Input */}
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
                        ? "bg-gray-800/90 text-gray-100 border-gray-700 focus:border-indigo-500"
                        : "bg-white/90 text-gray-900 border-gray-200 focus:border-indigo-500"
                    } focus:ring-4 focus:ring-indigo-500/20 outline-none shadow-lg backdrop-blur-xl`}
                    aria-label="Message input"
                  />

                  {/* Send Button */}
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 15 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleSend}
                    disabled={isTyping || !input.trim()}
                    className="absolute right-3 bottom-3 h-12 w-12 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-xl hover:shadow-2xl disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    aria-label="Send message"
                  >
                    <Icon icon="mdi:send" className="h-6 w-6" />
                  </motion.button>

                  {/* Character Count */}
                  <div className="absolute bottom-3 left-5 text-xs text-gray-400">
                    {input.length} characters
                  </div>
                </div>

                {/* Clear Button */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    if (!confirm("Clear current chat?")) return;
                    setMessages([]);
                    persistActiveMessages([]);
                  }}
                  className="flex-shrink-0 px-5 py-4 rounded-2xl bg-gradient-to-r from-red-500 to-pink-500 text-white font-medium shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                  title="Clear chat"
                >
                  <Icon icon="mdi:broom" className="h-5 w-5" />
                  <span className="hidden sm:inline">Clear</span>
                </motion.button>
              </div>

              {/* Helper Text */}
              <div className="mt-3 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-4">
                  <span>Press <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">Enter</kbd> to send</span>
                  <span>•</span>
                  <span><kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">Shift + Enter</kbd> for new line</span>
                </div>
                <span className="opacity-60"></span>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}