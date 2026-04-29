<?php
namespace App\Services;

use App\Models\{AttendanceRecord, Employee, Site, ShiftSchedule};
use Carbon\Carbon;

class AttendanceService
{
    public function checkIn(Employee $employee, array $data): AttendanceRecord
    {
        // Validate no open record today
        $existing = AttendanceRecord::where('employee_id', $employee->id)
            ->whereDate('check_in_at', today())
            ->whereNull('check_out_at')
            ->first();

        if ($existing) {
            throw new \Exception('Already checked in today. Please check out first.');
        }

        $site     = $employee->site;
        $inGeo    = false;
        $lateMin  = 0;

        if ($data['latitude'] ?? false) {
            $inGeo = $this->isWithinGeofence($site, $data['latitude'], $data['longitude']);
        }

        // Check shift for lateness
        $schedule = ShiftSchedule::where('employee_id', $employee->id)
            ->where('schedule_date', today())
            ->first();

        if ($schedule) {
            $shiftStart = Carbon::parse($schedule->shiftTemplate->start_time);
            $checkIn    = now();
            if ($checkIn->greaterThan($shiftStart->addMinutes(5))) {
                $lateMin = $checkIn->diffInMinutes($shiftStart);
            }
        }

        return AttendanceRecord::create([
            'employee_id'       => $employee->id,
            'site_id'           => $site?->id,
            'shift_schedule_id' => $schedule?->id,
            'check_in_at'       => now(),
            'check_in_lat'      => $data['latitude'] ?? null,
            'check_in_lng'      => $data['longitude'] ?? null,
            'is_within_geofence'=> $inGeo,
            'method'            => $data['method'] ?? 'web',
            'late_minutes'      => $lateMin,
            'status'            => $lateMin > 0 ? 'late' : 'present',
        ]);
    }

    public function checkOut(Employee $employee, array $data): AttendanceRecord
    {
        $record = AttendanceRecord::where('employee_id', $employee->id)
            ->whereDate('check_in_at', today())
            ->whereNull('check_out_at')
            ->firstOrFail();

        $totalHours = round(now()->diffInMinutes($record->check_in_at) / 60, 2);

        $record->update([
            'check_out_at'  => now(),
            'check_out_lat' => $data['latitude'] ?? null,
            'check_out_lng' => $data['longitude'] ?? null,
            'total_hours'   => $totalHours,
        ]);

        return $record;
    }

    private function isWithinGeofence(Site $site, float $lat, float $lng): bool
    {
        if (!$site || !$site->latitude || !$site->geo_fence_radius_m) {
            return false;
        }
        $distance = $this->haversine($site->latitude, $site->longitude, $lat, $lng);
        return $distance <= $site->geo_fence_radius_m;
    }

    private function haversine(float $lat1, float $lng1, float $lat2, float $lng2): float
    {
        $R    = 6371000; // metres
        $phi1 = deg2rad($lat1);
        $phi2 = deg2rad($lat2);
        $dphi = deg2rad($lat2 - $lat1);
        $dlam = deg2rad($lng2 - $lng1);
        $a    = sin($dphi/2)**2 + cos($phi1)*cos($phi2)*sin($dlam/2)**2;
        return $R * 2 * atan2(sqrt($a), sqrt(1-$a));
    }
}
