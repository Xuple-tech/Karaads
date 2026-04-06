<?php

namespace Tests\Unit\Grok;

use App\Services\Grok\ToolRegistry;
use PHPUnit\Framework\TestCase;

class ToolRegistryTest extends TestCase
{
    public function test_it_exposes_expected_tool_names(): void
    {
        $registry = new ToolRegistry();

        $names = array_map(
            fn (array $tool): string => $tool['function']['name'],
            $registry->getTools()
        );

        $this->assertSame([
            'web_search',
            'web_fetch',
            'generate_image',
            'edit_image',
            'generate_pdf_document',
            'generate_word_document',
        ], $names);
    }
}
