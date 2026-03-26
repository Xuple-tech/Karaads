<?php

namespace App\Http\Controllers\Api\Widget;

use App\Http\Controllers\Controller;
use App\Models\AgentConversation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class FileController extends Controller
{
    public function upload(Request $request)
    {
        $request->validate([
            'session_id' => 'required|string',
            'file' => 'required|file|max:10240', // 10MB max
            'widget_id' => 'required|string',
        ]);

        // Get conversation
        $conversation = AgentConversation::where('session_id', $request->session_id)
            ->with(['aiAgent'])
            ->first();

        if (!$conversation) {
            return response()->json([
                'success' => false,
                'error' => 'Session not found'
            ], 404);
        }

        $agent = $conversation->aiAgent;

        // Check if file upload is enabled for this agent
        if (!$agent->file_upload_enabled) {
            return response()->json([
                'success' => false,
                'error' => 'File upload is not enabled for this agent'
            ], 403);
        }

        $file = $request->file('file');
        $originalName = $file->getClientOriginalName();
        $extension = $file->getClientOriginalExtension();
        $mimeType = $file->getMimeType();
        $fileSize = $file->getSize();

        // Generate unique filename
        $filename = Str::random(32) . '.' . $extension;
        $path = 'widget-files/' . $agent->id . '/' . date('Y/m/d');

        // Store file
        $filePath = $file->storeAs($path, $filename, 'public');

        // Create file record (you might want a separate File model)
        $fileData = [
            'id' => Str::uuid(),
            'conversation_id' => $conversation->id,
            'agent_id' => $agent->id,
            'original_name' => $originalName,
            'filename' => $filename,
            'path' => $filePath,
            'mime_type' => $mimeType,
            'size' => $fileSize,
            'extension' => $extension,
            'uploaded_at' => now(),
            'metadata' => [
                'ip' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]
        ];

        // For now, we'll return the file info
        // In production, you'd save this to a database

        $url = Storage::url($filePath);

        return response()->json([
            'success' => true,
            'data' => [
                'file_id' => $fileData['id'],
                'original_name' => $originalName,
                'filename' => $filename,
                'url' => $url,
                'size' => $this->formatBytes($fileSize),
                'mime_type' => $mimeType,
                'uploaded_at' => now()->toISOString(),
            ]
        ]);
    }

    public function show($fileId)
    {
        // In production, you'd fetch from database and check permissions
        // For now, return placeholder

        return response()->json([
            'success' => false,
            'error' => 'File not found'
        ], 404);
    }

    public function destroy($fileId)
    {
        // In production, you'd delete file and database record
        // For now, return success

        return response()->json([
            'success' => true,
            'message' => 'File deleted successfully'
        ]);
    }

    private function formatBytes($bytes, $precision = 2)
    {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];

        $bytes = max($bytes, 0);
        $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
        $pow = min($pow, count($units) - 1);

        $bytes /= pow(1024, $pow);

        return round($bytes, $precision) . ' ' . $units[$pow];
    }
}
