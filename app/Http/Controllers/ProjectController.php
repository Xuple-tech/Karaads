<?php

namespace App\Http\Controllers;

use App\Models\Projects;
use App\Models\ProjectFiles;
use App\Models\ProjectMember;
use App\Models\ProjectTemplate;
use App\Models\ProjectVersion;
use App\Models\ProjectActivity;
use App\Models\User;
use App\Services\ProjectService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class ProjectController extends Controller
{
    private ProjectService $projectService;

    public function __construct(ProjectService $projectService)
    {
        $this->projectService = $projectService;
    }

    /**
     * Display a listing of projects
     */
    public function index(Request $request)
    {
        $filters = $request->only(['status', 'visibility', 'search']);

        $projects = $this->projectService->getUserProjects($filters);

        return Inertia::render('Projects/Index', [
            'projects' => $projects,
            'filters' => $filters,
        ]);
    }

    /**
     * Show the create project form
     */
    public function create()
    {
        return Inertia::render('Projects/Create');
    }

    /**
     * Store a newly created project
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'visibility' => 'nullable|in:private,shared,public',
            'settings' => 'nullable|array',
        ]);

        try {
            $project = $this->projectService->createProject($validated);

            return redirect()->route('projects.dashboard', $project->id)
                ->with('success', 'Project created successfully!');
        } catch (\Exception $e) {
            Log::error('Project creation failed', ['error' => $e->getMessage()]);
            return back()->withErrors('Failed to create project. Please try again.');
        }
    }

    /**
     * Display project dashboard
     */
    public function dashboard(Projects $project, Request $request)
    {
        // Check if user has access to this project
        if (!$project->isOwner(Auth::id()) && !$project->hasMember(Auth::id())) {
            abort(403, 'You do not have access to this project.');
        }

        $project = $this->projectService->getProjectWithRelations($project);
        $stats = $this->projectService->getProjectStats($project);

        $recentConversations = $project->conversations()
            ->latest()
            ->limit(5)
            ->get();

        $recentFiles = $project->files()
            ->latest()
            ->limit(5)
            ->get();

        $recentActivities = $project->activities()
            ->with('user')
            ->latest()
            ->limit(10)
            ->get();

        return Inertia::render('Projects/Dashboard', [
            'project' => $project,
            'stats' => $stats,
            'recentConversations' => $recentConversations,
            'recentFiles' => $recentFiles,
            'recentActivities' => $recentActivities,
        ]);
    }

    /**
     * Display project show page
     */
    public function show(Projects $project)
    {
        // Check if user has access to this project
        if (!$project->isOwner(Auth::id()) && !$project->hasMember(Auth::id())) {
            abort(403, 'You do not have access to this project.');
        }

        $project->load('conversations', 'files', 'members.user');

        return Inertia::render('Projects/Show', [
            'project' => $project,
        ]);
    }

    /**
     * Show project edit form
     */
    public function edit(Projects $project)
    {
        // Check if user can update this project
        if (!$project->isOwner(Auth::id()) && $project->getMemberRole(Auth::id()) !== 'admin') {
            abort(403, 'You do not have permission to edit this project.');
        }

        return Inertia::render('Projects/Edit', [
            'project' => $project->load('files'),
        ]);
    }

    /**
     * Update project
     */
    public function update(Request $request, Projects $project)
    {
        // Check if user can update this project
        if (!$project->isOwner(Auth::id()) && $project->getMemberRole(Auth::id()) !== 'admin') {
            abort(403, 'You do not have permission to update this project.');
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'settings' => 'nullable|array',
        ]);

        try {
            $this->projectService->updateProject($project, $validated);

            return redirect()->route('projects.dashboard', $project->id)
                ->with('success', 'Project updated successfully!');
        } catch (\Exception $e) {
            Log::error('Project update failed', ['error' => $e->getMessage()]);
            return back()->withErrors('Failed to update project. Please try again.');
        }
    }

    /**
     * Delete project
     */
    public function destroy(Projects $project)
    {
        // Only owner can delete project
        if (!$project->isOwner(Auth::id())) {
            abort(403, 'Only the project owner can delete this project.');
        }

        try {
            $this->projectService->deleteProject($project);

            return redirect()->route('p.i')
                ->with('success', 'Project deleted successfully!');
        } catch (\Exception $e) {
            Log::error('Project deletion failed', ['error' => $e->getMessage()]);
            return back()->withErrors('Failed to delete project. Please try again.');
        }
    }

    /**
     * Show project settings
     */
    public function settings(Projects $project)
    {
        $this->authorize('update', $project);

        return Inertia::render('Projects/Settings', [
            'project' => $project->load('category'),
        ]);
    }

    /**
     * Update project settings
     */
    public function updateSettings(Request $request, Projects $project)
    {
        // $this->authorize('update', $project);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'visibility' => 'required|in:private,shared,public',
            'status' => 'required|in:active,archived',
            'logo' => 'nullable|image|mimes:jpeg,png,gif|max:2048',
        ]);

        try {
            // Handle logo upload
            if ($request->hasFile('logo')) {
                if ($project->logo) {
                    Storage::disk('public')->delete($project->logo);
                }
                $validated['logo'] = $request->file('logo')->store('project-logos', 'public');
            }

            $this->projectService->updateProject($project, $validated);

            return redirect()->back()
                ->with('success', 'Settings updated successfully!');
        } catch (\Exception $e) {
            Log::error('Settings update failed', ['error' => $e->getMessage()]);
            return back()->withErrors('Failed to update settings. Please try again.');
        }
    }

    /**
     * Show project collaboration page
     */
    public function collaboration(Projects $project)
    {
        // $this->authorize('view', $project);

        $project->load(['members' => function ($query) {
            $query->with('user');
        }]);

        return Inertia::render('Projects/Collaboration', [
            'project' => $project,
            'members' => $project->members->map(function ($member) {
                return [
                    'id' => $member->id,
                    'user_id' => $member->user_id,
                    'name' => $member->user->name,
                    'email' => $member->user->email,
                    'avatar' => $member->user->avatar ?? null,
                    'role' => $member->role,
                    'joined_at' => $member->created_at,
                ];
            }),
            'currentUserRole' => Auth::id() === $project->user_id ? 'owner' : $project->getMemberRole(Auth::id()),
        ]);
    }

    /**
     * Add member to project
     */
    public function addMember(Request $request, Projects $project)
    {
        // $this->authorize('update', $project);

        $validated = $request->validate([
            'email' => 'required|email|exists:users,email',
            'role' => 'required|in:viewer,member,admin',
        ]);

        try {
            $this->projectService->addMember($project, $validated['email'], $validated['role']);

            return response()->json([
                'success' => true,
                'message' => 'Member added successfully!',
            ]);
        } catch (\Exception $e) {
            Log::error('Member addition failed', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Update member role
     */
    public function updateMember(Request $request, Projects $project, ProjectMember $member)
    {
        // $this->authorize('update', $project);

        if ($member->project_id !== $project->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'role' => 'required|in:viewer,member,admin',
        ]);

        try {
            $this->projectService->updateMemberRole($project, $member, $validated['role']);

            return response()->json([
                'success' => true,
                'message' => 'Member role updated successfully!',
            ]);
        } catch (\Exception $e) {
            Log::error('Member update failed', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to update member role',
            ], 400);
        }
    }

    /**
     * Remove member from project
     */
    public function removeMember(Projects $project, ProjectMember $member)
    {
        // $this->authorize('update', $project);

        if ($member->project_id !== $project->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        try {
            $this->projectService->removeMember($project, $member);

            return response()->json([
                'success' => true,
                'message' => 'Member removed successfully!',
            ]);
        } catch (\Exception $e) {
            Log::error('Member removal failed', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to remove member',
            ], 400);
        }
    }

    /**
     * Show project analytics
     */
    public function analytics(Projects $project)
    {
        // $this->authorize('view', $project);

        $stats = $this->projectService->getProjectStats($project);

        $activities = $project->activities()
            ->with('user')
            ->latest()
            ->limit(50)
            ->get();

        $conversationsByDate = $project->conversations()
            ->selectRaw('DATE(created_at) as date, COUNT(*) as count')
            ->groupBy('date')
            ->orderBy('date', 'desc')
            ->limit(30)
            ->get()
            ->map(fn($item) => [
                'date' => $item->date,
                'count' => $item->count,
            ]);

        return Inertia::render('Projects/Analytics', [
            'project' => $project,
            'stats' => $stats,
            'activities' => $activities,
            'conversationsByDate' => $conversationsByDate,
        ]);
    }

    /**
     * Show project versions
     */
    public function versions(Projects $project)
    {
        // $this->authorize('view', $project);

        $versions = $project->versions()
            ->with('user')
            ->orderByDesc('created_at')
            ->get();

        return Inertia::render('Projects/Versions', [
            'project' => $project,
            'versions' => $versions,
        ]);
    }

    /**
     * Create new version
     */
    public function createVersion(Request $request, Projects $project)
    {
        // $this->authorize('update', $project);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'changes' => 'nullable|array',
            'changes.*' => 'string|max:500',
        ]);

        try {
            $version = $this->projectService->createVersion($project, $validated);

            return response()->json([
                'success' => true,
                'message' => 'Version created successfully!',
                'version' => $version,
            ]);
        } catch (\Exception $e) {
            Log::error('Version creation failed', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to create version',
            ], 400);
        }
    }

    /**
     * Show project templates
     */
    public function templates()
    {
        $templates = ProjectTemplate::query()
            ->where(function ($query) {
                $query->where('is_public', true)
                    ->orWhere('user_id', Auth::id());
            })
            ->with('user')
            ->latest()
            ->paginate(12);

        return Inertia::render('Projects/Templates', [
            'templates' => $templates,
        ]);
    }

    /**
     * Create project from template
     */
    public function createFromTemplate(Request $request)
    {
        $validated = $request->validate([
            'template_id' => 'required|exists:project_templates,id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
        ]);

        try {
            $template = ProjectTemplate::findOrFail($validated['template_id']);

            $project = $this->projectService->createFromTemplate($template, $validated);

            return redirect()->route('projects.dashboard', $project->id)
                ->with('success', 'Project created from template successfully!');
        } catch (\Exception $e) {
            Log::error('Template project creation failed', ['error' => $e->getMessage()]);
            return back()->withErrors('Failed to create project from template.');
        }
    }

    /**
     * Save project as template
     */
    public function saveAsTemplate(Request $request, Projects $project)
    {
        // $this->authorize('update', $project);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'category' => 'required|string|max:50',
            'is_public' => 'nullable|boolean',
        ]);

        try {
            $template = $this->projectService->saveAsTemplate($project, $validated);

            return response()->json([
                'success' => true,
                'message' => 'Project saved as template successfully!',
                'template' => $template,
            ]);
        } catch (\Exception $e) {
            Log::error('Template saving failed', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to save as template',
            ], 400);
        }
    }

    /**
     * Show project activity log
     */
    public function activity(Projects $project)
    {
        // $this->authorize('view', $project);

        $activities = $project->activities()
            ->with('user')
            ->latest()
            ->paginate(25);

        return Inertia::render('Projects/Activity', [
            'project' => $project,
            'activities' => $activities,
        ]);
    }

    /**
     * Archive project
     */
    public function archive(Projects $project)
    {
        // $this->authorize('update', $project);

        try {
            $this->projectService->archiveProject($project);

            return response()->json([
                'success' => true,
                'message' => 'Project archived successfully!',
            ]);
        } catch (\Exception $e) {
            Log::error('Archive failed', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to archive project',
            ], 400);
        }
    }

    /**
     * Restore archived project
     */
    public function restore(Projects $project)
    {
        // $this->authorize('update', $project);

        try {
            $this->projectService->restoreProject($project);

            return response()->json([
                'success' => true,
                'message' => 'Project restored successfully!',
            ]);
        } catch (\Exception $e) {
            Log::error('Restore failed', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to restore project',
            ], 400);
        }
    }

    /**
     * Show project files management page
     */
    public function files(Projects $project)
    {
        // $this->authorize('view', $project);

        $files = ProjectFiles::where('project_id', $project->id)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($file) {
                return [
                    'id' => $file->id,
                    'name' => $file->file_name,
                    'size' => $file->file_size,
                    'type' => $file->file_type,
                    'created_at' => $file->created_at,
                    'file_path' => $file->file_path,
                ];
            });

        return Inertia::render('Projects/Files', [
            'project' => $project,
            'files' => $files,
        ]);
    }

    /**
     * Upload files to project
     */
    public function uploadFiles(Request $request, Projects $project)
    {
        // $this->authorize('update', $project);

        $request->validate([
            'files' => 'required|array',
            'files.*' => 'file|max:10240', // 10MB max per file
        ]);

        $uploadedFiles = [];

        try {
            foreach ($request->file('files') as $file) {
                $path = $file->store("projects/{$project->id}", 'public');

                $projectFile = ProjectFiles::create([
                    'project_id' => $project->id,
                    'file_path' => $path,
                    'file_name' => $file->getClientOriginalName(),
                    'file_type' => $file->getMimeType(),
                    'file_size' => $file->getSize(),
                    'meta' => [
                        'original_name' => $file->getClientOriginalName(),
                        'extension' => $file->getClientOriginalExtension(),
                    ],
                ]);

                $uploadedFiles[] = $projectFile;
            }

            ProjectActivity::log($project->id, Auth::id(), 'files_uploaded', count($uploadedFiles) . ' file(s) uploaded');

            return response()->json([
                'success' => true,
                'files' => $uploadedFiles,
                'message' => count($uploadedFiles) . ' file(s) uploaded successfully!',
            ]);
        } catch (\Exception $e) {
            Log::error('File upload failed', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to upload files',
            ], 400);
        }
    }

    /**
     * Delete file from project
     */
    public function deleteFile(Projects $project, ProjectFiles $file)
    {
        // $this->authorize('update', $project);

        if ($file->project_id !== $project->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        try {
            Storage::disk('public')->delete($file->file_path);
            $file->delete();

            ProjectActivity::log($project->id, Auth::id(), 'file_deleted', "File '{$file->file_name}' deleted");

            return response()->json([
                'success' => true,
                'message' => 'File deleted successfully!',
            ]);
        } catch (\Exception $e) {
            Log::error('File deletion failed', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete file',
            ], 400);
        }
    }
}
