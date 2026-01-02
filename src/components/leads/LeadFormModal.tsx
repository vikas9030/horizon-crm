import { useState, useEffect } from 'react';
import { Lead, LeadStatus, RequirementType, LeadSource } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface LeadFormModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (lead: Partial<Lead>) => void;
  lead?: Lead | null;
}

export default function LeadFormModal({ open, onClose, onSave, lead }: LeadFormModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    requirementType: 'apartment' as RequirementType,
    bhkRequirement: '2' as '1' | '2' | '3' | '4' | '5+',
    budgetMin: 0,
    budgetMax: 0,
    description: '',
    preferredLocation: '',
    source: 'website' as LeadSource,
    status: 'pending' as LeadStatus,
    followUpDate: '',
  });

  useEffect(() => {
    if (lead) {
      setFormData({
        name: lead.name,
        phone: lead.phone,
        email: lead.email,
        address: lead.address,
        requirementType: lead.requirementType,
        bhkRequirement: lead.bhkRequirement,
        budgetMin: lead.budgetMin,
        budgetMax: lead.budgetMax,
        description: lead.description,
        preferredLocation: lead.preferredLocation || '',
        source: lead.source || 'website',
        status: lead.status,
        followUpDate: lead.followUpDate ? lead.followUpDate.toISOString().split('T')[0] : '',
      });
    } else {
      setFormData({
        name: '',
        phone: '',
        email: '',
        address: '',
        requirementType: 'apartment',
        bhkRequirement: '2',
        budgetMin: 0,
        budgetMax: 0,
        description: '',
        preferredLocation: '',
        source: 'website',
        status: 'pending',
        followUpDate: '',
      });
    }
  }, [lead, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      followUpDate: formData.followUpDate ? new Date(formData.followUpDate) : undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {lead ? 'Edit Lead' : 'Create New Lead'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="input-field"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
                className="input-field"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="input-field"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="source">Lead Source</Label>
              <Select
                value={formData.source}
                onValueChange={(value: LeadSource) => setFormData({ ...formData, source: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="call">Call</SelectItem>
                  <SelectItem value="walk_in">Walk-in</SelectItem>
                  <SelectItem value="website">Website</SelectItem>
                  <SelectItem value="referral">Referral</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address *</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              required
              className="input-field"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Requirement Type *</Label>
              <Select
                value={formData.requirementType}
                onValueChange={(value: RequirementType) => setFormData({ ...formData, requirementType: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="villa">Villa</SelectItem>
                  <SelectItem value="apartment">Apartment</SelectItem>
                  <SelectItem value="house">House</SelectItem>
                  <SelectItem value="plot">Plot</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>BHK Requirement *</Label>
              <Select
                value={formData.bhkRequirement}
                onValueChange={(value: '1' | '2' | '3' | '4' | '5+') => setFormData({ ...formData, bhkRequirement: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 BHK</SelectItem>
                  <SelectItem value="2">2 BHK</SelectItem>
                  <SelectItem value="3">3 BHK</SelectItem>
                  <SelectItem value="4">4 BHK</SelectItem>
                  <SelectItem value="5+">5+ BHK</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: LeadStatus) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="interested">Interested</SelectItem>
                  <SelectItem value="not_interested">Not Interested</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="reminder">Reminder</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="budgetMin">Minimum Budget ($) *</Label>
              <Input
                id="budgetMin"
                type="number"
                value={formData.budgetMin}
                onChange={(e) => setFormData({ ...formData, budgetMin: parseInt(e.target.value) || 0 })}
                required
                className="input-field"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="budgetMax">Maximum Budget ($) *</Label>
              <Input
                id="budgetMax"
                type="number"
                value={formData.budgetMax}
                onChange={(e) => setFormData({ ...formData, budgetMax: parseInt(e.target.value) || 0 })}
                required
                className="input-field"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="preferredLocation">Preferred Location</Label>
              <Input
                id="preferredLocation"
                value={formData.preferredLocation}
                onChange={(e) => setFormData({ ...formData, preferredLocation: e.target.value })}
                className="input-field"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="followUpDate">Follow-up Date</Label>
              <Input
                id="followUpDate"
                type="date"
                value={formData.followUpDate}
                onChange={(e) => setFormData({ ...formData, followUpDate: e.target.value })}
                className="input-field"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description / Notes</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="input-field resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="btn-primary">
              {lead ? 'Update Lead' : 'Create Lead'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
