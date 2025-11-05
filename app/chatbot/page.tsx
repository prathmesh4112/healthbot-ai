"use client";

/**
 * Full page.tsx - HealthBot AI Chat UI
 *
 * - Hydration-safe animated background (dots generated on client only)
 * - Intro poster (blocks interaction until dismissed)
 * - Sidebar with chat history & new chat creation
 * - Prev / Next navigation between saved chats
 * - Typing indicator, scroll-to-bottom, auto-resize textarea
 * - Dark mode toggle
 *
 * Drop this into app/chatbot/page.tsx (or your equivalent route).
 */

import React, { useEffect, useRef, useState } from "react";
import { Icon } from "@iconify/react";
import { motion, AnimatePresence } from "framer-motion";

/* ----------------------------- Types ----------------------------- */

type Message = {
  role: "user" | "bot";
  content: string;
};

type ChatHistory = {
  title: string;
  messages: Message[];
};

/* ------------------------- BackgroundDots ------------------------ */
/**
 * Animated dotted background for the intro/poster.
 * IMPORTANT: positions are generated in a useEffect (client-only) to avoid SSR hydration mismatch.
 */
function BackgroundDots({
  count = 28,
  areaPaddingPercent = 0,
}: {
  count?: number;
  areaPaddingPercent?: number;
}) {
  const [dots, setDots] = useState<{ top: string; left: string; delay: number }[]>([]);

  useEffect(() => {
    // Generate random positions on client only (no SSR mismatch)
    const positions = Array.from({ length: count }).map((_, i) => ({
      top: `${Math.random() * (100 - areaPaddingPercent)}%`,
      left: `${Math.random() * (100 - areaPaddingPercent)}%`,
      delay: Math.random() * 3, // slight random delay per dot
    }));
    setDots(positions);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once on mount

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {dots.map((d, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-white rounded-full opacity-30"
          style={{ top: d.top, left: d.left }}
          initial={{ opacity: 0, y: 0 }}
          animate={{ opacity: [0.3, 0.9, 0.3], y: [0, -14, 0] }}
          transition={{
            duration: 4 + (i % 5),
            repeat: Infinity,
            ease: "easeInOut",
            delay: d.delay,
          }}
        />
      ))}
    </div>
  );
}

/* -------------------------- Helper Utils ------------------------- */

/** Safe localStorage helpers (guards for SSR) */
const storageAvailable = typeof window !== "undefined" && !!window.localStorage;
function loadChatHistoryFromStorage(key = "healthbot_history"): ChatHistory[] {
  try {
    if (!storageAvailable) return [];
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
    return [];
  } catch {
    return [];
  }
}
function saveChatHistoryToStorage(history: ChatHistory[], key = "healthbot_history") {
  try {
    if (!storageAvailable) return;
    localStorage.setItem(key, JSON.stringify(history));
  } catch {
    // ignore
  }
}

/* ----------------------------- Page ------------------------------ */

export default function Page() {
  /* ----- UI / local state ----- */
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>("");
  const [history, setHistory] = useState<ChatHistory[]>(() => {
    // initial in-memory history with two example chats
    return [
      { title: "Headache Check", messages: [] },
      { title: "Fever Symptoms", messages: [] },
    ];
  });
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [showScrollBtn, setShowScrollBtn] = useState<boolean>(false);
  const [showIntro, setShowIntro] = useState<boolean>(true);

  /* ----- refs ----- */
  const chatBodyRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  /* ----- Hydration-safe: load persistent history on client ----- */
  useEffect(() => {
    // load saved history (if any)
    if (typeof window === "undefined") return;
    const fromStorage = loadChatHistoryFromStorage();
    if (fromStorage.length) {
      setHistory(fromStorage);
      // keep activeIndex safe
      setActiveIndex(0);
      setMessages(fromStorage[0]?.messages ?? []);
    } else {
      // no saved history: keep initial states
      setMessages(history[0]?.messages ?? []);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ----- Persist history on changes ----- */
  useEffect(() => {
    saveChatHistoryToStorage(history);
  }, [history]);

  /* ----- apply dark class on html for tailwind dark mode ----- */
  useEffect(() => {
    if (darkMode) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, [darkMode]);

  /* -------------------- chat history helpers -------------------- */
  function saveChat(newMessages: Message[]) {
    setHistory(prev => {
      const next = [...prev];
      // ensure slot exists
      if (!next[activeIndex]) {
        next[activeIndex] = { title: `Chat ${activeIndex + 1}`, messages: [] };
      }
      next[activeIndex] = { ...next[activeIndex], messages: newMessages };
      return next;
    });
  }

  function resumeChatFromHistory(index: number) {
    setActiveIndex(index);
    setMessages(history[index]?.messages ?? []);
  }

  function createNewChat(title = "New Chat") {
    setHistory(prev => {
      const next = [{ title, messages: [] }, ...prev];
      saveChatHistoryToStorage(next);
      return next;
    });
    setActiveIndex(0);
    setMessages([]);
  }

  function renameChat(index: number) {
    const newName = prompt("Enter new chat title:", history[index]?.title ?? `Chat ${index + 1}`);
    if (!newName) return;
    setHistory(prev => {
      const next = [...prev];
      next[index] = { ...next[index], title: newName };
      saveChatHistoryToStorage(next);
      return next;
    });
  }

  function deleteChat(index: number) {
    if (!confirm("Are you sure you want to delete this chat?")) return;
    setHistory(prev => {
      const next = prev.filter((_, i) => i !== index);
      // adjust active index
      const newActive = Math.max(0, Math.min(next.length - 1, activeIndex === index ? 0 : activeIndex));
      setActiveIndex(newActive);
      setMessages(next[newActive]?.messages ?? []);
      saveChatHistoryToStorage(next);
      return next;
    });
  }

  /* -------------------- send / receive -------------------- */
  async function handleSend() {
    if (!input.trim()) return;
    const captured = input.trim();
    setInput("");

    // Build nextMessages explicitly (avoid stale closure/hydration issues)
    const nextMessages = [...messages, { role: "user", content: captured } as Message];
    setMessages(nextMessages);
    saveChat(nextMessages);

    // Hide intro if first message from poster
    if (showIntro) setShowIntro(false);

    // set typing and call API
    setIsTyping(true);

    try {
      // Replace with your actual API call (llama3.latest) when ready.
      // Keep this call as a standard fetch to your server-side route, or if using direct
      // to an external service put proper CORS/auth.
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: captured }),
      });

      const data = await res.json();

      const botText = data?.reply ?? data?.error ?? "No reply from server.";

      const withBot = [...nextMessages, { role: "bot", content: botText } as Message];
      setMessages(withBot);
      saveChat(withBot);
    } catch (err) {
      // If API fails, show fallback bot message
      // const withBot = [...nextMessages, { role: "bot", content: "Sorry, something went wrong while contacting the server." }];
      // setMessages(withBot);
      // saveChat(withBot);
    } finally {
      setIsTyping(false);
      // scroll to bottom after a short timeout for smoothness
      setTimeout(() => scrollToBottom(), 90);
    }
  }

  /* -------------------- Prev / Next navigation -------------------- */
  function goPrevChat() {
    if (history.length === 0) return;
    const newIdx = Math.max(0, activeIndex - 1);
    setActiveIndex(newIdx);
    setMessages(history[newIdx]?.messages ?? []);
  }

  function goNextChat() {
    if (history.length === 0) return;
    const newIdx = Math.min(history.length - 1, activeIndex + 1);
    setActiveIndex(newIdx);
    setMessages(history[newIdx]?.messages ?? []);
  }

  /* -------------------- textarea helpers -------------------- */
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

  /* -------------------- scroll helpers -------------------- */
  useEffect(() => {
    if (!chatBodyRef.current) return;
    // always scroll to bottom when messages or typing state change
    chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
  }, [messages, isTyping]);

  useEffect(() => {
    const container = chatBodyRef.current;
    if (!container) return;
    const onScroll = () => {
      setShowScrollBtn(container.scrollTop < container.scrollHeight - 500);
    };
    container.addEventListener("scroll", onScroll);
    return () => container.removeEventListener("scroll", onScroll);
  }, []);

  function scrollToBottom() {
    if (!chatBodyRef.current) return;
    chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
  }

  /* -------------------- small UI helpers -------------------- */
  const trimmedActiveTitle = history[activeIndex]?.title ?? "AI Health Assistant";

  /* -------------------- Render -------------------- */
  return (
    <div
      className={`flex h-screen w-full relative overflow-hidden ${darkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-black"}`}
      aria-live="polite"
    >
      {/* -------------------- Intro Poster (blocks UI until dismissed) -------------------- */}
      <AnimatePresence>
        {showIntro && (
          <motion.div
            className="absolute inset-0 z-50 flex flex-col items-center justify-center px-6 text-center bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 text-white"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="dialog"
            aria-modal="true"
            aria-label="Welcome to HealthBot AI"
          >
            {/* client-only animated background dots (no SSR randomness) */}
            <BackgroundDots count={32} />

            <motion.h1
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.15 }}
              className="text-4xl sm:text-5xl font-extrabold mb-4 drop-shadow-lg"
            >
              Welcome to <span className="text-yellow-300">HealthBot AI</span>
            </motion.h1>

            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-lg max-w-2xl mb-6 opacity-95"
            >
              A quick symptom checker that suggests possible causes and next steps.
              <br />
              Always consult a healthcare professional for medical advice.
            </motion.p>

            <div className="flex gap-3">
              <motion.button
                onClick={() => {
                  setShowIntro(false);
                }}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.98 }}
                className="px-6 py-3 bg-white text-indigo-700 font-semibold rounded-xl shadow-lg hover:bg-gray-100 transition"
              >
                Start Chat
              </motion.button>

              <motion.button
                onClick={() => {
                  // create a quick sample chat and start
                  createNewChat("Quick Check");
                  setShowIntro(false);
                }}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.98 }}
                className="px-6 py-3 bg-indigo-700 text-white font-semibold rounded-xl shadow-lg hover:bg-indigo-800 transition"
              >
                Start a Quick Check
              </motion.button>
            </div>

            <p className="mt-6 text-xs opacity-80 max-w-xl">
              Note: this assistant is for general guidance only and does not replace professional medical diagnosis.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* -------------------- Sidebar -------------------- */}
      <AnimatePresence>
        {sidebarOpen && !showIntro && (
          <>
            {/* overlay on mobile */}
            <motion.div
              className="fixed inset-0 bg-black bg-opacity-40 z-40 md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
            />

            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ duration: 0.28 }}
              className="fixed md:static z-50 h-full w-72 flex flex-col border-r border-gray-200 dark:border-gray-700 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md shadow-2xl"
              aria-label="Chat sidebar"
            >
              <header className="px-4 py-3 flex items-center justify-between bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center">
                    <Icon icon="medical-icon:i-health-services" className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">HealthBot AI</h3>
                    <p className="text-xs opacity-80">Symptom Checker</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    title="New chat"
                    onClick={() => createNewChat()}
                    className="p-1 rounded hover:bg-white/10"
                  >
                    <Icon icon="mdi:plus" className="h-5 w-5" />
                  </button>
                  <button
                    title="Close sidebar"
                    onClick={() => setSidebarOpen(false)}
                    className="p-1 rounded hover:bg-white/10"
                  >
                    <Icon icon="mdi:close" className="h-5 w-5" />
                  </button>
                </div>
              </header>

              <div className="flex-1 overflow-y-auto px-3 py-4">
                <div className="mb-3 text-xs font-medium text-gray-600 dark:text-gray-300">Chat History</div>

                <div className="space-y-2">
                  {history.length === 0 && (
                    <div className="text-xs text-gray-500">No chats yet — create one above.</div>
                  )}

                  {history.map((chat, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          resumeChatFromHistory(idx);
                          setSidebarOpen(false);
                        }}
                        className={`flex-1 text-left truncate px-3 py-2 rounded-md transition ${
                          activeIndex === idx
                            ? "bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-300"
                            : "hover:bg-gray-100 dark:hover:bg-gray-700"
                        }`}
                        title={chat.title}
                      >
                        <div className="flex items-center justify-between">
                          <span className="truncate">{chat.title}</span>
                          <span className="text-xs opacity-70 ml-2">{chat.messages.length}</span>
                        </div>
                      </button>

                      <div className="flex flex-col gap-1">
                        <button
                          title="Rename"
                          onClick={() => renameChat(idx)}
                          className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <Icon icon="mdi:pencil" className="h-4 w-4" />
                        </button>
                        <button
                          title="Delete"
                          onClick={() => deleteChat(idx)}
                          className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-700"
                        >
                          <Icon icon="mdi:delete" className="h-4 w-4 text-red-500" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 border-t pt-3">
                  <div className="text-xs text-gray-600 dark:text-gray-300 mb-1">Quick actions</div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        // copy conversation to clipboard
                        const text = messages.map(m => `${m.role}: ${m.content}`).join("\n\n");
                        if (navigator.clipboard) navigator.clipboard.writeText(text);
                        alert("Chat copied to clipboard (quick).");
                      }}
                      className="flex-1 px-3 py-2 rounded bg-gray-100 dark:bg-gray-700 hover:brightness-95 text-sm"
                    >
                      Copy current chat
                    </button>
                  </div>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Sidebar open floating button (mobile) */}
      {!sidebarOpen && !showIntro && (
        <motion.button
          onClick={() => setSidebarOpen(true)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed top-4 left-4 z-40 bg-indigo-600 text-white p-3 rounded-full shadow-lg hover:bg-indigo-700"
          aria-label="Open menu"
        >
          <Icon icon="mdi:menu" className="h-5 w-5" />
        </motion.button>
      )}

      {/* -------------------- Main Chat Area -------------------- */}
      <main className={`flex-1 flex flex-col transition-all ${showIntro ? "blur-sm pointer-events-none" : ""}`} aria-live="polite">
        {/* Header */}
        <header className="sticky top-0 z-20 flex items-center justify-between px-4 sm:px-6 h-16 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-white/20 flex items-center justify-center">
              <Icon icon="mdi:robot" className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="text-sm font-semibold">{trimmedActiveTitle}</div>
              <div className="text-xs opacity-80">Online • Ready to help</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Prev / Next */}
            <button
              onClick={goPrevChat}
              disabled={activeIndex <= 0}
              className="p-2 rounded hover:bg-white/20 disabled:opacity-40"
              aria-label="Previous conversation"
              title="Previous conversation"
            >
              <Icon icon="mdi:chevron-left" className="h-5 w-5" />
            </button>
            <button
              onClick={goNextChat}
              disabled={activeIndex >= history.length - 1}
              className="p-2 rounded hover:bg-white/20 disabled:opacity-40"
              aria-label="Next conversation"
              title="Next conversation"
            >
              <Icon icon="mdi:chevron-right" className="h-5 w-5" />
            </button>

            {/* toggle theme */}
            <motion.button
              whileTap={{ rotate: 180 }}
              onClick={() => setDarkMode(prev => !prev)}
              className="p-2 rounded hover:bg-white/20"
              aria-label="Toggle theme"
              title="Toggle theme"
            >
              <Icon icon={darkMode ? "mdi:weather-sunny" : "mdi:weather-night"} className="h-5 w-5" />
            </motion.button>
          </div>
        </header>

        {/* Messages area */}
        <div ref={chatBodyRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800" role="log" aria-live="polite">
          <AnimatePresence>
            {messages.map((msg, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.28, ease: "easeOut" }}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div className="flex items-start gap-3 max-w-2xl">
                  {msg.role === "bot" && (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-500">
                      <Icon icon="mdi:robot" className="h-4 w-4 text-white" />
                    </div>
                  )}

                  <div className={`border rounded-2xl px-4 py-3 shadow backdrop-blur-sm ${msg.role === "user" ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white" : darkMode ? "bg-gray-700 text-gray-100" : "bg-white text-black"}`}>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                  </div>

                  {msg.role === "user" && (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700">
                      <Icon icon="mdi:account" className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing indicator */}
          {isTyping && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="flex justify-start">
              <div className="flex items-center gap-3 max-w-2xl">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-500">
                  <Icon icon="mdi:robot" className="h-4 w-4 text-white" />
                </div>
                <div className="border rounded-2xl shadow px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-100">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" />
                    <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-150" />
                    <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-300" />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* scroll to bottom button */}
        {showScrollBtn && (
          <motion.button onClick={scrollToBottom} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed bottom-28 right-6 bg-indigo-600 text-white p-3 rounded-full shadow-lg hover:bg-indigo-700" title="Go to latest">
            <Icon icon="mdi:arrow-down" className="h-5 w-5" />
          </motion.button>
        )}

        {/* Input panel */}
        {!showIntro && (
          <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 shadow-lg">
            <div className="flex items-end gap-3">
              <div className="flex-1 relative">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  placeholder="Describe your symptoms in detail..."
                  className={`w-full min-h-[60px] max-h-40 resize-none border rounded-lg px-3 py-2 pr-12 text-sm ${darkMode ? "bg-gray-800 text-gray-100" : "bg-gray-50 text-black"} focus:border-indigo-500 focus:ring-2 focus:ring-indigo-400 outline-none transition`}
                  disabled={isTyping}
                  aria-label="Message input"
                />

                <motion.button
                  whileHover={{ scale: 1.06 }}
                  whileTap={{ scale: 0.92 }}
                  onClick={handleSend}
                  disabled={isTyping || !input.trim()}
                  className="absolute right-2 bottom-2 h-10 w-10 rounded-full bg-indigo-500 flex items-center justify-center text-white shadow hover:bg-indigo-600 disabled:opacity-50"
                  aria-label="Send message"
                >
                  <Icon icon="mdi:send" className="h-5 w-5" />
                </motion.button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
