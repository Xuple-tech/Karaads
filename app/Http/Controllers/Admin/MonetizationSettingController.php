<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\MonetizationSetting;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MonetizationSettingController extends Controller
{
    public function index()
    {
        $settings = MonetizationSetting::all()->groupBy('category');

        return Inertia::render('Admin/MonetizationSettings/Index', [
            'ad_revenue' => $settings->get(MonetizationSetting::CATEGORY_AD_REVENUE, collect())->values(),
            'user_payout' => $settings->get(MonetizationSetting::CATEGORY_USER_PAYOUT, collect())->values(),
        ]);
    }

    public function edit()
    {
        $settings = MonetizationSetting::where('is_editable', true)->get();
        
        $editableSettings = $settings->map(function ($setting) {
            return [
                'id' => $setting->id,
                'key' => $setting->key,
                'value' => $setting->value,
                'description' => $setting->description,
                'data_type' => $setting->data_type,
                'category' => $setting->category,
                'min_value' => $setting->min_value,
                'max_value' => $setting->max_value,
                'options' => $setting->options,
            ];
        })->toArray();

        return Inertia::render('Admin/MonetizationSettings/Edit', [
            'settings' => $editableSettings,
        ]);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'settings' => 'required|array',
            'settings.*.key' => 'required|string|exists:monetization_settings,key',
            'settings.*.value' => 'required',
        ]);

        foreach ($validated['settings'] as $setting) {
            $monetizationSetting = MonetizationSetting::where('key', $setting['key'])->first();
            if ($monetizationSetting && $monetizationSetting->is_editable) {
                $monetizationSetting->update(['value' => $setting['value']]);
            }
        }

        return redirect()->route('admin.monetization-settings.index')
            ->with('success', 'Monetization settings updated successfully.');
    }

    public function reset(Request $request)
    {
        $request->validate([
            'category' => 'nullable|string|in:ad_revenue,user_payout,content_creator,admin,platform',
        ]);

        if ($request->has('category')) {
            MonetizationSetting::where('category', $request->category)
                ->where('is_editable', true)
                ->delete();
        } else {
            MonetizationSetting::where('is_editable', true)->delete();
        }

        return redirect()->route('admin.monetization-settings.index')
            ->with('success', 'Settings reset to defaults successfully.');
    }

    public function revenueSplit()
    {
        $revenueSplitSettings = MonetizationSetting::where('category', MonetizationSetting::CATEGORY_AD_REVENUE)
            ->get();

        $revenueSplits = [
            'platform_share' => MonetizationSetting::getValue('platform_revenue_share', 50),
            'creator_share' => MonetizationSetting::getValue('creator_revenue_share', 40),
            'viewer_share' => MonetizationSetting::getValue('viewer_revenue_share', 10),
            'cpm_rate' => MonetizationSetting::getValue('cpm_rate', 5),
            'cpc_rate' => MonetizationSetting::getValue('cpc_rate', 0.50),
            'cpa_rate' => MonetizationSetting::getValue('cpa_rate', 2),
        ];

        return Inertia::render('Admin/MonetizationSettings/RevenueSplit', [
            'revenueSplits' => $revenueSplits,
            'settings' => $revenueSplitSettings,
        ]);
    }

    public function updateRevenueSplit(Request $request)
    {
        $validated = $request->validate([
            'platform_share' => 'required|numeric|min:0|max:100',
            'creator_share' => 'required|numeric|min:0|max:100',
            'viewer_share' => 'required|numeric|min:0|max:100',
            'cpm_rate' => 'required|numeric|min:0',
            'cpc_rate' => 'required|numeric|min:0',
            'cpa_rate' => 'required|numeric|min:0',
        ]);

        $totalShare = $validated['platform_share'] + $validated['creator_share'] + $validated['viewer_share'];
        if ($totalShare != 100) {
            return back()->withErrors(['error' => 'Revenue shares must total 100%']);
        }

        MonetizationSetting::setValue('platform_revenue_share', $validated['platform_share']);
        MonetizationSetting::setValue('creator_revenue_share', $validated['creator_share']);
        MonetizationSetting::setValue('viewer_revenue_share', $validated['viewer_share']);
        MonetizationSetting::setValue('cpm_rate', $validated['cpm_rate']);
        MonetizationSetting::setValue('cpc_rate', $validated['cpc_rate']);
        MonetizationSetting::setValue('cpa_rate', $validated['cpa_rate']);

        return redirect()->route('admin.monetization-settings.revenue-split')
            ->with('success', 'Revenue split settings updated successfully.');
    }

    public function payoutSettings()
    {
        $payoutSettings = [
            'minimum_payout' => MonetizationSetting::getValue('minimum_payout', 10),
            'maximum_payout' => MonetizationSetting::getValue('maximum_payout', 10000),
            'payout_frequency' => MonetizationSetting::getValue('payout_frequency', 'weekly'),
            'payout_methods' => MonetizationSetting::getValue('payout_methods', ['bank_transfer', 'paypal']),
            'processing_fee_percentage' => MonetizationSetting::getValue('processing_fee_percentage', 2),
            'processing_time_days' => MonetizationSetting::getValue('processing_time_days', 3),
        ];

        return Inertia::render('Admin/MonetizationSettings/PayoutSettings', [
            'payoutSettings' => $payoutSettings,
        ]);
    }

    public function updatePayoutSettings(Request $request)
    {
        $validated = $request->validate([
            'minimum_payout' => 'required|numeric|min:0',
            'maximum_payout' => 'required|numeric|min:0|gte:minimum_payout',
            'payout_frequency' => 'required|in:daily,weekly,monthly',
            'payout_methods' => 'required|array|min:1',
            'payout_methods.*' => 'string|in:bank_transfer,paypal,crypto',
            'processing_fee_percentage' => 'required|numeric|min:0|max:100',
            'processing_time_days' => 'required|integer|min:1',
        ]);

        MonetizationSetting::setValue('minimum_payout', $validated['minimum_payout']);
        MonetizationSetting::setValue('maximum_payout', $validated['maximum_payout']);
        MonetizationSetting::setValue('payout_frequency', $validated['payout_frequency']);
        MonetizationSetting::setValue('payout_methods', $validated['payout_methods']);
        MonetizationSetting::setValue('processing_fee_percentage', $validated['processing_fee_percentage']);
        MonetizationSetting::setValue('processing_time_days', $validated['processing_time_days']);

        return redirect()->route('admin.monetization-settings.payout-settings')
            ->with('success', 'Payout settings updated successfully.');
    }
}
