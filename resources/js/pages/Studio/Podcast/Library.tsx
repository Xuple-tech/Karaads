// resources/js/Pages/Podcast/Library.tsx
import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Search,
  Filter,
  Grid3x3,
  List,
  Calendar,
  Clock,
  Download,
  Trash2,
  Share2,
  MoreVertical,
  Play,
  Music,
  TrendingUp,
} from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import PodcastPlayer from '@/components/Podcast/PodcastPlayer';

// Define Podcast type
interface Podcast {
  id: string;
  title: string;
  topic: string;
  genre: string;
  duration: number;
  script: string;
  created_at: string;
  voice: string;
  audio_url?: string;
}

interface PodcastLibraryProps {
  podcasts: Podcast[];
}

export default function PodcastLibrary({ podcasts }: PodcastLibraryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'duration'>('newest');
  const [playingEpisode, setPlayingEpisode] = useState<Podcast | null>(null);

  // Filter and sort podcasts
  const filteredPodcasts = podcasts
    .filter(podcast =>
      podcast.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      podcast.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
      podcast.genre.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'duration':
          return b.duration - a.duration;
        default:
          return 0;
      }
    });

  // Get statistics
  const totalDuration = podcasts.reduce((sum, podcast) => sum + podcast.duration, 0);
  const totalEpisodes = podcasts.length;
  const genres = [...new Set(podcasts.map(p => p.genre))];

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const getGenreColor = (genre: string): string => {
    const colors: Record<string, string> = {
      'news': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      'technology': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
      'business': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      'health': 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300',
      'education': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
      'entertainment': 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300',
      'science': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300',
      'storytelling': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    };
    return colors[genre] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
  };

  return (
    <AppLayout>
      <Head title="Podcast Library" />

      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Podcast Library
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  Manage and listen to all your generated podcasts
                </p>
              </div>
              <Link href="/podcast/generate">
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  <Music className="mr-2 h-4 w-4" />
                  New Podcast
                </Button>
              </Link>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Total Episodes</p>
                      <p className="text-3xl font-bold mt-2">{totalEpisodes}</p>
                    </div>
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <Music className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Total Listening</p>
                      <p className="text-3xl font-bold mt-2">{formatDuration(totalDuration)}</p>
                    </div>
                    <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                      <Clock className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Genres</p>
                      <p className="text-3xl font-bold mt-2">{genres.length}</p>
                    </div>
                    <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                      <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Controls Bar */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search podcasts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <Filter className="mr-2 h-4 w-4" />
                    Sort: {sortBy === 'newest' ? 'Newest' : sortBy === 'oldest' ? 'Oldest' : 'Duration'}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setSortBy('newest')}>
                    <Calendar className="mr-2 h-4 w-4" />
                    Newest First
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy('oldest')}>
                    <Calendar className="mr-2 h-4 w-4" />
                    Oldest First
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy('duration')}>
                    <Clock className="mr-2 h-4 w-4" />
                    Duration
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button
                variant="outline"
                size="icon"
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              >
                {viewMode === 'grid' ? (
                  <List className="h-4 w-4" />
                ) : (
                  <Grid3x3 className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Podcasts Grid/List */}
          {filteredPodcasts.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-16 text-center">
                <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                  <Music className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No podcasts found</h3>
                <p className="text-gray-500 mb-6">
                  {searchQuery ? 'Try a different search term' : 'Create your first podcast to get started'}
                </p>
                <Link href="/podcast/generate">
                  <Button>Generate Podcast</Button>
                </Link>
              </CardContent>
            </Card>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPodcasts.map((podcast) => (
                <Card
                  key={podcast.id}
                  className="group hover:shadow-xl transition-all duration-300 hover:border-blue-300 dark:hover:border-blue-700"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg truncate">{podcast.title}</CardTitle>
                        <CardDescription className="truncate">{podcast.topic}</CardDescription>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => setPlayingEpisode(podcast)}>
                            <Play className="mr-2 h-4 w-4" />
                            Play
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <a href={`/podcast/${podcast.id}/download`}>
                              <Download className="mr-2 h-4 w-4" />
                              Download
                            </a>
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Share2 className="mr-2 h-4 w-4" />
                            Share
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={getGenreColor(podcast.genre)}>
                          {podcast.genre}
                        </Badge>
                        <Badge variant="outline">
                          <Clock className="mr-1 h-3 w-3" />
                          {podcast.duration}m
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                        {podcast.script.substring(0, 150)}...
                      </p>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>{formatDate(podcast.created_at)}</span>
                        <span>{podcast.voice}</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => setPlayingEpisode(podcast)}
                    >
                      <Play className="mr-2 h-4 w-4" />
                      Play Now
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPodcasts.map((podcast) => (
                <Card key={podcast.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                        <Music className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h3 className="font-semibold truncate">{podcast.title}</h3>
                            <p className="text-sm text-gray-500 truncate">{podcast.topic}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className={getGenreColor(podcast.genre)}>
                              {podcast.genre}
                            </Badge>
                            <Badge variant="outline">
                              {podcast.duration}m
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <span>Created {formatDate(podcast.created_at)} • Voice: {podcast.voice}</span>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setPlayingEpisode(podcast)}
                            >
                              <Play className="mr-2 h-3 w-3" />
                              Play
                            </Button>
                            <Button variant="ghost" size="icon" asChild>
                              <a href={`/podcast/${podcast.id}/download`}>
                                <Download className="h-4 w-4" />
                              </a>
                            </Button>
                            <Button variant="ghost" size="icon">
                              <Share2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Player Modal */}
          {playingEpisode && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold">Now Playing</h2>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setPlayingEpisode(null)}
                    >
                      ✕
                    </Button>
                  </div>
                  <PodcastPlayer
                    audioUrl={playingEpisode.audio_url || ''}
                    title={playingEpisode.title}
                    showDownload={true}
                    showShare={true}
                  />
                  <div className="mt-6 space-y-4">
                    <h3 className="font-semibold">Episode Details</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Topic</p>
                        <p className="font-medium">{playingEpisode.topic}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Duration</p>
                        <p className="font-medium">{playingEpisode.duration} minutes</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Genre</p>
                        <Badge variant="outline" className={getGenreColor(playingEpisode.genre)}>
                          {playingEpisode.genre}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Voice</p>
                        <p className="font-medium">{playingEpisode.voice}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
