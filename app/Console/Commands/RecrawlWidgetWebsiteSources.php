<?php

namespace App\Console\Commands;

use App\Models\WidgetWebsiteSource;
use App\Services\Widget\WidgetWebsiteSourceService;
use Illuminate\Console\Command;

class RecrawlWidgetWebsiteSources extends Command
{
    protected $signature = 'widget-sources:recrawl';

    protected $description = 'Queue due widget website source recrawls.';

    public function handle(WidgetWebsiteSourceService $sources): int
    {
        $dueSources = WidgetWebsiteSource::query()
            ->where('source_type', 'wordpress_url')
            ->where('is_active', true)
            ->where('verification_status', 'verified')
            ->where(function ($query) {
                $query->whereNull('next_recrawl_at')
                    ->orWhere('next_recrawl_at', '<=', now());
            })
            ->get();

        foreach ($dueSources as $source) {
            try {
                $sources->verifySource($source);
                $source->refresh();

                if ($source->verification_status !== 'verified') {
                    continue;
                }

                $sources->queueCrawl($source, true);
            } catch (\Throwable $e) {
                $source->update([
                    'verification_status' => 'failed',
                    'crawl_status' => 'failed',
                ]);
                report($e);
            }
        }

        $this->info('Queued ' . $dueSources->count() . ' widget website source recrawls.');

        return self::SUCCESS;
    }
}
