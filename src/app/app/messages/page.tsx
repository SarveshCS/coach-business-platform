'use client';

import React, { useState } from 'react';
import { ClientAppLayout } from '@/components/layout/ClientAppLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useTenant } from '@/context/TenantContext';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { Send } from 'lucide-react';

export default function ClientMessagesPage() {
  const { currentUser } = useAuth();
  const { currentOrganization } = useTenant();
  const { messages, coachAccounts, sendMessage } = useData();

  const orgId = currentOrganization?.id || 'org_1';
  const targetCoach = coachAccounts.find((c) => c.organizationIds?.includes(orgId)) || coachAccounts[0];

  const [inputMessage, setInputMessage] = useState('');

  // Messages between current member and coach in this org
  const chatMessages = messages.filter(
    (m) =>
      m.organizationId === orgId &&
      ((m.senderUserId === currentUser?.id && m.receiverUserId === (targetCoach?.userId || targetCoach?.id)) ||
        (m.senderUserId === (targetCoach?.userId || targetCoach?.id) && m.receiverUserId === currentUser?.id))
  );

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !currentUser || !targetCoach) return;

    sendMessage({
      organizationId: orgId,
      senderUserId: currentUser.id,
      receiverUserId: targetCoach.userId || targetCoach.id,
      senderName: currentUser.name,
      content: inputMessage.trim(),
    });

    setInputMessage('');
  };

  return (
    <ClientAppLayout>
      <div className="flex flex-col gap-4 pb-6 h-[calc(100vh-140px)]">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Coach Direct Chat</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Direct 1-on-1 line with Coach {targetCoach?.name || 'Coach'}.
          </p>
        </div>

        <Card className="flex-1 p-0 flex flex-col justify-between overflow-hidden bg-white shadow-2xs">
          {/* Top Bar */}
          <div className="p-3.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-xs text-teal-700">
                {targetCoach?.name.charAt(0) || 'C'}
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900">{targetCoach?.name}</h3>
                <span className="text-[10px] text-emerald-700 flex items-center gap-1 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" /> Online Coach
                </span>
              </div>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3">
            {chatMessages.length === 0 ? (
              <div className="text-center text-xs text-slate-400 my-auto">
                No messages yet. Send a message to check in with Coach {targetCoach?.name}!
              </div>
            ) : (
              chatMessages.map((msg) => {
                const isMe = msg.senderUserId === currentUser?.id;
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col max-w-[80%] ${
                      isMe ? 'self-end items-end' : 'self-start items-start'
                    }`}
                  >
                    <div
                      className={`p-3 rounded-xl text-xs leading-relaxed ${
                        isMe
                          ? 'bg-teal-700 text-white rounded-br-none shadow-2xs'
                          : 'bg-slate-100 border border-slate-200 text-slate-900 rounded-bl-none'
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

          {/* Chat Input */}
          <form
            onSubmit={handleSend}
            className="p-3 border-t border-slate-200 bg-slate-50 flex items-center gap-2"
          >
            <Input
              placeholder="Ask your coach anything..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              className="flex-1"
            />
            <Button variant="primary" size="md" type="submit">
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </Card>
      </div>
    </ClientAppLayout>
  );
}
