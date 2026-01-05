import { useState, useRef, useEffect } from 'react';
import { Project, ProjectStatus } from '@/types';
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
import { Badge } from '@/components/ui/badge';
import { X, Plus, Upload, Building, MapPin, DollarSign, Calendar, Image, Loader2, Link } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ProjectFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (project: Omit<Project, 'id' | 'createdAt'>) => void;
  project?: Project;
}

export default function ProjectFormModal({
  open,
  onOpenChange,
  onSubmit,
  project,
}: ProjectFormModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    name: project?.name || '',
    location: project?.location || '',
    type: project?.type || 'apartment',
    priceMin: project?.priceMin?.toString() || '',
    priceMax: project?.priceMax?.toString() || '',
    launchDate: project?.launchDate ? new Date(project.launchDate).toISOString().split('T')[0] : '',
    possessionDate: project?.possessionDate ? new Date(project.possessionDate).toISOString().split('T')[0] : '',
    description: project?.description || '',
    towerDetails: project?.towerDetails || '',
    status: project?.status || 'upcoming',
  });

  const [amenities, setAmenities] = useState<string[]>(project?.amenities || []);
  const [newAmenity, setNewAmenity] = useState('');
  const [nearbyLandmarks, setNearbyLandmarks] = useState<string[]>(project?.nearbyLandmarks || []);
  const [newLandmark, setNewLandmark] = useState('');
  const [photos, setPhotos] = useState<string[]>(project?.photos || []);
  const [newPhoto, setNewPhoto] = useState('');
  const [coverImage, setCoverImage] = useState(project?.coverImage || '');
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);

  // Reset form when project changes or modal opens
  useEffect(() => {
    if (open) {
      if (project) {
        setFormData({
          name: project.name || '',
          location: project.location || '',
          type: project.type || 'apartment',
          priceMin: project.priceMin?.toString() || '',
          priceMax: project.priceMax?.toString() || '',
          launchDate: project.launchDate ? new Date(project.launchDate).toISOString().split('T')[0] : '',
          possessionDate: project.possessionDate ? new Date(project.possessionDate).toISOString().split('T')[0] : '',
          description: project.description || '',
          towerDetails: project.towerDetails || '',
          status: project.status || 'upcoming',
        });
        setAmenities(project.amenities || []);
        setNearbyLandmarks(project.nearbyLandmarks || []);
        setPhotos(project.photos || []);
        setCoverImage(project.coverImage || '');
      } else {
        setFormData({
          name: '',
          location: '',
          type: 'apartment',
          priceMin: '',
          priceMax: '',
          launchDate: '',
          possessionDate: '',
          description: '',
          towerDetails: '',
          status: 'upcoming',
        });
        setAmenities([]);
        setNearbyLandmarks([]);
        setPhotos([]);
        setCoverImage('');
      }
    }
  }, [project, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.location || !formData.priceMin || !formData.priceMax || !formData.launchDate || !formData.possessionDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    onSubmit({
      name: formData.name,
      location: formData.location,
      type: formData.type as 'villa' | 'apartment' | 'plots',
      priceMin: parseFloat(formData.priceMin),
      priceMax: parseFloat(formData.priceMax),
      launchDate: new Date(formData.launchDate),
      possessionDate: new Date(formData.possessionDate),
      amenities,
      description: formData.description,
      towerDetails: formData.towerDetails,
      nearbyLandmarks,
      photos,
      coverImage: coverImage || photos[0] || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800',
      status: formData.status as ProjectStatus,
    });

    onOpenChange(false);
  };

  const addAmenity = () => {
    if (newAmenity.trim() && !amenities.includes(newAmenity.trim())) {
      setAmenities([...amenities, newAmenity.trim()]);
      setNewAmenity('');
    }
  };

  const removeAmenity = (amenity: string) => {
    setAmenities(amenities.filter(a => a !== amenity));
  };

  const addLandmark = () => {
    if (newLandmark.trim() && !nearbyLandmarks.includes(newLandmark.trim())) {
      setNearbyLandmarks([...nearbyLandmarks, newLandmark.trim()]);
      setNewLandmark('');
    }
  };

  const removeLandmark = (landmark: string) => {
    setNearbyLandmarks(nearbyLandmarks.filter(l => l !== landmark));
  };

  const addPhoto = () => {
    if (newPhoto.trim() && !photos.includes(newPhoto.trim())) {
      setPhotos([...photos, newPhoto.trim()]);
      if (!coverImage) setCoverImage(newPhoto.trim());
      setNewPhoto('');
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploadingPhoto(true);
    try {
      const uploadedUrls: string[] = [];
      
      for (const file of Array.from(files)) {
        if (!file.type.startsWith('image/')) {
          toast.error(`${file.name} is not an image`);
          continue;
        }
        if (file.size > 10 * 1024 * 1024) {
          toast.error(`${file.name} is too large (max 10MB)`);
          continue;
        }

        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `projects/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('project-images')
          .upload(filePath, file);

        if (uploadError) {
          toast.error(`Failed to upload ${file.name}`);
          continue;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('project-images')
          .getPublicUrl(filePath);

        uploadedUrls.push(publicUrl);
      }

      if (uploadedUrls.length > 0) {
        setPhotos(prev => [...prev, ...uploadedUrls]);
        if (!coverImage && uploadedUrls[0]) {
          setCoverImage(uploadedUrls[0]);
        }
        toast.success(`${uploadedUrls.length} image(s) uploaded successfully`);
      }
    } catch (error) {
      console.error('Error uploading photos:', error);
      toast.error('Failed to upload images');
    } finally {
      setIsUploadingPhoto(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image size should be less than 10MB');
      return;
    }

    setIsUploadingCover(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `cover-${Date.now()}.${fileExt}`;
      const filePath = `projects/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('project-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('project-images')
        .getPublicUrl(filePath);

      setCoverImage(publicUrl);
      if (!photos.includes(publicUrl)) {
        setPhotos(prev => [...prev, publicUrl]);
      }
      toast.success('Cover image uploaded successfully');
    } catch (error) {
      console.error('Error uploading cover:', error);
      toast.error('Failed to upload cover image');
    } finally {
      setIsUploadingCover(false);
      if (coverInputRef.current) coverInputRef.current.value = '';
    }
  };

  const removePhoto = (photo: string) => {
    setPhotos(photos.filter(p => p !== photo));
    if (coverImage === photo) {
      setCoverImage(photos[0] || '');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Building className="w-5 h-5 text-primary" />
            {project ? 'Edit Project' : 'Add New Project'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Project Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Skyline Towers"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input-field"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location *</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="location"
                  placeholder="e.g., Downtown Financial District"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="pl-10 input-field"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Property Type *</Label>
            <Select
              value={formData.type}
              onValueChange={(value: 'apartment' | 'villa' | 'plots') => setFormData({ ...formData, type: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="apartment">Apartment</SelectItem>
                <SelectItem value="villa">Villa</SelectItem>
                <SelectItem value="plots">Plots</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value: ProjectStatus) => setFormData({ ...formData, status: value })}
            >
              <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                  <SelectItem value="ongoing">Ongoing</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="towerDetails">Tower/Building Details</Label>
              <Input
                id="towerDetails"
                placeholder="e.g., 3 Towers, 45 floors each"
                value={formData.towerDetails}
                onChange={(e) => setFormData({ ...formData, towerDetails: e.target.value })}
                className="input-field"
              />
            </div>
          </div>

          {/* Price Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priceMin">Minimum Price ($) *</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="priceMin"
                  type="number"
                  placeholder="e.g., 450000"
                  value={formData.priceMin}
                  onChange={(e) => setFormData({ ...formData, priceMin: e.target.value })}
                  className="pl-10 input-field"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priceMax">Maximum Price ($) *</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="priceMax"
                  type="number"
                  placeholder="e.g., 1200000"
                  value={formData.priceMax}
                  onChange={(e) => setFormData({ ...formData, priceMax: e.target.value })}
                  className="pl-10 input-field"
                />
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="launchDate">Launch Date *</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="launchDate"
                  type="date"
                  required
                  value={formData.launchDate}
                  onChange={(e) => setFormData({ ...formData, launchDate: e.target.value })}
                  className="pl-10 input-field"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="possessionDate">Possession Date *</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="possessionDate"
                  type="date"
                  required
                  value={formData.possessionDate}
                  onChange={(e) => setFormData({ ...formData, possessionDate: e.target.value })}
                  className="pl-10 input-field"
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe the project features, highlights, and unique selling points..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="input-field resize-none"
            />
          </div>

          {/* Amenities */}
          <div className="space-y-3">
            <Label>Amenities</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Add amenity (e.g., Swimming Pool)"
                value={newAmenity}
                onChange={(e) => setNewAmenity(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addAmenity())}
                className="input-field flex-1"
              />
              <Button type="button" variant="secondary" onClick={addAmenity}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {amenities.map((amenity) => (
                <Badge key={amenity} variant="secondary" className="gap-1 px-3 py-1">
                  {amenity}
                  <X
                    className="w-3 h-3 cursor-pointer hover:text-destructive transition-colors"
                    onClick={() => removeAmenity(amenity)}
                  />
                </Badge>
              ))}
            </div>
          </div>

          {/* Nearby Landmarks */}
          <div className="space-y-3">
            <Label>Nearby Landmarks</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Add landmark (e.g., Central Mall)"
                value={newLandmark}
                onChange={(e) => setNewLandmark(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addLandmark())}
                className="input-field flex-1"
              />
              <Button type="button" variant="secondary" onClick={addLandmark}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {nearbyLandmarks.map((landmark) => (
                <Badge key={landmark} variant="outline" className="gap-1 px-3 py-1">
                  <MapPin className="w-3 h-3" />
                  {landmark}
                  <X
                    className="w-3 h-3 cursor-pointer hover:text-destructive transition-colors"
                    onClick={() => removeLandmark(landmark)}
                  />
                </Badge>
              ))}
            </div>
          </div>

          {/* Photos */}
          <div className="space-y-3">
            <Label>Building Photos</Label>
            <Tabs defaultValue="upload" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-3">
                <TabsTrigger value="upload" className="flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  Upload
                </TabsTrigger>
                <TabsTrigger value="url" className="flex items-center gap-2">
                  <Link className="w-4 h-4" />
                  URL
                </TabsTrigger>
              </TabsList>
              <TabsContent value="upload" className="space-y-3">
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingPhoto}
                    className="flex-1"
                  >
                    {isUploadingPhoto ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Image className="w-4 h-4 mr-2" />
                        Select Images
                      </>
                    )}
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handlePhotoUpload}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Upload multiple images (max 10MB each)
                </p>
              </TabsContent>
              <TabsContent value="url" className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    placeholder="Paste image URL"
                    value={newPhoto}
                    onChange={(e) => setNewPhoto(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addPhoto())}
                    className="input-field flex-1"
                  />
                  <Button type="button" variant="secondary" onClick={addPhoto}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
            
            {/* Cover Image Upload */}
            {photos.length === 0 && (
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                <div className="space-y-2">
                  <Image className="w-8 h-8 mx-auto text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">No images added yet</p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => coverInputRef.current?.click()}
                    disabled={isUploadingCover}
                  >
                    {isUploadingCover ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Cover Image
                      </>
                    )}
                  </Button>
                  <input
                    ref={coverInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleCoverUpload}
                  />
                </div>
              </div>
            )}

            {/* Photo Grid */}
            <div className="grid grid-cols-3 gap-3">
              {photos.map((photo) => (
                <div key={photo} className="relative group">
                  <img
                    src={photo}
                    alt="Project"
                    className="w-full h-24 object-cover rounded-lg border border-border"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant={coverImage === photo ? 'default' : 'secondary'}
                      onClick={() => setCoverImage(photo)}
                      className="text-xs"
                    >
                      {coverImage === photo ? 'Cover' : 'Set Cover'}
                    </Button>
                    <Button
                      type="button"
                      size="icon"
                      variant="destructive"
                      className="h-7 w-7"
                      onClick={() => removePhoto(photo)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                  {coverImage === photo && (
                    <Badge className="absolute top-2 left-2 text-xs">Cover</Badge>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="btn-accent">
              {project ? 'Update Project' : 'Add Project'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
