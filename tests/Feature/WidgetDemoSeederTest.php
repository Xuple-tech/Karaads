<?php

use App\Models\Subscription;
use App\Models\User;
use App\Models\WidgetConfig;
use Database\Seeders\SubscriptionPlanSeeder;
use Database\Seeders\WidgetDemoSeeder;

it('seeds the borrowlite demo widget idempotently', function () {
    $this->seed(SubscriptionPlanSeeder::class);

    $this->seed(WidgetDemoSeeder::class);
    $this->seed(WidgetDemoSeeder::class);

    $user = User::query()->where('email', 'test@example.com')->first();

    expect($user)->not->toBeNull();

    $widgets = WidgetConfig::query()
        ->where('user_id', $user->id)
        ->where('name', 'BorrowLite Sales & Support')
        ->get();

    expect($widgets)->toHaveCount(1);

    $widget = $widgets->first();

    expect($widget->bot_name)->toBe('BorrowLite Assistant')
        ->and($widget->greeting)->toContain('BorrowLite Assistant')
        ->and($widget->is_active)->toBeTrue()
        ->and($widget->allow_file_uploads)->toBeFalse()
        ->and($widget->allowed_domains)->toBe(['borrowlite.com', 'www.borrowlite.com'])
        ->and($widget->system_prompt)->toContain('support@borrowlite.com')
        ->and($widget->system_prompt)->toContain('https://borrowlite.com/contact');

    expect($widget->knowledgeItems()->count())->toBe(5);
    expect($widget->tools()->count())->toBe(1);

    $tool = $widget->tools()->first();

    expect($tool->name)->toBe('Demo Rates Lookup')
        ->and($tool->tool_type)->toBe('http')
        ->and($tool->endpoint_url)->toBe('https://api.frankfurter.dev/v2/rates')
        ->and($tool->is_active)->toBeTrue();

    $hasProSubscription = Subscription::query()
        ->where('user_id', $user->id)
        ->where('status', 'active')
        ->whereHas('plan', fn ($query) => $query->where('slug', 'pro'))
        ->exists();

    expect($hasProSubscription)->toBeTrue();
});

it('seeds the shoplace sales agent with verified knowledge and tools', function () {
    $this->seed(SubscriptionPlanSeeder::class);
    $this->seed(WidgetDemoSeeder::class);
    $this->seed(WidgetDemoSeeder::class);

    $user = User::query()->where('email', 'test@example.com')->first();
    expect($user)->not->toBeNull();

    $widgets = WidgetConfig::query()
        ->where('user_id', $user->id)
        ->where('name', 'Shoplace Sales Agent')
        ->get();

    expect($widgets)->toHaveCount(1);

    $widget = $widgets->first();

    expect($widget->bot_name)->toBe('Shoplace Assistant')
        ->and($widget->greeting)->toContain('Shoplace Assistant')
        ->and($widget->is_active)->toBeTrue()
        ->and($widget->allowed_domains)->toBe(['shoplace.store', 'www.shoplace.store'])
        ->and($widget->system_prompt)->toContain('Only recommend Shoplace URLs')
        ->and($widget->system_prompt)->toContain('contactanos@shoplace.store');

    expect($widget->knowledgeItems()->count())->toBeGreaterThanOrEqual(1);
    expect($widget->tools()->count())->toBe(2);

    expect(
        $widget->tools()->where('name', 'Demo Product Search')->exists()
    )->toBeTrue();

    expect(
        $widget->tools()->where('name', 'Demo Price Compare')->exists()
    )->toBeTrue();
});
