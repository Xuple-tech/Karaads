<?php

namespace App\Http\Controllers\Meta;

use App\Http\Controllers\Controller;
use App\Models\MetaAccount;
use App\Models\MetaReplyTemplate;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class MetaReplyTemplateController extends Controller
{
    public function index(MetaAccount $account)
    {
        $this->authorize('view', $account);

        $templates = MetaReplyTemplate::where('meta_account_id', $account->id)
            ->orderBy('usage_count', 'desc')
            ->orderBy('name')
            ->get()
            ->map(fn($t) => $this->format($t));

        return response()->json(['success' => true, 'templates' => $templates]);
    }

    public function store(MetaAccount $account, Request $request)
    {
        $this->authorize('update', $account);

        $validated = $request->validate([
            'name'      => 'required|string|max:80',
            'content'   => 'required|string|max:1000',
            'category'  => 'nullable|string|max:40',
            'is_active' => 'boolean',
        ]);

        $template = MetaReplyTemplate::create(array_merge($validated, [
            'meta_account_id' => $account->id,
            'user_id'         => Auth::id(),
        ]));

        return response()->json(['success' => true, 'template' => $this->format($template)], 201);
    }

    public function update(MetaAccount $account, MetaReplyTemplate $template, Request $request)
    {
        $this->authorize('update', $account);
        abort_if($template->meta_account_id !== $account->id, 403);

        $validated = $request->validate([
            'name'      => 'sometimes|string|max:80',
            'content'   => 'sometimes|string|max:1000',
            'category'  => 'nullable|string|max:40',
            'is_active' => 'boolean',
        ]);

        $template->update($validated);

        return response()->json(['success' => true, 'template' => $this->format($template)]);
    }

    public function destroy(MetaAccount $account, MetaReplyTemplate $template)
    {
        $this->authorize('update', $account);
        abort_if($template->meta_account_id !== $account->id, 403);

        $template->delete();

        return response()->json(['success' => true]);
    }

    public function incrementUsage(MetaReplyTemplate $template)
    {
        $template->increment('usage_count');

        return response()->json(['success' => true]);
    }

    private function format(MetaReplyTemplate $template): array
    {
        return [
            'id'          => $template->id,
            'name'        => $template->name,
            'content'     => $template->content,
            'category'    => $template->category,
            'usage_count' => $template->usage_count,
            'is_active'   => $template->is_active,
            'created_at'  => $template->created_at,
        ];
    }
}
