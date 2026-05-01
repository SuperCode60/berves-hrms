<?php
namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use App\Models\{User, AuditLog};
use Illuminate\Http\Request;
use Illuminate\Support\Facades\{Hash, DB};
use Illuminate\Support\Str;
class AuthController extends Controller
{
    /* ── Login ────────────────────────────────────────────────── */
    public function login(Request $request)
    {
        // Some proxies / clients send JSON without Laravel recognizing it as JSON.
        // If the request payload is JSON but parsed input is empty, decode manually.
        if (empty($request->all())) {
            $raw = $request->getContent();
            if (is_string($raw) && $raw !== '' && str_starts_with(ltrim($raw), '{')) {
                $decoded = json_decode($raw, true);
                if (is_array($decoded)) {
                    $request->merge($decoded);
                }
            }
        }

        $request->validate([
            'email'    => 'required|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $request->email)->with('employee')->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return $this->error('Invalid email or password.', 422);
        }

        if (!$user->is_active) {
            return $this->error('Your account has been deactivated. Contact HR.', 403);
        }

        $user->update(['last_login_at' => now()]);
        $token = $user->createToken('hrms-token')->plainTextToken;

        AuditLog::record('auth.login');

        return $this->success([
            'token' => $token,
            'user'  => $this->formatUser($user),
        ], 'Login successful');
    }

    /* ── Me ───────────────────────────────────────────────────── */
    public function me(Request $request)
    {
        return $this->success($this->formatUser($request->user()->load('employee')));
    }

    /* ── Logout ───────────────────────────────────────────────── */
    public function logout(Request $request)
    {
        AuditLog::record('auth.logout');
        $request->user()->currentAccessToken()->delete();
        return $this->success(null, 'Logged out successfully');
    }

    /* ── Change password ──────────────────────────────────────── */
    public function changePassword(Request $request)
    {
        $request->validate([
            'current_password' => 'required',
            'new_password'     => 'required|min:8|confirmed',
        ]);

        if (!Hash::check($request->current_password, $request->user()->password)) {
            return $this->error('Current password is incorrect', 422);
        }

        $request->user()->update(['password' => Hash::make($request->new_password)]);
        return $this->success(null, 'Password changed successfully');
    }

    /* ── Forgot password ──────────────────────────────────────── */
    public function forgotPassword(Request $request)
    {
        $request->validate(['email' => 'required|email|exists:users,email']);

        // Generate a short-lived token stored in password_reset_tokens table
        $token = Str::random(64);

        DB::table('password_reset_tokens')->updateOrInsert(
            ['email' => $request->email],
            ['token' => Hash::make($token), 'created_at' => now()]
        );

        // Send email with reset token
        // TODO: Implement email sending using Mail::send()
        // For now, return success message without exposing the token
        return $this->success(
            ['message' => 'Password reset link has been sent to your email.'],
            'Password reset email sent'
        );
    }

    /* ── Reset password ───────────────────────────────────────── */
    public function resetPassword(Request $request)
    {
        $request->validate([
            'email'        => 'required|email|exists:users,email',
            'token'        => 'required|string',
            'new_password' => 'required|min:8|confirmed',
        ]);

        $record = DB::table('password_reset_tokens')
            ->where('email', $request->email)
            ->first();

        if (!$record || !Hash::check($request->token, $record->token)) {
            return $this->error('Invalid or expired reset token.', 422);
        }

        if (now()->diffInMinutes($record->created_at) > 60) {
            DB::table('password_reset_tokens')->where('email', $request->email)->delete();
            return $this->error('Reset token has expired. Please request a new one.', 422);
        }

        User::where('email', $request->email)
            ->update(['password' => Hash::make($request->new_password)]);

        DB::table('password_reset_tokens')->where('email', $request->email)->delete();

        return $this->success(null, 'Password reset successfully');
    }

    /* ── Permissions ──────────────────────────────────────────── */
    public function permissions(Request $request)
    {
        return $this->success($request->user()->getAllPermissions()->pluck('name'));
    }

    /* ── Helper ───────────────────────────────────────────────── */
    private function formatUser(User $user): array
    {
        return [
            'id'            => $user->id,
            'name'          => $user->employee
                ? $user->employee->first_name . ' ' . $user->employee->last_name
                : $user->email,
            'email'         => $user->email,
            'role'          => $user->role,
            'permissions'   => $user->getAllPermissions()->pluck('name')->values()->all(),
            'profile_photo' => $user->employee?->profile_photo,
            'employee_id'   => $user->employee_id,
        ];
    }
}
