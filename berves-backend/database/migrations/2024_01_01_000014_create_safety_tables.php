<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('incident_reports', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('reported_by');
            $table->foreign('reported_by')->references('id')->on('employees');
            $table->foreignId('site_id')->constrained();
            $table->date('incident_date');
            $table->time('incident_time')->nullable();
            $table->enum('type', ['near_miss','first_aid','medical_treatment','lost_time','fatality','property_damage']);
            $table->enum('severity', ['low','medium','high','critical']);
            $table->text('description');
            $table->unsignedBigInteger('injured_employee_id')->nullable();
            $table->foreign('injured_employee_id')->references('id')->on('employees')->nullOnDelete();
            $table->text('injury_description')->nullable();
            $table->text('root_cause')->nullable();
            $table->text('corrective_actions')->nullable();
            $table->enum('status', ['reported','under_investigation','resolved','closed'])->default('reported');
            $table->foreignId('investigated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('closed_at')->nullable();
            $table->timestamps();
        });

        Schema::create('incident_attachments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('incident_id')->constrained('incident_reports')->cascadeOnDelete();
            $table->string('file_path', 500);
            $table->string('file_type', 50);
            $table->foreignId('uploaded_by')->constrained('users');
            $table->timestamp('created_at')->useCurrent();
        });

        Schema::create('safety_inspections', function (Blueprint $table) {
            $table->id();
            $table->foreignId('site_id')->constrained();
            $table->unsignedBigInteger('inspector_id');
            $table->foreign('inspector_id')->references('id')->on('employees');
            $table->date('inspection_date');
            $table->text('findings')->nullable();
            $table->enum('risk_level', ['low','medium','high']);
            $table->boolean('follow_up_required')->default(false);
            $table->date('follow_up_date')->nullable();
            $table->enum('status', ['scheduled','completed','overdue'])->default('scheduled');
            $table->timestamps();
        });
    }
    public function down(): void {
        Schema::dropIfExists('safety_inspections');
        Schema::dropIfExists('incident_attachments');
        Schema::dropIfExists('incident_reports');
    }
};
