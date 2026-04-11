<?php

namespace App\Http\Controllers;

use App\Models\WidgetConfig;
use App\Models\WidgetWebsiteSource;
use App\Services\Widget\WidgetWebsiteSourceService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

class WidgetWebsiteSourceController extends Controller
{
    public function __construct(
        private readonly WidgetWebsiteSourceService $sources,
    ) {
    }

    public function store(Request $request, WidgetConfig $widget): JsonResponse
    {
        $this->ensureOwnership($request, $widget);

        $validated = $this->validateSource($request, true);
        try {
            $source = $this->sources->createSource($widget, $request->user(), $validated);
        } catch (\RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }

        return response()->json([
            'message' => 'Website source created.',
            'source' => $this->sources->serializeSource($source, true),
        ], 201);
    }

    public function update(Request $request, WidgetConfig $widget, WidgetWebsiteSource $source): JsonResponse
    {
        $this->ensureOwnership($request, $widget);
        abort_unless($source->widget_id === $widget->id, 404);

        $validated = $this->validateSource($request, false);
        try {
            $source = $this->sources->updateSource($source, $validated);
        } catch (\RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }

        return response()->json([
            'message' => 'Website source updated.',
            'source' => $this->sources->serializeSource($source, true),
        ]);
    }

    public function verify(Request $request, WidgetConfig $widget, WidgetWebsiteSource $source): JsonResponse
    {
        $this->ensureOwnership($request, $widget);
        abort_unless($source->widget_id === $widget->id, 404);

        try {
            $source = $this->sources->verifySource($source);
        } catch (\RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }

        return response()->json([
            'message' => $source->verification_status === 'verified'
                ? 'Website ownership verified.'
                : 'Website verification failed.',
            'source' => $this->sources->serializeSource($source, true),
        ]);
    }

    public function crawl(Request $request, WidgetConfig $widget, WidgetWebsiteSource $source): JsonResponse
    {
        $this->ensureOwnership($request, $widget);
        abort_unless($source->widget_id === $widget->id, 404);

        try {
            $source = $this->sources->queueCrawl($source, true);
        } catch (\RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }

        return response()->json([
            'message' => 'Website crawl queued.',
            'source' => $this->sources->serializeSource($source, true),
        ]);
    }

    public function verificationFile(Request $request, WidgetConfig $widget, WidgetWebsiteSource $source): StreamedResponse
    {
        $this->ensureOwnership($request, $widget);
        abort_unless($source->widget_id === $widget->id, 404);

        $filename = $this->sources->verificationFilename($source);

        return response()->streamDownload(function () use ($source): void {
            echo $source->verification_token;
        }, $filename, [
            'Content-Type' => 'text/plain',
        ]);
    }

    public function pluginSync(string $token, Request $request): JsonResponse
    {
        $source = WidgetWebsiteSource::query()
            ->where('connection_token', $token)
            ->firstOrFail();

        $secret = (string) $request->header('X-Kwati-Plugin-Secret', '');
        abort_unless(hash_equals((string) $source->connection_secret, $secret), 403);

        $validated = $request->validate([
            'site_name' => 'nullable|string|max:255',
            'plugin_version' => 'nullable|string|max:50',
            'wordpress_version' => 'nullable|string|max:50',
            'pages' => 'nullable|array',
            'pages.*.url' => 'required|string|max:2048',
            'pages.*.title' => 'nullable|string|max:255',
            'pages.*.content' => 'nullable|string',
            'pages.*.post_type' => 'nullable|string|max:50',
        ]);

        try {
            $source = $this->sources->syncPluginSource($source, $validated);
        } catch (\RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }

        return response()->json([
            'message' => 'Plugin sync received.',
            'source' => $this->sources->serializeSource($source, true),
        ]);
    }

    private function ensureOwnership(Request $request, WidgetConfig $widget): void
    {
        abort_unless($widget->user_id === $request->user()->id, 404);
    }

    private function validateSource(Request $request, bool $creating): array
    {
        return $request->validate([
            'site_name' => 'nullable|string|max:255',
            'site_url' => ($creating ? 'required' : 'sometimes') . '|string|max:2048',
            'source_type' => ($creating ? 'required' : 'sometimes') . '|in:wordpress_url,wordpress_plugin',
            'verification_method' => 'nullable|in:meta_tag,file',
            'include_paths' => 'nullable|array',
            'include_paths.*' => 'string|max:255',
            'exclude_paths' => 'nullable|array',
            'exclude_paths.*' => 'string|max:255',
            'seed_urls' => 'nullable|array',
            'seed_urls.*' => 'string|max:2048',
            'scope_mode' => 'nullable|in:safe_public,custom',
            'recrawl_interval_hours' => 'nullable|integer|min:1|max:168',
            'is_active' => 'nullable|boolean',
        ]);
    }
}
