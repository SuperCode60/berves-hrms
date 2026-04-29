<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: Arial, Helvetica, sans-serif; font-size: 11px; color: #1e293b; background: #fff; }
  .page { padding: 28px; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #0d9488; padding-bottom: 14px; margin-bottom: 20px; }
  .company-name { font-size: 18px; font-weight: 800; color: #0a0f1e; letter-spacing: -0.5px; }
  .company-sub  { font-size: 10px; color: #64748b; margin-top: 2px; }
  .report-badge { background: #0d9488; color: #fff; padding: 5px 14px; border-radius: 20px; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
  .report-meta  { text-align: right; font-size: 10px; color: #64748b; margin-top: 4px; }
  .summary-grid { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 10px; margin-bottom: 20px; }
  .stat-box     { border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 14px; }
  .stat-label   { font-size: 9px; font-weight: 700; text-transform: uppercase; color: #94a3b8; letter-spacing: 0.5px; }
  .stat-value   { font-size: 15px; font-weight: 800; color: #0a0f1e; margin-top: 3px; }
  .stat-blue    { border-top: 3px solid #2563eb; }
  .stat-red     { border-top: 3px solid #dc2626; }
  .stat-green   { border-top: 3px solid #059669; }
  .stat-teal    { border-top: 3px solid #0d9488; }
  h3 { font-size: 11px; font-weight: 700; color: #0a0f1e; text-transform: uppercase; letter-spacing: 0.5px; border-left: 3px solid #0d9488; padding-left: 8px; margin-bottom: 10px; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
  thead tr { background: #0a0f1e; color: #e2e8f0; }
  thead th { padding: 8px 10px; text-align: left; font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.3px; }
  tbody tr:nth-child(even) { background: #f8fafc; }
  tbody tr:hover { background: #f0fdfa; }
  tbody td { padding: 7px 10px; border-bottom: 1px solid #f1f5f9; }
  .r { text-align: right; }
  .total-row td { font-weight: 700; background: #f0fdfa; border-top: 2px solid #0d9488; }
  .footer { margin-top: 24px; border-top: 1px solid #e2e8f0; padding-top: 10px; display: flex; justify-content: space-between; color: #94a3b8; font-size: 9px; }
  .pill { display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 9px; font-weight: 600; }
  .pill-green { background: #d1fae5; color: #065f46; }
</style>
</head>
<body>
<div class="page">
  <div class="header">
    <div>
      <div class="company-name">BERVES ENGINEERING LIMITED</div>
      <div class="company-sub">Human Resource Management System</div>
    </div>
    <div style="text-align:right">
      <div class="report-badge">Payroll Report</div>
      <div class="report-meta">Period: {{ $month }} &nbsp;|&nbsp; Generated: {{ now()->format('d M Y, H:i') }}</div>
    </div>
  </div>

  <div class="summary-grid">
    <div class="stat-box stat-blue">
      <div class="stat-label">Total Gross Pay</div>
      <div class="stat-value">GHS {{ number_format($data['total_gross'] ?? 0, 2) }}</div>
    </div>
    <div class="stat-box stat-red">
      <div class="stat-label">Total Deductions</div>
      <div class="stat-value">GHS {{ number_format($data['total_deductions'] ?? 0, 2) }}</div>
    </div>
    <div class="stat-box stat-green">
      <div class="stat-label">Total Net Pay</div>
      <div class="stat-value">GHS {{ number_format($data['total_net'] ?? 0, 2) }}</div>
    </div>
    <div class="stat-box stat-teal">
      <div class="stat-label">Employees Paid</div>
      <div class="stat-value">{{ $data['employee_count'] ?? 0 }}</div>
    </div>
  </div>

  @if(!empty($data['by_department']))
  <h3>Breakdown by Department</h3>
  <table>
    <thead>
      <tr>
        <th>Department</th>
        <th class="r">Employees</th>
        <th class="r">Gross Pay (GHS)</th>
        <th class="r">Deductions (GHS)</th>
        <th class="r">Net Pay (GHS)</th>
      </tr>
    </thead>
    <tbody>
      @foreach($data['by_department'] as $dept)
      <tr>
        <td>{{ $dept['name'] }}</td>
        <td class="r">{{ $dept['count'] }}</td>
        <td class="r">{{ number_format($dept['gross_pay'] ?? ($dept['net_pay'] ?? 0), 2) }}</td>
        <td class="r">{{ number_format($dept['deductions'] ?? 0, 2) }}</td>
        <td class="r">{{ number_format($dept['net_pay'], 2) }}</td>
      </tr>
      @endforeach
      <tr class="total-row">
        <td>TOTAL</td>
        <td class="r">{{ $data['employee_count'] }}</td>
        <td class="r">{{ number_format($data['total_gross'], 2) }}</td>
        <td class="r">{{ number_format($data['total_deductions'], 2) }}</td>
        <td class="r">{{ number_format($data['total_net'], 2) }}</td>
      </tr>
    </tbody>
  </table>
  @endif

  @if(!empty($data['runs']))
  <h3>Employee Detail</h3>
  <table>
    <thead>
      <tr>
        <th>Employee</th><th>Dept</th>
        <th class="r">Basic</th><th class="r">Allow.</th>
        <th class="r">OT</th><th class="r">Gross</th>
        <th class="r">Deduct.</th><th class="r">Net Pay</th>
        <th>Status</th>
      </tr>
    </thead>
    <tbody>
      @foreach($data['runs'] as $run)
      <tr>
        <td>{{ $run['name'] }}</td>
        <td>{{ $run['department'] }}</td>
        <td class="r">{{ number_format($run['basic_salary'], 2) }}</td>
        <td class="r">{{ number_format($run['total_allowances'], 2) }}</td>
        <td class="r">{{ number_format($run['overtime_pay'], 2) }}</td>
        <td class="r">{{ number_format($run['gross_pay'], 2) }}</td>
        <td class="r">{{ number_format($run['total_deductions'], 2) }}</td>
        <td class="r"><strong>{{ number_format($run['net_pay'], 2) }}</strong></td>
        <td><span class="pill pill-green">{{ ucfirst($run['payment_status'] ?? 'pending') }}</span></td>
      </tr>
      @endforeach
    </tbody>
  </table>
  @endif

  <div class="footer">
    <span>Berves Engineering Limited — Confidential Payroll Document</span>
    <span>Generated by HRMS v2.0 &nbsp;|&nbsp; {{ now()->format('d M Y') }}</span>
  </div>
</div>
</body>
</html>
