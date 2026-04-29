<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('training_programs', function (Blueprint $table) {
            $table->id();
            $table->string('name', 255);
            $table->text('description')->nullable();
            $table->string('provider', 200)->nullable();
            $table->unsignedInteger('duration_hours')->nullable();
            $table->boolean('is_mandatory')->default(false);
            $table->unsignedInteger('recurrence_months')->nullable();
            $table->timestamps();
        });

        Schema::create('training_enrollments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained();
            $table->foreignId('training_program_id')->constrained();
            $table->date('scheduled_date')->nullable();
            $table->date('completed_date')->nullable();
            $table->enum('status', ['enrolled','in_progress','completed','failed','expired'])->default('enrolled');
            $table->decimal('score', 5, 2)->nullable();
            $table->date('expiry_date')->nullable();
            $table->string('certificate_path', 500)->nullable();
            $table->timestamps();
            $table->index('expiry_date');
        });

        Schema::create('certification_reminders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('enrollment_id')->constrained('training_enrollments')->cascadeOnDelete();
            $table->enum('reminder_type', ['30_days','14_days','7_days','expired']);
            $table->timestamp('sent_at');
            $table->enum('channel', ['email','sms']);
        });
    }
    public function down(): void {
        Schema::dropIfExists('certification_reminders');
        Schema::dropIfExists('training_enrollments');
        Schema::dropIfExists('training_programs');
    }
};
