<?php

namespace App\Domain\Recommendation\Scoring;

class WeightedScorer
{
    /**
     * @param  array<string, float|int>  $features
     * @param  array<string, float|int>  $weights
     * @return array{score: float, breakdown: array<string, float>}
     */
    public function score(array $features, array $weights): array
    {
        $score = 0.0;
        $breakdown = [];

        foreach ($weights as $name => $weightRaw) {
            $weight = (float) $weightRaw;
            $feature = (float) ($features[$name] ?? 0.0);
            $contribution = $feature * $weight;
            $breakdown[(string) $name] = round($contribution, 6);
            $score += $contribution;
        }

        return [
            'score' => round($score, 6),
            'breakdown' => $breakdown,
        ];
    }
}

