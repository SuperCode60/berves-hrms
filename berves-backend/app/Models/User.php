<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;
use Spatie\Permission\Traits\HasPermissions;

class User extends Authenticatable
{
    use HasApiTokens, HasRoles, HasPermissions, Notifiable;

    protected $fillable = [
        'name',
        'email', 
        'password', 
        'is_active', 
        'last_login_at',
    ];

    protected $hidden = ['password', 'remember_token'];

    protected $casts = [
        'is_active' => 'boolean',
        'last_login_at' => 'datetime',
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
    ];

    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }

    /**
     * Get user's full name from employee relationship.
     */
    public function getNameAttribute(): string
    {
        if ($this->employee) {
            return $this->employee->first_name . ' ' . $this->employee->last_name;
        }
        
        return $this->name;
    }

    /**
     * Get user's profile photo URL from employee relationship.
     */
    public function getProfilePhotoUrlAttribute(): ?string
    {
        if ($this->employee && $this->employee->profile_photo) {
            return asset('storage/profile-photos/' . $this->employee->profile_photo);
        }
        
        return null;
    }
}