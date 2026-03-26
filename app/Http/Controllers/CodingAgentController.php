<?php

namespace App\Http\Controllers;

use App\Services\GeminiService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;

class CodingAgentController extends Controller
{
    protected $geminiService;

    public function __construct(GeminiService $geminiService)
    {
        $this->geminiService = $geminiService;
    }

    public function index()
    {
        return Inertia::render('CodingAgent');
    }

    public function generate(Request $request)
    {
        $request->validate([
            'prompt' => 'required|string'
        ]);

        try {
            $result = $this->geminiService->handleProjectCreation($request->prompt);
            
            // Store generated files
            foreach ($result['files'] as &$file) {
                if (isset($file['path'])) {
                    $path = 'generated/' . uniqid() . '/' . $file['path'];
                    Storage::put($path, $file['content']);
                    $file['stored_path'] = $path;
                }
            }

            return Inertia::render('CodingAgent', [
                'result' => $result
            ]);
        } catch (\Exception $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }
} 