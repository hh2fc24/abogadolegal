export const ATTACHMENTS_BUCKET = 'dc-attachments'; // tu bucket real

// 20 MB por archivo
export const MAX_FILE_SIZE = 20 * 1024 * 1024;

export const ALLOWED_MIME = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'image/png',
  'image/jpeg',
  'image/webp',
  'text/plain',
];