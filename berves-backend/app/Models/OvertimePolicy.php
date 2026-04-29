<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OvertimePolicy extends Model
{
    protected $fillable = [
        'day_type', 'multiplier', 'is_active', 'min_hours', 'max_hours',
        'effective_from', 'updated_by',
    ];

    protected $casts = [
        'multiplier'     => 'decimal:2',
        'min_hours'      => 'decimal:1',
        'max_hours'      => 'decimal:1',
        'is_active'      => 'boolean',
        'effective_from' => 'date',
    ];

    public function updatedBy() { return $this->belongsTo(User::class, 'updated_by'); }
}
