<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        if (DB::getDriverName() !== 'sqlite') {
            DB::statement('SET FOREIGN_KEY_CHECKS=0');
        }

        // Currency exchange rates table
        Schema::create('currency_rates', function (Blueprint $table) {
            $table->id();
            $table->string('base_currency', 3);
            $table->string('target_currency', 3);
            $table->decimal('rate', 18, 8);
            $table->decimal('original_rate', 18, 8)->nullable(); // For tracking rate changes
            $table->timestamp('rate_timestamp');
            $table->timestamp('expires_at')->nullable(); // For cache expiration
            $table->timestamps();

            $table->unique(['base_currency', 'target_currency']);
            $table->index('expires_at');
        });

        // Request logs table - tracks all HTTP requests
        Schema::create('request_logs', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id')->nullable(); // Foreign key to users.id
            $table->ipAddress('ip_address');
            $table->string('method', 10); // GET, POST, PUT, DELETE, etc.
            $table->string('path', 255);
            $table->string('uri', 255)->nullable();
            $table->text('user_agent')->nullable();
            $table->string('referer')->nullable();
            $table->unsignedSmallInteger('response_status')->nullable();
            $table->unsignedInteger('response_time_ms')->nullable();
            $table->text('request_data')->nullable(); // Sanitized request payload

            // Currency info
            $table->string('detected_currency')->nullable();
            $table->string('user_country')->nullable();

            // Bot detection
            $table->boolean('is_suspected_bot')->default(false);
            $table->string('bot_reason')->nullable();
            $table->float('bot_score')->default(0); // 0-100 score for bot likelihood

            $table->timestamps();
            $table->softDeletes();

            $table->index(['ip_address', 'created_at']);
            $table->index(['user_id', 'created_at']);
            $table->index('is_suspected_bot');
            $table->index('bot_score');
        });

        // IP reputation scoring table
        Schema::create('ip_reputation', function (Blueprint $table) {
            $table->id();
            $table->ipAddress('ip_address')->unique();
            $table->float('reputation_score')->default(0); // 0-100: 0=clean, 100=malicious
            $table->enum('reputation_status', ['clean', 'suspicious', 'high-risk'])->default('clean');
            $table->unsignedInteger('failed_attempts')->default(0);
            $table->timestamp('last_failed_attempt')->nullable();
            $table->timestamp('blocked_until')->nullable();
            $table->boolean('is_blocked')->default(false);
            $table->boolean('is_permanent_block')->default(false);
            $table->timestamps();

            $table->index('reputation_status');
            $table->index('blocked_until');
        });

        // Prompt logs table - tracks user prompts for analytics
        Schema::create('prompt_logs', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id')->nullable(); // Foreign key to users.id
            $table->ipAddress('ip_address');
            $table->longText('prompt');
            $table->string('prompt_length'); // Total length category: short, medium, long, huge
            $table->string('model_used')->nullable();
            $table->decimal('estimated_cost', 10, 6)->nullable();
            $table->string('detected_currency')->nullable();

            // Rate limiting and pattern detection
            $table->timestamp('timestamp')->index();
            $table->unsignedInteger('tokens_used')->nullable();
            $table->boolean('is_likely_abuse')->default(false);
            $table->string('abuse_reason')->nullable();

            // Duplicate/spam detection
            $table->string('prompt_hash')->nullable()->index(); // SHA256 hash for duplicate detection
            $table->unsignedInteger('similar_prompts_in_hour')->default(0);

            $table->timestamps();
            $table->softDeletes();

            $table->index(['ip_address', 'timestamp']);
        });

        // User currency preferences table
        Schema::create('user_currency_preferences', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id')->unique(); // Foreign key to users.id
            $table->string('preferred_currency', 3)->default('USD');
            $table->string('country_code', 2)->nullable();
            $table->boolean('auto_detect')->default(true); // Auto-detect based on IP
            $table->timestamps();
        });

        // Suspicious activity alerts table
        Schema::create('suspicious_activity_alerts', function (Blueprint $table) {
            $table->id();
            $table->ipAddress('ip_address');
            $table->unsignedBigInteger('user_id')->nullable(); // Foreign key to users.id
            $table->string('alert_type'); // bot_detected, rate_limit_exceeded, duplicate_prompts, etc.
            $table->enum('severity', ['low', 'medium', 'high', 'critical'])->default('medium');
            $table->text('description');
            $table->boolean('auto_action_taken')->default(false);
            $table->string('action_taken')->nullable(); // rate_limited, temporarily_blocked, captcha_required, etc.
            $table->timestamp('resolved_at')->nullable();
            $table->timestamps();

            $table->index(['ip_address', 'created_at']);
            $table->index(['alert_type', 'severity']);
        });

        if (DB::getDriverName() !== 'sqlite') {
            DB::statement('SET FOREIGN_KEY_CHECKS=1');
        }
    }

    public function down(): void
    {
        if (DB::getDriverName() !== 'sqlite') {
            DB::statement('SET FOREIGN_KEY_CHECKS=0');
        }

        Schema::dropIfExists('suspicious_activity_alerts');
        Schema::dropIfExists('user_currency_preferences');
        Schema::dropIfExists('prompt_logs');
        Schema::dropIfExists('ip_reputation');
        Schema::dropIfExists('request_logs');
        Schema::dropIfExists('currency_rates');

        if (DB::getDriverName() !== 'sqlite') {
            DB::statement('SET FOREIGN_KEY_CHECKS=1');
        }
    }
};
