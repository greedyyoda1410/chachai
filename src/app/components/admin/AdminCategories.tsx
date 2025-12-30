import React, { useState, useEffect } from 'react';
import { useNavigate, Navigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Edit2, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { useCategories } from '../../hooks/useCategories';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createCategory, updateCategory, deleteCategory, toggleCategoryActive } from '../../../lib/services/categories';
import { getCurrentAdmin } from '../../../lib/supabase/auth';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { toast } from 'sonner';

export const AdminCategories: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null); // null = checking
  const { data: categories = [], isLoading } = useCategories(false);
  const isInTabContext = location.pathname.includes('/admin/menu');
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name_en: '',
    name_bn: '',
    icon_url: '',
    display_order: 0,
    is_active: true,
  });

  const resetForm = () => {
    setFormData({
      name_en: '',
      name_bn: '',
      icon_url: '',
      display_order: categories?.length || 0,
      is_active: true,
    });
  };

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const admin = await getCurrentAdmin();
      if (!admin) throw new Error('Not authenticated');
      return createCategory(data, admin.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setIsDialogOpen(false);
      resetForm();
      toast.success('Category created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<typeof formData> }) => {
      return updateCategory(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setIsDialogOpen(false);
      setEditingCategory(null);
      resetForm();
      toast.success('Category updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Category deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      toggleCategoryActive(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Category status updated');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  useEffect(() => {
    const checkAdmin = async () => {
      const admin = await getCurrentAdmin();
      setIsAdmin(!!admin);
    };
    checkAdmin();
  }, []);

  const handleEdit = (category: any) => {
    setEditingCategory(category.id);
    setFormData({
      name_en: category.name_en,
      name_bn: category.name_bn,
      icon_url: category.icon_url || '',
      display_order: category.display_order,
      is_active: category.is_active,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCategory) {
      updateMutation.mutate({ id: editingCategory, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this category?')) {
      deleteMutation.mutate(id);
    }
  };

  // Show loading while checking auth
  if (isAdmin === null) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  // Redirect if not admin (after check completes)
  if (!isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {!isInTabContext && (
        <div className="bg-gray-900 text-white p-4 sticky top-0 z-50 shadow-md">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/10"
                onClick={() => navigate('/admin/dashboard')}
              >
                <ArrowLeft className="w-6 h-6" />
              </Button>
              <div>
                <h1 className="text-2xl">Categories Management</h1>
                <p className="text-sm text-gray-400">Manage menu categories</p>
              </div>
            </div>

            {!isInTabContext && (
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    className="bg-orange-500 hover:bg-orange-600"
                    onClick={() => {
                      resetForm();
                      setEditingCategory(null);
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Category
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{editingCategory ? 'Edit Category' : 'Create Category'}</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="name_en_header">Name (English) *</Label>
                      <Input
                        id="name_en_header"
                        value={formData.name_en}
                        onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="name_bn_header">Name (Bengali) *</Label>
                      <Input
                        id="name_bn_header"
                        value={formData.name_bn}
                        onChange={(e) => setFormData({ ...formData, name_bn: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="icon_url_header">Icon URL</Label>
                      <Input
                        id="icon_url_header"
                        value={formData.icon_url}
                        onChange={(e) => setFormData({ ...formData, icon_url: e.target.value })}
                        placeholder="URL or emoji"
                      />
                    </div>
                    <div>
                      <Label htmlFor="display_order_header">Display Order</Label>
                      <Input
                        id="display_order_header"
                        type="number"
                        value={formData.display_order}
                        onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="is_active_header"
                        checked={formData.is_active}
                        onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                        className="rounded"
                      />
                      <Label htmlFor="is_active_header">Active</Label>
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={createMutation.isPending || updateMutation.isPending}
                      >
                        {editingCategory ? 'Update' : 'Create'}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
      )}
      
      {isInTabContext && (
        <div className="max-w-7xl mx-auto p-4 mb-4 flex justify-end">
          <Button
            className="bg-orange-500 hover:bg-orange-600"
            onClick={() => {
              resetForm();
              setEditingCategory(null);
              setIsDialogOpen(true);
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Category
          </Button>
        </div>
      )}

      {/* Shared Dialog for both contexts */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCategory ? 'Edit Category' : 'Create Category'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name_en_dialog">Name (English) *</Label>
              <Input
                id="name_en_dialog"
                value={formData.name_en}
                onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="name_bn_dialog">Name (Bengali) *</Label>
              <Input
                id="name_bn_dialog"
                value={formData.name_bn}
                onChange={(e) => setFormData({ ...formData, name_bn: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="icon_url_dialog">Icon URL</Label>
              <Input
                id="icon_url_dialog"
                value={formData.icon_url}
                onChange={(e) => setFormData({ ...formData, icon_url: e.target.value })}
                placeholder="URL or emoji"
              />
            </div>
            <div>
              <Label htmlFor="display_order_dialog">Display Order</Label>
              <Input
                id="display_order_dialog"
                type="number"
                value={formData.display_order}
                onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_active_dialog"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="rounded"
              />
              <Label htmlFor="is_active_dialog">Active</Label>
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {editingCategory ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="text-4xl">{category.icon_url || '📦'}</div>
                    <div>
                      <h3 className="font-semibold">{category.name_en}</h3>
                      <p className="text-sm text-gray-600">{category.name_bn}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(category)}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(category.id)}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    Order: {category.display_order}
                  </span>
                  <Button
                    variant={category.is_active ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => toggleMutation.mutate({ id: category.id, isActive: !category.is_active })}
                  >
                    {category.is_active ? 'Active' : 'Inactive'}
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {categories.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No categories found. Create your first category!
          </div>
        )}
      </div>
    </div>
  );
};

