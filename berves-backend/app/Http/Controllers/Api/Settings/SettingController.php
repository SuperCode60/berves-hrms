<?php
namespace App\Http\Controllers\Api\Settings;

use App\Http\Controllers\Controller;
use App\Models\{SystemSetting, TaxConfiguration};
use Illuminate\Http\Request;
use Spatie\Permission\Models\Role;

class SettingController extends Controller
{
    public function index()
    {
        return $this->success(SystemSetting::all()->pluck('value','key'));
    }

    public function update(Request $request, string $key)
    {
        $request->validate(['value' => 'required']);
        SystemSetting::set($key, $request->value, auth()->id());
        return $this->success(null, 'Setting updated');
    }

    public function payrollCycle()
    {
        return $this->success([
            'processing_day' => SystemSetting::get('payroll_processing_day', 25),
            'payment_day'    => SystemSetting::get('payroll_payment_day', 28),
            'currency'       => SystemSetting::get('payroll_currency', 'GHS'),
        ]);
    }

    public function updatePayrollCycle(Request $request)
    {
        $request->validate([
            'processing_day' => 'required|integer|min:1|max:31',
            'payment_day'    => 'required|integer|min:1|max:31',
            'currency'       => 'required|string|size:3',
        ]);

        SystemSetting::set('payroll_processing_day', $request->processing_day, auth()->id());
        SystemSetting::set('payroll_payment_day', $request->payment_day, auth()->id());
        SystemSetting::set('payroll_currency', $request->currency, auth()->id());

        return $this->success(null, 'Payroll cycle updated');
    }

    public function taxConfigurations()
    {
        return $this->success(TaxConfiguration::orderBy('min_amount')->get());
    }

    public function roles()
    {
        return $this->success(Role::with('permissions')->get());
    }

    public function updateRolePermissions(Request $request, Role $role)
    {
        $request->validate(['permissions' => 'required|array']);
        $role->syncPermissions($request->permissions);
        return $this->success(null, 'Permissions updated');
    }
}
