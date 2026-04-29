<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('kpi_definitions', function (Blueprint $table) {
            $table->id();
            $table->string('name', 255);
            $table->text('description')->nullable();
            $table->string('measurement_unit', 100);
            $table->foreignId('department_id')->nullable()->constrained()->nullOnDelete();
            $table->decimal('weight', 5, 2)->default(10);
            $table->timestamps();
        });

        Schema::create('appraisal_cycles', function (Blueprint $table) {
            $table->id();
            $table->string('name', 200);
            $table->date('start_date');
            $table->date('end_date');
            $table->enum('status', ['upcoming','active','completed'])->default('upcoming');
            $table->timestamps();
        });

        Schema::create('employee_appraisals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained();
            $table->unsignedBigInteger('appraiser_id');
            $table->foreign('appraiser_id')->references('id')->on('employees');
            $table->foreignId('appraisal_cycle_id')->constrained();
            $table->decimal('overall_score', 5, 2)->nullable();
            $table->enum('status', ['draft','submitted','reviewed','finalised'])->default('draft');
            $table->text('employee_comment')->nullable();
            $table->text('appraiser_comment')->nullable();
            $table->timestamps();
        });

        Schema::create('appraisal_kpi_scores', function (Blueprint $table) {
            $table->id();
            $table->foreignId('appraisal_id')->constrained('employee_appraisals')->cascadeOnDelete();
            $table->foreignId('kpi_id')->constrained('kpi_definitions');
            $table->decimal('target_value', 10, 2);
            $table->decimal('actual_value', 10, 2)->nullable();
            $table->decimal('score', 5, 2)->nullable();
            $table->text('comments')->nullable();
        });
    }
    public function down(): void {
        Schema::dropIfExists('appraisal_kpi_scores');
        Schema::dropIfExists('employee_appraisals');
        Schema::dropIfExists('appraisal_cycles');
        Schema::dropIfExists('kpi_definitions');
    }
};
