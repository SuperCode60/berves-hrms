<?php
namespace App\Services;

use App\Models\{User, Notification};
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class NotificationService
{
    public function send(User $user, string $title, string $body, string $channel = 'database'): void
    {
        Notification::create([
            'user_id' => $user->id,
            'type'    => 'general',
            'channel' => $channel,
            'title'   => $title,
            'body'    => $body,
        ]);

        if ($channel === 'email') {
            $this->sendEmail($user->email, $title, $body);
        }

        if ($channel === 'sms' && $user->employee?->phone) {
            $this->sendSms($user->employee->phone, $body);
        }
    }

    public function notifyLeaveReview(User $employee, string $status, string $leaveType): void
    {
        $this->send($employee, "Leave Request {$status}", "Your {$leaveType} request has been {$status}.", 'database');
    }

    public function notifyPayslipReady(User $employee, string $period): void
    {
        $this->send($employee, 'Payslip Ready', "Your payslip for {$period} is now available.", 'database');
    }

    public function notifyCertExpiry(User $employee, string $programName, string $expiryDate): void
    {
        $this->send($employee, 'Certification Expiring', "Your {$programName} certification expires on {$expiryDate}. Please renew.", 'email');
    }

    private function sendEmail(string $email, string $subject, string $body): void
    {
        try {
            Mail::raw($body, fn($m) => $m->to($email)->subject($subject));
        } catch (\Exception $e) {
            Log::error("Email failed to {$email}: " . $e->getMessage());
        }
    }

    private function sendSms(string $phone, string $message): void
    {
        try {
            $apiKey   = config('services.sms.api_key');
            $senderId = config('services.sms.sender_id');
            if (!$apiKey) return;

            \Http::post('https://sms.arkesel.com/api/v2/sms/send', [
                'sender'     => $senderId,
                'message'    => $message,
                'recipients' => [$phone],
            ], ['headers' => ['api-key' => $apiKey]]);
        } catch (\Exception $e) {
            Log::error("SMS failed to {$phone}: " . $e->getMessage());
        }
    }
}