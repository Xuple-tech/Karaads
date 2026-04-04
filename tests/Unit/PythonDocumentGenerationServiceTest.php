<?php

namespace Tests\Unit;

use App\Services\PythonDocumentGenerationService;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class PythonDocumentGenerationServiceTest extends TestCase
{
    protected function tearDown(): void
    {
        @unlink(sys_get_temp_dir() . '/kwati-docgen-output.pdf');
        @unlink(sys_get_temp_dir() . '/kwati-docgen-output.docx');
        parent::tearDown();
    }

    public function test_it_stores_generated_document_metadata_from_worker_output(): void
    {
        Storage::fake('public');

        $output = sys_get_temp_dir() . '/kwati-docgen-output.pdf';
        file_put_contents($output, 'pdf-bytes');

        $script = $this->makeWorkerScript(<<<'PHP'
$payload = json_decode(stream_get_contents(STDIN), true);
echo json_encode([
    'success' => true,
    'output_path' => sys_get_temp_dir() . '/kwati-docgen-output.pdf',
    'filename' => 'proposal.pdf',
    'mime_type' => 'application/pdf',
]);
PHP);

        config()->set('document_generation.python_binary', PHP_BINARY);
        config()->set('document_generation.entrypoint', $script);
        config()->set('document_generation.bootstrap', false);
        config()->set('document_generation.timeout', 5);

        $service = app(PythonDocumentGenerationService::class);
        $result = $service->generateDocument('Board Proposal', '# Hello', 'pdf', 'proposal');

        Storage::disk('public')->assertExists($result['path']);
        $this->assertSame('proposal.pdf', $result['filename']);
        $this->assertSame('application/pdf', $result['mime_type']);
        $this->assertSame('proposal', $result['document_type']);
        $this->assertGreaterThan(0, $result['size']);
    }

    public function test_it_rejects_malformed_worker_json(): void
    {
        $script = $this->makeWorkerScript(<<<'PHP'
echo 'not-json';
PHP);

        config()->set('document_generation.python_binary', PHP_BINARY);
        config()->set('document_generation.entrypoint', $script);
        config()->set('document_generation.bootstrap', false);
        config()->set('document_generation.timeout', 5);

        $service = app(PythonDocumentGenerationService::class);

        $this->expectException(\RuntimeException::class);
        $this->expectExceptionMessage('invalid JSON');

        $service->generateDocument('Broken', 'content', 'pdf');
    }

    public function test_it_throws_when_worker_output_file_is_missing(): void
    {
        $script = $this->makeWorkerScript(<<<'PHP'
echo json_encode([
    'success' => true,
    'output_path' => sys_get_temp_dir() . '/missing-output.pdf',
    'filename' => 'missing.pdf',
    'mime_type' => 'application/pdf',
]);
PHP);

        config()->set('document_generation.python_binary', PHP_BINARY);
        config()->set('document_generation.entrypoint', $script);
        config()->set('document_generation.bootstrap', false);
        config()->set('document_generation.timeout', 5);

        $service = app(PythonDocumentGenerationService::class);

        $this->expectException(\RuntimeException::class);
        $this->expectExceptionMessage('valid output file');

        $service->generateDocument('Missing', 'content', 'pdf');
    }

    public function test_it_times_out_when_worker_takes_too_long(): void
    {
        $script = $this->makeWorkerScript(<<<'PHP'
sleep(2);
echo json_encode(['success' => true]);
PHP);

        config()->set('document_generation.python_binary', PHP_BINARY);
        config()->set('document_generation.entrypoint', $script);
        config()->set('document_generation.bootstrap', false);
        config()->set('document_generation.timeout', 1);

        $service = app(PythonDocumentGenerationService::class);

        $this->expectException(\RuntimeException::class);
        $this->expectExceptionMessage('timed out');

        $service->generateDocument('Slow', 'content', 'pdf');
    }

    private function makeWorkerScript(string $body): string
    {
        $path = tempnam(sys_get_temp_dir(), 'kwati-docgen-worker-') . '.php';
        file_put_contents($path, "<?php\n{$body}\n");

        return $path;
    }
}
