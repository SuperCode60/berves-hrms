<?php

namespace App\Http\Controllers\Api\Employee;

use App\Http\Controllers\Controller;
use App\Models\Employee;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class ProfilePhotoController extends Controller
{
    /**
     * Upload or update employee profile photo
     */
    public function upload(Request $request, $employeeId)
    {
        $validator = Validator::make($request->all(), [
            'profile_photo' => 'required|image|mimes:jpeg,png,jpg,gif|max:5120', // Max 5MB
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $employee = Employee::findOrFail($employeeId);

        // Delete old photo if exists
        if ($employee->profile_photo) {
            Storage::disk('public')->delete('profile-photos/' . $employee->profile_photo);
        }

        $file = $request->file('profile_photo');
        $filename = $this->generateUniqueFilename($file, $employee);
        
        // Store the file
        $path = $file->storeAs('profile-photos', $filename, 'public');
        
        // Update employee record
        $employee->profile_photo = $filename;
        $employee->save();

        return response()->json([
            'message' => 'Profile photo uploaded successfully',
            'data' => [
                'profile_photo_url' => asset('storage/' . $path),
                'profile_photo' => $filename
            ]
        ]);
    }

    /**
     * Delete employee profile photo
     */
    public function destroy($employeeId)
    {
        $employee = Employee::findOrFail($employeeId);

        if ($employee->profile_photo) {
            // Delete file from storage
            Storage::disk('public')->delete('profile-photos/' . $employee->profile_photo);
            
            // Update employee record
            $employee->profile_photo = null;
            $employee->save();
        }

        return response()->json([
            'message' => 'Profile photo deleted successfully'
        ]);
    }

    /**
     * Generate unique filename for profile photo
     */
    private function generateUniqueFilename($file, $employee)
    {
        $extension = $file->getClientOriginalExtension();
        $employeeName = Str::slug($employee->first_name . '-' . $employee->last_name);
        $timestamp = time();
        $random = Str::random(6);
        
        return "{$employeeName}-{$timestamp}-{$random}.{$extension}";
    }

    /**
     * Get profile photo URL
     */
    public function show($employeeId)
    {
        $employee = Employee::findOrFail($employeeId);
        
        if ($employee->profile_photo) {
            return response()->json([
                'data' => [
                    'profile_photo_url' => $employee->profile_photo_url,
                    'profile_photo' => $employee->profile_photo
                ]
            ]);
        }

        return response()->json([
            'data' => [
                'profile_photo_url' => null,
                'profile_photo' => null
            ]
        ]);
    }
}
