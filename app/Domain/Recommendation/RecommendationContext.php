<?php

namespace App\Domain\Recommendation;

class RecommendationContext
{
    public function __construct(
        public readonly ?string $userId,
        public readonly string $entityType,
        public readonly string $surface,
        public readonly ?string $slot,
        public readonly array $context,
        public readonly array $viewer,
        public readonly array $device,
    ) {}

    public static function fromArray(array $payload): self
    {
        return new self(
            userId: $payload['user_id'] ?? null,
            entityType: $payload['entity_type'] ?? 'ad',
            surface: $payload['surface'] ?? 'feed',
            slot: $payload['slot'] ?? null,
            context: (array) ($payload['context'] ?? []),
            viewer: (array) ($payload['viewer'] ?? []),
            device: (array) ($payload['device'] ?? []),
        );
    }
}

