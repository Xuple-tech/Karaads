<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Chat;
use App\Models\ChatFile;
use App\Models\Conversation;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class DashboardController extends Controller
{
    /**
     * Display the admin dashboard.
     */
    public function index()
    {
        // Get statistics for the dashboard
        $stats = $this->getStatistics();

        // Get recent image uploads
        $recentImageUploads = $this->getRecentImageUploads();

        // Get top users by image uploads
        $topUsers = $this->getTopUsersByImageUploads();

        return Inertia::render('Admin/Dashboard', [
            'stats' => $stats,
            'recentImageUploads' => $recentImageUploads,
            'topUsers' => $topUsers,
        ]);
    }

    /**
     * Get statistics for the dashboard.
     */
    private function getStatistics()
    {
        // Total users
        $totalUsers = User::count();

        // Total conversations
        $totalConversations = Conversation::count();

        // Total chats
        $totalChats = Chat::count();

        // Total image uploads
        $totalImageUploads = ChatFile::count();

        // Image uploads today
        $imageUploadsToday = ChatFile::whereDate('created_at', today())->count();

        // Image uploads this week
        $imageUploadsThisWeek = ChatFile::whereBetween('created_at', [now()->startOfWeek(), now()])->count();

        // Image uploads this month
        $imageUploadsThisMonth = ChatFile::whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->count();

        // Average image size
        $averageImageSize = ChatFile::avg('file_size');
        $averageImageSizeFormatted = $averageImageSize ? round($averageImageSize / 1024 / 1024, 2) . ' MB' : '0 MB';

        // Total storage used
        $totalStorageUsed = ChatFile::sum('file_size');
        $totalStorageUsedFormatted = $totalStorageUsed ? round($totalStorageUsed / 1024 / 1024, 2) . ' MB' : '0 MB';

        // API Usage Statistics
        $apiUsage = \App\Models\ApiUsageLog::query();

        // Total API requests
        $totalApiRequests = $apiUsage->count();

        // Total tokens used
        $totalTokensUsed = $apiUsage->sum('tokens_used');

        // API requests today
        $apiRequestsToday = (clone $apiUsage)->whereDate('created_at', today())->count();

        // API requests this week
        $apiRequestsThisWeek = (clone $apiUsage)->whereBetween('created_at', [now()->startOfWeek(), now()])->count();

        // API requests this month
        $apiRequestsThisMonth = (clone $apiUsage)->whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->count();

        // Error count
        $errorCount = (clone $apiUsage)->where('status', 'error')->count();

        // Average response time
        $avgResponseTime = (clone $apiUsage)->avg('response_time_ms');
        $avgResponseTimeFormatted = $avgResponseTime ? round($avgResponseTime, 2) . ' ms' : '0 ms';

        // Unique IP addresses
        $uniqueIPs = (clone $apiUsage)->distinct('ip_address')->count('ip_address');

        // Top countries
        $topCountries = (clone $apiUsage)->selectRaw('country, count(*) as count')
            ->whereNotNull('country')
            ->groupBy('country')
            ->orderBy('count', 'desc')
            ->take(5)
            ->get();

        return [
            'totalUsers' => $totalUsers,
            'totalConversations' => $totalConversations,
            'totalChats' => $totalChats,
            'totalImageUploads' => $totalImageUploads,
            'imageUploadsToday' => $imageUploadsToday,
            'imageUploadsThisWeek' => $imageUploadsThisWeek,
            'imageUploadsThisMonth' => $imageUploadsThisMonth,
            'averageImageSize' => $averageImageSizeFormatted,
            'totalStorageUsed' => $totalStorageUsedFormatted,
            // API Usage Stats
            'totalApiRequests' => $totalApiRequests,
            'totalTokensUsed' => $totalTokensUsed,
            'apiRequestsToday' => $apiRequestsToday,
            'apiRequestsThisWeek' => $apiRequestsThisWeek,
            'apiRequestsThisMonth' => $apiRequestsThisMonth,
            'errorCount' => $errorCount,
            'avgResponseTime' => $avgResponseTimeFormatted,
            'uniqueIPs' => $uniqueIPs,
            'topCountries' => $topCountries,
        ];
    }

    /**
     * Get recent image uploads.
     */
    private function getRecentImageUploads()
    {
        return ChatFile::with(['chat' => function ($query) {
                $query->with('conversation.user');
            }])
            ->orderBy('created_at', 'desc')
            ->take(10)
            ->get()
            ->map(function ($file) {
                return [
                    'id' => $file->id,
                    'file_name' => $file->file_name,
                    'file_type' => $file->file_type,
                    'file_size' => round($file->file_size / 1024, 2) . ' KB',
                    'file_path' => asset('storage/' . $file->file_path),
                    'created_at' => $file->created_at->diffForHumans(),
                    'user' => $file->chat->conversation->user ? [
                        'id' => $file->chat->conversation->user->id,
                        'name' => $file->chat->conversation->user->name,
                        'email' => $file->chat->conversation->user->email,
                    ] : null,
                    'conversation_id' => $file->chat->conversation_id,
                    'chat_id' => $file->chat_id,
                ];
            });
    }

    /**
     * Get top users by image uploads.
     */
    private function getTopUsersByImageUploads()
    {
        return User::select('users.id', 'users.name', 'users.email', DB::raw('COUNT(chat_files.id) as upload_count'))
            ->join('conversations', 'users.id', '=', 'conversations.user_id')
            ->join('chats', 'conversations.id', '=', 'chats.conversation_id')
            ->join('chat_files', 'chats.id', '=', 'chat_files.chat_id')
            ->groupBy('users.id', 'users.name', 'users.email')
            ->orderBy('upload_count', 'desc')
            ->take(5)
            ->get();
    }

    /**
     * Show image upload details.
     */
    public function imageUploads(Request $request)
    {
        $query = ChatFile::with(['chat' => function ($query) {
            $query->with('conversation.user');
        }]);

        // Apply filters if provided
        if ($request->has('user_id')) {
            $query->whereHas('chat.conversation', function ($q) use ($request) {
                $q->where('user_id', $request->user_id);
            });
        }

        if ($request->has('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->has('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        if ($request->has('file_type')) {
            $query->where('file_type', 'like', $request->file_type . '%');
        }

        // Paginate results
        $perPage = $request->input('per_page', 15);
        $imageUploads = $query->orderBy('created_at', 'desc')
            ->paginate($perPage)
            ->through(function ($file) {
                return [
                    'id' => $file->id,
                    'file_name' => $file->file_name,
                    'file_type' => $file->file_type,
                    'file_size' => round($file->file_size / 1024, 2) . ' KB',
                    'file_path' => asset('storage/' . $file->filepath),
                    'created_at' => $file->created_at->format('Y-m-d H:i:s'),
                    'user' => $file->chat->conversation->user ? [
                        'id' => $file->chat->conversation->user->id,
                        'name' => $file->chat->conversation->user->name,
                        'email' => $file->chat->conversation->user->email,
                    ] : null,
                    'conversation_id' => $file->chat->conversation_id,
                    'chat_id' => $file->chat_id,
                ];
            });

        return Inertia::render('Admin/ImageUploads', [
            'imageUploads' => $imageUploads,
            'filters' => $request->only(['user_id', 'date_from', 'date_to', 'file_type']),
        ]);
    }

    /**
     * Show user statistics.
     */
    public function userStats()
    {
        $users = User::select('users.id', 'users.name', 'users.email', 'users.created_at')
            ->withCount(['conversations', 'chats'])
            ->withCount(['imageUploads' => function ($query) {
                $query->join('chats', 'conversations.id', '=', 'chats.conversation_id')
                    ->join('chat_files', 'chats.id', '=', 'chat_files.chat_id');
            }])
            ->orderBy('image_uploads_count', 'desc')
            ->paginate(15);

        return Inertia::render('Admin/UserStats', [
            'users' => $users,
        ]);
    }

    /**
     * Delete an image upload.
     */
    public function deleteImage(Request $request, $id)
    {
        $file = ChatFile::findOrFail($id);

        // Delete the file from storage
        if (Storage::disk('public')->exists($file->file_path)) {
            Storage::disk('public')->delete($file->file_path);
        }

        // Delete the record
        $file->delete();

        return redirect()->back()->with('success', 'Image deleted successfully');
    }
}
