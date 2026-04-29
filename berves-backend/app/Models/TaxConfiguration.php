<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class TaxConfiguration extends Model
{
    protected $fillable = ['bracket_name','min_amount','max_amount','rate_percent','effective_from','effective_to'];
    protected $casts = ['min_amount'=>'decimal:2','max_amount'=>'decimal:2','rate_percent'=>'decimal:2','effective_from'=>'date','effective_to'=>'date'];
}
