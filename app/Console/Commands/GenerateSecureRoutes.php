<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

class GenerateSecureRoutes extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'secure:generate-routes {--force : Force regeneration of routes}';

    /**
     * The console command description.
     */
    protected $description = 'Generate new obfuscated route patterns for enhanced security';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $this->info('Generating secure route patterns...');

        if (!$this->option('force') && Cache::has('secure_routes_generated')) {
            $this->warn('Secure routes were recently generated. Use --force to regenerate.');
            return 0;
        }

        $routePatterns = $this->generateRoutePatterns();

        // Cache the new patterns
        Cache::put('secure_route_patterns', $routePatterns, now()->addDay());
        Cache::put('secure_routes_generated', now(), now()->addDay());

        $this->info('Generated ' . count($routePatterns) . ' secure route patterns.');

        if ($this->confirm('Do you want to display the generated patterns?')) {
            $this->displayPatterns($routePatterns);
        }

        $this->info('Secure routes generated successfully!');
        $this->warn('Remember to update your frontend route references.');

        return 0;
    }

    /**
     * Generate new route patterns
     */
    private function generateRoutePatterns(): array
    {
        $patterns = [];

        // Authentication routes
        $patterns['auth'] = [
            'login' => $this->generatePattern(),
            'register' => $this->generatePattern(),
            'logout' => $this->generatePattern(),
            'password_reset' => $this->generatePattern(),
            'email_verify' => $this->generatePattern(),
        ];

        // Chat routes
        $patterns['chat'] = [
            'create' => $this->generatePattern(),
            'list' => $this->generatePattern(),
            'show' => $this->generatePattern(),
            'send' => $this->generatePattern(),
            'regenerate' => $this->generatePattern(),
        ];

        // API routes
        $patterns['api'] = [
            'conversations' => $this->generatePattern(),
            'messages' => $this->generatePattern(),
            'files' => $this->generatePattern(),
            'settings' => $this->generatePattern(),
        ];

        // Admin routes
        $patterns['admin'] = [
            'dashboard' => $this->generatePattern(),
            'users' => $this->generatePattern(),
            'security' => $this->generatePattern(),
            'audit' => $this->generatePattern(),
        ];

        // Project routes
        $patterns['projects'] = [
            'list' => $this->generatePattern(),
            'create' => $this->generatePattern(),
            'show' => $this->generatePattern(),
            'agents' => $this->generatePattern(),
            'workflows' => $this->generatePattern(),
        ];

        return $patterns;
    }

    /**
     * Generate a random pattern
     */
    private function generatePattern(): string
    {
        $chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
        $pattern = '';

        for ($i = 0; $i < 8; $i++) {
            $pattern .= $chars[random_int(0, strlen($chars) - 1)];
        }

        return $pattern;
    }

    /**
     * Display generated patterns
     */
    private function displayPatterns(array $patterns): void
    {
        $this->table(
            ['Category', 'Route Type', 'Pattern'],
            collect($patterns)->flatMap(function ($routes, $category) {
                return collect($routes)->map(function ($pattern, $type) use ($category) {
                    return [$category, $type, $pattern];
                });
            })->toArray()
        );
    }
}
