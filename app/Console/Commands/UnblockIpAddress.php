<?php

namespace App\Console\Commands;

use App\Models\IpReputation;
use Illuminate\Console\Command;

class UnblockIpAddress extends Command
{
    protected $signature = 'ip:unblock {ip_address}';
    protected $description = 'Unblock an IP address';

    public function handle(): int
    {
        $ip = $this->argument('ip_address');

        $ipRecord = IpReputation::where('ip_address', $ip)->first();

        if (!$ipRecord) {
            $this->error("✗ IP address {$ip} not found in reputation database");
            return self::FAILURE;
        }

        $ipRecord->unblock();
        $this->info("✓ IP {$ip} has been unblocked");

        return self::SUCCESS;
    }
}
