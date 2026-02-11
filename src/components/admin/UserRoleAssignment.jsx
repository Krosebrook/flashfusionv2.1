import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Users, UserPlus, Trash2, Search, Shield } from 'lucide-react';
import { toast } from 'sonner';

export default function UserRoleAssignment() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [userRoles, setUserRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedRoleId, setSelectedRoleId] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [fetchedUsers, fetchedRoles, fetchedUserRoles] = await Promise.all([
        base44.entities.User.list(),
        base44.entities.Role.list(),
        base44.entities.UserRole.list()
      ]);
      setUsers(fetchedUsers);
      setRoles(fetchedRoles);
      setUserRoles(fetchedUserRoles);
    } catch (error) {
      toast.error('Failed to fetch data');
    }
    setLoading(false);
  };

  const handleAssignRole = async () => {
    if (!selectedUser || !selectedRoleId) {
      toast.error('Please select a user and role');
      return;
    }

    try {
      const currentUser = await base44.auth.me();
      await base44.entities.UserRole.create({
        user_email: selectedUser.email,
        role_id: selectedRoleId,
        assigned_by_email: currentUser.email,
        assigned_at: new Date().toISOString()
      });
      toast.success('Role assigned successfully');
      fetchData();
      setShowAssignDialog(false);
      setSelectedUser(null);
      setSelectedRoleId('');
    } catch (error) {
      toast.error('Failed to assign role');
    }
  };

  const handleUnassignRole = async (userRoleId) => {
    if (!confirm('Remove this role assignment?')) return;
    try {
      await base44.entities.UserRole.delete(userRoleId);
      toast.success('Role unassigned successfully');
      fetchData();
    } catch (error) {
      toast.error('Failed to unassign role');
    }
  };

  const getUserRoles = (userEmail) => {
    return userRoles
      .filter(ur => ur.user_email === userEmail)
      .map(ur => roles.find(r => r.id === ur.role_id))
      .filter(Boolean);
  };

  const filteredUsers = users.filter(user =>
    user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Users className="w-6 h-6 text-purple-400" />
            User Role Assignments
          </h2>
          <p className="text-gray-400">Assign roles to users</p>
        </div>
        <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
          <DialogTrigger asChild>
            <Button className="bg-purple-600 hover:bg-purple-700">
              <UserPlus className="w-4 h-4 mr-2" />
              Assign Role
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gray-800 text-white">
            <DialogHeader>
              <DialogTitle>Assign Role to User</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <label className="block text-sm font-medium mb-2">Select User</label>
                <Select onValueChange={(value) => setSelectedUser(users.find(u => u.email === value))}>
                  <SelectTrigger className="bg-gray-700 border-gray-600">
                    <SelectValue placeholder="Choose a user" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user.email} value={user.email}>
                        {user.full_name} ({user.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Select Role</label>
                <Select onValueChange={setSelectedRoleId}>
                  <SelectTrigger className="bg-gray-700 border-gray-600">
                    <SelectValue placeholder="Choose a role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.filter(r => r.is_active).map((role) => (
                      <SelectItem key={role.id} value={role.id}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <Button variant="outline" onClick={() => setShowAssignDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAssignRole} className="bg-purple-600 hover:bg-purple-700">
                  Assign Role
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <Input
          placeholder="Search users by name or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-gray-800 border-gray-700"
        />
      </div>

      <div className="grid gap-4">
        {filteredUsers.map((user) => {
          const assignedRoles = getUserRoles(user.email);
          const userRoleRecords = userRoles.filter(ur => ur.user_email === user.email);

          return (
            <Card key={user.email} className="bg-gray-800 border-gray-700">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white font-medium">
                        {user.full_name?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{user.full_name}</h3>
                        <p className="text-sm text-gray-400">{user.email}</p>
                      </div>
                      <Badge variant="outline" className="ml-2">
                        {user.role}
                      </Badge>
                    </div>
                    
                    {assignedRoles.length > 0 ? (
                      <div className="mt-4 space-y-2">
                        <p className="text-sm text-gray-400">Assigned Roles:</p>
                        <div className="flex flex-wrap gap-2">
                          {assignedRoles.map((role) => {
                            const userRoleRecord = userRoleRecords.find(ur => ur.role_id === role.id);
                            return (
                              <div key={role.id} className="flex items-center gap-2 bg-gray-700 px-3 py-1 rounded-full">
                                <Shield className="w-4 h-4 text-purple-400" />
                                <span className="text-sm">{role.name}</span>
                                <button
                                  onClick={() => handleUnassignRole(userRoleRecord.id)}
                                  className="ml-1 text-red-400 hover:text-red-300"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 mt-4">No additional roles assigned</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}