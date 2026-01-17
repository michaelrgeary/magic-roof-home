import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import {
  Phone,
  Mail,
  MessageSquare,
  Calendar,
  Building,
  Clock,
  CheckCircle,
  XCircle,
  User,
  Loader2,
} from "lucide-react";
type LeadStatus = "new" | "contacted" | "converted" | "lost";

// Extended Lead type with joined site data and new fields
type Lead = {
  id: string;
  site_id: string;
  name: string;
  phone: string;
  email: string | null;
  message: string | null;
  source: "quote_form" | "contact_form" | "chat";
  status: LeadStatus;
  sms_sent: boolean;
  created_at: string;
  notes?: string | null;
  read?: boolean;
  sites?: { template: string; config: unknown } | null;
};

interface LeadDetailDialogProps {
  lead: Lead | null;
  siteName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LeadDetailDialog({
  lead,
  siteName,
  open,
  onOpenChange,
}: LeadDetailDialogProps) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [notes, setNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  useEffect(() => {
    if (lead) {
      setNotes(lead.notes || "");
      // Mark as read when opened
      if (!lead.read) {
        markAsRead(lead.id);
      }
    }
  }, [lead]);

  const markAsRead = async (leadId: string) => {
    await supabase.from("leads").update({ read: true }).eq("id", leadId);
    queryClient.invalidateQueries({ queryKey: ["all-leads"] });
  };

  const handleSaveNotes = async () => {
    if (!lead) return;
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("leads")
        .update({ notes })
        .eq("id", lead.id);

      if (error) throw error;
      toast.success("Notes saved");
      queryClient.invalidateQueries({ queryKey: ["all-leads"] });
    } catch (error) {
      toast.error("Failed to save notes");
    } finally {
      setIsSaving(false);
    }
  };

  const handleStatusChange = async (newStatus: LeadStatus) => {
    if (!lead) return;
    setIsUpdatingStatus(true);
    try {
      const { error } = await supabase
        .from("leads")
        .update({ status: newStatus })
        .eq("id", lead.id);

      if (error) throw error;
      toast.success(`Status updated to ${newStatus}`);
      queryClient.invalidateQueries({ queryKey: ["all-leads"] });
    } catch (error) {
      toast.error("Failed to update status");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  if (!lead) return null;

  const statusButtons: { status: LeadStatus; label: string; icon: typeof Clock; variant: "default" | "secondary" | "outline" | "destructive" }[] = [
    { status: "new", label: "New", icon: Clock, variant: "outline" },
    { status: "contacted", label: "Contacted", icon: Phone, variant: "secondary" },
    { status: "converted", label: "Converted", icon: CheckCircle, variant: "default" },
    { status: "lost", label: "Lost", icon: XCircle, variant: "destructive" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {lead.name}
          </DialogTitle>
          <DialogDescription>
            Lead from {siteName} · {lead.source.replace("_", " ")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Contact Info */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground">Contact Information</h4>
            <div className="grid gap-2">
              <a
                href={`tel:${lead.phone}`}
                className="flex items-center gap-3 p-3 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
              >
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Phone className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{lead.phone}</p>
                  <p className="text-xs text-muted-foreground">Click to call</p>
                </div>
              </a>

              {lead.email && (
                <a
                  href={`mailto:${lead.email}`}
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
                >
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{lead.email}</p>
                    <p className="text-xs text-muted-foreground">Click to email</p>
                  </div>
                </a>
              )}
            </div>
          </div>

          {/* Message */}
          {lead.message && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Message
              </h4>
              <div className="p-3 rounded-lg bg-muted">
                <p className="text-sm whitespace-pre-wrap">{lead.message}</p>
              </div>
            </div>
          )}

          {/* Details */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {new Date(lead.created_at).toLocaleString()}
            </div>
            <div className="flex items-center gap-1">
              <Building className="h-4 w-4" />
              {siteName}
            </div>
          </div>

          <Separator />

          {/* Status */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground">Lead Status</h4>
            <div className="flex flex-wrap gap-2">
              {statusButtons.map((btn) => (
                <Button
                  key={btn.status}
                  variant={lead.status === btn.status ? btn.variant : "outline"}
                  size="sm"
                  onClick={() => handleStatusChange(btn.status)}
                  disabled={isUpdatingStatus || lead.status === btn.status}
                  className={lead.status === btn.status ? "ring-2 ring-offset-2" : ""}
                >
                  {isUpdatingStatus ? (
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  ) : (
                    <btn.icon className="h-4 w-4 mr-1" />
                  )}
                  {btn.label}
                </Button>
              ))}
            </div>
          </div>

          <Separator />

          {/* Notes */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground">Follow-up Notes</h4>
            <Textarea
              placeholder="Add notes about this lead..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
            />
            <Button
              onClick={handleSaveNotes}
              disabled={isSaving || notes === (lead.notes || "")}
              size="sm"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Notes"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
