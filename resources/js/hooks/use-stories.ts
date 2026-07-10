import axios from 'axios';
import { useCallback, useState } from 'react';

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

export interface StoryUser {
    id: string;
    name: string;
    username: string;
    avatar?: string;
    avatar_variants?: {
        sm?: string | null;
        md?: string | null;
        lg?: string | null;
        original?: string | null;
    } | null;
    avatar_processing_status?: 'queued' | 'processing' | 'ready' | 'failed' | 'skipped' | null;
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
    user: StoryUser;
    media: StoryMedia[];
    is_viewed?: boolean;
    view_count?: number;
    viewer_reaction?: string | null;
    reaction_summary?: Record<string, number>;
}

export interface StoryGroup {
    user: StoryUser;
    has_unseen: boolean;
    latest_story_at: string;
    stories: Story[];
}

interface StoryDetailsPayload {
    story: Story;
    prev_story_id: string | null;
    next_story_id: string | null;
}

export function useStories() {
    const [groups, setGroups] = useState<StoryGroup[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchGroups = useCallback(async (feed: 'for-you' | 'following' = 'for-you') => {
        setLoading(true);
        setError(null);

        try {
            const response = await axios.get<{ data: StoryGroup[] }>(`/api/stories?feed=${feed}`);
            setGroups(response.data.data || []);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load stories');
        } finally {
            setLoading(false);
        }
    }, []);

    const createStory = useCallback(async (payload: {
        media?: File[];
        caption?: string;
        durationSeconds?: Array<number | undefined>;
        music?: File;
        musicDurationSeconds?: number;
    }) => {
        const formData = new FormData();

        (payload.media ?? []).forEach((file, index) => {
            formData.append(`media[${index}]`, file);
        });

        if (payload.caption) {
            formData.append('caption', payload.caption);
        }

        payload.durationSeconds?.forEach((duration, index) => {
            if (typeof duration === 'number') {
                formData.append(`duration_seconds[${index}]`, duration.toString());
            }
        });

        if (payload.music) {
            formData.append('music', payload.music);
        }

        if (typeof payload.musicDurationSeconds === 'number') {
            formData.append('music_duration_seconds', payload.musicDurationSeconds.toString());
        }

        const response = await axios.post<{ data: Story }>('/api/stories', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        return response.data.data;
    }, []);

    const fetchStoryDetails = useCallback(async (storyId: string) => {
        const response = await axios.get<{ data: StoryDetailsPayload }>(`/api/stories/${storyId}`);
        return response.data.data;
    }, []);

    const markViewed = useCallback(async (storyId: string) => {
        await axios.post(`/api/stories/${storyId}/view`);
        setGroups((prev) =>
            prev.map((group) => {
                const updatedStories = group.stories.map((story) =>
                    story.id === storyId ? { ...story, is_viewed: true } : story,
                );
                return {
                    ...group,
                    stories: updatedStories,
                    has_unseen: updatedStories.some((story) => !story.is_viewed),
                };
            }),
        );
    }, []);

    const react = useCallback(async (storyId: string, emoji: string) => {
        await axios.post(`/api/stories/${storyId}/reaction`, { emoji });
    }, []);

    return {
        groups,
        setGroups,
        loading,
        error,
        fetchGroups,
        createStory,
        fetchStoryDetails,
        markViewed,
        react,
    };
}
