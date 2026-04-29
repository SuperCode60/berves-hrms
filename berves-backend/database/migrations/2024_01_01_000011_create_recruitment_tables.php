<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('job_postings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('job_title_id')->constrained();
            $table->foreignId('department_id')->constrained();
            $table->foreignId('site_id')->nullable()->constrained()->nullOnDelete();
            $table->text('description');
            $table->text('requirements')->nullable();
            $table->enum('employment_type', ['permanent','contract','site_based']);
            $table->decimal('salary_min', 15, 2)->nullable();
            $table->decimal('salary_max', 15, 2)->nullable();
            $table->date('deadline');
            $table->enum('status', ['draft','open','closed','filled'])->default('draft');
            $table->foreignId('posted_by')->constrained('users');
            $table->timestamps();
        });

        Schema::create('applicants', function (Blueprint $table) {
            $table->id();
            $table->foreignId('job_posting_id')->constrained()->cascadeOnDelete();
            $table->string('full_name', 200);
            $table->string('email', 191);
            $table->string('phone', 30)->nullable();
            $table->string('cv_path', 500)->nullable();
            $table->text('cover_letter')->nullable();
            $table->enum('status', ['applied','shortlisted','interviewed','offered','rejected','hired'])->default('applied');
            $table->timestamp('applied_at')->useCurrent();
        });

        Schema::create('interview_schedules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('applicant_id')->constrained()->cascadeOnDelete();
            $table->dateTime('scheduled_at');
            $table->string('location', 300)->nullable();
            $table->enum('interview_type', ['phone','in_person','panel','technical']);
            $table->json('interviewers')->nullable();
            $table->enum('status', ['scheduled','completed','cancelled','no_show'])->default('scheduled');
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::create('interview_evaluations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('interview_schedule_id')->constrained()->cascadeOnDelete();
            $table->foreignId('interviewer_id')->constrained('users');
            $table->unsignedTinyInteger('score');
            $table->enum('recommendation', ['hire','reject','hold']);
            $table->text('comments')->nullable();
            $table->timestamps();
        });

        Schema::create('onboarding_checklists', function (Blueprint $table) {
            $table->id();
            $table->string('name', 255);
            $table->string('category', 100);
            $table->boolean('is_mandatory')->default(true);
            $table->unsignedInteger('due_days_after_hire')->default(3);
        });

        Schema::create('employee_onboardings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained()->cascadeOnDelete();
            $table->foreignId('checklist_id')->constrained('onboarding_checklists');
            $table->enum('status', ['pending','completed','skipped'])->default('pending');
            $table->timestamp('completed_at')->nullable();
            $table->boolean('safety_induction_done')->default(false);
            $table->text('notes')->nullable();
        });
    }
    public function down(): void {
        Schema::dropIfExists('employee_onboardings');
        Schema::dropIfExists('onboarding_checklists');
        Schema::dropIfExists('interview_evaluations');
        Schema::dropIfExists('interview_schedules');
        Schema::dropIfExists('applicants');
        Schema::dropIfExists('job_postings');
    }
};
