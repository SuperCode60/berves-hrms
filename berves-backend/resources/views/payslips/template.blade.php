<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Payslip — {{ $run->employee->first_name }} {{ $run->employee->last_name }}</title>
<style>
  @page { size: A4; margin: 20mm; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: Arial, Helvetica, sans-serif; font-size: 11px; color: #1e293b; background: #fff; }
  .page { max-width: 800px; margin: 0 auto; padding: 24px; }

  /* Header */
  .header { display: flex; justify-content: space-between; align-items: flex-start;
            border-bottom: 4px solid #0d9488; padding-bottom: 16px; margin-bottom: 20px; }
  .company-name { font-size: 20px; font-weight: 900; color: #0a0f1e; letter-spacing: -0.5px; }
  .company-sub  { font-size: 10px; color: #64748b; margin-top: 3px; }
  .slip-label   { background: #0a0f1e; color: #fff; padding: 6px 16px; border-radius: 20px;
                  font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; }
  .slip-period  { text-align: right; font-size: 10px; color: #64748b; margin-top: 5px; }

  /* Employee / period grid */
  .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px; }
  .info-box  { border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 16px; }
  .info-box h4 { font-size: 9px; font-weight: 700; text-transform: uppercase; color: #94a3b8;
                 letter-spacing: 0.8px; margin-bottom: 8px; }
  .field { margin-bottom: 5px; }
  .field .lbl { font-size: 9px; color: #94a3b8; display: block; }
  .field .val { font-size: 11px; font-weight: 600; color: #1e293b; }

  /* Pay tables */
  .section-title { font-size: 10px; font-weight: 700; text-transform: uppercase; color: #64748b;
                   letter-spacing: 0.8px; border-left: 3px solid #0d9488; padding-left: 8px;
                   margin-bottom: 10px; margin-top: 16px; }
  table { width: 100%; border-collapse: collapse; }
  thead tr { background: #f8fafc; }
  thead th { padding: 7px 10px; text-align: left; font-size: 10px; font-weight: 700;
             color: #64748b; text-transform: uppercase; border-bottom: 2px solid #e2e8f0; }
  tbody td { padding: 7px 10px; border-bottom: 1px solid #f1f5f9; font-size: 11px; }
  .r { text-align: right; font-family: 'Courier New', monospace; }
  .sub-total td { font-weight: 700; border-top: 2px solid #e2e8f0; background: #f8fafc; }
  .net-row { background: #0a0f1e !important; }
  .net-row td { color: #fff !important; font-size: 14px; font-weight: 900;
                padding: 12px 10px; border: none; border-radius: 8px; }
  .spacer { height: 8px; }

  /* Footer */
  .footer { margin-top: 28px; border-top: 1px solid #e2e8f0; padding-top: 12px;
            display: flex; justify-content: space-between; align-items: flex-end; }
  .footer-note { font-size: 9px; color: #94a3b8; }
  .sig-line { border-top: 1px solid #cbd5e1; width: 160px; margin-top: 20px;
              text-align: center; padding-top: 4px; font-size: 9px; color: #94a3b8; }

  @media print {
    body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
    .no-print { display: none; }
  }
</style>
</head>
<body>
<div class="page">

  <!-- Print button (hidden when printing) -->
  <div class="no-print" style="text-align:right; margin-bottom:12px;">
    <button onclick="window.print()"
      style="background:#0d9488;color:#fff;border:none;padding:8px 20px;border-radius:6px;font-size:12px;font-weight:700;cursor:pointer;">
      🖨 Print / Save as PDF
    </button>
  </div>

  <!-- Header -->
  <div class="header">
    <div>
      <div class="company-name">BERVES ENGINEERING LIMITED</div>
      <div class="company-sub">Human Resource Management System</div>
    </div>
    <div style="text-align:right">
      <div class="slip-label">Employee Payslip</div>
      <div class="slip-period">{{ $run->period->period_name }}</div>
    </div>
  </div>

  <!-- Employee + Period Info -->
  <div class="info-grid">
    <div class="info-box">
      <h4>Employee Information</h4>
      <div class="field"><span class="lbl">Full Name</span><span class="val">{{ $run->employee->first_name }} {{ $run->employee->last_name }}</span></div>
      <div class="field"><span class="lbl">Employee No.</span><span class="val">{{ $run->employee->employee_number }}</span></div>
      <div class="field"><span class="lbl">Position</span><span class="val">{{ $run->employee->jobTitle?->title ?? '—' }}</span></div>
      <div class="field"><span class="lbl">Department</span><span class="val">{{ $run->employee->department?->name ?? '—' }}</span></div>
      <div class="field"><span class="lbl">Site / Location</span><span class="val">{{ $run->employee->site?->name ?? '—' }}</span></div>
    </div>
    <div class="info-box">
      <h4>Payroll Period</h4>
      <div class="field"><span class="lbl">Period Name</span><span class="val">{{ $run->period->period_name }}</span></div>
      <div class="field"><span class="lbl">Start Date</span><span class="val">{{ $run->period->start_date->format('d M Y') }}</span></div>
      <div class="field"><span class="lbl">End Date</span><span class="val">{{ $run->period->end_date->format('d M Y') }}</span></div>
      <div class="field"><span class="lbl">Payment Status</span><span class="val" style="text-transform:capitalize">{{ $run->payment_status ?? 'Pending' }}</span></div>
      <div class="field"><span class="lbl">Run Date</span><span class="val">{{ $run->created_at?->format('d M Y') ?? now()->format('d M Y') }}</span></div>
    </div>
  </div>

  <!-- Earnings -->
  <div class="section-title">Earnings</div>
  <table>
    <thead>
      <tr><th>Description</th><th class="r">Amount (GHS)</th></tr>
    </thead>
    <tbody>
      <tr><td>Basic Salary</td><td class="r">{{ number_format($run->basic_salary, 2) }}</td></tr>
      @foreach($run->allowanceLines ?? [] as $line)
      <tr><td>{{ ucfirst(str_replace('_', ' ', $line->allowance_type)) }}</td><td class="r">{{ number_format($line->amount, 2) }}</td></tr>
      @endforeach
      @if(($run->overtime_pay ?? 0) > 0)
      <tr><td>Overtime Pay</td><td class="r">{{ number_format($run->overtime_pay, 2) }}</td></tr>
      @endif
      <tr class="sub-total"><td>Gross Earnings</td><td class="r">{{ number_format($run->gross_pay ?? $run->basic_salary, 2) }}</td></tr>
    </tbody>
  </table>

  <!-- Deductions -->
  <div class="section-title">Deductions</div>
  <table>
    <thead>
      <tr><th>Description</th><th class="r">Amount (GHS)</th></tr>
    </thead>
    <tbody>
      @if(($run->tax_amount ?? 0) > 0)
      <tr><td>Income Tax (PAYE)</td><td class="r">{{ number_format($run->tax_amount, 2) }}</td></tr>
      @endif
      @if(($run->ssnit_employee ?? 0) > 0)
      <tr><td>SSNIT Employee (5.5%)</td><td class="r">{{ number_format($run->ssnit_employee, 2) }}</td></tr>
      @endif
      @if(($run->loan_deduction ?? 0) > 0)
      <tr><td>Loan Repayment</td><td class="r">{{ number_format($run->loan_deduction, 2) }}</td></tr>
      @endif
      @if(($run->other_deductions ?? 0) > 0)
      <tr><td>Other Deductions</td><td class="r">{{ number_format($run->other_deductions, 2) }}</td></tr>
      @endif
      <tr class="sub-total"><td>Total Deductions</td><td class="r">{{ number_format($run->total_deductions ?? 0, 2) }}</td></tr>
    </tbody>
  </table>

  <!-- Net Pay -->
  <div class="spacer"></div>
  <table>
    <tbody>
      <tr class="net-row">
        <td>💰 NET PAY</td>
        <td class="r">GHS {{ number_format($run->net_pay ?? ($run->gross_pay - $run->total_deductions), 2) }}</td>
      </tr>
    </tbody>
  </table>

  <!-- Footer -->
  <div class="footer">
    <div>
      <div class="footer-note">This is a computer-generated payslip. No signature required.</div>
      <div class="footer-note">Berves Engineering Limited · HRMS v2.0</div>
    </div>
    <div style="text-align:right">
      <div class="sig-line">Authorised Signatory</div>
    </div>
  </div>

</div>
</body>
</html>
