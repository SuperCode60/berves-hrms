<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('off_day_requests', function (Blueprint $table) {
            $table->date('start_date')->nullable()->after('employee_id');
            $table->date('end_date')->nullable()->after('start_date');
            $table->unsignedSmallInteger('days_count')->default(1)->after('end_date');
        });

        // Migrate existing single-date rows: set start_date = end_date = requested_date
        DB::statement('UPDATE off_day_requests SET start_date = requested_date, end_date = requested_date WHERE start_date IS NULL');

        Schema::table('off_day_requests', function (Blueprint $table) {
            $table->date('start_date')->nullable(false)->change();
            $table->date('end_date')->nullable(false)->change();
            $table->dropColumn('requested_date');
        });
    }

    public function down(): void
    {
        Schema::table('off_day_requests', function (Blueprint $table) {
            $table->date('requested_date')->nullable()->after('employee_id');
        });

        DB::statement('UPDATE off_day_requests SET requested_date = start_date');

        Schema::table('off_day_requests', function (Blueprint $table) {
            $table->date('requested_date')->nullable(false)->change();
            $table->dropColumn(['start_date', 'end_date', 'days_count']);
        });
    }
};
