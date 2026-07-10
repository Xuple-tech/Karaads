<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->text('google_token')->nullable()->change();
            $table->text('google_refresh_token')->nullable()->change();
        });

        Schema::table('user_wallets', function (Blueprint $table) {
            $table->longText('payout_details')->nullable()->change();
        });

        Schema::table('withdrawal_requests', function (Blueprint $table) {
            $table->longText('payout_details')->nullable()->change();
        });

        Schema::table('ad_payments', function (Blueprint $table) {
            $table->longText('meta')->nullable()->change();
            $table->longText('raw_payload')->nullable()->change();
        });

        Schema::table('ad_provider_adapters', function (Blueprint $table) {
            $table->longText('secrets')->nullable()->change();
        });

        $this->encryptStringColumn('users', 'id', 'google_token');
        $this->encryptStringColumn('users', 'id', 'google_refresh_token');
        $this->encryptJsonColumn('user_wallets', 'id', 'payout_details');
        $this->encryptJsonColumn('withdrawal_requests', 'id', 'payout_details');
        $this->encryptJsonColumn('ad_payments', 'id', 'meta');
        $this->encryptJsonColumn('ad_payments', 'id', 'raw_payload');
        $this->encryptJsonColumn('ad_provider_adapters', 'id', 'secrets');
    }

    public function down(): void
    {
        $this->decryptStringColumn('users', 'id', 'google_token');
        $this->decryptStringColumn('users', 'id', 'google_refresh_token');
        $this->decryptJsonColumn('user_wallets', 'id', 'payout_details');
        $this->decryptJsonColumn('withdrawal_requests', 'id', 'payout_details');
        $this->decryptJsonColumn('ad_payments', 'id', 'meta');
        $this->decryptJsonColumn('ad_payments', 'id', 'raw_payload');
        $this->decryptJsonColumn('ad_provider_adapters', 'id', 'secrets');

        Schema::table('users', function (Blueprint $table) {
            $table->string('google_token')->nullable()->change();
            $table->string('google_refresh_token')->nullable()->change();
        });

        Schema::table('user_wallets', function (Blueprint $table) {
            $table->json('payout_details')->nullable()->change();
        });

        Schema::table('withdrawal_requests', function (Blueprint $table) {
            $table->json('payout_details')->nullable()->change();
        });

        Schema::table('ad_payments', function (Blueprint $table) {
            $table->json('meta')->nullable()->change();
            $table->json('raw_payload')->nullable()->change();
        });

        Schema::table('ad_provider_adapters', function (Blueprint $table) {
            $table->json('secrets')->nullable()->change();
        });
    }

    private function encryptStringColumn(string $table, string $keyColumn, string $column): void
    {
        DB::table($table)
            ->select([$keyColumn, $column])
            ->whereNotNull($column)
            ->orderBy($keyColumn)
            ->each(function (object $row) use ($table, $keyColumn, $column): void {
                $value = $row->{$column};

                if (! is_string($value) || $value === '' || $this->isEncrypted($value)) {
                    return;
                }

                DB::table($table)
                    ->where($keyColumn, $row->{$keyColumn})
                    ->update([$column => Crypt::encryptString($value)]);
            });
    }

    private function encryptJsonColumn(string $table, string $keyColumn, string $column): void
    {
        DB::table($table)
            ->select([$keyColumn, $column])
            ->whereNotNull($column)
            ->orderBy($keyColumn)
            ->each(function (object $row) use ($table, $keyColumn, $column): void {
                $value = $row->{$column};

                if (! is_string($value) || $value === '' || $this->isEncrypted($value)) {
                    return;
                }

                DB::table($table)
                    ->where($keyColumn, $row->{$keyColumn})
                    ->update([$column => Crypt::encryptString($value)]);
            });
    }

    private function decryptStringColumn(string $table, string $keyColumn, string $column): void
    {
        DB::table($table)
            ->select([$keyColumn, $column])
            ->whereNotNull($column)
            ->orderBy($keyColumn)
            ->each(function (object $row) use ($table, $keyColumn, $column): void {
                $value = $row->{$column};

                if (! is_string($value) || $value === '' || ! $this->isEncrypted($value)) {
                    return;
                }

                DB::table($table)
                    ->where($keyColumn, $row->{$keyColumn})
                    ->update([$column => Crypt::decryptString($value)]);
            });
    }

    private function decryptJsonColumn(string $table, string $keyColumn, string $column): void
    {
        $this->decryptStringColumn($table, $keyColumn, $column);
    }

    private function isEncrypted(string $value): bool
    {
        try {
            Crypt::decryptString($value);

            return true;
        } catch (Throwable) {
            return false;
        }
    }
};
