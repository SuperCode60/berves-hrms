<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class KpiDefinition extends Model
{
    protected $fillable = ['name','description','measurement_unit','department_id','weight'];
    protected $casts = ['weight'=>'decimal:2'];
    public function department() { return $this->belongsTo(Department::class); }
}
