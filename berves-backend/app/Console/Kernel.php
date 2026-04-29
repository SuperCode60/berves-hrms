<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    /**
     * Define the application's command schedule.
     */
    protected function schedule(Schedule $schedule): void
    {
        // Daily database backup at 2 AM
        $schedule->command('backup:database')
            ->dailyAt('02:00')
            ->timezone('Africa/Accra')
            ->withoutOverlapping()
            ->runInBackground();

        // Weekly files backup on Sundays at 3 AM
        $schedule->command('backup:files')
            ->weekly()
            ->sundays()
            ->at('03:00')
            ->timezone('Africa/Accra')
            ->withoutOverlapping()
            ->runInBackground();

        // Full backup weekly on Sundays at 4 AM
        $schedule->command('backup:run')
            ->weekly()
            ->sundays()
            ->at('04:00')
            ->timezone('Africa/Accra')
            ->withoutOverlapping()
            ->runInBackground();

        // Cleanup old backups daily at 5 AM
        $schedule->command('backup:clean')
            ->dailyAt('05:00')
            ->timezone('Africa/Accra')
            ->withoutOverlapping()
            ->runInBackground();

        // Monitor backup health daily at 6 AM
        $schedule->command('backup:monitor')
            ->dailyAt('06:00')
            ->timezone('Africa/Accra')
            ->withoutOverlapping()
            ->runInBackground();
    }

    /**
     * Register the commands for the application.
     */
    protected function commands(): void
    {
        $this->load(__DIR__.'/Commands');

        require base_path('routes/console.php');
    }
}
