<?php
namespace App\Services;

use App\Models\{Employee, PayrollPeriod, PayrollRun, PayrollAllowanceLine,
    OvertimeRecord, EmployeeLoan, TaxConfiguration, OvertimePolicy, EmployeeAllowance};
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class PayrollService
{
    public function runPayroll(PayrollPeriod $period): void
    {
        $employees = Employee::where('employment_status', 'active')
            ->with(['allowances' => fn($q) => $q->whereNull('effective_to')
                ->orWhere('effective_to', '>=', $period->start_date)])
            ->get();

        DB::transaction(function () use ($employees, $period) {
            foreach ($employees as $employee) {
                $this->processEmployee($employee, $period);
            }
            $period->update([
                'status'       => 'processing',
                'processed_by' => auth()->id(),
                'processed_at' => now(),
            ]);
        });
    }

    private function processEmployee(Employee $employee, PayrollPeriod $period): PayrollRun
    {
        $basicSalary = $employee->base_salary;
        $hourlyRate  = $basicSalary / 160; // 160 working hours/month

        // Allowances
        $allowances      = $employee->allowances->where('effective_from', '<=', $period->end_date);
        $totalAllowances = $allowances->sum('amount');

        // Overtime
        $overtimeRecords = OvertimeRecord::where('employee_id', $employee->id)
            ->whereBetween('date', [$period->start_date, $period->end_date])
            ->whereNull('payroll_run_id')
            ->get();
        $overtimePay = $overtimeRecords->sum('amount');

        // Gross
        $grossPay = $basicSalary + $totalAllowances + $overtimePay;

        // SSNIT
        $ssnitEmployee = round($basicSalary * 0.055, 2);
        $ssnitEmployer = round($basicSalary * 0.13, 2);

        // PAYE Tax
        $taxableIncome = $grossPay - $ssnitEmployee;
        $taxDeduction  = $this->calculateTax($taxableIncome);

        // Loans
        $loanDeduction = EmployeeLoan::where('employee_id', $employee->id)
            ->where('status', 'active')
            ->sum('monthly_deduction');

        $totalDeductions = $ssnitEmployee + $taxDeduction + $loanDeduction;
        $netPay          = $grossPay - $totalDeductions;

        $run = PayrollRun::updateOrCreate(
            ['payroll_period_id' => $period->id, 'employee_id' => $employee->id],
            [
                'basic_salary'    => $basicSalary,
                'total_allowances'=> $totalAllowances,
                'overtime_pay'    => $overtimePay,
                'gross_pay'       => $grossPay,
                'tax_deduction'   => $taxDeduction,
                'ssnit_employee'  => $ssnitEmployee,
                'ssnit_employer'  => $ssnitEmployer,
                'loan_deduction'  => $loanDeduction,
                'other_deductions'=> 0,
                'total_deductions'=> $totalDeductions,
                'net_pay'         => $netPay,
            ]
        );

        // Allowance lines
        $run->allowanceLines()->delete();
        foreach ($allowances as $allowance) {
            $run->allowanceLines()->create([
                'allowance_type' => $allowance->allowance_type,
                'amount'         => $allowance->amount,
                'is_taxable'     => $allowance->is_taxable,
            ]);
        }

        // Link overtime
        $overtimeRecords->each(fn($ot) => $ot->update(['payroll_run_id' => $run->id]));

        // Deduct loan balances
        EmployeeLoan::where('employee_id', $employee->id)->where('status', 'active')->each(function ($loan) {
            $newBalance = max(0, $loan->balance_remaining - $loan->monthly_deduction);
            $loan->update([
                'balance_remaining' => $newBalance,
                'status' => $newBalance <= 0 ? 'settled' : 'active',
            ]);
        });

        return $run;
    }

    private function calculateTax(float $taxableIncome): float
    {
        $brackets = TaxConfiguration::whereDate('effective_from', '<=', now())
            ->where(fn($q) => $q->whereNull('effective_to')->orWhereDate('effective_to', '>=', now()))
            ->orderBy('min_amount')
            ->get();

        $tax = 0;
        $remaining = $taxableIncome;

        foreach ($brackets as $bracket) {
            if ($remaining <= 0) break;
            $bandWidth = $bracket->max_amount
                ? min($remaining, $bracket->max_amount - $bracket->min_amount)
                : $remaining;
            $tax      += $bandWidth * ($bracket->rate_percent / 100);
            $remaining -= $bandWidth;
        }

        return round($tax, 2);
    }

    public function computeOvertimeAmount(Employee $employee, string $dayType, float $hours): float
    {
        $policy    = OvertimePolicy::where('day_type', $dayType)->first();
        $multiplier= $policy?->multiplier ?? ($dayType === 'sunday' ? 2.0 : 1.5);
        $hourlyRate= $employee->base_salary / 160;
        return round($hours * $hourlyRate * $multiplier, 2);
    }
}
