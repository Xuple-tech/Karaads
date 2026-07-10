<?php

return [
    'paths' => [
        'original_subdir' => 'original',
        'derived_subdir' => 'derived',
        'store_originals_in_subdir' => true,
    ],

    'image' => [
        'variants' => [
            'thumb' => 480,
            'medium' => 900,
        ],
        'quality' => env('MEDIA_IMAGE_QUALITY', 76),
    ],

    'avatar' => [
        'sizes' => [
            'sm' => 64,
            'md' => 128,
            'lg' => 256,
        ],
        'quality' => 85,
    ],

    'cover' => [
        'sizes' => [
            'sm' => [400, 225],    // 400x225 (16:9)
            'md' => [800, 450],    // 800x450 (16:9)
            'lg' => [1200, 675],   // 1200x675 (16:9)
        ],
        'quality' => 82,
    ],

    'video' => [
        'ffmpeg_binary' => env('FFMPEG_BINARY'),
        'ffprobe_binary' => env('FFPROBE_BINARY'),
        'max_long_edge' => env('MEDIA_VIDEO_MAX_LONG_EDGE', 720),
        'crf' => env('MEDIA_VIDEO_CRF', 28),
        'preset' => env('MEDIA_VIDEO_PRESET', 'veryfast'),
        'audio_bitrate' => env('MEDIA_VIDEO_AUDIO_BITRATE', '96k'),
        'thumbnail_second' => 1.0,
        'thumbnail_long_edge' => 480,
    ],

    'quality' => [
        'enabled' => env('MEDIA_QUALITY_VALIDATION_ENABLED', true),
        'min_image_long_edge' => env('MEDIA_QUALITY_MIN_IMAGE_LONG_EDGE', 360),
        'min_video_long_edge' => env('MEDIA_QUALITY_MIN_VIDEO_LONG_EDGE', 360),
        'image_blur_threshold' => env('MEDIA_QUALITY_IMAGE_BLUR_THRESHOLD', 45),
        'video_blur_threshold' => env('MEDIA_QUALITY_VIDEO_BLUR_THRESHOLD', 38),
        'video_sample_count' => env('MEDIA_QUALITY_VIDEO_SAMPLE_COUNT', 3),
    ],

    'copyright' => [
        'enabled' => env('MEDIA_COPYRIGHT_VALIDATION_ENABLED', true),
        'tesseract_binary' => env('TESSERACT_BINARY'),
    ],
];
