<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('live_streams', function (Blueprint $table) {
            if (! Schema::hasColumn('live_streams', 'scheduled_for')) {
                $table->timestamp('scheduled_for')->nullable()->after('last_activity_at');
            }

            if (! Schema::hasColumn('live_streams', 'thumbnail_path')) {
                $table->string('thumbnail_path')->nullable()->after('scheduled_for');
            }

            if (! Schema::hasColumn('live_streams', 'stream_mode')) {
                $table->string('stream_mode', 32)->default('webrtc')->after('thumbnail_path');
            }

            if (! Schema::hasColumn('live_streams', 'health_status')) {
                $table->string('health_status', 32)->default('unknown')->after('stream_mode');
            }

            if (! Schema::hasColumn('live_streams', 'health_meta')) {
                $table->json('health_meta')->nullable()->after('health_status');
            }

            if (! Schema::hasColumn('live_streams', 'settings')) {
                $table->json('settings')->nullable()->after('health_meta');
            }

            if (! Schema::hasColumn('live_streams', 'peak_viewer_count')) {
                $table->unsignedInteger('peak_viewer_count')->default(0)->after('viewer_count');
            }

            if (! Schema::hasColumn('live_streams', 'reaction_count')) {
                $table->unsignedInteger('reaction_count')->default(0)->after('peak_viewer_count');
            }

            if (! Schema::hasColumn('live_streams', 'share_count')) {
                $table->unsignedInteger('share_count')->default(0)->after('reaction_count');
            }

            if (! Schema::hasColumn('live_streams', 'total_watch_seconds')) {
                $table->unsignedBigInteger('total_watch_seconds')->default(0)->after('share_count');
            }

            if (! Schema::hasColumn('live_streams', 'last_health_at')) {
                $table->timestamp('last_health_at')->nullable()->after('total_watch_seconds');
            }
        });

        Schema::table('live_stream_messages', function (Blueprint $table) {
            if (! Schema::hasColumn('live_stream_messages', 'is_pinned')) {
                $table->boolean('is_pinned')->default(false)->after('message');
            }

            if (! Schema::hasColumn('live_stream_messages', 'pinned_at')) {
                $table->timestamp('pinned_at')->nullable()->after('is_pinned');
            }

            if (! Schema::hasColumn('live_stream_messages', 'is_deleted')) {
                $table->boolean('is_deleted')->default(false)->after('pinned_at');
            }
        });
    }

    public function down(): void
    {
        Schema::table('live_stream_messages', function (Blueprint $table) {
            foreach (['is_deleted', 'pinned_at', 'is_pinned'] as $column) {
                if (Schema::hasColumn('live_stream_messages', $column)) {
                    $table->dropColumn($column);
                }
            }
        });

        Schema::table('live_streams', function (Blueprint $table) {
            foreach ([
                'last_health_at',
                'total_watch_seconds',
                'share_count',
                'reaction_count',
                'peak_viewer_count',
                'settings',
                'health_meta',
                'health_status',
                'stream_mode',
                'thumbnail_path',
                'scheduled_for',
            ] as $column) {
                if (Schema::hasColumn('live_streams', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};
