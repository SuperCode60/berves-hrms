<?php
namespace App\Http\Controllers\Api\Reports;

use App\Http\Controllers\Controller;
use App\Services\ReportService;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    public function __construct(private ReportService $reportService) {}

    /* ── JSON data endpoints ─────────────────────────────────────────── */
    public function payroll(Request $request)
    {
        return $this->success($this->reportService->payrollSummary(
            $request->get('month', now()->format('Y-m'))
        ));
    }

    public function attendance(Request $request)
    {
        return $this->success($this->reportService->attendanceSummary(
            $request->get('month', now()->format('Y-m'))
        ));
    }

    public function leave(Request $request)
    {
        return $this->success($this->reportService->leaveReport(
            $request->get('month', now()->format('Y-m'))
        ));
    }

    public function overtime(Request $request)
    {
        return $this->success($this->reportService->overtimeReport(
            $request->get('month', now()->format('Y-m'))
        ));
    }

    public function headcount(Request $request)
    {
        return $this->success($this->reportService->headcountReport());
    }

    /* ── PDF export ──────────────────────────────────────────────────── */
    public function exportPdf(Request $request, string $type)
    {
        $month    = $request->get('month', now()->format('Y-m'));
        $data     = $this->resolveData($type, $month);
        $view     = "pdfs.report-{$type}";
        $filename = "{$type}-report-{$month}.pdf";

        // DomPDF path
        if (class_exists(\Barryvdh\DomPDF\Facade\Pdf::class)) {
            if (!view()->exists($view)) {
                return $this->error("No PDF template for report type '{$type}'.", 422);
            }
            $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView($view, [
                'data'  => $data,
                'month' => $month,
            ])->setPaper('a4', 'portrait');

            return $pdf->download($filename);
        }

        // Fallback: return printable HTML — browser prints to PDF
        if (!view()->exists($view)) {
            return $this->error("PDF template missing for '{$type}'. Install barryvdh/laravel-dompdf.", 422);
        }

        $html = view($view, ['data' => $data, 'month' => $month])->render();

        return response($html, 200, [
            'Content-Type'        => 'text/html; charset=UTF-8',
            'Content-Disposition' => "inline; filename=\"{$filename}\"",
        ]);
    }

    /* ── CSV export (zero dependencies) ─────────────────────────────── */
    public function exportCsv(Request $request, string $type)
    {
        $month    = $request->get('month', now()->format('Y-m'));
        $filename = "{$type}-report-{$month}.csv";

        [$headers, $rows] = $this->buildCsvData($type, $month);

        return response()->streamDownload(function () use ($headers, $rows) {
            $out = fopen('php://output', 'w');
            // UTF-8 BOM so Excel opens correctly
            fwrite($out, "\xEF\xBB\xBF");
            fputcsv($out, $headers);
            foreach ($rows as $row) {
                fputcsv($out, $row);
            }
            fclose($out);
        }, $filename, [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }

    /* ── Excel (XLSX-named CSV — opens in Excel without extra library) ─ */
    public function exportExcel(Request $request, string $type)
    {
        $month    = $request->get('month', now()->format('Y-m'));
        $filename = "{$type}-report-{$month}.csv"; // CSV is fully Excel-compatible

        [$headers, $rows] = $this->buildCsvData($type, $month);

        return response()->streamDownload(function () use ($headers, $rows) {
            $out = fopen('php://output', 'w');
            fwrite($out, "\xEF\xBB\xBF");
            fputcsv($out, $headers);
            foreach ($rows as $row) {
                fputcsv($out, $row);
            }
            fclose($out);
        }, $filename, [
            'Content-Type' => 'application/vnd.ms-excel; charset=UTF-8',
        ]);
    }

    /* ── Sub-reports ─────────────────────────────────────────────────── */
    public function salarySummary(Request $request)
    {
        $data = $this->reportService->payrollSummary($request->get('month', now()->format('Y-m')));
        return $this->success($data);
    }

    public function deductionSummary(Request $request)
    {
        $data = $this->reportService->payrollSummary($request->get('month', now()->format('Y-m')));
        return $this->success(['deductions' => $data['total_deductions'] ?? 0]);
    }

    public function taxSummary(Request $request)
    {
        $data = $this->reportService->payrollSummary($request->get('month', now()->format('Y-m')));
        return $this->success(['total_tax' => collect($data['runs'] ?? [])->sum('tax_amount')]);
    }

    /* ── Stub endpoints ──────────────────────────────────────────────── */
    public function turnover()           { return $this->success([]); }
    public function recruitment()        { return $this->success([]); }
    public function training()           { return $this->success([]); }
    public function performance()        { return $this->success([]); }
    public function safety()             { return $this->success([]); }
    public function scheduledReports()   { return $this->success([]); }
    public function scheduleReport(Request $r)      { return $this->success([], 'Scheduled'); }
    public function updateSchedule(Request $r, $s)  { return $this->success([], 'Updated'); }
    public function deleteSchedule($s)              { return $this->success([], 'Deleted'); }
    public function customReport(Request $r)        { return $this->success([]); }
    public function saveCustomReport(Request $r)    { return $this->success([], 'Saved'); }
    public function savedCustomReports()            { return $this->success([]); }

    /* ── Private helpers ─────────────────────────────────────────────── */
    private function resolveData(string $type, string $month): array
    {
        return match ($type) {
            'payroll'    => $this->reportService->payrollSummary($month),
            'attendance' => $this->reportService->attendanceSummary($month),
            'leave'      => $this->reportService->leaveReport($month),
            'overtime'   => $this->reportService->overtimeReport($month),
            'headcount'  => $this->reportService->headcountReport(),
            default      => [],
        };
    }

    private function buildCsvData(string $type, string $month): array
    {
        $data = $this->resolveData($type, $month);

        return match ($type) {
            'payroll' => [
                ['Employee', 'Employee No.', 'Department', 'Basic Salary (GHS)', 'Allowances (GHS)',
                 'Overtime (GHS)', 'Gross Pay (GHS)', 'Deductions (GHS)', 'Net Pay (GHS)', 'Status'],
                array_merge(
                    array_map(fn($r) => [
                        $r['name'], $r['employee_number'], $r['department'],
                        number_format($r['basic_salary'], 2),
                        number_format($r['total_allowances'], 2),
                        number_format($r['overtime_pay'], 2),
                        number_format($r['gross_pay'], 2),
                        number_format($r['total_deductions'], 2),
                        number_format($r['net_pay'], 2),
                        $r['payment_status'],
                    ], $data['runs'] ?? []),
                    [[]],
                    [['TOTAL', '', '',
                      number_format($data['total_gross'] ?? 0, 2), '',
                      '', number_format($data['total_gross'] ?? 0, 2),
                      number_format($data['total_deductions'] ?? 0, 2),
                      number_format($data['total_net'] ?? 0, 2), '']]
                ),
            ],
            'attendance' => [
                ['Date', 'Present', 'Absent', 'Late Arrivals', 'Attendance Rate (%)'],
                array_map(fn($r) => [
                    $r['date'], $r['present'], $r['absent'] ?? 0,
                    $r['late'] ?? 0, $r['rate'],
                ], $data['trend'] ?? []),
            ],
            'leave' => [
                ['Employee', 'Department', 'Leave Type', 'Start Date', 'End Date', 'Days', 'Status'],
                array_map(fn($r) => [
                    $r['employee'], $r['department'], $r['type'],
                    $r['start_date'], $r['end_date'], $r['days'], $r['status'],
                ], $data['detail'] ?? []),
            ],
            'overtime' => [
                ['Employee', 'Employee No.', 'Department', 'Date', 'Day Type',
                 'Hours', 'Rate Multiplier', 'Amount (GHS)', 'Approved'],
                array_merge(
                    array_map(fn($r) => [
                        $r['employee'], $r['employee_number'], $r['department'],
                        $r['date'], $r['day_type'], $r['hours'], $r['rate_multiplier'],
                        number_format($r['amount'], 2), $r['approved_by'] ? 'Yes' : 'No',
                    ], $data['records'] ?? []),
                    [[]],
                    [['TOTAL', '', '', '', '', $data['total_hours'] ?? 0, '',
                      number_format($data['total_amount'] ?? 0, 2), '']]
                ),
            ],
            default => [['Type', 'Month', 'Note'], [[$type, $month, 'No data available']]],
        };
    }
}
