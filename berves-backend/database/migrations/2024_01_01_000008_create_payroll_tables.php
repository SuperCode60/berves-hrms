<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('tax_configurations', function (Blueprint $table) {
            $table->id();
            $table->string('bracket_name', 100);
            $table->decimal('min_amount', 15, 2);
            $table->decimal('max_amount', 15, 2)->nullable();
            $table->decimal('rate_percent', 5, 2);
            $table->date('effective_from');
            $table->date('effective_to')->nullable();
            $table->timestamps();
        });

        Schema::create('payroll_periods', function (Blueprint $table) {
            $table->id();
            $table->string('period_name', 100);
            $table->date('start_date');
            $table->date('end_date');
            $table->enum('status', ['open','processing','approved','paid','closed'])->default('open');
            $table->foreignId('processed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('processed_at')->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->timestamps();
        });

        Schema::create('payroll_runs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('payroll_period_id')->constrained()->cascadeOnDelete();
            $table->foreignId('employee_id')->constrained();
            $table->decimal('basic_salary', 15, 2);
            $table->decimal('total_allowances', 15, 2)->default(0);
            $table->decimal('overtime_pay', 15, 2)->default(0);
            $table->decimal('gross_pay', 15, 2);
            $table->decimal('tax_deduction', 15, 2)->default(0);
            $table->decimal('ssnit_employee', 15, 2)->default(0);
            $table->decimal('ssnit_employer', 15, 2)->default(0);
            $table->decimal('loan_deduction', 15, 2)->default(0);
            $table->decimal('other_deductions', 15, 2)->default(0);
            $table->decimal('total_deductions', 15, 2);
            $table->decimal('net_pay', 15, 2);
            $table->enum('payment_status', ['pending','paid','failed'])->default('pending');
            $table->date('payment_date')->nullable();
            $table->string('payslip_path', 500)->nullable();
            $table->timestamps();
            $table->unique(['payroll_period_id','employee_id']);
        });

        Schema::create('payroll_allowance_lines', function (Blueprint $table) {
            $table->id();
            $table->foreignId('payroll_run_id')->constrained()->cascadeOnDelete();
            $table->string('allowance_type', 150);
            $table->decimal('amount', 12, 2);
            $table->boolean('is_taxable');
        });

        Schema::create('overtime_records', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained();
            $table->date('date');
            $table->enum('day_type', ['weekday','sunday','public_holiday']);
            $table->decimal('hours', 5, 2);
            $table->decimal('rate_multiplier', 4, 2);
            $table->decimal('hourly_rate', 10, 2);
            $table->decimal('amount', 12, 2);
            $table->foreignId('approved_by')->constrained('users');
            $table->foreignId('payroll_run_id')->nullable()->constrained()->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('employee_loans', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained();
            $table->decimal('principal', 15, 2);
            $table->decimal('interest_rate', 5, 2)->nullable();
            $table->decimal('monthly_deduction', 12, 2);
            $table->decimal('balance_remaining', 15, 2);
            $table->date('disbursed_on');
            $table->enum('status', ['active','settled','defaulted'])->default('active');
            $table->foreignId('approved_by')->constrained('users');
            $table->timestamps();
        });
    }
    public function down(): void {
        Schema::dropIfExists('employee_loans');
        Schema::dropIfExists('overtime_records');
        Schema::dropIfExists('payroll_allowance_lines');
        Schema::dropIfExists('payroll_runs');
        Schema::dropIfExists('payroll_periods');
        Schema::dropIfExists('tax_configurations');
    }
};
