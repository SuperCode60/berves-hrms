<?php
namespace App\Services;

use App\Models\{LeaveRequest, LeaveEntitlement, PublicHoliday};
use Carbon\Carbon;
use Carbon\CarbonPeriod;

class LeaveService
{
    /**
     * Count working days between two dates (excl. weekends and public holidays).
     */
    public function countWorkingDays(string $startDate, string $endDate): int
    {
        $holidays = PublicHoliday::whereBetween('date', [$startDate, $endDate])
            ->pluck('date')
            ->map(fn($d) => Carbon::parse($d)->toDateString())
            ->toArray();

        $count  = 0;
        $period = CarbonPeriod::create($startDate, $endDate);

        foreach ($period as $day) {
            if ($day->isWeekday() && !in_array($day->toDateString(), $holidays)) {
                $count++;
            }
        }

        return max(1, $count);
    }

    /**
     * Deduct days from the employee's leave entitlement after approval.
     */
    public function deductEntitlement(LeaveRequest $request): void
    {
        $entitlement = LeaveEntitlement::where('employee_id', $request->employee_id)
            ->where('leave_type_id', $request->leave_type_id)
            ->where('year', Carbon::parse($request->start_date)->year)
            ->first();

        if ($entitlement) {
            $entitlement->increment('used_days', $request->days_requested);
        }
    }

    /**
     * Check if the employee has enough entitlement days.
     */
    public function hasEntitlement(int $employeeId, int $leaveTypeId, int $daysRequested, int $year): bool
    {
        $entitlement = LeaveEntitlement::where('employee_id', $employeeId)
            ->where('leave_type_id', $leaveTypeId)
            ->where('year', $year)
            ->first();

        if (!$entitlement) return false;

        $remaining = $entitlement->entitled_days - $entitlement->used_days;
        return $remaining >= $daysRequested;
    }
}
