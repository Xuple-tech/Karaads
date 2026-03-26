<?php
// database/migrations/2025_12_03_3452015_seed_agent_templates.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $templates = [
            [
                'id' => '019a9ded-f5b0-732f-820e-d52b791395f1',
                'name' => 'Customer Support Agent',
                'description' => 'AI agent specialized in customer support and FAQ answering',
                'category' => 'support',
                'industry' => 'general',
                'default_config' => json_encode([
                    'temperature' => 0.7,
                    'response_style' => 'professional',
                    'fallback_message' => 'I apologize, I don\'t have the answer to that question. Let me connect you with a human agent.',
                ]),
                'welcome_message' => 'Hello! I\'m your AI support assistant. How can I help you today?',
                'suggested_questions' => json_encode([
                    'What are your business hours?',
                    'How can I track my order?',
                    'What is your return policy?',
                    'How do I contact customer service?',
                ]),
                'tools_config' => json_encode([
                    'support_ticket' => true,
                    'knowledge_base_search' => true,
                ]),
                'knowledge_base_structure' => json_encode([
                    'sections' => ['FAQ', 'Policies', 'Procedures'],
                ]),
                'widget_settings' => json_encode([
                    'position' => 'bottom-right',
                    'icon' => 'support',
                    'color' => '#3B82F6',
                ]),
                'is_active' => true,
                'is_premium' => false,
                'price' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => '019a9ded-f5b0-732f-820e-d52b791395f2',
                'name' => 'E-commerce Assistant',
                'description' => 'AI agent for e-commerce websites to help with products, orders, and recommendations',
                'category' => 'ecommerce',
                'industry' => 'retail',
                'default_config' => json_encode([
                    'temperature' => 0.8,
                    'response_style' => 'friendly',
                    'fallback_message' => 'I\'m not sure about that product. Let me check with our team and get back to you!',
                ]),
                'welcome_message' => 'Welcome to our store! I can help you find products, check order status, and answer questions about our services.',
                'suggested_questions' => json_encode([
                    'What are your best-selling products?',
                    'Do you offer international shipping?',
                    'How long does delivery take?',
                    'Can I return a product?',
                ]),
                'tools_config' => json_encode([
                    'product_search' => true,
                    'order_tracking' => true,
                    'shipping_calculator' => true,
                ]),
                'knowledge_base_structure' => json_encode([
                    'sections' => ['Products', 'Shipping', 'Returns', 'Payment'],
                ]),
                'widget_settings' => json_encode([
                    'position' => 'bottom-right',
                    'icon' => 'shopping-cart',
                    'color' => '#10B981',
                ]),
                'is_active' => true,
                'is_premium' => false,
                'price' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => '019a9ded-f5b0-732f-820e-d52b791395f3',
                'name' => 'Booking Assistant',
                'description' => 'AI agent for appointment booking and scheduling',
                'category' => 'booking',
                'industry' => 'services',
                'default_config' => json_encode([
                    'temperature' => 0.6,
                    'response_style' => 'efficient',
                    'fallback_message' => 'I need to check availability for that time. Please wait a moment.',
                ]),
                'welcome_message' => 'Hello! I can help you book appointments, check availability, and answer questions about our services.',
                'suggested_questions' => json_encode([
                    'What are your available time slots?',
                    'How do I cancel or reschedule?',
                    'What services do you offer?',
                    'Do you offer group bookings?',
                ]),
                'tools_config' => json_encode([
                    'booking_calendar' => true,
                    'availability_checker' => true,
                    'appointment_manager' => true,
                ]),
                'knowledge_base_structure' => json_encode([
                    'sections' => ['Services', 'Pricing', 'Availability', 'Policies'],
                ]),
                'widget_settings' => json_encode([
                    'position' => 'bottom-right',
                    'icon' => 'calendar',
                    'color' => '#8B5CF6',
                ]),
                'is_active' => true,
                'is_premium' => true,
                'price' => 29.99,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        foreach ($templates as $template) {
            DB::table('agent_templates')->insert($template);
        }
    }

    public function down(): void
    {
        DB::table('agent_templates')->whereIn('id', [
            '019a9ded-f5b0-732f-820e-d52b791395f1',
            '019a9ded-f5b0-732f-820e-d52b791395f2',
            '019a9ded-f5b0-732f-820e-d52b791395f3',
        ])->delete();
    }
};
