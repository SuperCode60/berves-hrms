<?php
namespace App\Http\Controllers\Api\Leave;

use App\Http\Controllers\Controller;
use App\Models\PublicHoliday;
use Illuminate\Http\Request;

class HolidayController extends Controller
{
    public function index(Request $request)
    {
        $holidays = PublicHoliday::when($request->year, fn($q, $y) => $q->where('year', $y))
            ->orderBy('date')->get();
        return $this->success($holidays);
    }

    public function store(Request $request)
    {
        $validated = $request->validate(['name' => 'required|string', 'date' => 'required|date', 'site_id' => 'nullable|exists:sites,id']);
        $validated['year'] = date('Y', strtotime($validated['date']));
        return $this->success(PublicHoliday::create($validated), 'Holiday added', 201);
    }
}
