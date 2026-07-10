<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Ad;
use App\Models\AdCampaign;
use App\Models\MonetizationSetting;
use App\Jobs\ProcessAdMedia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class AdController extends Controller
{
    private const MAX_AD_UPLOAD_KB = 10 * 1024 * 1024;

    public function pricing()
    {
        return response()->json([
            'cpm_rate' => (float) MonetizationSetting::getValue('cpm_rate', 5),
            'cpc_rate' => (float) MonetizationSetting::getValue('cpc_rate', 0.50),
            'cpa_rate' => (float) MonetizationSetting::getValue('cpa_rate', 2),
        ]);
    }

    public function index(Request $request)
    {
        $user = $request->user();
        $ads = Ad::where('user_id', $user->id)
            ->with('campaign')
            ->latest()
            ->paginate(20);

        return response()->json($ads);
    }

    public function store(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string|max:1000',
            'target_url' => 'nullable|url',
            'media' => 'required|file|max:' . self::MAX_AD_UPLOAD_KB . '|mimes:jpeg,png,jpg,gif,webp,mp4,webm',
            'ad_type' => 'required|in:banner,sponsored,native', // simplified types for users
            'budget' => 'required|numeric|min:5',
            'duration_days' => 'required|integer|min:1|max:365',
            'start_date' => 'required|date|after_or_equal:today',
        ]);

        // Upload media
        $path = $request->file('media')->store('ads', 'public');
        $mediaType = Str::startsWith($request->file('media')->getMimeType(), 'video') ? 'video' : 'image';

        // Create Campaign (auto-generated for simple user ads)
        $campaign = AdCampaign::create([
            'id' => (string) Str::uuid(),
            'user_id' => $user->id,
            'name' => 'Campaign: ' . $validated['title'],
            'description' => 'User created ad campaign',
            'status' => 'pending_approval', // Pending approval
            'type' => 'cpm', // Default to CPM for now or user choice? Let's assume CPM for simplicity or calculate based on goal
            'budget' => $validated['budget'],
            'daily_budget' => $validated['budget'] / $validated['duration_days'],
            'start_date' => $validated['start_date'],
            'end_date' => date('Y-m-d', strtotime($validated['start_date'] . ' + ' . $validated['duration_days'] . ' days')),
        ]);

        // Create Ad
        $ad = Ad::create([
            'id' => (string) Str::uuid(),
            'user_id' => $user->id,
            'ad_campaign_id' => $campaign->id,
            'title' => $validated['title'],
            'description' => $validated['description'],
            'media_url' => Storage::disk('public')->url($path),
            'media_type' => $mediaType,
            'target_url' => $validated['target_url'] ?? null,
            'ad_type' => $validated['ad_type'],
            'status' => false, // Inactive/Pending
            'total_spent' => 0,
        ]);

        // Process media in background
        ProcessAdMedia::dispatch($ad);

        // Here we would handle payment processing.
        // For now, we assume payment is successful or handled externally.
        
        Log::info('User created ad', ['user_id' => $user->id, 'ad_id' => $ad->id]);

        return response()->json([
            'message' => 'Ad created successfully and is pending approval.',
            'ad' => $ad,
            'campaign' => $campaign,
        ], 201);
    }

    public function update(Request $request, Ad $ad)
    {
        if ($ad->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string|max:1000',
            'target_url' => 'nullable|url',
            'media' => 'nullable|file|max:' . self::MAX_AD_UPLOAD_KB . '|mimes:jpeg,png,jpg,gif,webp,mp4,webm',
        ]);

        $data = [
            'title' => $validated['title'],
            'description' => $validated['description'],
            'target_url' => $validated['target_url'] ?? null,
        ];

        if ($request->hasFile('media')) {
            // Upload new media
            $path = $request->file('media')->store('ads', 'public');
            $mediaType = Str::startsWith($request->file('media')->getMimeType(), 'video') ? 'video' : 'image';
            
            $data['media_url'] = Storage::disk('public')->url($path);
            $data['media_type'] = $mediaType;

            // Optionally delete old media file here
        }

        $ad->update($data);

        if ($request->hasFile('media')) {
            ProcessAdMedia::dispatch($ad);
        }

        return response()->json([
            'message' => 'Ad updated successfully.',
            'ad' => $ad,
        ]);
    }

    public function destroy(Request $request, Ad $ad)
    {
        if ($ad->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Delete associated campaign if it only has this ad (for simple user ads)
        if ($ad->campaign && $ad->campaign->user_id === $request->user()->id) {
            $ad->campaign->delete();
        }

        $ad->delete();

        return response()->json(['message' => 'Ad deleted successfully']);
    }
}
