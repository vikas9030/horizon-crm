import { useEffect } from 'react';
import { User, UserRole, Permission } from '@/types';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';

const userSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address').max(255),
  phone: z.string().min(10, 'Phone must be at least 10 digits').max(20),
  address: z.string().max(500).optional(),
  role: z.enum(['manager', 'staff'] as const),
  status: z.enum(['active', 'inactive'] as const),
  managerId: z.string().optional(),
});

type UserFormData = z.infer<typeof userSchema>;

interface UserFormModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (userData: Partial<User>) => void;
  user?: User | null;
  managers?: User[];
}

const moduleOptions = [
  { value: 'leads', label: 'Leads' },
  { value: 'tasks', label: 'Tasks' },
  { value: 'projects', label: 'Projects' },
  { value: 'leaves', label: 'Leaves' },
  { value: 'reports', label: 'Reports' },
] as const;

const actionOptions = ['view', 'create', 'edit', 'delete', 'approve'] as const;

export default function UserFormModal({ open, onClose, onSave, user, managers = [] }: UserFormModalProps) {
  const form = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      address: '',
      role: 'staff',
      status: 'active',
      managerId: '',
    },
  });

  const selectedRole = form.watch('role');

  useEffect(() => {
    if (user) {
      form.reset({
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        role: user.role as 'manager' | 'staff',
        status: user.status,
        managerId: user.managerId || '',
      });
    } else {
      form.reset({
        name: '',
        email: '',
        phone: '',
        address: '',
        role: 'staff',
        status: 'active',
        managerId: '',
      });
    }
  }, [user, form, open]);

  const getDefaultPermissions = (role: UserRole): Permission[] => {
    if (role === 'manager') {
      return [
        { module: 'leads', actions: ['view'] },
        { module: 'tasks', actions: ['view'] },
        { module: 'leaves', actions: ['view', 'approve'] },
        { module: 'reports', actions: ['view'] },
      ];
    }
    return [
      { module: 'leads', actions: ['view', 'create', 'edit'] },
      { module: 'tasks', actions: ['view', 'create', 'edit'] },
      { module: 'leaves', actions: ['view', 'create'] },
    ];
  };

  const handleSubmit = (data: UserFormData) => {
    const permissions = getDefaultPermissions(data.role);
    onSave({
      ...data,
      permissions,
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>{user ? 'Edit User' : 'Add New User'}</DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] pr-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name <span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <Input placeholder="Enter full name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email <span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="Enter email address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone <span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <Input placeholder="Enter phone number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role <span className="text-destructive">*</span></FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="manager">Manager</SelectItem>
                        <SelectItem value="staff">Staff</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {selectedRole === 'staff' && managers.length > 0 && (
                <FormField
                  control={form.control}
                  name="managerId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Assign Manager</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select manager" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {managers.map((manager) => (
                            <SelectItem key={manager.id} value={manager.id}>
                              {manager.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status <span className="text-destructive">*</span></FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                <p className="text-sm font-medium">Default Permissions</p>
                <p className="text-xs text-muted-foreground">
                  {selectedRole === 'manager' 
                    ? 'Managers can view leads, tasks, and approve leaves.'
                    : 'Staff can view, create, and edit leads and tasks, and apply for leaves.'}
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit" className="btn-accent">
                  {user ? 'Update User' : 'Create User'}
                </Button>
              </div>
            </form>
          </Form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
