<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('shift_templates', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100);
            $table->time('start_time');
            $table->time('end_time');
            $table->unsignedInteger('break_minutes')->default(0);
            $table->enum('type', ['day','night','custom']);
            $table->timestamps();
        });

        Schema::create('shift_schedules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained();
            $table->foreignId('shift_template_id')->constrained();
            $table->foreignId('site_id')->constrained();
            $table->date('schedule_date');
            $table->enum('status', ['scheduled','completed','absent','swapped'])->default('scheduled');
            $table->foreignId('created_by')->constrained('users');
            $table->timestamps();
            $table->index(['employee_id','schedule_date']);
        });

        Schema::create('attendance_records', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained();
            $table->foreignId('site_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('shift_schedule_id')->nullable()->constrained()->nullOnDelete();
            $table->timestamp('check_in_at');
            $table->timestamp('check_out_at')->nullable();
            $table->decimal('check_in_lat', 10, 7)->nullable();
            $table->decimal('check_in_lng', 10, 7)->nullable();
            $table->decimal('check_out_lat', 10, 7)->nullable();
            $table->decimal('check_out_lng', 10, 7)->nullable();
            $table->boolean('is_within_geofence')->default(false);
            $table->enum('method', ['mobile','web','biometric','manual']);
            $table->decimal('total_hours', 5, 2)->nullable();
            $table->unsignedInteger('late_minutes')->default(0);
            $table->enum('status', ['present','late','absent','half_day'])->default('present');
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->index(['employee_id','check_in_at']);
        });
    }
    public function down(): void {
        Schema::dropIfExists('attendance_records');
        Schema::dropIfExists('shift_schedules');
        Schema::dropIfExists('shift_templates');
    }
};
