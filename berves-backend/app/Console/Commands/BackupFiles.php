<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Log;

class BackupFiles extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'backup:files';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Create a files backup';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting files backup...');

        try {
            Artisan::call('backup:run --only-files');
            
            $this->info('Files backup completed successfully!');
            Log::info('Files backup completed successfully');
            
            return 0;
        } catch (\Exception $e) {
            $this->error('Files backup failed: ' . $e->getMessage());
            Log::error('Files backup failed: ' . $e->getMessage());
            
            return 1;
        }
    }
}
