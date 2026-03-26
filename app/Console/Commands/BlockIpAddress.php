<?php

namespace App\Console\Commands;

use App\Models\IpReputation;
use Illuminate\Console\Command;

class BlockIpAddress extends Command
{
    protected $signature = 'ip:block {ip_address} {--permanent : Permanently block the IP} {--hours=1 : Hours to block (default: 1)}';
    protected $description = 'Block an IP address temporarily or permanently';

    public function handle(): int
    {
        $ip = $this->argument('ip_address');
        $isPermanent = $this->option('permanent');
        $hours = $this->option('hours');

        $ipRecord = IpReputation::firstOrCreate(
            ['ip_address' => $ip],
            ['reputation_score' => 50, 'reputation_status' => 'suspicious']
        );

        if ($isPermanent) {
            $ipRecord->blockPermanently();
            $this->info("✓ IP {$ip} has been permanently blocked");
        } else {
            $ipRecord->blockTemporarily($hours * 60);
            $this->info("✓ IP {$ip} has been blocked for {$hours} hour(s)");
        }

        return self::SUCCESS;
    }
}
