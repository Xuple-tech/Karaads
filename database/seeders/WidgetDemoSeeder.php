<?php

namespace Database\Seeders;

use App\Models\Subscription;
use App\Models\SubscriptionPlan;
use App\Models\User;
use App\Models\WidgetConfig;
use App\Models\WidgetKnowledgeItem;
use App\Models\WidgetTool;
use App\Services\Widget\WidgetKnowledgeService;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class WidgetDemoSeeder extends Seeder
{
    private ?WidgetKnowledgeService $knowledge = null;

    public function run(): void
    {
        $user = User::query()->firstOrCreate(
            ['email' => 'test@example.com'],
            [
                'name' => 'Test User',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ]
        );

        $this->ensureWidgetPlan($user);
        $this->knowledge = app(WidgetKnowledgeService::class);

        $borrowLiteWidget = WidgetConfig::query()->firstOrCreate(
            [
                'user_id' => $user->id,
                'name' => 'BorrowLite Sales & Support',
            ],
            [
                'token' => WidgetConfig::generateToken(),
                'bot_name' => 'BorrowLite Assistant',
                'greeting' => 'Hi, I am the BorrowLite Assistant. I can help with BorrowLite product questions and point you to the right next step.',
                'theme_color' => '#0f766e',
                'system_prompt' => $this->borrowLitePrompt(),
                'is_active' => true,
                'allow_file_uploads' => false,
                'allowed_domains' => ['borrowlite.com', 'www.borrowlite.com'],
            ]
        );

        $this->seedBorrowLiteKnowledge($borrowLiteWidget, $user);
        $this->seedBorrowLiteTools($borrowLiteWidget);

        $shoplaceWidget = WidgetConfig::query()->firstOrCreate(
            [
                'user_id' => $user->id,
                'name' => 'Shoplace Sales Agent',
            ],
            [
                'token' => WidgetConfig::generateToken(),
                'bot_name' => 'Shoplace Assistant',
                'greeting' => 'Hola, soy Shoplace Assistant. Puedo ayudarte con productos, ofertas, envios, pagos y politicas de la tienda.',
                'theme_color' => '#c2410c',
                'system_prompt' => $this->shoplacePrompt(),
                'is_active' => true,
                'allow_file_uploads' => false,
                'allowed_domains' => ['shoplace.store', 'www.shoplace.store'],
            ]
        );

        $this->seedShoplaceKnowledge($shoplaceWidget, $user);
        $this->seedShoplaceTools($shoplaceWidget);
    }

    private function ensureWidgetPlan(User $user): void
    {
        $proPlan = SubscriptionPlan::query()->where('slug', 'pro')->first();

        if (! $proPlan) {
            return;
        }

        Subscription::query()->updateOrCreate(
            [
                'user_id' => $user->id,
                'plan_id' => $proPlan->id,
                'status' => 'active',
            ],
            [
                'started_at' => now(),
                'renews_at' => now()->addMonth(),
                'expires_at' => null,
                'billing_period' => 'monthly',
                'amount_paid' => 0,
                'cancelled_at' => null,
                'is_trial' => false,
                'trial_ends_at' => null,
            ]
        );
    }

    private function seedBorrowLiteKnowledge(WidgetConfig $widget, User $user): void
    {
        WidgetKnowledgeItem::query()->updateOrCreate(
            [
                'widget_id' => $widget->id,
                'user_id' => $user->id,
                'name' => 'BorrowLite Basics',
            ],
            [
                'type' => 'text',
                'content' => implode("\n", [
                    'BorrowLite is a buy now pay later platform.',
                    'Support email: support@borrowlite.com',
                    'Support phone: +2348012345678',
                    'Contact address: 123 Main Street, Lagos, Nigeria',
                    'Public product areas: wallet funding, transfers, withdrawals, airtime, data, cable, electricity, referrals, card management, borrowing, repayment.',
                    'Only recommend BorrowLite public pages that were successfully fetched into ready URL knowledge.',
                ]),
                'source_url' => null,
                'status' => 'ready',
            ]
        );

        $this->syncUrlKnowledge($widget, $user, 'https://borrowlite.com/', 'BorrowLite Home');
        $this->syncUrlKnowledge($widget, $user, 'https://borrowlite.com/about', 'BorrowLite About');
        $this->syncUrlKnowledge($widget, $user, 'https://borrowlite.com/contact', 'BorrowLite Contact');
        $this->syncUrlKnowledge($widget, $user, 'https://borrowlite.com/privacy-policy', 'BorrowLite Privacy Policy');
    }

    private function seedBorrowLiteTools(WidgetConfig $widget): void
    {
        WidgetTool::query()->updateOrCreate(
            [
                'widget_id' => $widget->id,
                'name' => 'Demo Rates Lookup',
            ],
            [
                'tool_type' => 'http',
                'description' => 'Read-only public demo lookup for testing widget HTTP tool calls. This is not official BorrowLite account data.',
                'endpoint_url' => 'https://api.frankfurter.dev/v2/rates',
                'method' => 'GET',
                'transport' => 'http',
                'headers' => [],
                'parameters' => [
                    'type' => 'object',
                    'properties' => [
                        'quotes' => [
                            'type' => 'string',
                            'description' => 'Comma-separated quote currencies, for example USD,NGN.',
                        ],
                    ],
                    'required' => ['quotes'],
                ],
                'configuration' => [
                    'demo' => true,
                    'authoritative' => false,
                ],
                'is_active' => true,
            ]
        );
    }

    private function seedShoplaceKnowledge(WidgetConfig $widget, User $user): void
    {
        WidgetKnowledgeItem::query()->updateOrCreate(
            [
                'widget_id' => $widget->id,
                'user_id' => $user->id,
                'name' => 'Shoplace Basics',
            ],
            [
                'type' => 'text',
                'content' => implode("\n", [
                    'Shoplace is an online store branded as ShoPlace.',
                    'Public location: Bogota, Colombia.',
                    'Public contact email: contactanos@shoplace.store',
                    'Public support topics: product discovery, offers, catalog questions, shipping, refunds, guarantees, payment methods, and contact handoff.',
                    'Public delivery window: 5 to 10 business days depending on the city.',
                    'Public guarantee: 30-day guarantee for damaged or defective products.',
                    'Public payment method: cash on delivery.',
                    'Only recommend Shoplace pages that were successfully fetched into ready URL knowledge.',
                ]),
                'source_url' => null,
                'status' => 'ready',
            ]
        );

        $this->syncUrlKnowledge($widget, $user, 'https://shoplace.store/', 'Shoplace Home');
        $this->syncUrlKnowledge($widget, $user, 'https://shoplace.store/collections/all', 'Shoplace Catalog');
        $this->syncUrlKnowledge($widget, $user, 'https://shoplace.store/pages/contacto', 'Shoplace Contact');
        $this->syncUrlKnowledge($widget, $user, 'https://shoplace.store/policies/refund-policy', 'Shoplace Refund Policy');
        $this->syncUrlKnowledge($widget, $user, 'https://shoplace.store/policies/shipping-policy', 'Shoplace Shipping Policy');
        $this->syncUrlKnowledge($widget, $user, 'https://shoplace.store/policies/privacy-policy', 'Shoplace Privacy Policy');
    }

    private function seedShoplaceTools(WidgetConfig $widget): void
    {
        WidgetTool::query()->updateOrCreate(
            [
                'widget_id' => $widget->id,
                'name' => 'Demo Product Search',
            ],
            [
                'tool_type' => 'http',
                'description' => 'Read-only public demo product search for testing sales-agent tool calls. This is demo catalog data, not Shoplace live inventory.',
                'endpoint_url' => 'https://dummyjson.com/products/search',
                'method' => 'GET',
                'transport' => 'http',
                'headers' => [],
                'parameters' => [
                    'type' => 'object',
                    'properties' => [
                        'q' => [
                            'type' => 'string',
                            'description' => 'Short product search query.',
                        ],
                    ],
                    'required' => ['q'],
                ],
                'configuration' => [
                    'demo' => true,
                    'authoritative' => false,
                ],
                'is_active' => true,
            ]
        );

        WidgetTool::query()->updateOrCreate(
            [
                'widget_id' => $widget->id,
                'name' => 'Demo Price Compare',
            ],
            [
                'tool_type' => 'http',
                'description' => 'Read-only public demo product list for comparing sample sale prices. This is demo data, not Shoplace live inventory.',
                'endpoint_url' => 'https://dummyjson.com/products',
                'method' => 'GET',
                'transport' => 'http',
                'headers' => [],
                'parameters' => [
                    'type' => 'object',
                    'properties' => [
                        'limit' => [
                            'type' => 'number',
                            'description' => 'Number of sample products to return.',
                        ],
                        'skip' => [
                            'type' => 'number',
                            'description' => 'Offset into the sample product list.',
                        ],
                    ],
                ],
                'configuration' => [
                    'demo' => true,
                    'authoritative' => false,
                ],
                'is_active' => true,
            ]
        );
    }

    private function borrowLitePrompt(): string
    {
        return <<<'PROMPT'
You are BorrowLite Assistant, a hybrid sales and support widget for BorrowLite.

Use BorrowLite knowledge first. Help visitors understand BorrowLite's public products, onboarding steps, and common support questions.

Important guardrails:
- Do not claim to access customer accounts, balances, approvals, repayments, transactions, or internal systems.
- Do not invent loan decisions, repayment changes, account status updates, or policy exceptions.
- For account-specific, repayment exception, or policy-confirmation requests, hand off to support@borrowlite.com, +2348012345678, or https://borrowlite.com/contact.
- If you use the demo rates lookup tool, explain clearly that it is only a public test tool and not official BorrowLite account or lending data.

Keep answers practical, short, and grounded in public BorrowLite information.
PROMPT;
    }

    private function shoplacePrompt(): string
    {
        return <<<'PROMPT'
You are Shoplace Assistant, a sales-first website agent for Shoplace (ShoPlace).

Use Shoplace knowledge first. Help visitors discover products, understand offers, shipping, guarantees, payment methods, and common pre-sale questions.

Important guardrails:
- Do not claim to access live order records, internal stock systems, payment gateways, or private customer accounts.
- Do not invent product availability, delivery exceptions, refunds, or policy terms that are not supported by verified Shoplace knowledge.
- Only recommend Shoplace URLs that were successfully fetched into ready knowledge. If a page is unavailable, say you could not verify it and use another verified page or the public contact email instead.
- If you use demo tools, clearly say they are public test tools and not Shoplace live catalog or order data.
- For order-specific or exception handling, hand off to contactanos@shoplace.store.

Keep answers concise, sales-oriented, and practical. Prefer verified Shoplace context before pointing visitors to an external page.
PROMPT;
    }

    private function syncUrlKnowledge(WidgetConfig $widget, User $user, string $url, string $name): void
    {
        if (app()->runningUnitTests()) {
            WidgetKnowledgeItem::query()->updateOrCreate(
                [
                    'widget_id' => $widget->id,
                    'user_id' => $user->id,
                    'name' => $name,
                ],
                [
                    'type' => 'url',
                    'content' => '',
                    'source_url' => $url,
                    'status' => 'failed',
                ]
            );

            return;
        }

        try {
            $this->knowledge?->syncUrl($widget, $user, $url, $name);
        } catch (\Throwable $e) {
            WidgetKnowledgeItem::query()->updateOrCreate(
                [
                    'widget_id' => $widget->id,
                    'user_id' => $user->id,
                    'name' => $name,
                ],
                [
                    'type' => 'url',
                    'content' => '',
                    'source_url' => $url,
                    'status' => 'failed',
                ]
            );
        }
    }
}
