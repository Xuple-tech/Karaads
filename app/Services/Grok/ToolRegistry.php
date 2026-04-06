<?php

namespace App\Services\Grok;

class ToolRegistry
{
    public function getTools(): array
    {
        static $cachedTools = null;

        if ($cachedTools !== null) {
            return $cachedTools;
        }

        $cachedTools = [
            [
                'type' => 'function',
                'function' => [
                    'name' => 'web_search',
                    'description' => 'Search the web for current information, news, facts, or any up-to-date data. Use this when you need recent information beyond your knowledge cutoff.',
                    'parameters' => [
                        'type' => 'object',
                        'properties' => [
                            'query' => [
                                'type' => 'string',
                                'description' => 'The search query to find relevant, current information',
                            ],
                            'max_results' => [
                                'type' => 'integer',
                                'description' => 'Maximum number of results to return (default 3, max 5)',
                                'default' => 3,
                            ],
                        ],
                        'required' => ['query'],
                    ],
                ],
            ],
            [
                'type' => 'function',
                'function' => [
                    'name' => 'web_fetch',
                    'description' => 'Fetch the content of a specific webpage by URL when you need detailed information from a particular source.',
                    'parameters' => [
                        'type' => 'object',
                        'properties' => [
                            'url' => [
                                'type' => 'string',
                                'description' => 'The URL of the webpage to fetch',
                            ],
                        ],
                        'required' => ['url'],
                    ],
                ],
            ],
            [
                'type' => 'function',
                'function' => [
                    'name' => 'generate_image',
                    'description' => 'Generate an image when the user explicitly asks to create images. Use Stability AI models for generation.',
                    'parameters' => [
                        'type' => 'object',
                        'properties' => [
                            'user_prompt' => [
                                'type' => 'string',
                                'description' => 'The user\'s EXACT original prompt for image generation. Do not modify, enhance, or interpret it. Use it verbatim.',
                            ],
                            'number_of_images' => [
                                'type' => 'integer',
                                'description' => 'Number of images to generate (1-10)',
                                'default' => 1,
                                'minimum' => 1,
                                'maximum' => 10,
                            ],
                            'model' => [
                                'type' => 'string',
                                'description' => 'Stability AI model to use for generation',
                                'enum' => ['sd3.5', 'sd3', 'sd3-turbo', 'sd-xl', 'stable-image-core', 'stable-image-ultra'],
                                'default' => 'sd3.5',
                            ],
                            'size' => [
                                'type' => 'string',
                                'description' => 'Size of generated images',
                                'enum' => ['512x512', '768x768', '1024x1024', '2048x2048'],
                                'default' => '1024x1024',
                            ],
                        ],
                        'required' => ['user_prompt'],
                    ],
                ],
            ],
            [
                'type' => 'function',
                'function' => [
                    'name' => 'edit_image',
                    'description' => 'Edit or modify existing images when user uploads images and provides editing instructions.',
                    'parameters' => [
                        'type' => 'object',
                        'properties' => [
                            'edit_prompt' => [
                                'type' => 'string',
                                'description' => 'Detailed instructions for how to edit the uploaded images',
                            ],
                            'model' => [
                                'type' => 'string',
                                'description' => 'Stability AI model for editing',
                                'enum' => ['sd3.5', 'sd3', 'stable-image-ultra'],
                                'default' => 'sd3.5',
                            ],
                        ],
                        'required' => ['edit_prompt'],
                    ],
                ],
            ],
            [
                'type' => 'function',
                'function' => [
                    'name' => 'generate_pdf_document',
                    'description' => 'Generate a PDF document with formatted content. Use when the user asks to create a PDF, report, or any document that needs to be easily readable and printable.',
                    'parameters' => [
                        'type' => 'object',
                        'properties' => [
                            'title' => [
                                'type' => 'string',
                                'description' => 'Title of the document',
                            ],
                            'content' => [
                                'type' => 'string',
                                'description' => 'Main content of the document (can include markdown formatting like **bold**, *italic*, # headers, and lists)',
                            ],
                            'document_type' => [
                                'type' => 'string',
                                'description' => 'Type of document to generate',
                                'enum' => ['report', 'letter', 'essay', 'resume', 'business', 'academic', 'proposal', 'general'],
                                'default' => 'general',
                            ],
                            'include_header' => [
                                'type' => 'boolean',
                                'description' => 'Whether to include a header with title and date',
                                'default' => true,
                            ],
                            'include_page_numbers' => [
                                'type' => 'boolean',
                                'description' => 'Whether to include page numbers',
                                'default' => true,
                            ],
                        ],
                        'required' => ['title', 'content'],
                    ],
                ],
            ],
            [
                'type' => 'function',
                'function' => [
                    'name' => 'generate_word_document',
                    'description' => 'Generate a Microsoft Word (.docx) document with formatted content. Use when the user specifically requests a Word document.',
                    'parameters' => [
                        'type' => 'object',
                        'properties' => [
                            'title' => [
                                'type' => 'string',
                                'description' => 'Title of the document',
                            ],
                            'content' => [
                                'type' => 'string',
                                'description' => 'Main content of the document (can include markdown formatting - will be converted to Word formatting)',
                            ],
                            'document_type' => [
                                'type' => 'string',
                                'description' => 'Type of document to generate',
                                'enum' => ['report', 'letter', 'essay', 'resume', 'business', 'academic', 'proposal', 'general'],
                                'default' => 'general',
                            ],
                        ],
                        'required' => ['title', 'content'],
                    ],
                ],
            ],
        ];

        return $cachedTools;
    }
}
