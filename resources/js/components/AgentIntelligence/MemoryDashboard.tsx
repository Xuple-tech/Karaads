import React, { useState, useEffect } from 'react';
import { Trash2, Download, Search, Tag, BarChart3 } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

interface Memory {
    id: string;
    context: string;
    relevance_score: number;
    tags: string[];
    created_at: string;
    used_count: number;
}

interface MemoryStats {
    total_memories: number;
    avg_relevance: number;
    most_used_tag: string;
    total_reuses: number;
}

interface MemoryDashboardProps {
    projectId: string;
    agentId: string;
}

export default function MemoryDashboard({ projectId, agentId }: MemoryDashboardProps) {
    const [memories, setMemories] = useState<Memory[]>([]);
    const [stats, setStats] = useState<MemoryStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTag, setSelectedTag] = useState<string | null>(null);
    const [allTags, setAllTags] = useState<string[]>([]);

    useEffect(() => {
        loadMemories();
    }, []);

    const loadMemories = async () => {
        try {
            setLoading(true);
            const response = await axios.get(
                `/api/projects/${projectId}/agents/${agentId}/memories`
            );
            setMemories(response.data.memories || []);
            setStats(response.data.stats);

            // Extract all unique tags
            const tags = new Set<string>();
            response.data.memories?.forEach((m: Memory) => {
                m.tags?.forEach(tag => tags.add(tag));
            });
            setAllTags(Array.from(tags));
        } catch (error) {
            toast.error('Failed to load memories');
        } finally {
            setLoading(false);
        }
    };

    const deleteMemory = async (id: string) => {
        if (!confirm('Delete this memory?')) return;

        try {
            await axios.delete(
                `/api/projects/${projectId}/agents/${agentId}/memories/${id}`
            );
            toast.success('Memory deleted');
            await loadMemories();
        } catch (error) {
            toast.error('Failed to delete memory');
        }
    };

    const searchMemories = async () => {
        if (!searchQuery.trim()) {
            loadMemories();
            return;
        }

        try {
            const response = await axios.get(
                `/api/projects/${projectId}/agents/${agentId}/memories/search`,
                { params: { q: searchQuery } }
            );
            setMemories(response.data.memories || []);
        } catch (error) {
            toast.error('Search failed');
        }
    };

    const exportMemories = async () => {
        try {
            const response = await axios.get(
                `/api/projects/${projectId}/agents/${agentId}/memories/export`,
                { responseType: 'blob' }
            );

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `memories-${new Date().toISOString()}.md`);
            document.body.appendChild(link);
            link.click();
            link.parentNode?.removeChild(link);

            toast.success('Memories exported');
        } catch (error) {
            toast.error('Export failed');
        }
    };

    const clearAllMemories = async () => {
        if (!confirm('Clear ALL memories? This cannot be undone.')) return;

        try {
            await axios.post(
                `/api/projects/${projectId}/agents/${agentId}/memories/clear`
            );
            toast.success('All memories cleared');
            await loadMemories();
        } catch (error) {
            toast.error('Failed to clear memories');
        }
    };

    const filteredMemories = memories.filter(m => {
        const matchesSearch = !searchQuery.trim() ||
            m.context.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesTag = !selectedTag || m.tags.includes(selectedTag);
        return matchesSearch && matchesTag;
    });

    if (loading) {
        return <div className="text-center py-8">Loading memories...</div>;
    }

    return (
        <div className="space-y-4 max-w-6xl mx-auto p-4 bg-white dark:bg-gray-900 rounded-lg border">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Agent Memory Dashboard</h2>
                <div className="flex gap-2">
                    <button
                        onClick={exportMemories}
                        className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-2 text-sm"
                    >
                        <Download size={16} /> Export
                    </button>
                    <button
                        onClick={clearAllMemories}
                        className="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                    >
                        Clear All
                    </button>
                </div>
            </div>

            {/* Stats */}
            {stats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 bg-blue-50 dark:bg-blue-900 rounded border border-blue-200 dark:border-blue-700">
                    <div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Total Memories</div>
                        <div className="text-2xl font-bold">{stats.total_memories}</div>
                    </div>
                    <div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Avg Relevance</div>
                        <div className="text-2xl font-bold">{stats.avg_relevance.toFixed(2)}</div>
                    </div>
                    <div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Total Reuses</div>
                        <div className="text-2xl font-bold">{stats.total_reuses}</div>
                    </div>
                    <div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Top Tag</div>
                        <div className="text-2xl font-bold truncate">{stats.most_used_tag || 'N/A'}</div>
                    </div>
                </div>
            )}

            {/* Search */}
            <div className="space-y-3">
                <div className="flex gap-2">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyUp={(e) => e.key === 'Enter' && searchMemories()}
                            placeholder="Search memories..."
                            className="w-full pl-10 pr-3 py-2 border rounded dark:bg-gray-800 dark:border-gray-600"
                        />
                    </div>
                    <button
                        onClick={searchMemories}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        Search
                    </button>
                </div>

                {/* Tag Filter */}
                {allTags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => setSelectedTag(null)}
                            className={`px-3 py-1 rounded text-sm transition ${
                                selectedTag === null
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300'
                            }`}
                        >
                            All
                        </button>
                        {allTags.map(tag => (
                            <button
                                key={tag}
                                onClick={() => setSelectedTag(tag)}
                                className={`px-3 py-1 rounded text-sm transition flex items-center gap-1 ${
                                    selectedTag === tag
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300'
                                }`}
                            >
                                <Tag size={14} /> {tag}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Memories List */}
            <div className="space-y-2">
                {filteredMemories.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        {memories.length === 0 ? 'No memories yet.' : 'No memories match your filters.'}
                    </div>
                ) : (
                    filteredMemories.map(memory => (
                        <div
                            key={memory.id}
                            className="p-4 bg-gray-50 dark:bg-gray-800 border rounded hover:shadow-md transition"
                        >
                            <div className="flex justify-between items-start gap-4">
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm line-clamp-2">{memory.context}</p>

                                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                                        {/* Relevance Score */}
                                        <div className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded">
                                            <BarChart3 className="inline mr-1" size={12} />
                                            Relevance: {memory.relevance_score.toFixed(2)}
                                        </div>

                                        {/* Used Count */}
                                        <div className="text-xs px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded">
                                            Used {memory.used_count} times
                                        </div>

                                        {/* Tags */}
                                        {memory.tags && memory.tags.map(tag => (
                                            <span
                                                key={tag}
                                                className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded cursor-pointer hover:bg-gray-300"
                                                onClick={() => setSelectedTag(tag)}
                                            >
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>

                                    <div className="text-xs text-gray-500 mt-2">
                                        {new Date(memory.created_at).toLocaleString()}
                                    </div>
                                </div>

                                <button
                                    onClick={() => deleteMemory(memory.id)}
                                    className="p-2 hover:bg-red-200 dark:hover:bg-red-900 rounded text-red-600 flex-shrink-0"
                                    title="Delete memory"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
