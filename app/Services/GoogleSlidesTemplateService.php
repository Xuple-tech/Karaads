<?php

namespace App\Services;

use App\Models\PresentationTemplate;
use Google\Client;
use Google\Service\Drive;
use Google\Service\Drive\DriveFile;
use Google\Service\Slides;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class GoogleSlidesTemplateService
{
    public function isConfigured(): bool
    {
        return $this->serviceAccountConfig() !== null;
    }

    /**
     * @return array{presentation_id: string, drive_file_id: string, web_view_link: string|null, preview_image_url: string|null, slide_previews: array<int, array<string, string|null>>}|null
     */
    public function importPowerPointAsGoogleSlides(PresentationTemplate $template, string $absolutePath): ?array
    {
        if (!$this->isConfigured() || !is_file($absolutePath)) {
            return null;
        }

        try {
            $client = $this->makeClient();
            $drive = new Drive($client);
            $slides = new Slides($client);

            $fileMetadata = new DriveFile([
                'name' => $template->source_file_name ?: ($template->name . '.pptx'),
                'mimeType' => 'application/vnd.google-apps.presentation',
            ]);

            $folderId = config('services.google.slides.folder_id');
            if (is_string($folderId) && $folderId !== '') {
                $fileMetadata->setParents([$folderId]);
            }

            $createdFile = $drive->files->create($fileMetadata, [
                'data' => file_get_contents($absolutePath),
                'mimeType' => 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
                'uploadType' => 'multipart',
                'fields' => 'id,name,webViewLink',
                'supportsAllDrives' => true,
            ]);

            $presentationId = (string) $createdFile->getId();
            if ($presentationId === '') {
                return null;
            }

            $presentation = $slides->presentations->get($presentationId);
            $slidePages = $presentation->getSlides() ?? [];

            $slidePreviews = [];
            Storage::disk('public')->deleteDirectory($this->previewDirectory($template));

            foreach ($slidePages as $index => $page) {
                $pageId = (string) $page->getObjectId();

                $thumbnail = $slides->presentations_pages->getThumbnail($presentationId, $pageId, [
                    'thumbnailProperties.mimeType' => 'PNG',
                    'thumbnailProperties.thumbnailSize' => 'LARGE',
                ]);

                $contentUrl = $thumbnail->getContentUrl();
                $storedPreviewUrl = null;

                if (is_string($contentUrl) && $contentUrl !== '') {
                    $storedPreviewUrl = $this->downloadAndStorePreview($template, $index + 1, $contentUrl);
                }

                $slidePreviews[] = [
                    'page_object_id' => $pageId,
                    'preview_image_url' => $storedPreviewUrl,
                ];
            }

            return [
                'presentation_id' => $presentationId,
                'drive_file_id' => (string) $createdFile->getId(),
                'web_view_link' => $createdFile->getWebViewLink(),
                'preview_image_url' => $slidePreviews[0]['preview_image_url'] ?? null,
                'slide_previews' => $slidePreviews,
            ];
        } catch (\Throwable $exception) {
            Log::warning('Google Slides import failed for presentation template', [
                'template_id' => $template->id,
                'message' => $exception->getMessage(),
            ]);

            return null;
        }
    }

    private function makeClient(): Client
    {
        $client = new Client();
        $client->setAuthConfig($this->serviceAccountConfig());
        $client->setScopes([
            Drive::DRIVE,
            Slides::PRESENTATIONS_READONLY,
        ]);

        $subject = config('services.google.slides.subject');
        if (is_string($subject) && $subject !== '') {
            $client->setSubject($subject);
        }

        return $client;
    }

    /**
     * @return array<string, mixed>|string|null
     */
    private function serviceAccountConfig(): array|string|null
    {
        $json = config('services.google.slides.service_account_json');
        if (is_string($json) && trim($json) !== '') {
            $decoded = json_decode($json, true);

            return is_array($decoded) ? $decoded : null;
        }

        $path = config('services.google.slides.service_account_path');
        if (is_string($path) && $path !== '' && is_file($path)) {
            return $path;
        }

        return null;
    }

    private function downloadAndStorePreview(PresentationTemplate $template, int $position, string $contentUrl): ?string
    {
        $response = Http::timeout(60)->get($contentUrl);
        if (!$response->successful()) {
            return null;
        }

        $path = $this->previewDirectory($template) . '/google-slide-' . $position . '.png';
        Storage::disk('public')->put($path, $response->body());

        return Storage::disk('public')->url($path);
    }

    private function previewDirectory(PresentationTemplate $template): string
    {
        return 'presentation-templates/google-slides-previews/' . $template->id;
    }
}
