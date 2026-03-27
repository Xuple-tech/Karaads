<?php

namespace App\Http\Controllers\Console;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ModelsController extends ConsoleBaseController
{
    public function index(Request $request): Response
    {
        return Inertia::render('User/DeveloperApi/Index', $this->sharedProps($request, 'models'));
    }
}
