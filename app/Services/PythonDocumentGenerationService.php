<?php

namespace App\Services;

use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Symfony\Component\Process\Exception\ProcessTimedOutException;
use Symfony\Component\Process\Process;

class PythonDocumentGenerationService
{
    public function generateDocument(
        string $title,
        string $contentMarkdown,
        string $format,
        string $documentType = 'general',
        array $options = [],
    ): array {
        $normalizedFormat = strtolower($format);

        if (!in_array($normalizedFormat, ['pdf', 'docx'], true)) {
            throw new \InvalidArgumentException("Unsupported document format [{$format}]");
        }

        $this->bootstrapVirtualEnvIfNeeded();

        $payload = [
            'title' => $title,
            'content_markdown' => $contentMarkdown,
            'format' => $normalizedFormat,
            'document_type' => $documentType,
            'options' => $options,
        ];

        $process = new Process([
            $this->resolvePythonExecutable(),
            $this->entrypoint(),
            '--stdin',
        ], base_path());

        $process->setInput(json_encode($payload, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE));
        $process->setTimeout($this->timeout());

        try {
            $process->mustRun();
        } catch (ProcessTimedOutException $exception) {
            throw new \RuntimeException('Python document generator timed out.');
        } catch (\Throwable $exception) {
            $message = trim($process->getErrorOutput()) ?: $exception->getMessage();
            throw new \RuntimeException('Python document generator failed: ' . $message);
        }

        $decoded = json_decode(trim($process->getOutput()), true);

        if (!is_array($decoded)) {
            throw new \RuntimeException('Python document generator returned invalid JSON.');
        }

        if (!($decoded['success'] ?? false)) {
            throw new \RuntimeException($decoded['error'] ?? 'Python document generation failed.');
        }

        $outputPath = $decoded['output_path'] ?? null;
        if (!is_string($outputPath) || $outputPath === '' || !is_file($outputPath)) {
            throw new \RuntimeException('Python document generator did not return a valid output file.');
        }

        $filename = $decoded['filename'] ?? $this->defaultFilename($title, $normalizedFormat);
        $storagePath = 'user-content/documents/' . now()->format('Y/m/d') . '/' . $filename;

        Storage::disk('public')->put($storagePath, file_get_contents($outputPath));
        @unlink($outputPath);

        return [
            'success' => true,
            'title' => $title,
            'format' => $normalizedFormat,
            'filename' => $filename,
            'url' => Storage::url($storagePath),
            'path' => $storagePath,
            'mime_type' => $decoded['mime_type'] ?? $this->mimeTypeFor($normalizedFormat),
            'size' => Storage::disk('public')->size($storagePath),
            'document_type' => $documentType,
            'generated_at' => now()->toISOString(),
        ];
    }

    private function resolvePythonExecutable(): string
    {
        $configured = (string) config('document_generation.python_binary', 'py');
        $venvPath = (string) config('document_generation.venv_path', '');

        if ($configured !== '' && $configured !== 'py') {
            return $configured;
        }

        if ($venvPath !== '') {
            $candidate = DIRECTORY_SEPARATOR === '\\'
                ? $venvPath . DIRECTORY_SEPARATOR . 'Scripts' . DIRECTORY_SEPARATOR . 'python.exe'
                : $venvPath . DIRECTORY_SEPARATOR . 'bin' . DIRECTORY_SEPARATOR . 'python';

            if (is_file($candidate)) {
                return $candidate;
            }
        }

        return $configured;
    }

    private function bootstrapVirtualEnvIfNeeded(): void
    {
        if (!config('document_generation.bootstrap', false)) {
            return;
        }

        $venvPath = (string) config('document_generation.venv_path', '');
        if ($venvPath === '') {
            return;
        }

        $pythonExecutable = DIRECTORY_SEPARATOR === '\\'
            ? $venvPath . DIRECTORY_SEPARATOR . 'Scripts' . DIRECTORY_SEPARATOR . 'python.exe'
            : $venvPath . DIRECTORY_SEPARATOR . 'bin' . DIRECTORY_SEPARATOR . 'python';

        if (is_file($pythonExecutable)) {
            return;
        }

        $script = DIRECTORY_SEPARATOR === '\\'
            ? base_path('_services/docgen/bootstrap.ps1')
            : base_path('_services/docgen/bootstrap.sh');

        if (!is_file($script)) {
            return;
        }

        $command = DIRECTORY_SEPARATOR === '\\'
            ? ['powershell', '-ExecutionPolicy', 'Bypass', '-File', $script]
            : ['sh', $script];

        $process = new Process($command, base_path());
        $process->setTimeout($this->timeout());
        $process->mustRun();
    }

    private function entrypoint(): string
    {
        return (string) config('document_generation.entrypoint', base_path('_services/docgen/main.py'));
    }

    private function timeout(): float
    {
        return (float) config('document_generation.timeout', 120);
    }

    private function defaultFilename(string $title, string $format): string
    {
        return 'document_' . Str::slug($title) . '_' . Str::lower(Str::random(8)) . '.' . $format;
    }

    private function mimeTypeFor(string $format): string
    {
        return match ($format) {
            'pdf' => 'application/pdf',
            'docx' => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            default => 'application/octet-stream',
        };
    }
}
