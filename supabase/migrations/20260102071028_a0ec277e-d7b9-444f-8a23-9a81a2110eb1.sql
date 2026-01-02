-- Create storage bucket for leave documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('leave-documents', 'leave-documents', false);