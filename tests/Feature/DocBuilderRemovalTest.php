<?php

namespace Tests\Feature;

use App\Models\User;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class DocBuilderRemovalTest extends TestCase
{
    public function test_doc_builder_web_urls_return_not_found(): void
    {
        $this->get('/doc-builder')->assertNotFound();
        $this->get('/doc-builder/01testsession')->assertNotFound();
    }

    public function test_doc_builder_api_urls_return_not_found(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $this->getJson('/api/doc-builder/sessions')->assertNotFound();
        $this->postJson('/api/doc-builder/messages', [
            'message' => 'Generate a document',
        ])->assertNotFound();
    }
}
