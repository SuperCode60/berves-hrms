<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('employees', function (Blueprint $table) {
            $table->id();
            $table->string('employee_number', 50)->unique();
            $table->string('first_name', 100);
            $table->string('last_name', 100);
            $table->string('other_names', 100)->nullable();
            $table->date('date_of_birth')->nullable();
            $table->enum('gender', ['male','female','other'])->nullable();
            $table->string('national_id', 50)->nullable();
            $table->string('tin_number', 50)->nullable();
            $table->string('ssnit_number', 50)->nullable();
            $table->string('phone', 30);
            $table->string('email', 191)->nullable();
            $table->text('address')->nullable();
            $table->string('emergency_contact_name', 200)->nullable();
            $table->string('emergency_contact_phone', 30)->nullable();
            $table->foreignId('department_id')->constrained();
            $table->foreignId('job_title_id')->constrained();
            $table->foreignId('site_id')->constrained();
            $table->unsignedBigInteger('manager_id')->nullable();
            $table->foreign('manager_id')->references('id')->on('employees')->nullOnDelete();
            $table->enum('employment_type', ['permanent','contract','site_based']);
            $table->enum('employment_status', ['active','on_leave','terminated','suspended'])->default('active');
            $table->date('hire_date');
            $table->date('contract_end_date')->nullable();
            $table->date('probation_end_date')->nullable();
            $table->decimal('base_salary', 15, 2);
            $table->string('bank_name', 200)->nullable();
            $table->string('bank_account', 100)->nullable();
            $table->string('bank_branch', 200)->nullable();
            $table->string('profile_photo', 500)->nullable();
            $table->timestamps();
            $table->softDeletes();
            $table->index(['department_id','site_id','employment_status']);
        });
    }
    public function down(): void { Schema::dropIfExists('employees'); }
};
