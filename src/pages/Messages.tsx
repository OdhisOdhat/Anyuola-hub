import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Mail, 
  Send, 
  Inbox, 
  User, 
  Users, 
  Search, 
  Clock, 
  CheckCircle2, 
  X,
  ChevronRight,
  Plus,
  ArrowLeft
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { fetchMessages, sendMessage, markMessageRead, fetchMembers } from "../lib/api";
import { format } from "date-fns";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function Messages() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<any>(null);
  const [isComposing, setIsComposing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Compose state
  const [composeData, setComposeData] = useState({
    receiver_id: "",
    is_broadcast: false,
    subject: "",
    body: ""
  });

  useEffect(() => {
    loadMessages();
    if (user?.role === "admin") {
      loadMembers();
    }
  }, [user]);

  const loadMessages = async () => {
    setLoading(true);
    try {
      const data = await fetchMessages();
      if (Array.isArray(data)) {
        setMessages(data);
      } else {
        console.error("fetchMessages did not return an array:", data);
        setMessages([]);
      }
    } catch (error) {
      console.error("Error loading messages:", error);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  const loadMembers = async () => {
    if (!user?.clan_id) return;
    try {
      const data = await fetchMembers(user.clan_id);
      if (Array.isArray(data)) {
        setMembers(data);
      } else {
        console.error("fetchMembers did not return an array:", data);
        setMembers([]);
      }
    } catch (error) {
      console.error("Error loading members:", error);
      setMembers([]);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await sendMessage(composeData);
      setIsComposing(false);
      setComposeData({ receiver_id: "", is_broadcast: false, subject: "", body: "" });
      loadMessages();
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleSelectMessage = async (msg: any) => {
    setSelectedMessage(msg);
    if (!msg.is_read && msg.receiver_id === user?.id) {
      try {
        await markMessageRead(msg.id);
        setMessages(messages.map(m => m.id === msg.id ? { ...m, is_read: true } : m));
      } catch (error) {
        console.error("Error marking message as read:", error);
      }
    }
  };

  const filteredMessages = Array.isArray(messages) ? messages.filter(msg => 
    msg.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    msg.sender?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 h-[calc(100vh-120px)]">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
          <p className="text-gray-600">Stay connected with your clan members.</p>
        </div>
        <button
          onClick={() => setIsComposing(true)}
          className="flex items-center gap-2 px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand/90 transition-colors shadow-brand"
        >
          <Plus className="w-5 h-5" />
          <span>New Message</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden h-full flex">
        {/* Sidebar */}
        <div className={cn(
          "w-full md:w-80 border-r border-gray-200 flex flex-col",
          selectedMessage && "hidden md:flex"
        )}>
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search messages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all text-sm"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin w-6 h-6 border-2 border-brand border-t-transparent rounded-full mx-auto mb-2"></div>
                <p className="text-sm text-gray-500">Loading...</p>
              </div>
            ) : filteredMessages.length === 0 ? (
              <div className="p-8 text-center">
                <Inbox className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No messages found</p>
              </div>
            ) : (
              filteredMessages.map((msg) => (
                <button
                  key={msg.id}
                  onClick={() => handleSelectMessage(msg)}
                  className={cn(
                    "w-full p-4 text-left hover:bg-gray-50 transition-colors flex items-start gap-3",
                    selectedMessage?.id === msg.id && "bg-brand/5",
                    !msg.is_read && msg.receiver_id === user?.id && "bg-brand/5"
                  )}
                >
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                    msg.is_broadcast ? "bg-purple-100 text-purple-600" : "bg-blue-100 text-blue-600"
                  )}>
                    {msg.is_broadcast ? <Users className="w-5 h-5" /> : <User className="w-5 h-5" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-semibold text-gray-900 truncate">
                        {msg.is_broadcast ? "Broadcast" : msg.sender?.name}
                      </span>
                      <span className="text-[10px] text-gray-400">
                        {format(new Date(msg.created_at), "MMM d")}
                      </span>
                    </div>
                    <h4 className={cn(
                      "text-sm truncate",
                      !msg.is_read && msg.receiver_id === user?.id ? "font-bold text-gray-900" : "text-gray-600"
                    )}>
                      {msg.subject}
                    </h4>
                    <p className="text-xs text-gray-400 truncate mt-1">
                      {msg.body}
                    </p>
                  </div>
                  {!msg.is_read && msg.receiver_id === user?.id && (
                    <div className="w-2 h-2 bg-brand rounded-full mt-2 shrink-0" />
                  )}
                </button>
              ))
            )}
          </div>
        </div>

        {/* Content */}
        <div className={cn(
          "flex-1 flex flex-col",
          !selectedMessage && "hidden md:flex"
        )}>
          {selectedMessage ? (
            <>
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <button
                  onClick={() => setSelectedMessage(null)}
                  className="md:hidden p-2 text-gray-400 hover:text-gray-600"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center",
                    selectedMessage.is_broadcast ? "bg-purple-100 text-purple-600" : "bg-blue-100 text-blue-600"
                  )}>
                    {selectedMessage.is_broadcast ? <Users className="w-5 h-5" /> : <User className="w-5 h-5" />}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">
                      {selectedMessage.is_broadcast ? "Broadcast Message" : selectedMessage.sender?.name}
                    </h3>
                    <p className="text-xs text-gray-500">
                      Sent on {format(new Date(selectedMessage.created_at), "MMMM d, yyyy 'at' h:mm a")}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-6">
                <div className="max-w-3xl">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">{selectedMessage.subject}</h2>
                  <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap">
                    {selectedMessage.body}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-50/50">
              <div className="text-center">
                <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-8 h-8 text-gray-300" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">Select a message</h3>
                <p className="text-gray-500">Choose a message from the list to read it.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Compose Modal */}
      <AnimatePresence>
        {isComposing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsComposing(false)}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-2xl shadow-xl overflow-hidden"
            >
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">New Message</h2>
                <button
                  onClick={() => setIsComposing(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSend} className="p-6 space-y-4">
                {user?.role === "admin" && (
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl mb-4">
                    <input
                      type="checkbox"
                      id="is_broadcast"
                      checked={composeData.is_broadcast}
                      onChange={(e) => setComposeData({ ...composeData, is_broadcast: e.target.checked, receiver_id: e.target.checked ? "" : composeData.receiver_id })}
                      className="w-4 h-4 text-brand border-gray-300 rounded focus:ring-brand"
                    />
                    <label htmlFor="is_broadcast" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Broadcast to all members
                    </label>
                  </div>
                )}

                {!composeData.is_broadcast && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Recipient</label>
                    <select
                      required
                      value={composeData.receiver_id}
                      onChange={(e) => setComposeData({ ...composeData, receiver_id: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all"
                    >
                      <option value="">Select a member...</option>
                      {members.filter(m => m.id !== user?.id).map(m => (
                        <option key={m.id} value={m.id}>{m.name} ({m.role})</option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Subject</label>
                  <input
                    type="text"
                    required
                    value={composeData.subject}
                    onChange={(e) => setComposeData({ ...composeData, subject: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all"
                    placeholder="Enter subject..."
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Message</label>
                  <textarea
                    rows={8}
                    required
                    value={composeData.body}
                    onChange={(e) => setComposeData({ ...composeData, body: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all resize-none"
                    placeholder="Type your message here..."
                  />
                </div>

                <div className="flex gap-3 pt-6">
                  <button
                    type="button"
                    onClick={() => setIsComposing(false)}
                    className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-brand text-white rounded-xl hover:bg-brand/90 transition-colors shadow-brand flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>Send Message</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
