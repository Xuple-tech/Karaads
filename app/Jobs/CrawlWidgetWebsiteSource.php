<?php

namespace App\Jobs;

use App\Models\WidgetWebsiteSource;
use App\Services\Widget\WidgetWebsiteSourceService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Throwable;

class CrawlWidgetWebsiteSource implements ShouldQueue
{
    use Queueable;

    public int $tries = 2;

    public int $timeout = 300;

    public function __construct(
        public readonly string $websiteSourceId,
    ) {
    }

    public function handle(WidgetWebsiteSourceService $sources): void
    {
        $source = WidgetWebsiteSource::query()->findOrFail($this->websiteSourceId);
        $sources->crawlSource($source);
    }

    public function failed(Throwable $exception): void
    {
        WidgetWebsiteSource::query()
            ->whereKey($this->websiteSourceId)
            ->update([
                'crawl_status' => 'failed',
            ]);

        report($exception);
    }
}
