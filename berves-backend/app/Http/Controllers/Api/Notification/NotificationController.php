<?php

namespace App\Http\Controllers\Api\Notification;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    /**
     * List notifications for the authenticated user.
     * Employees see only their own; admin/hr see all.
     */
    public function index(Request $request)
    {
        $user  = $request->user();
        $query = Notification::query()
            ->when(
                !in_array($user->role, ['admin', 'hr']),  // ✅ Fixed: role is a string
                fn($q) => $q->where('user_id', $user->id)
            )
            ->when($request->unread_only, fn($q) => $q->whereNull('read_at'))
            ->when($request->type,        fn($q, $t) => $q->where('type', $t))
            ->latest();

        $perPage = min($request->integer('per_page', 20), 100);

        return $this->paginated($query, $perPage);
    }

    /**
     * Return unread count for the navbar badge (current user only).
     */
    public function unreadCount(Request $request)
    {
        $count = Notification::where('user_id', $request->user()->id)
            ->whereNull('read_at')
            ->count();

        return $this->success(['count' => $count], 'Unread count');
    }

    /**
     * Mark a single notification as read.
     */
    public function markRead(Request $request, Notification $notification)
    {
        $this->authorizeOwnerOrAdmin($request, $notification);

        $notification->update(['read_at' => now()]);

        return $this->success($notification, 'Notification marked as read');
    }

    /**
     * Mark ALL notifications for the current user as read.
     */
    public function markAllRead(Request $request)
    {
        Notification::where('user_id', $request->user()->id)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return $this->success([], 'All notifications marked as read');
    }

    /**
     * Delete a notification (owner or admin only).
     */
    public function destroy(Request $request, Notification $notification)
    {
        $this->authorizeOwnerOrAdmin($request, $notification);

        $notification->delete();

        return $this->success([], 'Notification deleted', 200);
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private function authorizeOwnerOrAdmin(Request $request, Notification $notification): void
    {
        $user = $request->user();
        if (
            $notification->user_id !== $user->id &&
            !in_array($user->role, ['admin', 'hr'])  // ✅ Fixed: role is a string
        ) {
            abort(403, 'You do not have access to this notification.');
        }
    }
}