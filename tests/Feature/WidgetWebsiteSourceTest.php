<?php

use App\Jobs\CrawlWidgetWebsiteSource;
use App\Models\Subscription;
use App\Models\SubscriptionPlan;
use App\Models\User;
use App\Models\WidgetConfig;
use App\Models\WidgetKnowledgeItem;
use App\Models\WidgetWebsiteSource;
use App\Services\Widget\WidgetWebsiteSourceService;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Queue;
use Laravel\Sanctum\Sanctum;

function widgetOwner(): array
{
    $user = User::factory()->create();
    $plan = SubscriptionPlan::query()->create([
        'name' => 'Pro',
        'slug' => 'pro',
        'monthly_price' => 15,
        'yearly_price' => 144,
        'is_active' => true,
        'display_order' => 1,
    ]);

    Subscription::query()->create([
        'user_id' => $user->id,
        'plan_id' => $plan->id,
        'status' => 'active',
        'started_at' => now(),
        'renews_at' => now()->addMonth(),
        'billing_period' => 'monthly',
        'amount_paid' => 0,
    ]);

    $widget = WidgetConfig::query()->create([
        'user_id' => $user->id,
        'name' => 'Website Agent',
        'token' => WidgetConfig::generateToken(),
        'bot_name' => 'Website Agent',
        'greeting' => 'Hi',
        'theme_color' => '#7c3aed',
        'is_active' => true,
    ]);

    Sanctum::actingAs($user);

    return [$user, $widget];
}

it('creates a wordpress website source and stores scope details', function () {
    [, $widget] = widgetOwner();

    Http::fake([
        'https://example.com*' => Http::response('<html><body>wp-content</body></html>', 200),
    ]);

    $response = $this->postJson("/api/widget/{$widget->id}/website-sources", [
        'source_type' => 'wordpress_url',
        'site_url' => 'https://example.com',
        'verification_method' => 'meta_tag',
        'include_paths' => ['/blog', '/faq'],
        'exclude_paths' => ['/cart'],
        'seed_urls' => ['https://example.com/faq'],
        'scope_mode' => 'custom',
        'recrawl_interval_hours' => 12,
    ]);

    $response->assertCreated()
        ->assertJsonPath('source.site_host', 'example.com')
        ->assertJsonPath('source.is_wordpress', true)
        ->assertJsonPath('source.include_paths.0', '/blog')
        ->assertJsonPath('source.settings.recrawl_interval_hours', 12);
});

it('rejects unsafe local website urls', function () {
    [, $widget] = widgetOwner();

    $this->postJson("/api/widget/{$widget->id}/website-sources", [
        'source_type' => 'wordpress_url',
        'site_url' => 'http://localhost:8000',
    ])->assertStatus(422);
});

it('verifies ownership with meta tag and file methods', function () {
    [, $widget] = widgetOwner();

    $metaSource = WidgetWebsiteSource::query()->create([
        'widget_id' => $widget->id,
        'user_id' => $widget->user_id,
        'source_type' => 'wordpress_url',
        'site_url' => 'https://example.com',
        'site_host' => 'example.com',
        'verification_method' => 'meta_tag',
        'verification_token' => 'meta-token',
    ]);

    $fileSource = WidgetWebsiteSource::query()->create([
        'widget_id' => $widget->id,
        'user_id' => $widget->user_id,
        'source_type' => 'wordpress_url',
        'site_url' => 'https://example.com',
        'site_host' => 'example.com',
        'verification_method' => 'file',
        'verification_token' => 'file-token',
    ]);

    Http::fake([
        'https://example.com' => Http::response('<meta name="kwati-site-verification" content="meta-token">', 200),
        'https://example.com/kwati-site-verification-file-token.txt' => Http::response('file-token', 200),
    ]);

    $this->postJson("/api/widget/{$widget->id}/website-sources/{$metaSource->id}/verify")
        ->assertOk()
        ->assertJsonPath('source.verification_status', 'verified');

    $this->postJson("/api/widget/{$widget->id}/website-sources/{$fileSource->id}/verify")
        ->assertOk()
        ->assertJsonPath('source.verification_status', 'verified');
});

it('does not queue crawl before verification', function () {
    [, $widget] = widgetOwner();

    $source = WidgetWebsiteSource::query()->create([
        'widget_id' => $widget->id,
        'user_id' => $widget->user_id,
        'source_type' => 'wordpress_url',
        'site_url' => 'https://example.com',
        'site_host' => 'example.com',
        'verification_method' => 'meta_tag',
        'verification_token' => 'meta-token',
        'verification_status' => 'pending',
    ]);

    $this->postJson("/api/widget/{$widget->id}/website-sources/{$source->id}/crawl")
        ->assertStatus(422);
});

it('queues crawls and ingests only allowed pages', function () {
    [, $widget] = widgetOwner();

    $source = WidgetWebsiteSource::query()->create([
        'widget_id' => $widget->id,
        'user_id' => $widget->user_id,
        'source_type' => 'wordpress_url',
        'site_url' => 'https://example.com',
        'site_host' => 'example.com',
        'verification_method' => 'meta_tag',
        'verification_token' => 'meta-token',
        'verification_status' => 'verified',
        'include_paths' => null,
        'exclude_paths' => ['/blog/private'],
        'settings' => ['recrawl_interval_hours' => 24],
    ]);

    Queue::fake();

    $this->postJson("/api/widget/{$widget->id}/website-sources/{$source->id}/crawl")
        ->assertOk()
        ->assertJsonPath('source.crawl_status', 'queued');

    Queue::assertPushed(CrawlWidgetWebsiteSource::class);

    Http::fake([
        'https://example.com' => Http::response('<html><head><title>Home</title></head><body>Welcome <a href="/faq">FAQ</a><a href="/cart">Cart</a></body></html>', 200),
        'https://example.com/faq' => Http::response('<html><head><title>FAQ</title></head><body>Answers for customers.</body></html>', 200),
    ]);

    app(WidgetWebsiteSourceService::class)->crawlSource($source->fresh());

    expect(WidgetKnowledgeItem::query()->where('widget_id', $widget->id)->count())->toBe(2);
    expect($source->fresh()->pages()->where('status', 'ready')->count())->toBe(2);
    expect($source->fresh()->pages()->where('status', 'skipped')->count())->toBe(1);
});

it('accepts plugin sync and keeps manual widget knowledge working', function () {
    [, $widget] = widgetOwner();

    $pluginSource = WidgetWebsiteSource::query()->create([
        'widget_id' => $widget->id,
        'user_id' => $widget->user_id,
        'source_type' => 'wordpress_plugin',
        'site_url' => 'https://example.com',
        'site_host' => 'example.com',
        'verification_token' => 'plugin-token',
        'verification_status' => 'verified',
        'connection_token' => 'plugin-connection-token',
        'connection_secret' => 'plugin-secret',
        'settings' => ['recrawl_interval_hours' => 24],
    ]);

    $this->postJson('/api/widget/plugin/plugin-connection-token/sync', [
        'site_name' => 'Demo WordPress',
        'pages' => [
            [
                'url' => 'https://example.com/about',
                'title' => 'About Us',
                'content' => 'About page content',
                'post_type' => 'page',
            ],
        ],
    ], ['X-Kwati-Plugin-Secret' => 'plugin-secret'])
        ->assertOk()
        ->assertJsonPath('source.stats.pages_ready', 1);

    $this->postJson("/api/widget/{$widget->id}/knowledge", [
        'type' => 'text',
        'name' => 'Manual Note',
        'content' => 'Still works',
    ])->assertCreated();

    expect($pluginSource->fresh()->pages()->where('status', 'ready')->count())->toBe(1);
    expect(WidgetKnowledgeItem::query()->where('widget_id', $widget->id)->where('name', 'Manual Note')->exists())->toBeTrue();
});
