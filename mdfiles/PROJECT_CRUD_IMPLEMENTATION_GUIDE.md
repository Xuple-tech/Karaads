# Project CRUD Implementation Guide

## Overview
Complete project management system with file upload capabilities has been implemented. This includes full CRUD operations for projects, file management with drag-and-drop, and modern UI using shadcn/ui components.

## What's Been Implemented

### 1. **Backend Updates**

#### Updated Files:
- **`app/Http/Controllers/ProjectController.php`**
  - Added file upload handling (`uploadFiles` method)
  - Added file deletion method (`deleteFile` method)
  - Enhanced `index` with file/conversation counts
  - Updated validation to remove project_type requirement
  - Added cascade deletion for files when project is deleted

- **`app/Models/ProjectFiles.php`**
  - Added helper methods for download URLs
  - Human-readable file size formatting
  - File icon detection based on extension
  - Proper relationships and casts

- **Database Migrations**
  - Updated `project_files` table with `file_name` column
  - Added proper foreign key with cascade delete
  - Changed `file_size` to bigInteger for large files

- **Routes (`routes/web.php`)**
  - Added file upload route: `POST /projects/{project}/files/upload`
  - Added file delete route: `DELETE /projects/{project}/files/{file}`
  - Updated project routes to include PUT and DELETE
  - All routes protected with `auth` middleware

### 2. **Frontend Components**

#### New Component: `FileUploadDropZone.tsx`
- **Features:**
  - Drag-and-drop file upload
  - Multiple file support
  - Progress bar during upload
  - Visual file list with icons
  - File deletion with confirmation
  - Support for all file types
  - Responsive design

#### Updated Pages:

**`Projects/Index.tsx`**
- Already styled with modern UI
- Display project count
- Create project dialog

**`Projects/Edit.tsx`** (Completely Redesigned)
- Project details form (title, description)
- Integrated FileUploadDropZone component
- Delete project with confirmation dialog
- Breadcrumb navigation
- Back button for easy navigation
- Full file management UI

**`Projects/Show.tsx`** (Enhanced)
- Better file display with icons
- File size formatting
- Download functionality
- Conversation listings
- Modern card-based layout
- Breadcrumb navigation
- Status badges

### 3. **Sidebar Navigation**
- Added "Projects" link to main navigation
- Icon: Folder
- Route: `/projects`
- Appears in main navigation alongside Chat and Voice

## Database Setup

### Required Migrations
Ensure these migrations have been run:
```bash
php artisan migrate
```

### Tables Created/Updated:
1. `projects` - Main projects table (ULID primary key)
2. `project_files` - Files associated with projects (UUID primary key)

## File Upload Specifications

### Supported File Types:
All common file types are supported:
- **Documents**: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT
- **Images**: JPG, JPEG, PNG, GIF, SVG, WebP
- **Audio**: MP3, WAV, FLAC, AAC
- **Video**: MP4, AVI, MOV, MKV
- **Archives**: ZIP, RAR, 7Z, TAR, GZ
- **Others**: Any file type up to 10MB

### File Limits:
- Maximum file size: 10MB per file
- Unlimited files per project
- Storage location: `storage/app/public/projects/{project_id}/`

## Routes Overview

### Project CRUD Routes (Protected by `auth` middleware):
```
GET    /projects                           → Projects Index
POST   /projects                           → Create Project
GET    /projects/{project}                 → Show Project
GET    /projects/{project}/edit            → Edit Project Form
PUT    /projects/{project}                 → Update Project
DELETE /projects/{project}                 → Delete Project

POST   /projects/{project}/files/upload    → Upload Files
DELETE /projects/{project}/files/{file}    → Delete File
```

## Usage Instructions

### Creating a Project
1. Click on "Projects" in sidebar navigation
2. Click "Create Project" button
3. Enter project title and description
4. Click "Create Project"

### Managing Project Details
1. From project view, click "Edit" button
2. Update title and description
3. Click "Update Project"

### Uploading Files
1. Go to Edit Project page
2. In "File Management" section, drag & drop files or click "Browse"
3. Upload progress will be displayed
4. Files appear in the list after upload

### Downloading Files
1. View project (Show page)
2. Hover over file and click download icon
3. Or go to Edit page and click download icon

### Deleting Files
1. Go to Edit Project page
2. Hover over file and click delete icon
3. File is removed immediately

### Deleting Project
1. Go to Edit Project page
2. Click "Delete Project" button
3. Confirm deletion in dialog
4. Project and all associated files are deleted

## Component Props

### FileUploadDropZone Component
```typescript
interface FileUploadDropZoneProps {
    projectId: string;                    // Project ID for upload
    onFilesUploaded?: (files: FileItem[]) => void;  // Callback after upload
    existingFiles?: FileItem[];           // Pre-populate with files
    onFileDeleted?: (fileId: string) => void;       // Callback on delete
}
```

## API Responses

### Upload Files Response
```json
{
    "success": true,
    "files": [
        {
            "id": "uuid-string",
            "project_id": "ulid-string",
            "file_name": "example.pdf",
            "file_path": "projects/ulid/example.pdf",
            "file_type": "application/pdf",
            "file_size": 1024000,
            "created_at": "2024-01-20T10:30:00Z"
        }
    ],
    "message": "1 file(s) uploaded successfully."
}
```

### Delete File Response
```json
{
    "success": true,
    "message": "File deleted successfully."
}
```

## Styling & UI

### Design Principles:
- Modern, clean interface using shadcn/ui components
- Responsive design (mobile, tablet, desktop)
- Smooth transitions and hover effects
- Dark mode support
- Accessible forms and buttons
- Visual feedback for user actions

### Color Coding:
- **Blue**: Images
- **Purple**: Audio files
- **Red**: Video files
- **Orange**: Documents
- **Yellow**: Archive files
- **Gray**: Other files

## TypeScript Types

### Projects Type
Ensure your `@/types` includes:
```typescript
interface Projects {
    id: string;
    title: string;
    description?: string;
    project_type?: string;
    settings?: any;
    files?: ProjectFile[];
    conversations?: Conversation[];
    files_count?: number;
    conversations_count?: number;
    created_at?: string;
    updated_at?: string;
}

interface ProjectFile {
    id: string;
    project_id: string;
    file_name?: string;
    file_path: string;
    file_type?: string;
    file_size?: number;
    meta?: any;
    created_at?: string;
    updated_at?: string;
}
```

## Troubleshooting

### Files Not Uploading
1. Check file size (max 10MB)
2. Verify storage permissions: `chmod -R 775 storage/`
3. Check symbolic link: `php artisan storage:link`
4. Clear browser cache

### Files Not Showing
1. Run migrations: `php artisan migrate`
2. Check database connection
3. Verify files are in `storage/app/public/`

### Routes Not Working
1. Clear route cache: `php artisan route:clear`
2. Verify middleware is installed
3. Check CSRF token in forms

## Security Considerations

1. **File Uploads**
   - Only authenticated users can upload
   - File size limited to 10MB
   - Stored in public directory with proper paths
   - MIME type validation

2. **File Deletion**
   - Only project owner can delete files
   - Verification checks project_id
   - Physical files deleted from storage

3. **Project Management**
   - Only authenticated users can create/edit
   - Cascade delete ensures data consistency
   - CSRF protection on forms

## Performance Tips

1. **Lazy Load Files**
   - Files load on demand
   - Progress indication for uploads

2. **Batch Operations**
   - Multiple files upload in one request
   - Single delete operation per file

3. **Caching**
   - Project counts cached with withCount()
   - Relationships loaded efficiently

## Future Enhancements

Consider implementing:
- [ ] File sharing/permissions
- [ ] File versioning
- [ ] Comment system for projects
- [ ] Project collaboration
- [ ] File preview generation
- [ ] Archive downloads (multiple files)
- [ ] Storage quota management
- [ ] File search functionality

## Support

For issues or questions:
1. Check error messages in browser console
2. Review Laravel logs in `storage/logs/`
3. Verify database migrations ran successfully
4. Check file permissions in storage directory
