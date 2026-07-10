<?php

namespace App\Domain\Calls;

use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class CallSignalService
{
    private int $sdpMaxLen;

    private int $iceMaxLen;

    public function __construct(private readonly CallSessionRepository $repository)
    {
        $this->sdpMaxLen = (int) config('calls.sdp_max_len', 50000);
        $this->iceMaxLen = (int) config('calls.ice_max_len', 20000);
    }

    public function sdpMaxLen(): int
    {
        return $this->sdpMaxLen;
    }

    public function iceMaxLen(): int
    {
        return $this->iceMaxLen;
    }

    /**
     * @return array{signal_id:string,sdp:string}
     */
    public function storeOffer(string $callId, string $rawSdp): array
    {
        [$sanitizedSdp, $removedCount] = $this->sanitizeSdp($rawSdp);
        $signalId = (string) Str::uuid();
        $this->repository->putSignal($callId, 'offer', $signalId, $sanitizedSdp);
        $this->logSignalDebug('offer', $callId, $signalId, strlen($rawSdp), strlen($sanitizedSdp), $removedCount);

        return ['signal_id' => $signalId, 'sdp' => $sanitizedSdp];
    }

    /**
     * @return array{signal_id:string,sdp:string}
     */
    public function storeAnswer(string $callId, string $rawSdp): array
    {
        [$sanitizedSdp, $removedCount] = $this->sanitizeSdp($rawSdp);
        $signalId = (string) Str::uuid();
        $this->repository->putSignal($callId, 'answer', $signalId, $sanitizedSdp);
        $this->logSignalDebug('answer', $callId, $signalId, strlen($rawSdp), strlen($sanitizedSdp), $removedCount);

        return ['signal_id' => $signalId, 'sdp' => $sanitizedSdp];
    }

    public function getSignal(string $callId, string $type, string $signalId): mixed
    {
        return $this->repository->getSignal($callId, $type, $signalId);
    }

    public function validateIceCandidatePayload(mixed $candidate): void
    {
        $encoded = json_encode($candidate);
        if ($encoded === false || strlen($encoded) > $this->iceMaxLen) {
            abort(response()->json(['message' => 'ICE candidate too large'], 422));
        }
    }

    /**
     * @return array{0:string,1:int}
     */
    public function sanitizeSdp(string $sdp): array
    {
        $normalized = str_replace(["\r\n", "\r"], "\n", $sdp);
        $lines = explode("\n", $normalized);
        $kept = [];
        $removedCount = 0;

        foreach ($lines as $line) {
            $trimmed = ltrim($line);

            if (str_starts_with($trimmed, 'a=ssrc:') || str_starts_with($trimmed, 'a=ssrc-group:')) {
                $removedCount++;
                continue;
            }

            $kept[] = $line;
        }

        $result = trim(implode("\r\n", $kept));
        if ($result !== '') {
            $result .= "\r\n";
        }

        return [$result, $removedCount];
    }

    private function logSignalDebug(
        string $type,
        string $callId,
        string $signalId,
        int $rawLen,
        int $sanitizedLen,
        int $removedCount,
    ): void {
        $enabled = filter_var((string) env('CALL_DEBUG', false), FILTER_VALIDATE_BOOL);
        if (!$enabled) {
            return;
        }

        Log::info('Call signal sanitized', [
            'type' => $type,
            'call_id' => $callId,
            'signal_id' => $signalId,
            'raw_sdp_len' => $rawLen,
            'sanitized_sdp_len' => $sanitizedLen,
            'ssrc_lines_removed_count' => $removedCount,
        ]);
    }
}
