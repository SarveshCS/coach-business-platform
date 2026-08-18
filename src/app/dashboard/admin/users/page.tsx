'use client';

import React, { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Drawer } from '@/components/ui/Drawer';
import { useData } from '@/context/DataContext';
import { User } from '@/types';
import { Search } from 'lucide-react';

export default function SuperAdminUsersPage() {
  const { users, memberships, organizations } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const filteredUsers = useMemo(() => {
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [users, searchQuery]);

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Global Users & Identity Directory
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Global users maintain a single identity and can hold memberships across multiple tenant organizations.
          </p>
        </div>

        {/* Search */}
        <Card className="p-3.5 bg-white shadow-2xs">
          <Input
            placeholder="Search global users by name or email..."
            leftIcon={<Search className="w-4 h-4 text-teal-700" />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </Card>

        {/* User Table */}
        <Card className="p-0 overflow-hidden bg-white shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="py-3.5 px-4 sm:px-6">User Identity</th>
                  <th className="py-3.5 px-4">Global Role</th>
                  <th className="py-3.5 px-4">Tenant Memberships</th>
                  <th className="py-3.5 px-4">Joined Date</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((user) => {
                  const userMems = memberships.filter((m) => m.userId === user.id);

                  return (
                    <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-xs text-teal-700 overflow-hidden shrink-0">
                            {user.avatar ? (
                              <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                            ) : (
                              user.name.charAt(0)
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 truncate">{user.name}</p>
                            <p className="text-xs text-slate-500 truncate">{user.email}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <Badge
                          variant={
                            user.globalRole === 'super_admin'
                              ? 'active'
                              : user.globalRole === 'coach'
                              ? 'info'
                              : 'default'
                          }
                          size="xs"
                        >
                          {user.globalRole.replace('_', ' ')}
                        </Badge>
                      </td>

                      <td className="py-4 px-4">
                        {userMems.length === 0 ? (
                          <span className="text-xs text-rose-600 font-medium">0 Memberships (Orphan)</span>
                        ) : (
                          <div className="flex flex-col gap-1">
                            {userMems.map((m) => {
                              const org = organizations.find((o) => o.id === m.organizationId);
                              return (
                                <span
                                  key={m.id}
                                  className="inline-flex items-center gap-1.5 text-xs text-slate-700"
                                >
                                  <span className="w-4 h-4 rounded bg-slate-100 border border-slate-200 text-[10px] flex items-center justify-center font-bold text-teal-800">{org?.name.charAt(0) || 'O'}</span>
                                  <span className="font-medium">{org?.name || 'Organization'}</span>
                                  <Badge variant={m.status === 'active' ? 'active' : 'danger'} size="xs">
                                    {m.role}
                                  </Badge>
                                </span>
                              );
                            })}
                          </div>
                        )}
                      </td>

                      <td className="py-4 px-4 text-xs text-slate-500 font-mono">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>

                      <td className="py-4 px-4 sm:px-6 text-right">
                        <Button variant="outline" size="xs" onClick={() => setSelectedUser(user)}>
                          Inspect
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>

        {/* User Detail Drawer */}
        <Drawer
          isOpen={!!selectedUser}
          onClose={() => setSelectedUser(null)}
          title={selectedUser?.name || 'User Profile'}
          description={selectedUser?.email}
        >
          {selectedUser && (
            <div className="flex flex-col gap-6">
              <div>
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Global Identity
                </h4>
                <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 flex flex-col gap-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Global ID:</span>
                    <span className="font-mono text-slate-900 font-semibold">{selectedUser.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Phone:</span>
                    <span className="text-slate-900">{selectedUser.phone || 'Not provided'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Date of Birth:</span>
                    <span className="text-slate-900">{selectedUser.dateOfBirth || 'Not provided'}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Active Organization Memberships
                </h4>
                <div className="flex flex-col gap-3">
                  {memberships
                    .filter((m) => m.userId === selectedUser.id)
                    .map((m) => {
                      const org = organizations.find((o) => o.id === m.organizationId);
                      return (
                        <div
                          key={m.id}
                          className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 flex flex-col gap-2 text-xs"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900 flex items-center gap-2">
                              <span className="w-4 h-4 rounded bg-slate-200 text-[10px] flex items-center justify-center font-bold text-teal-800">{org?.name.charAt(0) || 'O'}</span>
                              <span>{org?.name}</span>
                            </span>
                            <Badge variant={m.status === 'active' ? 'active' : 'danger'} size="xs">
                              {m.status}
                            </Badge>
                          </div>
                          <div className="flex justify-between text-slate-500">
                            <span>Role:</span>
                            <span className="capitalize text-slate-900 font-medium">{m.role}</span>
                          </div>
                          <div className="flex justify-between text-slate-500">
                            <span>Community Status:</span>
                            <Badge
                              variant={m.communityStatus === 'active' ? 'active' : 'danger'}
                              size="xs"
                            >
                              {m.communityStatus}
                            </Badge>
                          </div>
                          <div className="flex justify-between text-slate-500">
                            <span>AI Scanner Credits:</span>
                            <span className="font-mono text-amber-700 font-bold">
                              {m.aiCreditBalance || 0} pts
                            </span>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          )}
        </Drawer>
      </div>
    </DashboardLayout>
  );
}
