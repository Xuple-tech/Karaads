<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Illuminate\Http\Request;

class PageController extends Controller
{
    /**
     * Display Privacy Policy page
     */
    public function privacy(Request $request)
    {
        return Inertia::render('Legal/Privacy', [
            'title' => 'Privacy Policy - KwatiAI',
            'description' => 'Learn how KwatiAI collects, uses, and protects your personal information. Your privacy is our priority.',
            'lastUpdated' => '2024',
        ]);
    }

    /**
     * Display Terms of Service page
     */
    public function terms(Request $request)
    {
        return Inertia::render('Legal/Terms', [
            'title' => 'Terms of Service - KwatiAI',
            'description' => 'Please read these terms carefully before using KwatiAI services.',
            'effectiveDate' => '2024',
        ]);
    }
}
