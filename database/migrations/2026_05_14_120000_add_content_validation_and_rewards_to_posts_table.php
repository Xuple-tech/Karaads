<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('posts', function (Blueprint $table): void {
            if (! Schema::hasColumn('posts', 'content_validation_status')) {
                $table->string('content_validation_status', 20)->default('approved')->after('music_duration_seconds');
            }

            if (! Schema::hasColumn('posts', 'content_validation_score')) {
                $table->unsignedSmallInteger('content_validation_score')->nullable()->after('content_validation_status');
            }

            if (! Schema::hasColumn('posts', 'content_validation_summary')) {
                $table->text('content_validation_summary')->nullable()->after('content_validation_score');
            }

            if (! Schema::hasColumn('posts', 'content_validation_flags')) {
                $table->json('content_validation_flags')->nullable()->after('content_validation_summary');
            }

            if (! Schema::hasColumn('posts', 'content_validation_trace')) {
                $table->json('content_validation_trace')->nullable()->after('content_validation_flags');
            }

            if (! Schema::hasColumn('posts', 'content_validated_at')) {
                $table->timestamp('content_validated_at')->nullable()->after('content_validation_trace');
            }

            if (! Schema::hasColumn('posts', 'reward_status')) {
                $table->string('reward_status', 20)->default('ineligible')->after('content_validated_at');
            }

            if (! Schema::hasColumn('posts', 'reward_amount')) {
                $table->decimal('reward_amount', 15, 6)->default(0)->after('reward_status');
            }

            if (! Schema::hasColumn('posts', 'reward_reason')) {
                $table->string('reward_reason')->nullable()->after('reward_amount');
            }

            if (! Schema::hasColumn('posts', 'rewarded_at')) {
                $table->timestamp('rewarded_at')->nullable()->after('reward_reason');
            }
        });
    }

    public function down(): void
    {
        Schema::table('posts', function (Blueprint $table): void {
            $table->dropColumn([
                'content_validation_status',
                'content_validation_score',
                'content_validation_summary',
                'content_validation_flags',
                'content_validation_trace',
                'content_validated_at',
                'reward_status',
                'reward_amount',
                'reward_reason',
                'rewarded_at',
            ]);
        });
    }
};
