<?php

namespace App\Http\Controllers;

use App\Services\SubscriptionService;
use App\Models\ImageGeneration;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

/**
 * Example Controller showing how to implement image generation with limit checking
 *
 * This demonstrates:
 * 1. Checking if user can generate images before attempting
 * 2. Handling limit exceeded errors with proper response
 * 3. Recording image generation usage
 * 4. Returning appropriate frontend UI data
 */
class ImageGenerationLimitExampleController extends Controller
{
    public function __construct(
        private SubscriptionService $subscriptionService
    ) {}

    /**
     * Generate an image with subscription limit checking
     *
     * Request body:
     * {
     *   "prompt": "A beautiful sunset over the ocean",
     *   "count": 1
     * }
     *
     * Responses:
     * - 200: Image generated successfully
     * - 429: Limit exceeded (returns limit data for UI modal)
     * - 400: Invalid request
     */
    public function generate(Request $request)
    {
        $user = auth()->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'error' => 'Unauthorized',
            ], 401);
        }

        // Validate request
        $validated = $request->validate([
            'prompt' => 'required|string|max:1000',
            'count' => 'integer|min:1|max:10', // Batch generation
        ], [
            'prompt.required' => 'Please enter an image description',
            'prompt.max' => 'Description too long (max 1000 characters)',
            'count.max' => 'Maximum 10 images per request',
        ]);

        $count = $validated['count'] ?? 1;
        $prompt = $validated['prompt'];

        // ⭐ CHECK SUBSCRIPTION LIMITS
        $canGenerate = $this->subscriptionService->canGenerateImages($user, $count);

        if (!$canGenerate['allowed']) {
            Log::warning("User {$user->id} hit image generation limit", [
                'reason' => $canGenerate['reason'],
                'plan' => $canGenerate['plan_name'],
                'attempted' => $count,
                'used' => $canGenerate['used'] ?? 0,
            ]);

            // Return 429 Too Many Requests with limit data for frontend modal
            return response()->json([
                'success' => false,
                'error' => $canGenerate['reason'],
                'message' => "You've reached your image generation limit",
                'limit_data' => $canGenerate, // Pass to frontend for UI modal
            ], 429);
        }

        try {
            // Generate image(s) - replace with your actual image generation logic
            // This could call OpenAI API, Stability AI, or any other service
            $images = $this->generateImagesFromAPI($prompt, $count);

            // ⭐ RECORD THE USAGE
            $this->subscriptionService->recordImageGeneration($user, $count);

            // Store in database
            foreach ($images as $image_url) {
                ImageGeneration::create([
                    'user_id' => $user->id,
                    'prompt' => $prompt,
                    'image_url' => $image_url,
                    'ip_address' => $request->ip(),
                ]);
            }

            Log::info("User {$user->id} generated {$count} image(s)", [
                'plan' => $canGenerate['plan_name'],
            ]);

            return response()->json([
                'success' => true,
                'message' => "Generated {$count} image(s)",
                'images' => $images,
                'usage' => [
                    'generated' => $count,
                    'plan' => $canGenerate['plan_name'],
                ],
            ], 200);

        } catch (\Exception $e) {
            Log::error("Image generation failed for user {$user->id}", [
                'error' => $e->getMessage(),
                'prompt' => $prompt,
            ]);

            return response()->json([
                'success' => false,
                'error' => 'Failed to generate image',
                'message' => 'An error occurred while generating your image. Please try again.',
            ], 500);
        }
    }

    /**
     * Get user's image generation usage and limits
     *
     * Returns current usage and plan limits
     */
    public function getUsage(Request $request)
    {
        $user = auth()->user();

        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $stats = $this->subscriptionService->getUserUsageStats($user);

        return response()->json([
            'success' => true,
            'today' => [
                'generated' => $stats['today']['images'],
                'limit' => $stats['limits']['images_per_day'],
                'remaining' => max(0, $stats['limits']['images_per_day'] - $stats['today']['images']),
                'percentage' => $stats['limits']['images_per_day']
                    ? round(($stats['today']['images'] / $stats['limits']['images_per_day']) * 100, 1)
                    : 0,
            ],
            'monthly' => [
                'generated' => $stats['monthly']['images'],
                'limit' => $stats['limits']['images_per_month'],
                'remaining' => max(0, $stats['limits']['images_per_month'] - $stats['monthly']['images']),
                'percentage' => $stats['limits']['images_per_month']
                    ? round(($stats['monthly']['images'] / $stats['limits']['images_per_month']) * 100, 1)
                    : 0,
            ],
            'plan' => [
                'name' => $stats['plan']['name'],
                'slug' => $stats['plan']['slug'],
                'is_unlimited' => !$stats['limits']['images_per_day'] && !$stats['limits']['images_per_month'],
            ],
        ]);
    }

    /**
     * Get all available plans with image limits
     *
     * Used for the upgrade modal/page
     */
    public function getAvailablePlans(Request $request)
    {
        $user = auth()->user();
        $plans = $this->subscriptionService->getAvailablePlans();

        $userPlanId = $user?->subscription?->plan_id;

        $formatted = array_map(function ($plan) use ($userPlanId) {
            return [
                'id' => $plan['id'],
                'name' => $plan['name'],
                'slug' => $plan['slug'],
                'description' => $plan['description'],
                'monthly_price' => $plan['monthly_price'],
                'yearly_price' => $plan['yearly_price'],
                'images_per_day' => $plan['images_per_day'],
                'images_per_month' => $plan['images_per_month'],
                'is_unlimited_images' => !$plan['images_per_day'] && !$plan['images_per_month'],
                'features' => $plan['features'],
                'is_current' => $plan['id'] === $userPlanId,
            ];
        }, $plans);

        return response()->json([
            'success' => true,
            'plans' => $formatted,
        ]);
    }

    /**
     * Placeholder for actual image generation API call
     * Replace with your actual implementation
     */
    private function generateImagesFromAPI(string $prompt, int $count): array
    {
        // Example implementation - replace with actual API call
        $images = [];

        // This is where you'd call:
        // - OpenAI DALL-E
        // - Stability AI
        // - Midjourney API
        // - etc.

        for ($i = 0; $i < $count; $i++) {
            // Placeholder URL - replace with actual generated image
            $images[] = "https://placeholder.com/512x512?text=Generated+Image+" . ($i + 1);
        }

        return $images;
    }
}

/**
 * INTEGRATION STEPS:
 *
 * 1. Add routes to routes/api.php:
 *
 *    Route::middleware('auth:sanctum')->group(function () {
 *        Route::post('/images/generate', [ImageGenerationLimitExampleController::class, 'generate']);
 *        Route::get('/images/usage', [ImageGenerationLimitExampleController::class, 'getUsage']);
 *        Route::get('/images/plans', [ImageGenerationLimitExampleController::class, 'getAvailablePlans']);
 *    });
 *
 * 2. In your frontend component, call the API:
 *
 *    const handleGenerateImage = async (prompt) => {
 *        try {
 *            const response = await axios.post('/api/images/generate', {
 *                prompt,
 *                count: 1
 *            });
 *            setImages(response.data.images);
 *        } catch (error) {
 *            if (error.response?.status === 429) {
 *                // Limit exceeded - show modal
 *                setLimitExceeded({
 *                    open: true,
 *                    data: error.response.data.limit_data
 *                });
 *            }
 *        }
 *    };
 *
 * 3. Show the LimitExceededModal when status is 429:
 *
 *    <LimitExceededModal
 *        isOpen={limitExceeded.open}
 *        limitData={limitExceeded.data}
 *        onClose={() => setLimitExceeded({ open: false, data: null })}
 *        onUpgrade={() => window.location.href = '/subscription/plans'}
 *    />
 */
