<?php

namespace App\Http\Middleware;

use App\Support\ConsoleUrl;
use App\Support\DeveloperPortalUrl;
use Illuminate\Foundation\Inspiring;
use Illuminate\Http\Request;
use Inertia\Middleware;
use Tighten\Ziggy\Ziggy;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        [$message, $author] = str(Inspiring::quotes()->random())->explode('-');

        $auth = [
            'user' => $request->user(),
        ];

        // Add current plan if user is authenticated
        if ($request->user()) {
            try {
                $auth['user']['current_plan'] = $request->user()->getCurrentPlan();
            } catch (\Throwable) {
                $auth['user']['current_plan'] = null;
            }
        }

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'auth' => $auth,
            'console' => [
                'base_url' => ConsoleUrl::consoleUrl($request),
                'docs_base_url' => ConsoleUrl::docsUrl($request),
                'uses_path_prefix' => ConsoleUrl::usesPathPrefix(),
            ],
            'developerPortal' => [
                'base_url' => DeveloperPortalUrl::baseUrl($request),
                'login_url' => DeveloperPortalUrl::loginUrl($request),
                'register_url' => DeveloperPortalUrl::registerUrl($request),
                'logout_url' => DeveloperPortalUrl::logoutUrl($request),
                'uses_subdomain' => DeveloperPortalUrl::usesSubdomain($request),
            ],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
                'developer_plaintext_key' => fn () => $request->session()->pull('developer_plaintext_key'),
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
        ];
    }
}
