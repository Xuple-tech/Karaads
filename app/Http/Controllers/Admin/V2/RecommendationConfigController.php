<?php

namespace App\Http\Controllers\Admin\V2;

use App\Domain\Recommendation\RecommendationConfigService;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateRecommendationConfigRequest;
use App\Models\Post;
use App\Models\Recommendation\RecoEntityPerformanceDaily;
use App\Models\Recommendation\RecoModelTrainingHistory;
use App\Models\Recommendation\RecoSurfaceConfig;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class RecommendationConfigController extends Controller
{
    public function index(): RedirectResponse
    {
        return redirect()->route('admin.v2.reco.configs.page');
    }

    public function update(UpdateRecommendationConfigRequest $request, RecoSurfaceConfig $config): RedirectResponse
    {
        $validated = $request->validated();
        if (isset($validated['weights'])) {
            $sum = array_sum(array_map('floatval', $validated['weights']));
            if ($sum > 0) {
                $validated['weights'] = collect($validated['weights'])
                    ->map(fn ($value) => round(((float) $value) / $sum, 6))
                    ->all();
            }
        }
        if (($validated['rollout_mode'] ?? null) === 'rules_only') {
            $validated['canary_percentage'] = 0;
        }
        if (($validated['rollout_mode'] ?? null) === 'big_bang') {
            $validated['canary_percentage'] = 100;
        }

        $config->update($validated);

        return back()->with('success', 'Recommendation config updated.');
    }

    public function resetDefaults(RecommendationConfigService $configService): RedirectResponse
    {
        $configService->resetDefaults();

        return back()->with('success', 'Recommendation defaults restored.');
    }

    public function page(Request $request): Response
    {
        $days = max(1, min(365, (int) $request->query('days', 30)));
        $surface = (string) $request->query('surface', 'all');
        $validSurfaces = ['all', 'feed', 'moments', 'profile'];
        if (! in_array($surface, $validSurfaces, true)) {
            $surface = 'all';
        }
        $fromDate = now()->subDays($days)->toDateString();

        $configs = RecoSurfaceConfig::query()
            ->orderBy('entity_type')
            ->orderBy('surface')
            ->orderBy('slot')
            ->get();

        $history = RecoModelTrainingHistory::query()
            ->latest()
            ->limit(100)
            ->get();

        $basePosts = Post::query()->whereDate('created_at', '>=', $fromDate);
        if ($surface !== 'all') {
            $postIds = RecoEntityPerformanceDaily::query()
                ->where('entity_type', 'post')
                ->where('surface', $surface)
                ->where('date', '>=', $fromDate)
                ->pluck('entity_id')
                ->unique()
                ->values();

            if ($postIds->isEmpty()) {
                $basePosts->whereRaw('1 = 0');
            } else {
                $basePosts->whereIn('id', $postIds);
            }
        }

        $summary = $this->buildCategorySummary(clone $basePosts);
        $topCategories = $this->buildTopCategories(clone $basePosts);
        $surfaceBreakdown = [];
        foreach (['feed', 'moments', 'profile'] as $surfaceName) {
            $surfacePostIds = RecoEntityPerformanceDaily::query()
                ->where('entity_type', 'post')
                ->where('surface', $surfaceName)
                ->where('date', '>=', $fromDate)
                ->pluck('entity_id')
                ->unique()
                ->values();

            $surfaceQuery = clone $basePosts;
            if ($surfacePostIds->isEmpty()) {
                $surfaceQuery->whereRaw('1 = 0');
            } else {
                $surfaceQuery->whereIn('id', $surfacePostIds);
            }

            $surfaceBreakdown[$surfaceName] = $this->buildCategorySummary($surfaceQuery);
        }

        return Inertia::render('Admin/Recommendations/Index', [
            'configs' => $configs,
            'history' => $history,
            'categoryStats' => [
                'filters' => ['days' => $days, 'surface' => $surface],
                'summary' => $summary,
                'top_categories' => $topCategories,
                'surface_breakdown' => $surfaceBreakdown,
            ],
        ]);
    }

    public function history(): RedirectResponse
    {
        return redirect()->route('admin.v2.reco.configs.page');
    }

    public function categoryStats(): RedirectResponse
    {
        return redirect()->route('admin.v2.reco.configs.page');
    }

    private function buildCategorySummary($query): array
    {
        $totalPosts = (clone $query)->count();
        $categorizedPosts = (clone $query)->whereNotNull('primary_category')->count();
        $avgConfidence = (float) ((clone $query)->whereNotNull('category_confidence')->avg('category_confidence') ?? 0);
        $highConfidence = (clone $query)->where('category_confidence', '>=', 0.70)->count();
        $lowConfidence = (clone $query)
            ->whereNotNull('category_confidence')
            ->where('category_confidence', '<', 0.40)
            ->count();

        return [
            'total_posts' => $totalPosts,
            'categorized_posts' => $categorizedPosts,
            'coverage_rate' => $totalPosts > 0 ? round($categorizedPosts / $totalPosts, 4) : 0.0,
            'avg_confidence' => round($avgConfidence, 4),
            'high_confidence_posts' => $highConfidence,
            'low_confidence_posts' => $lowConfidence,
        ];
    }

    private function buildTopCategories($query)
    {
        return $query
            ->whereNotNull('primary_category')
            ->selectRaw('primary_category, COUNT(*) as total, AVG(category_confidence) as avg_confidence')
            ->groupBy('primary_category')
            ->orderByDesc('total')
            ->limit(12)
            ->get()
            ->map(fn ($row) => [
                'category' => (string) $row->primary_category,
                'total' => (int) $row->total,
                'avg_confidence' => round((float) ($row->avg_confidence ?? 0), 4),
            ])
            ->values();
    }
}
