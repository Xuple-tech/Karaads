import { InertiaLinkProps } from '@inertiajs/react';
import { LucideIcon } from 'lucide-react';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: NonNullable<InertiaLinkProps['href']>;
    icon?: LucideIcon | null;
    isActive?: boolean;
    onClick?: () => void;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    sidebarOpen: boolean;
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    avatar_variants?: {
        sm?: string | null;
        md?: string | null;
        lg?: string | null;
        original?: string | null;
    } | null;
    avatar_processing_status?: 'queued' | 'processing' | 'ready' | 'failed' | 'skipped' | null;
    email_verified_at: string | null;
    two_factor_enabled?: boolean;
    created_at: string;
    updated_at: string;
    [key: string]: unknown; // This allows for additional properties...
}

export interface StoryMedia {
    id: string;
    path: string;
    thumbnail?: string | null;
    type: 'image' | 'video';
    mime_type?: string;
    duration_seconds?: number | null;
    display_order?: number;
    processing_status?: 'queued' | 'processing' | 'ready' | 'failed' | 'skipped';
    variants?: Record<string, string | null> | null;
}

export interface Story {
    id: string;
    caption?: string | null;
    visibility: 'followers';
    expires_at: string;
    music_url?: string | null;
    music_title?: string | null;
    music_mime_type?: string | null;
    music_duration_seconds?: number | null;
    created_at: string;
    user: {
        id: string;
        name: string;
        username: string;
        avatar?: string;
    };
    media: StoryMedia[];
    is_viewed?: boolean;
    view_count?: number;
    viewer_reaction?: string | null;
    reaction_summary?: Record<string, number>;
}

export interface StoryGroup {
    user: {
        id: string;
        name: string;
        username: string;
        avatar?: string;
    };
    has_unseen: boolean;
    latest_story_at: string;
    stories: Story[];
}

export interface StoryViewerState {
    isOpen: boolean;
    groupIndex: number;
    storyIndex: number;
}
