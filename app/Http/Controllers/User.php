<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\ImageGeneration;
use Inertia\Inertia;

class User extends Controller
{
    function saveLanguage()  {

        $supportedLanguages = ['ENGLISH','HAUSA','IGBO','YORUBA']; // Example supported languages
        $user = auth('web')->user();
        $language = request('language');

        if ($user && $language && in_array($language, $supportedLanguages)) {
            $user->language = $language;
            $user->email_verified_at = now(); // Assuming you want to set the email_verified_at when saving language
            $user->save();
            return response()->json(['message' => 'Language saved successfully']);
        }


        return response()->json(['error' => 'User not authenticated or language not provided'], 400);
    }
    public function librabry(Request $request) {
        $user = auth('web')->user();

        // Get the images with pagination and user info
        $images = ImageGeneration::with('user')
            ->latest()
            ->when($user, function($query) use ($user) {
                $query->where('user_id', $user->id);
            })
            ->paginate(12); // Show 12 images per page

        // Get some stats
        $stats = [
            'total_images' => ImageGeneration::when($user, function($query) use ($user) {
                $query->where('user_id', $user->id);
            })->count(),
            'today_generated' => ImageGeneration::when($user, function($query) use ($user) {
                $query->where('user_id', $user->id);
            })->whereDate('created_at', today())->count(),
            'remaining_today' => $user ? max(0, 5 - ImageGeneration::where('user_id', $user->id)
                ->whereDate('created_at', today())
                ->count()) : 0
        ];

        return Inertia::render('Library/Index', [
            'images' => $images,
            'stats' => $stats
        ]);
    }
}
