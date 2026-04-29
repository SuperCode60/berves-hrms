<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\{SystemSetting, OvertimePolicy, TaxConfiguration, LeaveType, OnboardingChecklist};

class SettingsSeeder extends Seeder
{
    public function run(): void
    {
        // System settings
        $settings = [
            ['key'=>'payroll_processing_day','value'=>'25','group'=>'payroll','description'=>'Day of month payroll is processed'],
            ['key'=>'payroll_payment_day','value'=>'28','group'=>'payroll','description'=>'Day of month salaries are paid'],
            ['key'=>'payroll_currency','value'=>'GHS','group'=>'payroll','description'=>'Payroll currency'],
            ['key'=>'ssnit_employee_rate','value'=>'5.5','group'=>'payroll','description'=>'SSNIT employee contribution %'],
            ['key'=>'ssnit_employer_rate','value'=>'13','group'=>'payroll','description'=>'SSNIT employer contribution %'],
        ];
        foreach ($settings as $s) {
            SystemSetting::updateOrCreate(['key' => $s['key']], $s);
        }

        // Overtime policies
        $policies = [
            ['day_type'=>'weekday','multiplier'=>1.50,'effective_from'=>'2024-01-01'],
            ['day_type'=>'sunday','multiplier'=>2.00,'effective_from'=>'2024-01-01'],
            ['day_type'=>'public_holiday','multiplier'=>2.00,'effective_from'=>'2024-01-01'],
        ];
        foreach ($policies as $p) {
            OvertimePolicy::updateOrCreate(['day_type' => $p['day_type']], $p);
        }

        // Ghana PAYE tax brackets (2024)
        TaxConfiguration::truncate();
        $brackets = [
            ['bracket_name'=>'Band 1','min_amount'=>0,'max_amount'=>365,'rate_percent'=>0,'effective_from'=>'2024-01-01'],
            ['bracket_name'=>'Band 2','min_amount'=>365,'max_amount'=>1095,'rate_percent'=>5,'effective_from'=>'2024-01-01'],
            ['bracket_name'=>'Band 3','min_amount'=>1095,'max_amount'=>3295,'rate_percent'=>10,'effective_from'=>'2024-01-01'],
            ['bracket_name'=>'Band 4','min_amount'=>3295,'max_amount'=>16535,'rate_percent'=>17.5,'effective_from'=>'2024-01-01'],
            ['bracket_name'=>'Band 5','min_amount'=>16535,'max_amount'=>41535,'rate_percent'=>25,'effective_from'=>'2024-01-01'],
            ['bracket_name'=>'Band 6','min_amount'=>41535,'max_amount'=>null,'rate_percent'=>30,'effective_from'=>'2024-01-01'],
        ];
        foreach ($brackets as $b) {
            TaxConfiguration::create($b);
        }

        // Leave types
        $leaveTypes = [
            ['name'=>'Annual Leave','days_per_year'=>21,'is_paid'=>true,'requires_approval'=>true,'carry_over_days'=>5,'notice_days'=>7],
            ['name'=>'Sick Leave','days_per_year'=>14,'is_paid'=>true,'requires_approval'=>false,'carry_over_days'=>0,'notice_days'=>0],
            ['name'=>'Maternity Leave','days_per_year'=>84,'is_paid'=>true,'requires_approval'=>true,'carry_over_days'=>0,'notice_days'=>30],
            ['name'=>'Paternity Leave','days_per_year'=>5,'is_paid'=>true,'requires_approval'=>true,'carry_over_days'=>0,'notice_days'=>7],
            ['name'=>'Compassionate Leave','days_per_year'=>3,'is_paid'=>true,'requires_approval'=>true,'carry_over_days'=>0,'notice_days'=>0],
            ['name'=>'Study Leave','days_per_year'=>10,'is_paid'=>false,'requires_approval'=>true,'carry_over_days'=>0,'notice_days'=>14],
        ];
        foreach ($leaveTypes as $lt) {
            LeaveType::updateOrCreate(['name' => $lt['name']], $lt);
        }

        // Onboarding checklists
        $checklists = [
            ['name'=>'Sign Employment Contract','category'=>'HR','is_mandatory'=>true,'due_days_after_hire'=>1],
            ['name'=>'Complete Personal Data Form','category'=>'HR','is_mandatory'=>true,'due_days_after_hire'=>1],
            ['name'=>'Safety Induction Training','category'=>'Safety','is_mandatory'=>true,'due_days_after_hire'=>1],
            ['name'=>'Worksite Orientation','category'=>'Safety','is_mandatory'=>true,'due_days_after_hire'=>2],
            ['name'=>'IT Equipment Setup','category'=>'IT','is_mandatory'=>false,'due_days_after_hire'=>2],
            ['name'=>'System Access & Login','category'=>'IT','is_mandatory'=>true,'due_days_after_hire'=>3],
            ['name'=>'Bank Account Details Submission','category'=>'HR','is_mandatory'=>true,'due_days_after_hire'=>3],
            ['name'=>'SSNIT Registration Verification','category'=>'HR','is_mandatory'=>true,'due_days_after_hire'=>5],
            ['name'=>'Meet Your Team','category'=>'Admin','is_mandatory'=>false,'due_days_after_hire'=>3],
            ['name'=>'Review Company Policies','category'=>'HR','is_mandatory'=>true,'due_days_after_hire'=>5],
        ];
        foreach ($checklists as $c) {
            OnboardingChecklist::updateOrCreate(['name' => $c['name']], $c);
        }
    }
}
