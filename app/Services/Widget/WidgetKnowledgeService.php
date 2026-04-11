<?php

namespace App\Services\Widget;

use App\Models\User;
use App\Models\WidgetConfig;
use App\Models\WidgetKnowledgeItem;
use Illuminate\Http\UploadedFile;
use Illuminate\Http\Client\PendingRequest;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Smalot\PdfParser\Parser;

class WidgetKnowledgeService
{
    public function addText(WidgetConfig $widget, User $user, string $name, string $content): WidgetKnowledgeItem
    {
        return WidgetKnowledgeItem::create([
            'widget_id' => $widget->id,
            'user_id' => $user->id,
            'name' => $name,
            'type' => 'text',
            'content' => trim($content),
            'status' => 'ready',
        ]);
    }

    public function addUrl(WidgetConfig $widget, User $user, string $url, ?string $name = null): WidgetKnowledgeItem
    {
        $this->assertSafeUrl($url);

        $item = WidgetKnowledgeItem::create([
            'widget_id' => $widget->id,
            'user_id' => $user->id,
            'name' => $name ?: $url,
            'type' => 'url',
            'content' => '',
            'source_url' => $url,
            'status' => 'processing',
        ]);

        try {
            $response = $this->sendPublicGet($url);
            $response->throw();

            $content = $this->normalizeText(strip_tags($response->body()));
            $item->update([
                'content' => Str::limit($content, 10000, ''),
                'status' => 'ready',
            ]);
        } catch (\Throwable $e) {
            Log::warning('Widget URL knowledge ingestion failed', [
                'widget_id' => $widget->id,
                'url' => $url,
                'error' => $e->getMessage(),
            ]);

            $item->update([
                'content' => '',
                'status' => 'failed',
            ]);
        }

        return $item->fresh();
    }

    public function syncUrl(WidgetConfig $widget, User $user, string $url, ?string $name = null): WidgetKnowledgeItem
    {
        $existing = WidgetKnowledgeItem::query()
            ->where('widget_id', $widget->id)
            ->where('user_id', $user->id)
            ->where('type', 'url')
            ->where('source_url', $url)
            ->first();

        if ($existing) {
            $existing->delete();
        }

        return $this->addUrl($widget, $user, $url, $name);
    }

    public function addPdf(WidgetConfig $widget, User $user, UploadedFile $file): WidgetKnowledgeItem
    {
        $item = WidgetKnowledgeItem::create([
            'widget_id' => $widget->id,
            'user_id' => $user->id,
            'name' => $file->getClientOriginalName(),
            'type' => 'pdf',
            'content' => '',
            'status' => 'processing',
        ]);

        $directory = 'widget-knowledge/' . now()->format('Y/m/d') . '/' . $user->id;
        $filename = Str::uuid() . '.pdf';
        $path = $file->storeAs($directory, $filename, 'private');

        try {
            $parser = new Parser();
            $pdf = $parser->parseFile(Storage::disk('private')->path($path));
            $text = $this->normalizeText($pdf->getText());

            $item->update([
                'content' => Str::limit($text, 50000, ''),
                'status' => $text !== '' ? 'ready' : 'failed',
            ]);
        } catch (\Throwable $e) {
            Log::warning('Widget PDF knowledge ingestion failed', [
                'widget_id' => $widget->id,
                'item_id' => $item->id,
                'error' => $e->getMessage(),
            ]);

            $item->update([
                'content' => '',
                'status' => 'failed',
            ]);
        }

        return $item->fresh();
    }

    private function normalizeText(string $value): string
    {
        $normalized = preg_replace('/\s+/', ' ', html_entity_decode($value, ENT_QUOTES | ENT_HTML5));

        return trim((string) $normalized);
    }

    private function assertSafeUrl(string $url): void
    {
        $parts = parse_url($url);
        $scheme = strtolower((string) ($parts['scheme'] ?? ''));

        if (! in_array($scheme, ['http', 'https'], true)) {
            throw new \RuntimeException('Only HTTP and HTTPS knowledge URLs are allowed.');
        }

        $host = strtolower((string) ($parts['host'] ?? ''));

        if ($host === '' || in_array($host, ['localhost', '127.0.0.1', '::1'], true) || str_ends_with($host, '.local')) {
            throw new \RuntimeException('Private or local URLs are not allowed.');
        }

        $addresses = gethostbynamel($host) ?: [];

        if ($addresses === []) {
            throw new \RuntimeException('Could not resolve the knowledge source host.');
        }

        foreach ($addresses as $address) {
            $isPublic = filter_var(
                $address,
                FILTER_VALIDATE_IP,
                FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE
            );

            if (! $isPublic) {
                throw new \RuntimeException('Private or reserved network targets are not allowed.');
            }
        }
    }

    private function sendPublicGet(string $url)
    {
        $client = Http::timeout(5)->connectTimeout(3)->withoutRedirecting();

        try {
            return $client->get($url);
        } catch (\Throwable $e) {
            if (! $this->isCertificateAuthorityError($e)) {
                throw $e;
            }

            Log::warning('Retrying widget knowledge fetch without SSL verification after certificate error.', [
                'url' => $url,
                'error' => $e->getMessage(),
            ]);

            return $this->insecurePublicClient()->get($url);
        }
    }

    private function insecurePublicClient(): PendingRequest
    {
        return Http::timeout(5)
            ->connectTimeout(3)
            ->withoutRedirecting()
            ->withoutVerifying();
    }

    private function isCertificateAuthorityError(\Throwable $e): bool
    {
        return str_contains(strtolower($e->getMessage()), 'curl error 60');
    }
}
