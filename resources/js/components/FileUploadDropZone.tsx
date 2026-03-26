import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import projects from '@/routes/projects';
import axios from 'axios';
import { File, FileText, Image, Music, Trash2, Upload, Video } from 'lucide-react';
import React, { useCallback, useState } from 'react';
import toast from 'react-hot-toast';

interface FileItem {
    id: string;
    name: string;
    size: number;
    type: string;
    created_at?: string;
    file_path?: string;
}

interface FileUploadDropZoneProps {
    projectId: string;
    onFilesUploaded?: (files: FileItem[]) => void;
    existingFiles?: FileItem[];
    onFileDeleted?: (fileId: string) => void;
}

export default function FileUploadDropZone({ projectId, onFilesUploaded, existingFiles = [], onFileDeleted }: FileUploadDropZoneProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [files, setFiles] = useState<FileItem[]>(existingFiles);
    const [deletingFiles, setDeletingFiles] = useState<Set<string>>(new Set());

    const handleDragEnter = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    }, []);

    const uploadFiles = async (filesToUpload: File[]) => {
        if (filesToUpload.length === 0) return;

        setIsUploading(true);
        const formData = new FormData();

        filesToUpload.forEach((file) => {
            formData.append('files[]', file);
        });

        try {
            const response = await axios.post(projects.files.upload.url(projectId), formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
                    setUploadProgress(percentCompleted);
                },
            });

            const uploadedFiles = response.data.files || [];
            setFiles((prev) => [...prev, ...uploadedFiles]);
            onFilesUploaded?.(uploadedFiles);
            toast.success(`${uploadedFiles.length} file(s) uploaded successfully`);
            setUploadProgress(0);
        } catch (error: any) {
            console.error('Upload error:', error);
            toast.error(error.response?.data?.message || 'Failed to upload files. Please try again.');
        } finally {
            setIsUploading(false);
            setUploadProgress(0);
        }
    };

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const droppedFiles = Array.from(e.dataTransfer.files);
        if (droppedFiles.length > 0) {
            uploadFiles(droppedFiles);
        }
    }, []);

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = Array.from(e.target.files || []);
        if (selectedFiles.length > 0) {
            uploadFiles(selectedFiles);
        }
    };

    const handleDeleteFile = async (fileId: string) => {
        setDeletingFiles((prev) => new Set(prev).add(fileId));

        try {
            await axios.delete(projects.files.delete.url({ project: projectId, file: fileId }));

            setFiles((prev) => prev.filter((f) => f.id !== fileId));
            onFileDeleted?.(fileId);
            toast.success('File deleted successfully');
        } catch (error: any) {
            console.error('Delete error:', error);
            toast.error(error.response?.data?.message || 'Failed to delete file');
        } finally {
            setDeletingFiles((prev) => {
                const newSet = new Set(prev);
                newSet.delete(fileId);
                return newSet;
            });
        }
    };

    const getFileIcon = (fileName: string) => {
        const ext = fileName.split('.').pop()?.toLowerCase();

        if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(ext || '')) {
            return <Image className="h-4 w-4 text-blue-500" />;
        }
        if (['mp3', 'wav', 'flac', 'aac'].includes(ext || '')) {
            return <Music className="h-4 w-4 text-purple-500" />;
        }
        if (['mp4', 'avi', 'mov', 'mkv'].includes(ext || '')) {
            return <Video className="h-4 w-4 text-red-500" />;
        }
        if (['pdf', 'doc', 'docx', 'txt'].includes(ext || '')) {
            return <FileText className="h-4 w-4 text-orange-500" />;
        }

        return <File className="h-4 w-4 text-gray-500" />;
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
    };

    const formatDate = (dateString?: string): string => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    return (
        <div className="space-y-6">
            {/* Upload Area */}
            <Card>
                <CardHeader>
                    <CardTitle>Upload Files</CardTitle>
                    <CardDescription>Drag and drop files here or click to browse</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div
                        onDragEnter={handleDragEnter}
                        onDragLeave={handleDragLeave}
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                        className={`rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
                            isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'
                        } ${isUploading ? 'pointer-events-none opacity-50' : ''}`}
                    >
                        <div className="flex flex-col items-center space-y-2">
                            <div className="bg-primary/10 rounded-full p-3">
                                <Upload className="text-primary h-6 w-6" />
                            </div>
                            <div>
                                <p className="font-medium">{isDragging ? 'Drop files here' : 'Drag files here to upload'}</p>
                                <p className="text-muted-foreground text-sm">
                                    or{' '}
                                    <label className="text-primary cursor-pointer hover:underline">
                                        browse your files
                                        <input
                                            type="file"
                                            multiple
                                            onChange={handleFileInput}
                                            className="hidden"
                                            disabled={isUploading}
                                            accept="*/*"
                                        />
                                    </label>
                                </p>
                            </div>
                            <p className="text-muted-foreground text-xs">Maximum file size: 10 MB per file</p>
                        </div>
                    </div>

                    {isUploading && (
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Uploading...</span>
                                <span className="text-muted-foreground text-sm">{uploadProgress}%</span>
                            </div>
                            <Progress value={uploadProgress} className="h-2" />
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Files List */}
            {files.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Uploaded Files</CardTitle>
                        <CardDescription>
                            {files.length} {files.length === 1 ? 'file' : 'files'} uploaded
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {files.map((file) => (
                                <div
                                    key={file.id}
                                    className="hover:bg-accent group flex items-center justify-between rounded-lg border p-3 transition-colors"
                                >
                                    <div className="flex min-w-0 flex-1 items-center gap-3">
                                        {getFileIcon(file.name || file.file_path || '')}
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2">
                                                <p className="truncate font-medium">{file.name || file.file_path?.split('/').pop()}</p>
                                                <Badge variant="outline" className="text-xs">
                                                    {formatFileSize(file.size)}
                                                </Badge>
                                            </div>
                                            {file.created_at && <p className="text-muted-foreground text-xs">{formatDate(file.created_at)}</p>}
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDeleteFile(file.id)}
                                        disabled={deletingFiles.has(file.id)}
                                        className="opacity-0 transition-opacity group-hover:opacity-100"
                                    >
                                        <Trash2 className="text-destructive h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
