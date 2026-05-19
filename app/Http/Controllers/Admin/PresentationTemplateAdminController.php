<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PresentationTemplate;
use App\Services\PowerPointTemplateImportService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class PresentationTemplateAdminController extends Controller
{
    public function __construct(
        private readonly PowerPointTemplateImportService $powerPointTemplateImportService,
    ) {}

    public function index(Request $request): Response
    {
        $search = trim((string) $request->string('search'));
        $format = trim((string) $request->string('format'));
        $active = (string) $request->string('is_active');

        $templates = PresentationTemplate::query()
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($nested) use ($search) {
                    $nested->where('name', 'like', "%{$search}%")
                        ->orWhere('description', 'like', "%{$search}%")
                        ->orWhere('category', 'like', "%{$search}%")
                        ->orWhere('source_file_name', 'like', "%{$search}%");
                });
            })
            ->when($format !== '', fn ($query) => $query->where('template_format', $format))
            ->when($active !== '', fn ($query) => $query->where('is_active', $active === '1'))
            ->latest()
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('Admin/Slides/Templates/Index', [
            'templates' => $templates,
            'filters' => [
                'search' => $search,
                'format' => $format,
                'is_active' => $active,
            ],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/Slides/Templates/Create');
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'category' => ['required', 'string', 'max:120'],
            'description' => ['nullable', 'string', 'max:1000'],
            'template_file' => ['required', 'file', 'mimes:pptx,potx,pptm', 'max:51200'],
            'is_active' => ['sometimes', 'boolean'],
            'is_featured' => ['sometimes', 'boolean'],
        ]);

        $file = $request->file('template_file');
        $storedPath = $file->store('presentation-templates/source-files', 'public');
        $extension = strtolower((string) $file->getClientOriginalExtension());

        $template = PresentationTemplate::create([
            'user_id' => $request->user()?->id,
            'name' => $validated['name'],
            'slug' => Str::slug($validated['name']) . '-' . Str::lower(Str::random(6)),
            'category' => $validated['category'],
            'description' => $validated['description'] ?? null,
            'slides_count' => 0,
            'is_featured' => (bool) ($validated['is_featured'] ?? false),
            'is_trending' => false,
            'is_recommended' => false,
            'is_system' => false,
            'usage_count' => 0,
            'theme_config' => [],
            'color_palette' => [],
            'font_pair' => [],
            'tags' => ['PowerPoint', 'Uploaded'],
            'preview_mode' => 'immersive',
            'structure' => [],
            'template_format' => $extension,
            'source_file_path' => $storedPath,
            'source_file_name' => $file->getClientOriginalName(),
            'source_file_size' => $file->getSize(),
            'source_file_mime_type' => $file->getMimeType(),
            'is_powerpoint_template' => true,
            'is_active' => (bool) ($validated['is_active'] ?? true),
        ]);

        $this->powerPointTemplateImportService->importFromStoredFile($template);

        return redirect()->route('admin.slide-templates.index')
            ->with('success', 'PowerPoint template uploaded successfully.');
    }

    public function edit(PresentationTemplate $template): Response
    {
        return Inertia::render('Admin/Slides/Templates/Edit', [
            'template' => [
                'id' => $template->id,
                'name' => $template->name,
                'category' => $template->category,
                'description' => $template->description,
                'template_format' => $template->template_format,
                'source_file_name' => $template->source_file_name,
                'source_file_size' => $template->source_file_size,
                'is_active' => (bool) $template->is_active,
                'is_featured' => (bool) $template->is_featured,
                'is_powerpoint_template' => (bool) $template->is_powerpoint_template,
            ],
        ]);
    }

    public function update(Request $request, PresentationTemplate $template): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'category' => ['required', 'string', 'max:120'],
            'description' => ['nullable', 'string', 'max:1000'],
            'template_file' => ['nullable', 'file', 'mimes:pptx,potx,pptm', 'max:51200'],
            'is_active' => ['sometimes', 'boolean'],
            'is_featured' => ['sometimes', 'boolean'],
        ]);

        $payload = [
            'name' => $validated['name'],
            'category' => $validated['category'],
            'description' => $validated['description'] ?? null,
            'is_active' => (bool) ($validated['is_active'] ?? false),
            'is_featured' => (bool) ($validated['is_featured'] ?? false),
        ];

        if ($request->hasFile('template_file')) {
            if ($template->source_file_path) {
                Storage::disk('public')->delete($template->source_file_path);
            }

            $file = $request->file('template_file');
            $storedPath = $file->store('presentation-templates/source-files', 'public');

            $payload = array_merge($payload, [
                'template_format' => strtolower((string) $file->getClientOriginalExtension()),
                'source_file_path' => $storedPath,
                'source_file_name' => $file->getClientOriginalName(),
                'source_file_size' => $file->getSize(),
                'source_file_mime_type' => $file->getMimeType(),
                'is_powerpoint_template' => true,
            ]);
        }

        $template->update($payload);
        $this->powerPointTemplateImportService->importFromStoredFile($template->fresh());

        return redirect()->route('admin.slide-templates.index')
            ->with('success', 'PowerPoint template updated successfully.');
    }

    public function destroy(PresentationTemplate $template): RedirectResponse
    {
        if ($template->source_file_path) {
            Storage::disk('public')->delete($template->source_file_path);
        }

        $template->delete();

        return redirect()->route('admin.slide-templates.index')
            ->with('success', 'PowerPoint template deleted successfully.');
    }
}
