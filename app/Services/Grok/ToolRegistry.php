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
                    'description' => 'Generate a PDF document. Use ONLY when the user explicitly requests a PDF file. For all other document requests (reports, proposals, letters, etc.) use generate_word_document instead.',
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
                    'description' => 'Generate a Microsoft Word (.docx) document. This is the DEFAULT document format. Use whenever the user asks to create any document, report, proposal, letter, resume, contract, or written content — unless they explicitly ask for PDF.',
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
            [
                'type' => 'function',
                'function' => [
                    'name' => 'generate_powerpoint_presentation',
                    'description' => 'Generate a Microsoft PowerPoint (.pptx) presentation. Use when the user explicitly asks for a PowerPoint, PPT, PPTX, slide deck, presentation, or slides.',
                    'parameters' => [
                        'type' => 'object',
                        'properties' => [
                            'title' => [
                                'type' => 'string',
                                'description' => 'Title of the presentation',
                            ],
                            'content' => [
                                'type' => 'string',
                                'description' => 'Complete slide content in markdown. Use headings for slide titles and bullets for slide body points. For charts, create a slide heading containing "Bar Chart", "Pie Chart", or "Histogram", then list values as bullets like "- Product A: 120".',
                            ],
                            'document_type' => [
                                'type' => 'string',
                                'description' => 'Type of presentation to generate',
                                'enum' => ['pitch_deck', 'training', 'business', 'academic', 'proposal', 'report', 'general'],
                                'default' => 'general',
                            ],
                            'design_style' => [
                                'type' => 'string',
                                'description' => 'Primary visual design style for the PowerPoint. Use when the user picks one look; otherwise use mixed.',
                                'enum' => ['mixed', 'business_blue', 'boardroom', 'editorial', 'tech_grid', 'financial_clean', 'corporate', 'creative', 'minimalist', 'dark', 'warm'],
                                'default' => 'mixed',
                            ],
                            'design_styles' => [
                                'type' => 'array',
                                'description' => 'Optional list of visual design styles to combine in one PowerPoint when the user wants multiple looks.',
                                'items' => [
                                    'type' => 'string',
                                    'enum' => ['mixed', 'business_blue', 'boardroom', 'editorial', 'tech_grid', 'financial_clean', 'corporate', 'creative', 'minimalist', 'dark', 'warm'],
                                ],
                            ],
                            'design_description' => [
                                'type' => 'string',
                                'description' => 'Free-form description of the desired presentation look. Use this when the user describes a style but does not know the library names; the design library will match the closest preset(s).',
                            ],
                            'logo_position' => [
                                'type' => 'string',
                                'description' => 'Where to place an uploaded logo image on the PowerPoint slides.',
                                'enum' => ['top_right', 'top_left', 'bottom_right', 'bottom_left'],
                                'default' => 'top_right',
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
