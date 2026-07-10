<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Config;
use Inertia\Inertia;
use Inertia\Response;

class QrCodeController extends Controller
{
    public function index(): Response
    {
        $defaultUrl = (string) Config::get('app.url', url('/'));

        if (! str_starts_with($defaultUrl, 'http://') && ! str_starts_with($defaultUrl, 'https://')) {
            $defaultUrl = url('/');
        }

        return Inertia::render('Admin/QrCode/Index', [
            'appName' => Config::get('app.name', 'Karaads'),
            'defaultUrl' => $defaultUrl,
            'suggestedUrls' => [
                [
                    'label' => 'Website',
                    'url' => $defaultUrl,
                ],
                [
                    'label' => 'Admin login',
                    'url' => url('/admin/login'),
                ],
            ],
        ]);
    }
}
