<?php
namespace App\Services;

use App\Models\PayrollRun;

class PayslipService
{
    public function generate(PayrollRun $run)
    {
        $run->load([
            'employee.department',
            'employee.jobTitle',
            'employee.site',
            'period',
            'allowanceLines',
        ]);

        // Use DomPDF if available, otherwise stream an HTML page (print-to-PDF in browser)
        if (class_exists(\Barryvdh\DomPDF\Facade\Pdf::class)) {
            $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView(
                'payslips.template',
                ['run' => $run]
            )->setPaper('a4', 'portrait');

            $filename = "payslip-{$run->employee->employee_number}-{$run->period->period_name}.pdf";
            return $pdf->download($filename);
        }

        // Fallback: return the Blade view as HTML with a print-trigger header
        $html = view('payslips.template', ['run' => $run])->render();
        $filename = "payslip-{$run->employee->employee_number}-{$run->period->period_name}";

        return response($html, 200, [
            'Content-Type'        => 'text/html; charset=UTF-8',
            'Content-Disposition' => "inline; filename=\"{$filename}.html\"",
            'X-Payslip-Filename'  => $filename,
        ]);
    }
}
