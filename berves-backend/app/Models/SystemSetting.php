<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SystemSetting extends Model
{
    protected $table      = 'system_settings';
    protected $primaryKey = 'key';
    public    $incrementing = false;
    protected $keyType    = 'string';

    public    $timestamps = false;

    protected $fillable = ['key','value','description','group','updated_by','updated_at'];

    public static function get(string $key, mixed $default = null): mixed
    {
        return static::find($key)?->value ?? $default;
    }

    public static function set(string $key, mixed $value, ?int $userId = null): void
    {
        static::updateOrCreate(
            ['key'  => $key],
            ['value'=> $value, 'updated_by' => $userId, 'updated_at' => now()]
        );
    }
}
