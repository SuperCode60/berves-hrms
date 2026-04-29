<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('overtime_policies', function (Blueprint $table) {
            $table->boolean('is_active')->default(true)->after('multiplier');
            $table->decimal('min_hours', 4, 1)->default(1.0)->after('is_active');
            $table->decimal('max_hours', 4, 1)->default(12.0)->after('min_hours');
            $table->date('effective_from')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('overtime_policies', function (Blueprint $table) {
            $table->dropColumn(['is_active', 'min_hours', 'max_hours']);
        });
    }
};
