import { useState } from "react";
import { Star, Plus, Pencil, Trash2, GripVertical, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Card, CardContent } from "@/components/ui/card";

export interface Testimonial {
  name: string;
  text: string;
  rating: number;
  location?: string;
  date?: string;
}

interface TestimonialManagerProps {
  testimonials: Testimonial[];
  onUpdate: (testimonials: Testimonial[]) => void;
}

export function TestimonialManager({ testimonials, onUpdate }: TestimonialManagerProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState<Testimonial>({
    name: "",
    text: "",
    rating: 5,
    location: "",
    date: new Date().toISOString().split("T")[0],
  });

  const resetForm = () => {
    setFormData({
      name: "",
      text: "",
      rating: 5,
      location: "",
      date: new Date().toISOString().split("T")[0],
    });
  };

  const handleOpenAdd = () => {
    resetForm();
    setEditingIndex(null);
    setIsAddDialogOpen(true);
  };

  const handleOpenEdit = (index: number) => {
    setFormData(testimonials[index]);
    setEditingIndex(index);
    setIsAddDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.name.trim() || !formData.text.trim()) return;

    const updated = [...testimonials];
    if (editingIndex !== null) {
      updated[editingIndex] = formData;
    } else {
      updated.push(formData);
    }
    onUpdate(updated);
    setIsAddDialogOpen(false);
    resetForm();
    setEditingIndex(null);
  };

  const handleDelete = () => {
    if (deleteIndex === null) return;
    const updated = testimonials.filter((_, i) => i !== deleteIndex);
    onUpdate(updated);
    setDeleteIndex(null);
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const updated = [...testimonials];
    [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
    onUpdate(updated);
  };

  const handleMoveDown = (index: number) => {
    if (index === testimonials.length - 1) return;
    const updated = [...testimonials];
    [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
    onUpdate(updated);
  };

  const averageRating = testimonials.length > 0
    ? (testimonials.reduce((sum, t) => sum + t.rating, 0) / testimonials.length).toFixed(1)
    : "0.0";

  return (
    <div className="space-y-6">
      {/* Header with stats */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Customer Testimonials</h3>
          <p className="text-sm text-muted-foreground">
            {testimonials.length} review{testimonials.length !== 1 ? "s" : ""} • {averageRating} avg rating
          </p>
        </div>
        <Button onClick={handleOpenAdd}>
          <Plus className="h-4 w-4 mr-2" />
          Add Review
        </Button>
      </div>

      {/* Aggregate Rating Display */}
      {testimonials.length > 0 && (
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="text-3xl font-bold">{averageRating}</div>
              <div>
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${i < Math.round(parseFloat(averageRating)) ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}`}
                    />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  Based on {testimonials.length} review{testimonials.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Testimonials List */}
      <div className="space-y-3">
        {testimonials.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              <p>No testimonials yet. Add your first customer review!</p>
            </CardContent>
          </Card>
        ) : (
          testimonials.map((testimonial, index) => (
            <Card key={index} className="group">
              <CardContent className="py-4">
                <div className="flex items-start gap-3">
                  {/* Reorder buttons */}
                  <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => handleMoveUp(index)}
                      disabled={index === 0}
                    >
                      <GripVertical className="h-4 w-4 rotate-90" />
                    </Button>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="flex gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${i < testimonial.rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}`}
                          />
                        ))}
                      </div>
                      {testimonial.date && (
                        <span className="text-xs text-muted-foreground">
                          {new Date(testimonial.date).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-foreground line-clamp-2 mb-1">
                      "{testimonial.text}"
                    </p>
                    <p className="text-sm font-medium">
                      — {testimonial.name}
                      {testimonial.location && (
                        <span className="text-muted-foreground font-normal">, {testimonial.location}</span>
                      )}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleMoveUp(index)}
                      disabled={index === 0}
                    >
                      ↑
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleMoveDown(index)}
                      disabled={index === testimonials.length - 1}
                    >
                      ↓
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleOpenEdit(index)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => setDeleteIndex(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingIndex !== null ? "Edit Testimonial" : "Add Testimonial"}
            </DialogTitle>
            <DialogDescription>
              {editingIndex !== null
                ? "Update the testimonial details."
                : "Add a new customer testimonial to display on your website."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Reviewer Name *</Label>
              <Input
                id="name"
                placeholder="John Smith"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Star Rating *</Label>
              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setFormData({ ...formData, rating: i + 1 })}
                    className="p-1 hover:scale-110 transition-transform"
                  >
                    <Star
                      className={`h-8 w-8 ${i < formData.rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300 hover:text-yellow-400"}`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="text">Review Text *</Label>
              <Textarea
                id="text"
                placeholder="They did an excellent job on our roof..."
                rows={4}
                value={formData.text}
                onChange={(e) => setFormData({ ...formData, text: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location">Location (optional)</Label>
                <Input
                  id="location"
                  placeholder="Springfield"
                  value={formData.location || ""}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Date (optional)</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date || ""}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!formData.name.trim() || !formData.text.trim()}
            >
              <Save className="h-4 w-4 mr-2" />
              {editingIndex !== null ? "Save Changes" : "Add Review"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteIndex !== null} onOpenChange={() => setDeleteIndex(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Testimonial?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the testimonial from your website. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
