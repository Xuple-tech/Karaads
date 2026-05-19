<?php

namespace Tests\Unit;

use App\Services\PythonDocumentGenerationService;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;
use ZipArchive;

class PythonDocumentGenerationServiceTest extends TestCase
{
    protected function tearDown(): void
    {
        @unlink(sys_get_temp_dir() . '/kwati-docgen-output.pdf');
        @unlink(sys_get_temp_dir() . '/kwati-docgen-output.docx');
        @unlink(sys_get_temp_dir() . '/kwati-docgen-output.pptx');
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

    public function test_it_generates_powerpoint_presentations(): void
    {
        Storage::fake('public');

        config()->set('document_generation.bootstrap', false);

        $service = app(PythonDocumentGenerationService::class);
        $result = $service->generateDocument(
            'Investor Pitch',
            "# Market Opportunity\n- Large addressable market\n- Clear buyer pain\n\n# Plan\n- Launch pilot\n- Expand channels",
            'pptx',
            'pitch_deck',
            ['design_style' => 'creative']
        );

        Storage::disk('public')->assertExists($result['path']);
        $this->assertStringEndsWith('.pptx', $result['filename']);
        $this->assertSame('pptx', $result['format']);
        $this->assertSame('application/vnd.openxmlformats-officedocument.presentationml.presentation', $result['mime_type']);
        $this->assertSame('pitch_deck', $result['document_type']);
        $this->assertSame('creative', $result['design_style']);
        $this->assertGreaterThan(0, $result['size']);
    }

    public function test_it_normalizes_powerpoint_design_aliases(): void
    {
        Storage::fake('public');

        config()->set('document_generation.bootstrap', false);

        $service = app(PythonDocumentGenerationService::class);
        $result = $service->generateDocument(
            'Board Update',
            "# Summary\n- Revenue is up\n- Costs are stable",
            'pptx',
            'report',
            ['design_style' => 'professional']
        );

        $this->assertSame('corporate', $result['design_style']);
        Storage::disk('public')->assertExists($result['path']);
    }

    public function test_it_embeds_uploaded_logo_in_powerpoint_presentations(): void
    {
        Storage::fake('public');

        config()->set('document_generation.bootstrap', false);

        $logo = 'data:image/png;base64,' . base64_encode(base64_decode(
            'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAFgwJ/lz9nJAAAAABJRU5ErkJggg=='
        ));

        $service = app(PythonDocumentGenerationService::class);
        $result = $service->generateDocument(
            'Branded Deck',
            "# Summary\n- Branded slide\n- Logo should appear",
            'pptx',
            'general',
            [
                'logo_image' => [
                    'name' => 'Acme Logo',
                    'type' => 'image/png',
                    'data' => $logo,
                ],
                'logo_position' => 'bottom_right',
            ]
        );

        $path = Storage::disk('public')->path($result['path']);
        $zip = new ZipArchive();

        $this->assertTrue($result['has_logo']);
        $this->assertTrue($zip->open($path));

        $mediaFiles = 0;
        for ($index = 0; $index < $zip->numFiles; $index++) {
            $name = $zip->getNameIndex($index);
            if (is_string($name) && preg_match('#^ppt/media/.+\.(png|jpg|jpeg|gif|svg)$#', $name)) {
                $mediaFiles++;
            }
        }

        $zip->close();

        $this->assertGreaterThanOrEqual(1, $mediaFiles);
    }

    public function test_it_generates_powerpoint_presentations_with_charts(): void
    {
        Storage::fake('public');

        config()->set('document_generation.bootstrap', false);

        $service = app(PythonDocumentGenerationService::class);
        $result = $service->generateDocument(
            'Performance Charts',
            "# Revenue Bar Chart\n- Q1: 120\n- Q2: 180\n- Q3: 150\n\n# Market Share Pie Chart\n- Starter: 35\n- Pro: 45\n- Enterprise: 20\n\n# Response Time Histogram\n- 0-1s: 14\n- 1-2s: 31\n- 2-3s: 12",
            'pptx',
            'report'
        );

        $path = Storage::disk('public')->path($result['path']);
        $zip = new ZipArchive();

        $this->assertTrue($zip->open($path));

        $chartFiles = 0;
        for ($index = 0; $index < $zip->numFiles; $index++) {
            $name = $zip->getNameIndex($index);
            if (is_string($name) && preg_match('#^ppt/charts/chart\d+\.xml$#', $name)) {
                $chartFiles++;
            }
        }

        $zip->close();

        $this->assertGreaterThanOrEqual(3, $chartFiles);
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
