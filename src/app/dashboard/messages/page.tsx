'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useTenant } from '@/context/TenantContext';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { Send, Search } from 'lucide-react';

export default function CoachMessagesPage() {
  const { currentUser } = useAuth();
  const { currentOrganization } = useTenant();
  const { messages, memberships, users, sendMessage, markMessagesAsRead } = useData();

  const orgId = currentOrganization?.id || 'org_1';
  const orgMembers = memberships.filter((m) => m.organizationId === orgId && m.role === 'member');

  const [selectedUserId, setSelectedUserId] = useState<string>(orgMembers[0]?.userId || 'usr_member_1');
  const [inputText, setInputText] = useState('');
  const [searchMember, setSearchMember] = useState('');

  const selectedUser = users.find((u) => u.id === selectedUserId);

  // Filter messages for selected conversation
  const activeConversation = useMemo(() => {
    return messages.filter(
      (m) =>
        m.organizationId === orgId &&
        ((m.senderUserId === currentUser?.id && m.receiverUserId === selectedUserId) ||
          (m.senderUserId === selectedUserId && m.receiverUserId === currentUser?.id))
    );
  }, [messages, orgId, currentUser, selectedUserId]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !currentUser || !selectedUser) return;

    sendMessage({
      organizationId: orgId,
      senderUserId: currentUser.id,
      receiverUserId: selectedUser.id,
      senderName: currentUser.name,
      content: inputText.trim(),
    });

    setInputText('');
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Direct Client Messaging
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time chat with your active coaching clients.
          </p>
        </div>

        {/* Messaging Workspace Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
          {/* Member Conversation List */}
          <Card className="p-0 overflow-hidden flex flex-col bg-white shadow-2xs">
            <div className="p-3 border-b border-slate-200 bg-slate-50">
              <Input
                placeholder="Search conversations..."
                leftIcon={<Search className="w-4 h-4 text-teal-700" />}
                value={searchMember}
                onChange={(e) => setSearchMember(e.target.value)}
              />
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
              {orgMembers.map((m) => {
                const u = users.find((usr) => usr.id === m.userId);
                if (!u) return null;
                const isSelected = u.id === selectedUserId;

                // Last message
                const userMsgs = messages.filter(
                  (msg) =>
                    msg.organizationId === orgId &&
                    ((msg.senderUserId === u.id && msg.receiverUserId === currentUser?.id) ||
                      (msg.senderUserId === currentUser?.id && msg.receiverUserId === u.id))
                );
                const lastMsg = userMsgs[userMsgs.length - 1];
                const unread = userMsgs.filter((msg) => msg.receiverUserId === currentUser?.id && !msg.isRead).length;

                return (
                  <button
                    key={m.id}
                    onClick={() => {
                      setSelectedUserId(u.id);
                      if (currentUser) markMessagesAsRead(orgId, currentUser.id, u.id);
                    }}
                    className={`w-full p-3.5 flex items-center justify-between text-left transition-colors cursor-pointer ${
                      isSelected ? 'bg-teal-50/70 border-l-2 border-teal-700' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-xs text-teal-700 overflow-hidden shrink-0">
                        {u.avatar ? <img src={u.avatar} alt={u.name} className="w-full h-full object-cover" /> : u.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate">{u.name}</p>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">
                          {lastMsg ? lastMsg.content : 'No messages yet'}
                        </p>
                      </div>
                    </div>

                    {unread > 0 && (
                      <span className="text-[10px] bg-rose-600 text-white font-bold px-1.5 py-0.5 rounded-full shrink-0">
                        {unread}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </Card>

          {/* Active Conversation Chat Window */}
          <Card className="lg:col-span-2 p-0 flex flex-col justify-between overflow-hidden bg-white shadow-2xs">
            {/* Header */}
            <div className="p-3.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-teal-50 border border-teal-200 flex items-center justify-center font-bold text-xs text-teal-800">
                  {selectedUser?.name.charAt(0) || 'U'}
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900">{selectedUser?.name}</h3>
                  <span className="text-[10px] text-emerald-700 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" /> Active Session
                  </span>
                </div>
              </div>

              <Link href={`/dashboard/members/${orgMembers.find((m) => m.userId === selectedUserId)?.id}`}>
                <Button variant="outline" size="xs">
                  Profile
                </Button>
              </Link>
            </div>

            {/* Chat Thread */}
            <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3 bg-slate-50/50">
              {activeConversation.length === 0 ? (
                <div className="text-center text-xs text-slate-400 my-auto">
                  Start the conversation with {selectedUser?.name}.
                </div>
              ) : (
                activeConversation.map((msg) => {
                  const isMe = msg.senderUserId === currentUser?.id;
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col max-w-[70%] ${
                        isMe ? 'self-end items-end' : 'self-start items-start'
                      }`}
                    >
                      <div
                        className={`p-3 rounded-xl text-xs leading-relaxed ${
                          isMe
                            ? 'bg-teal-700 text-white rounded-br-none'
                            : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none shadow-2xs'
                        }`}
                      >
                        {msg.content}
                      </div>
                      <span className="text-[10px] text-slate-400 mt-1 px-1 font-mono">
                        {new Date(msg.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  );
                })
              )}
            </div>

            {/* Send Input */}
            <form onSubmit={handleSend} className="p-3 border-t border-slate-200 bg-white flex items-center gap-2">
              <Input
                placeholder={`Message ${selectedUser?.name}...`}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="flex-1"
              />
              <Button variant="primary" size="md" type="submit">
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
