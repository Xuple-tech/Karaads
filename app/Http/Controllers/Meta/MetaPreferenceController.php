<?php

namespace App\Http\Controllers\Meta;

use App\Http\Controllers\Controller;
use App\Models\MetaAccount;
use App\Models\MetaAutomationPreference;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class MetaPreferenceController extends Controller
{
    public function __construct()
    {
        // $this->middleware('auth');
    }

    /**
     * Show preferences for specific account
     */
    public function show(MetaAccount $account)
    {
        $this->authorize('view', $account);

        $preference = MetaAutomationPreference::firstOrCreate(
            ['meta_account_id' => $account->id, 'user_id' => Auth::id()],
            [
                'enable_auto_reply' => false,
                'enable_message_analysis' => true,
                'require_approval_before_send' => true,
                'reply_tone' => 'professional',
                'auto_reply_delay_seconds' => 0,
            ]
        );

        return Inertia::render('Meta/Preferences', [
            'metaAccount' => [
                'id' => $account->id,
                'account_name' => $account->account_name,
                'platform' => $account->platform,
            ],
            'preference' => [
                'id' => $preference->id,
                'enable_auto_reply' => $preference->enable_auto_reply,
                'enable_message_analysis' => $preference->enable_message_analysis,
                'require_approval_before_send' => $preference->require_approval_before_send,
                'reply_tone' => $preference->reply_tone,
                'custom_instructions' => $preference->custom_instructions,
                'auto_reply_delay_seconds' => $preference->auto_reply_delay_seconds,
                'enabled_platforms' => $preference->enabled_platforms ?? [],
            ],
            'availableTones' => ['professional', 'friendly', 'casual', 'formal'],
        ]);
    }

    /**
     * Update preferences for specific account
     */
    public function update(MetaAccount $account, Request $request)
    {
        $this->authorize('update', $account);

        $validated = $request->validate([
            'enable_auto_reply' => 'boolean',
            'enable_message_analysis' => 'boolean',
            'require_approval_before_send' => 'boolean',
            'reply_tone' => 'in:professional,friendly,casual,formal',
            'custom_instructions' => 'nullable|string|max:2000',
            'auto_reply_delay_seconds' => 'integer|min:0|max:3600',
        ]);

        $preference = MetaAutomationPreference::firstOrCreate(
            ['meta_account_id' => $account->id, 'user_id' => Auth::id()]
        );

        $preference->update($validated);

        return response()->json([
            'success' => true,
            'preference' => [
                'id' => $preference->id,
                'enable_auto_reply' => $preference->enable_auto_reply,
                'enable_message_analysis' => $preference->enable_message_analysis,
                'require_approval_before_send' => $preference->require_approval_before_send,
                'reply_tone' => $preference->reply_tone,
                'custom_instructions' => $preference->custom_instructions,
                'auto_reply_delay_seconds' => $preference->auto_reply_delay_seconds,
            ],
        ]);
    }

    /**
     * Show global preferences
     */
    public function globalPreferences()
    {
        $user = Auth::user();

        $preference = MetaAutomationPreference::firstOrCreate(
            ['user_id' => $user->id, 'is_global_preference' => true],
            [
                'enable_auto_reply' => false,
                'enable_message_analysis' => true,
                'require_approval_before_send' => true,
                'reply_tone' => 'professional',
                'auto_reply_delay_seconds' => 0,
                'is_global_preference' => true,
            ]
        );

        return Inertia::render('Meta/GlobalPreferences', [
            'preference' => [
                'id' => $preference->id,
                'enable_auto_reply' => $preference->enable_auto_reply,
                'enable_message_analysis' => $preference->enable_message_analysis,
                'require_approval_before_send' => $preference->require_approval_before_send,
                'reply_tone' => $preference->reply_tone,
                'custom_instructions' => $preference->custom_instructions,
                'auto_reply_delay_seconds' => $preference->auto_reply_delay_seconds,
                'enabled_platforms' => $preference->enabled_platforms ?? [],
            ],
            'availableTones' => ['professional', 'friendly', 'casual', 'formal'],
        ]);
    }

    /**
     * Update global preferences
     */
    public function updateGlobalPreferences(Request $request)
    {
        $user = Auth::user();

        $validated = $request->validate([
            'enable_auto_reply' => 'boolean',
            'enable_message_analysis' => 'boolean',
            'require_approval_before_send' => 'boolean',
            'reply_tone' => 'in:professional,friendly,casual,formal',
            'custom_instructions' => 'nullable|string|max:2000',
            'auto_reply_delay_seconds' => 'integer|min:0|max:3600',
            'enabled_platforms' => 'nullable|array',
        ]);

        $preference = MetaAutomationPreference::firstOrCreate(
            ['user_id' => $user->id, 'is_global_preference' => true]
        );

        $preference->update($validated);

        return response()->json([
            'success' => true,
            'preference' => [
                'id' => $preference->id,
                'enable_auto_reply' => $preference->enable_auto_reply,
                'enable_message_analysis' => $preference->enable_message_analysis,
                'require_approval_before_send' => $preference->require_approval_before_send,
                'reply_tone' => $preference->reply_tone,
                'custom_instructions' => $preference->custom_instructions,
                'auto_reply_delay_seconds' => $preference->auto_reply_delay_seconds,
                'enabled_platforms' => $preference->enabled_platforms,
            ],
        ]);
    }
}
