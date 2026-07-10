<?php

namespace App\Support;

class OnboardingInterestOptions
{
    /**
     * @return array<int, string>
     */
    public static function values(): array
    {
        return [
            'technology',
            'business',
            'finance',
            'education',
            'entertainment',
            'sports',
            'health',
            'gaming',
            'news',
            'lifestyle',
        ];
    }

    /**
     * @return array<int, array{value:string,label:string}>
     */
    public static function options(): array
    {
        return array_map(
            fn (string $value) => [
                'value' => $value,
                'label' => str($value)->replace('-', ' ')->title()->toString(),
            ],
            self::values()
        );
    }
}
