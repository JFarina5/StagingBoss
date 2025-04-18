import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAppContext } from '@/contexts/AppContext';
import { Separator } from '@/components/ui/separator';
import { Plus, Edit, Trash } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { RaceClass } from '@/types';

const ClassManager: React.FC = () => {
  const { classes, addClass, updateClass, removeClass } = useAppContext();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<RaceClass | null>(null);
  const [newClassName, setNewClassName] = useState('');
  const [newClassDescription, setNewClassDescription] = useState('');
  const [continuousAdding, setContinuousAdding] = useState(false);

  const handleAddClass = () => {
    if (!newClassName.trim()) return;
    
    addClass({
      id: Date.now().toString(),
      name: newClassName.trim(),
      description: newClassDescription.trim() || undefined,
    });
    
    setNewClassName('');
    setNewClassDescription('');
    if (!continuousAdding) {
      setIsAddDialogOpen(false);
    }
  };

  const handleEditClass = () => {
    if (!editingClass || !newClassName.trim()) return;
    
    updateClass({
      ...editingClass,
      name: newClassName.trim(),
      description: newClassDescription.trim() || undefined,
    });
    
    setEditingClass(null);
    setNewClassName('');
    setNewClassDescription('');
  };

  const openEditDialog = (classObj: RaceClass) => {
    setEditingClass(classObj);
    setNewClassName(classObj.name);
    setNewClassDescription(classObj.description || '');
  };

  const cancelEdit = () => {
    setEditingClass(null);
    setNewClassName('');
    setNewClassDescription('');
  };

  return (
    <Card className="border shadow-sm">
      <CardHeader>
        <CardTitle>Class Manager</CardTitle>
        <CardDescription>
          Add, edit, or remove racing classes for your lineups
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {classes.length === 0 ? (
          <div className="text-center p-4 border border-dashed rounded-md text-muted-foreground">
            No classes defined. Add your first race class to get started.
          </div>
        ) : (
          <div className="space-y-2">
            {classes.map((cls) => (
              <div key={cls.id} className="flex items-center justify-between p-3 rounded-md bg-muted/30 hover:bg-muted/50 transition-colors">
                <div>
                  <h3 className="font-medium">{cls.name}</h3>
                  {cls.description && (
                    <p className="text-sm text-muted-foreground">{cls.description}</p>
                  )}
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openEditDialog(cls)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Trash className="h-4 w-4 text-destructive" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Class</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete the "{cls.name}" class? This action cannot be undone and will remove any lineups associated with this class.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => removeClass(cls.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full">
              <Plus className="mr-2 h-4 w-4" />
              Add New Class
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Racing Class</DialogTitle>
              <DialogDescription>
                Create a new class for organizing your race lineups.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="className">Class Name</Label>
                <Input
                  id="className"
                  placeholder="e.g., Super Late Models"
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="classDescription">Description (Optional)</Label>
                <Input
                  id="classDescription"
                  placeholder="e.g., 604 Crate Engine Class"
                  value={newClassDescription}
                  onChange={(e) => setNewClassDescription(e.target.value)}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="continuousAdding"
                  checked={continuousAdding}
                  onCheckedChange={(checked) => setContinuousAdding(checked === true)}
                />
                <Label htmlFor="continuousAdding">Continue Adding Classes</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddClass} disabled={!newClassName.trim()}>
                Add Class
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        <Dialog open={!!editingClass} onOpenChange={(open) => !open && cancelEdit()}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Racing Class</DialogTitle>
              <DialogDescription>
                Update the details for this racing class.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="editClassName">Class Name</Label>
                <Input
                  id="editClassName"
                  placeholder="e.g., Super Late Models"
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editClassDescription">Description (Optional)</Label>
                <Input
                  id="editClassDescription"
                  placeholder="e.g., 604 Crate Engine Class"
                  value={newClassDescription}
                  onChange={(e) => setNewClassDescription(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={cancelEdit}>
                Cancel
              </Button>
              <Button onClick={handleEditClass} disabled={!newClassName.trim()}>
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  );
};

export default ClassManager;
