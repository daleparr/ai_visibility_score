'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Plus,
  Edit,
  Trash2,
  Shield,
  Clock,
  Mail,
  Search,
  Key
} from 'lucide-react';
import { format } from 'date-fns';

interface User {
  id: string;
  email: string;
  name?: string;
  image?: string;
  created_at: string;
  roles: UserRole[];
  profile?: {
    full_name?: string;
    company_name?: string;
    job_title?: string;
  };
}

interface UserRole {
  id: string;
  role_key: string;
  role_name: string;
  assigned_at: string;
  expires_at?: string;
}

interface Role {
  id: string;
  role_key: string;
  role_name: string;
  description: string;
  permissions: any;
}

export function UserManager() {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [view, setView] = useState<'list' | 'edit'>('list');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [usersRes, rolesRes] = await Promise.all([
        fetch('/api/admin/users'),
        fetch('/api/admin/roles')
      ]);
      const usersData = await usersRes.json();
      const rolesData = await rolesRes.json();
      setUsers(usersData.users || []);
      setRoles(rolesData.roles || []);
    } catch (error) {
      console.error('Failed to load user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const assignRole = async (userId: string, roleId: string, expiresAt?: string) => {
    try {
      await fetch(`/api/admin/users/${userId}/roles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role_id: roleId, expires_at: expiresAt })
      });
      await loadData();
    } catch (error) {
      console.error('Failed to assign role:', error);
    }
  };

  const removeRole = async (userId: string, roleId: string) => {
    try {
      await fetch(`/api/admin/users/${userId}/roles/${roleId}`, {
        method: 'DELETE'
      });
      await loadData();
    } catch (error) {
      console.error('Failed to remove role:', error);
    }
  };

  const resetPassword = async (userId: string) => {
    if (!confirm('Send password reset email to this user?')) return;
    
    try {
      await fetch(`/api/admin/users/${userId}/reset-password`, {
        method: 'POST'
      });
      alert('Password reset email sent!');
    } catch (error) {
      console.error('Failed to reset password:', error);
    }
  };

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.profile?.company_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading users...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">User Management</h2>
          <p className="text-gray-600 mt-1">Manage user roles, permissions, and access</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border p-4">
          <div className="text-2xl font-bold text-blue-600">{users.length}</div>
          <div className="text-sm text-gray-600">Total Users</div>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="text-2xl font-bold text-green-600">
            {users.filter(u => u.roles.some(r => r.role_key.includes('admin'))).length}
          </div>
          <div className="text-sm text-gray-600">Admins</div>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="text-2xl font-bold text-purple-600">
            {users.filter(u => u.roles.some(r => r.role_key.includes('customer'))).length}
          </div>
          <div className="text-sm text-gray-600">Customers</div>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="text-2xl font-bold text-orange-600">{roles.length}</div>
          <div className="text-sm text-gray-600">Roles</div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg border p-4">
        <div className="flex items-center gap-2">
          <Search className="h-5 w-5 text-gray-400" />
          <Input
            placeholder="Search by email, name, or company..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border-0 focus-visible:ring-0"
          />
        </div>
      </div>

      {/* Users List */}
      <div className="space-y-3">
        {filteredUsers.map((user) => (
          <div key={user.id} className="bg-white rounded-lg border p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold">
                    {user.name || user.email}
                  </h3>
                  {user.roles.map((role) => (
                    <Badge key={role.id} variant={role.role_key.includes('admin') ? 'default' : 'secondary'}>
                      {role.role_name}
                    </Badge>
                  ))}
                </div>
                
                <div className="text-sm text-gray-600 space-y-1">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {user.email}
                  </div>
                  {user.profile?.company_name && (
                    <div>Company: {user.profile.company_name}</div>
                  )}
                  {user.profile?.job_title && (
                    <div>Title: {user.profile.job_title}</div>
                  )}
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Clock className="h-3 w-3" />
                    Joined {format(new Date(user.created_at), 'MMM d, yyyy')}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setSelectedUser(user);
                    setView('edit');
                  }}
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => resetPassword(user.id)}
                >
                  <Key className="h-4 w-4 mr-1" />
                  Reset Password
                </Button>
              </div>
            </div>

            {/* Quick Role Assignment */}
            <div className="mt-4 pt-4 border-t">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm text-gray-600">Quick assign:</span>
                {roles.filter(role => !user.roles.some(ur => ur.id === role.id)).map((role) => (
                  <Button
                    key={role.id}
                    size="sm"
                    variant="ghost"
                    className="text-xs"
                    onClick={() => assignRole(user.id, role.id)}
                  >
                    <Shield className="h-3 w-3 mr-1" />
                    {role.role_name}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredUsers.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg border">
          <p className="text-gray-600">
            {searchTerm ? 'No users found matching your search' : 'No users yet'}
          </p>
        </div>
      )}
    </div>
  );
}

