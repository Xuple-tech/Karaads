<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Email;
use App\Models\EmailAccount;
use App\Services\EmailAutomationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class EmailController extends Controller
{
    protected $emailAutomationService;

    public function __construct(EmailAutomationService $emailAutomationService)
    {
        $this->emailAutomationService = $emailAutomationService;
    }

    public function listAccounts()
    {
        try {
            $accounts = EmailAccount::where('user_id', Auth::id())
                ->select('id', 'email_address', 'provider', 'is_active', 'created_at')
                ->get()
                ->map(function ($account) {
                    return [
                        'id' => $account->id,
                        'email' => $account->email_address,
                        'provider' => $account->provider,
                        'is_active' => $account->is_active,
                        'created_at' => $account->created_at,
                    ];
                });

            return response()->json([
                'success' => true,
                'accounts' => $accounts
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching email accounts: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Failed to fetch email accounts'
            ], 500);
        }
    }

    public function addAccount(Request $request)
    {
        $request->validate([
            'email' => 'required|email|unique:email_accounts,email_address',
            'password' => 'required|string',
            'provider' => 'required|in:gmail,outlook,imap',
            'host' => 'nullable|string',
            'port' => 'nullable|integer'
        ]);

        try {
            $credentials = [
                'password' => encrypt($request->password),
                'host' => $request->host,
                'port' => $request->port,
            ];

            $account = EmailAccount::create([
                'user_id' => Auth::id(),
                'email_address' => $request->email,
                'credentials' => $credentials,
                'provider' => $request->provider,
                'is_active' => true
            ]);

            return response()->json([
                'success' => true,
                'account' => [
                    'id' => $account->id,
                    'email' => $account->email_address,
                    'provider' => $account->provider,
                    'is_active' => $account->is_active,
                    'created_at' => $account->created_at,
                ],
                'message' => 'Email account added successfully'
            ], 201);
        } catch (\Exception $e) {
            Log::error('Error adding email account: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Failed to add email account'
            ], 500);
        }
    }

    public function updateAccount(Request $request, $id)
    {
        $request->validate([
            'email' => 'sometimes|email|unique:email_accounts,email_address,' . $id,
            'password' => 'nullable|string',
            'provider' => 'sometimes|in:gmail,outlook,imap',
            'host' => 'nullable|string',
            'port' => 'nullable|integer',
            'is_active' => 'boolean'
        ]);

        try {
            $account = EmailAccount::where('user_id', Auth::id())->findOrFail($id);

            $updateData = [];
            if ($request->has('email')) {
                $updateData['email_address'] = $request->email;
            }
            if ($request->has('provider')) {
                $updateData['provider'] = $request->provider;
            }
            if ($request->has('is_active')) {
                $updateData['is_active'] = $request->is_active;
            }

            $credentials = $account->credentials ?? [];
            if ($request->filled('password')) {
                $credentials['password'] = encrypt($request->password);
            }
            if ($request->has('host')) {
                $credentials['host'] = $request->host;
            }
            if ($request->has('port')) {
                $credentials['port'] = $request->port;
            }
            $updateData['credentials'] = $credentials;

            $account->update($updateData);

            return response()->json([
                'success' => true,
                'account' => [
                    'id' => $account->id,
                    'email' => $account->email_address,
                    'provider' => $account->provider,
                    'is_active' => $account->is_active,
                    'created_at' => $account->created_at,
                ],
                'message' => 'Email account updated successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Error updating email account: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Failed to update email account'
            ], 500);
        }
    }

    public function deleteAccount($id)
    {
        try {
            $account = EmailAccount::where('user_id', Auth::id())->findOrFail($id);
            $account->delete();

            return response()->json([
                'success' => true,
                'message' => 'Email account deleted successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Error deleting email account: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Failed to delete email account'
            ], 500);
        }
    }

    public function listEmails(Request $request)
    {
        $request->validate([
            'account_id' => 'nullable|integer|exists:email_accounts,id',
            'folder' => 'nullable|string',
            'limit' => 'integer|min:1|max:100',
            'offset' => 'integer|min:0'
        ]);

        try {
            $query = Email::whereHas('emailAccount', function ($q) {
                $q->where('user_id', Auth::id());
            });

            if ($request->account_id) {
                $query->where('email_account_id', $request->account_id);
            }

            if ($request->folder) {
                $query->where('folder', $request->folder);
            }

            $emails = $query->orderBy('received_at', 'desc')
                ->limit($request->input('limit', 50))
                ->offset($request->input('offset', 0))
                ->get();

            return response()->json([
                'success' => true,
                'emails' => $emails
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching emails: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Failed to fetch emails'
            ], 500);
        }
    }

    public function showEmail($id)
    {
        try {
            $email = Email::whereHas('emailAccount', function ($q) {
                $q->where('user_id', Auth::id());
            })->findOrFail($id);

            return response()->json([
                'success' => true,
                'email' => $email
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching email: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Email not found'
            ], 404);
        }
    }

    public function sendEmail(Request $request)
    {
        $request->validate([
            'account_id' => 'required|integer|exists:email_accounts,id',
            'to' => 'required|array',
            'to.*' => 'email',
            'subject' => 'required|string|max:255',
            'body' => 'required|string',
            'cc' => 'nullable|array',
            'cc.*' => 'email',
            'bcc' => 'nullable|array',
            'bcc.*' => 'email'
        ]);

        try {
            $account = EmailAccount::where('user_id', Auth::id())
                ->where('id', $request->account_id)
                ->firstOrFail();

            $result = $this->emailAutomationService->sendEmail(
                $account,
                $request->to,
                $request->subject,
                $request->body,
                $request->cc,
                $request->bcc
            );

            if ($result['success']) {
                return response()->json([
                    'success' => true,
                    'message' => 'Email sent successfully'
                ]);
            } else {
                return response()->json([
                    'success' => false,
                    'error' => $result['error']
                ], 500);
            }
        } catch (\Exception $e) {
            Log::error('Error sending email: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Failed to send email'
            ], 500);
        }
    }

    public function markAsRead(Request $request, $id)
    {
        $request->validate([
            'read' => 'required|boolean'
        ]);

        try {
            $email = Email::whereHas('emailAccount', function ($q) {
                $q->where('user_id', Auth::id());
            })->findOrFail($id);
            $email->update(['is_read' => $request->read]);

            return response()->json([
                'success' => true,
                'message' => 'Email status updated'
            ]);
        } catch (\Exception $e) {
            Log::error('Error updating email status: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Failed to update email status'
            ], 500);
        }
    }

    public function syncEmails($accountId)
    {
        try {
            $account = EmailAccount::where('user_id', Auth::id())->findOrFail($accountId);

            $result = $this->emailAutomationService->syncEmails($account);

            if ($result['success']) {
                return response()->json([
                    'success' => true,
                    'message' => 'Emails synced successfully',
                    'synced_count' => $result['synced_count']
                ]);
            } else {
                return response()->json([
                    'success' => false,
                    'error' => $result['error']
                ], 500);
            }
        } catch (\Exception $e) {
            Log::error('Error syncing emails: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Failed to sync emails'
            ], 500);
        }
    }
}
