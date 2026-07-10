import axiosInstance from '@/lib/axios';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, X, Camera } from 'lucide-react';
import { useState, useRef } from 'react';

interface User {
    id: string;
    name: string;
    username: string;
    phone?: string;
    bio?: string;
    avatar?: string;
    cover?: string;
}

interface ProfileEditDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    user: User;
    onSuccess?: (updatedUser: User) => void;
}

export function ProfileEditDialog({
    open,
    onOpenChange,
    user,
    onSuccess,
}: ProfileEditDialogProps) {
    const [name, setName] = useState(user.name);
    const [username, setUsername] = useState(user.username);
    const [phone, setPhone] = useState(user.phone || '');
    const [bio, setBio] = useState(user.bio || '');
    const [avatar, setAvatar] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [cover, setCover] = useState<File | null>(null);
    const [coverPreview, setCoverPreview] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const coverInputRef = useRef<HTMLInputElement>(null);

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setAvatar(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setCover(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setCoverPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async () => {
        if (!name.trim()) {
            setError('Name is required');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append('name', name);
            formData.append('username', username);
            formData.append('phone', phone);
            formData.append('bio', bio);
            if (avatar) {
                formData.append('avatar', avatar);
            }
            if (cover) {
                formData.append('cover', cover);
            }

            const response = await axiosInstance.patch('/api/users/profile', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.data.user) {
                onSuccess?.(response.data.user);
                onOpenChange(false);
            }
        } catch (err) {
            const apiError = err as {
                response?: {
                    data?: {
                        message?: string;
                        error?: string;
                    };
                };
            };
            const errorMessage = apiError.response?.data?.message ||
                                apiError.response?.data?.error ||
                                'Failed to update profile';
            setError(errorMessage);
            console.error('Failed to update profile:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        setName(user.name);
        setUsername(user.username);
        setPhone(user.phone || '');
        setBio(user.bio || '');
        setAvatar(null);
        setAvatarPreview(null);
        setCover(null);
        setCoverPreview(null);
        setError(null);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="grid max-h-[90dvh] w-full max-w-md grid-rows-[auto_minmax(0,1fr)_auto] gap-0 overflow-hidden p-0">
                <DialogHeader className="border-b border-border px-6 py-4">
                    <div className="flex items-center justify-between gap-3">
                        <DialogTitle>Edit Profile</DialogTitle>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleClose}
                            className="h-8 w-8"
                        >
                            <X className="h-5 w-5" />
                        </Button>
                    </div>
                    <DialogDescription className="hidden" />
                </DialogHeader>

                <div className="min-h-0 space-y-6 overflow-y-auto px-6 py-6">
                    <div
                        role="button"
                        tabIndex={0}
                        onClick={() => coverInputRef.current?.click()}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                coverInputRef.current?.click();
                            }
                        }}
                        className="group relative h-36 overflow-hidden rounded-2xl border border-border bg-muted/20"
                    >
                        {coverPreview || user.cover ? (
                            <img
                                src={coverPreview || user.cover || undefined}
                                alt={`${user.name} cover`}
                                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                            />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-200 via-slate-100 to-white text-sm font-medium text-slate-600">
                                Add cover photo
                            </div>
                        )}
                        <div className="absolute inset-0 bg-black/15 transition-colors group-hover:bg-black/25" />
                        <div className="absolute right-3 top-3 rounded-full bg-white/90 p-2 text-slate-900 shadow-sm">
                            <Camera className="h-4 w-4" />
                        </div>
                        <div className="absolute bottom-3 left-3 rounded-full bg-black/60 px-3 py-1 text-xs font-semibold text-white">
                            Change cover
                        </div>
                        <input
                            ref={coverInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleCoverChange}
                            className="hidden"
                            aria-label="Upload cover"
                        />
                    </div>

                    <div className="flex flex-col items-center gap-4">
                        <div className="relative">
                            <Avatar className="h-24 w-24 border-4 border-border">
                                <AvatarImage
                                    src={avatarPreview || user.avatar || undefined}
                                    alt={user.name}
                                />
                                <AvatarFallback className="text-2xl bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                                    {user.name.slice(0, 2).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="absolute bottom-0 right-0 bg-primary rounded-full p-2 text-white hover:bg-primary/90 transition-colors"
                            >
                                <Camera className="h-4 w-4" />
                            </button>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleAvatarChange}
                                className="hidden"
                                aria-label="Upload avatar"
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                placeholder="Your name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                disabled={isLoading}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="username">Username</Label>
                            <div className="flex items-center gap-2">
                                <span className="text-muted-foreground">@</span>
                                <Input
                                    id="username"
                                    placeholder="username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value.replace(/[^a-z0-9_-]/gi, ''))}
                                    disabled={isLoading}
                                    className="flex-1"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input
                                id="phone"
                                type="tel"
                                placeholder="Your phone number"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                disabled={isLoading}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="bio">Bio</Label>
                            <Textarea
                                id="bio"
                                placeholder="Tell us about yourself"
                                value={bio}
                                onChange={(e) => setBio(e.target.value.slice(0, 500))}
                                disabled={isLoading}
                                className="resize-none"
                                rows={4}
                            />
                            <p className="text-xs text-muted-foreground">
                                {bio.length}/500
                            </p>
                        </div>

                    </div>
                </div>

                <div className="relative z-[80] border-t border-border bg-background px-6 py-4 shadow-[0_-18px_40px_rgba(15,23,42,0.22)]">
                    <Button
                        onClick={handleSave}
                        disabled={isLoading}
                        className="w-full rounded-2xl"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            'Save Changes'
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
