<?php
namespace App\Http\Controllers\Api\Settings;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\{DB, File, Artisan, Storage, Log};
use Carbon\Carbon;
use ZipArchive;

class BackupController extends Controller
{
    private string $backupPath;

    public function __construct()
    {
        $this->backupPath = storage_path('app/backups');
        File::ensureDirectoryExists($this->backupPath);
    }

    /** List all available backup files. */
    public function index(): \Illuminate\Http\JsonResponse
    {
        $files = File::files($this->backupPath);

        $backups = collect($files)
            ->filter(fn($f) => str_ends_with($f->getFilename(), '.zip'))
            ->map(fn($f) => [
                'filename'   => $f->getFilename(),
                'size_bytes' => $f->getSize(),
                'size_human' => $this->formatBytes($f->getSize()),
                'created_at' => Carbon::createFromTimestamp($f->getMTime())->toISOString(),
                'type'       => str_contains($f->getFilename(), 'auto') ? 'automatic' : 'manual',
            ])
            ->sortByDesc('created_at')
            ->values();

        return $this->success($backups, 'Backups listed');
    }

    /** Create a fresh backup of the database (SQL dump) + settings. */
    public function create(Request $request): \Illuminate\Http\JsonResponse
    {
        try {
            $timestamp = Carbon::now()->format('Y-m-d_H-i-s');
            $prefix    = $request->get('type', 'manual');
            $filename  = "berves_hrms_{$prefix}_{$timestamp}.zip";
            $zipPath   = $this->backupPath . '/' . $filename;

            $zip = new ZipArchive();
            if ($zip->open($zipPath, ZipArchive::CREATE) !== true) {
                return $this->error('Could not create backup archive.');
            }

            // ── 1. SQL dump ──────────────────────────────────────────
            $sqlDump = $this->generateSqlDump();
            $zip->addFromString("database_{$timestamp}.sql", $sqlDump);

            // ── 2. Settings JSON ─────────────────────────────────────
            $settings = DB::table('system_settings')->get()->toJson(JSON_PRETTY_PRINT);
            $zip->addFromString('settings.json', $settings);

            // ── 3. Manifest ──────────────────────────────────────────
            $manifest = json_encode([
                'app'         => 'Berves Engineering HRMS',
                'version'     => '2.0',
                'created_at'  => now()->toISOString(),
                'created_by'  => auth()->user()?->name ?? 'system',
                'db_tables'   => $this->getTableList(),
                'type'        => $prefix,
            ], JSON_PRETTY_PRINT);
            $zip->addFromString('manifest.json', $manifest);

            $zip->close();

            // Auto-prune: keep last 10 manual + 5 automatic
            $this->pruneOldBackups($prefix);

            return $this->success([
                'filename'   => $filename,
                'size_human' => $this->formatBytes(filesize($zipPath)),
                'created_at' => now()->toISOString(),
            ], 'Backup created successfully');
        } catch (\Throwable $e) {
            Log::error('Backup failed: ' . $e->getMessage());
            return $this->error('Backup failed: ' . $e->getMessage());
        }
    }

    /** Download a backup file. */
    public function download(string $filename)
    {
        // Sanitise filename — no path traversal
        $filename = basename($filename);
        $path     = $this->backupPath . '/' . $filename;

        if (!File::exists($path) || !str_ends_with($filename, '.zip')) {
            abort(404, 'Backup file not found.');
        }

        return response()->download($path, $filename, [
            'Content-Type' => 'application/zip',
        ]);
    }

    /** Restore from an uploaded backup zip. */
    public function restore(Request $request): \Illuminate\Http\JsonResponse
    {
        $request->validate([
            'backup' => 'required|file|mimes:zip|max:102400',
        ]);

        try {
            $file = $request->file('backup');
            $zip  = new ZipArchive();

            if ($zip->open($file->getRealPath()) !== true) {
                return $this->error('Invalid or corrupted backup file.');
            }

            // Verify manifest
            $manifestJson = $zip->getFromName('manifest.json');
            if (!$manifestJson) {
                $zip->close();
                return $this->error('Not a valid Berves HRMS backup — manifest missing.');
            }
            $manifest = json_decode($manifestJson, true);
            if (($manifest['app'] ?? '') !== 'Berves Engineering HRMS') {
                $zip->close();
                return $this->error('Backup is not from Berves Engineering HRMS.');
            }

            // ── Auto-backup before restoring ─────────────────────────
            $this->createSafetyBackup();

            // ── Restore SQL ──────────────────────────────────────────
            $sqlFiles = [];
            for ($i = 0; $i < $zip->numFiles; $i++) {
                $name = $zip->getNameIndex($i);
                if (str_ends_with($name, '.sql')) {
                    $sqlFiles[] = $name;
                }
            }

            if (empty($sqlFiles)) {
                $zip->close();
                return $this->error('No SQL file found in backup archive.');
            }

            $sql = $zip->getFromName($sqlFiles[0]);
            $zip->close();

            // Execute SQL statements
            DB::unprepared($sql);

            return $this->success([
                'restored_from' => $manifest['created_at'] ?? 'unknown',
                'version'       => $manifest['version'] ?? 'unknown',
            ], 'System restored successfully. Please log in again.');
        } catch (\Throwable $e) {
            Log::error('Restore failed: ' . $e->getMessage());
            return $this->error('Restore failed: ' . $e->getMessage());
        }
    }

    /** Delete a backup file. */
    public function destroy(string $filename): \Illuminate\Http\JsonResponse
    {
        $filename = basename($filename);
        $path     = $this->backupPath . '/' . $filename;

        if (!File::exists($path)) {
            return $this->error('Backup file not found.', 404);
        }

        File::delete($path);
        return $this->success([], 'Backup deleted');
    }

    /** System health check. */
    public function systemHealth(): \Illuminate\Http\JsonResponse
    {
        $checks = [];

        // DB connectivity
        try {
            DB::connection()->getPdo();
            $checks['database'] = ['status' => 'ok', 'label' => 'Database Connection'];
        } catch (\Exception $e) {
            $checks['database'] = ['status' => 'error', 'label' => 'Database Connection', 'detail' => $e->getMessage()];
        }

        // Storage writable
        $checks['storage'] = File::isWritable(storage_path('app'))
            ? ['status' => 'ok',    'label' => 'Storage Writable']
            : ['status' => 'error', 'label' => 'Storage Writable'];

        // Cache
        try {
            cache()->put('health_check', true, 5);
            $ok = cache()->get('health_check');
            $checks['cache'] = $ok ? ['status' => 'ok', 'label' => 'Cache'] : ['status' => 'warn', 'label' => 'Cache'];
        } catch (\Exception $e) {
            $checks['cache'] = ['status' => 'error', 'label' => 'Cache', 'detail' => $e->getMessage()];
        }

        // Queue (check failed_jobs table size)
        try {
            $failed = DB::table('failed_jobs')->count();
            $checks['queue'] = [
                'status' => $failed > 10 ? 'warn' : 'ok',
                'label'  => 'Queue',
                'detail' => "{$failed} failed jobs",
            ];
        } catch (\Exception $e) {
            $checks['queue'] = ['status' => 'warn', 'label' => 'Queue', 'detail' => 'Table not found'];
        }

        // Backup freshness
        $files   = File::files($this->backupPath);
        $lastBak = collect($files)->filter(fn($f) => str_ends_with($f->getFilename(), '.zip'))
            ->max(fn($f) => $f->getMTime());
        if ($lastBak) {
            $age = Carbon::createFromTimestamp($lastBak)->diffInDays();
            $checks['backup'] = [
                'status' => $age > 7 ? 'warn' : 'ok',
                'label'  => 'Last Backup',
                'detail' => Carbon::createFromTimestamp($lastBak)->diffForHumans(),
            ];
        } else {
            $checks['backup'] = ['status' => 'warn', 'label' => 'Last Backup', 'detail' => 'No backup found'];
        }

        // Disk space
        $free  = disk_free_space(storage_path());
        $total = disk_total_space(storage_path());
        $usedPct = $total > 0 ? round(($total - $free) / $total * 100) : 0;
        $checks['disk'] = [
            'status' => $usedPct > 90 ? 'error' : ($usedPct > 75 ? 'warn' : 'ok'),
            'label'  => 'Disk Space',
            'detail' => "{$usedPct}% used — " . $this->formatBytes($free) . ' free',
        ];

        $overallOk = !collect($checks)->contains(fn($c) => $c['status'] === 'error');

        return $this->success([
            'overall' => $overallOk ? 'healthy' : 'degraded',
            'checks'  => $checks,
            'checked_at' => now()->toISOString(),
        ]);
    }

    /** Clear application cache. */
    public function clearCache(): \Illuminate\Http\JsonResponse
    {
        Artisan::call('cache:clear');
        Artisan::call('config:clear');
        Artisan::call('view:clear');
        return $this->success([], 'Cache cleared successfully');
    }

    /* ── Private helpers ─────────────────────────────────────────────── */
    private function generateSqlDump(): string
    {
        $tables = $this->getTableList();
        $sql    = "-- Berves Engineering HRMS Database Dump\n";
        $sql   .= "-- Generated: " . now()->toISOString() . "\n\n";
        $sql   .= "SET FOREIGN_KEY_CHECKS=0;\n\n";

        foreach ($tables as $table) {
            try {
                // Table structure
                $createResult = DB::select("SHOW CREATE TABLE `{$table}`");
                $createSql    = $createResult[0]->{'Create Table'} ?? '';
                $sql .= "DROP TABLE IF EXISTS `{$table}`;\n";
                $sql .= $createSql . ";\n\n";

                // Data
                $rows = DB::table($table)->get();
                if ($rows->isEmpty()) continue;

                $cols   = array_keys((array) $rows->first());
                $colStr = '`' . implode('`,`', $cols) . '`';
                $sql   .= "INSERT INTO `{$table}` ({$colStr}) VALUES\n";

                $values = $rows->map(function ($row) {
                    $vals = array_map(function ($v) {
                        if ($v === null) return 'NULL';
                        return "'" . addslashes((string) $v) . "'";
                    }, (array) $row);
                    return '(' . implode(',', $vals) . ')';
                })->implode(",\n");

                $sql .= $values . ";\n\n";
            } catch (\Throwable) {
                continue; // skip tables we can't read
            }
        }

        $sql .= "SET FOREIGN_KEY_CHECKS=1;\n";
        return $sql;
    }

    private function getTableList(): array
    {
        return collect(DB::select('SHOW TABLES'))
            ->map(fn($t) => array_values((array) $t)[0])
            ->toArray();
    }

    private function createSafetyBackup(): void
    {
        try {
            $timestamp = Carbon::now()->format('Y-m-d_H-i-s');
            $path      = $this->backupPath . "/berves_hrms_pre_restore_{$timestamp}.zip";
            $zip       = new ZipArchive();
            if ($zip->open($path, ZipArchive::CREATE) === true) {
                $zip->addFromString('database.sql', $this->generateSqlDump());
                $zip->addFromString('manifest.json', json_encode([
                    'app' => 'Berves Engineering HRMS', 'version' => '2.0',
                    'created_at' => now()->toISOString(), 'type' => 'pre_restore',
                ]));
                $zip->close();
            }
        } catch (\Throwable) { /* non-fatal */ }
    }

    private function pruneOldBackups(string $type): void
    {
        $keep  = $type === 'manual' ? 10 : 5;
        $files = collect(File::files($this->backupPath))
            ->filter(fn($f) => str_contains($f->getFilename(), $type) && str_ends_with($f->getFilename(), '.zip'))
            ->sortByDesc(fn($f) => $f->getMTime())
            ->slice($keep);

        foreach ($files as $f) File::delete($f->getPathname());
    }

    private function formatBytes(int $bytes): string
    {
        if ($bytes >= 1_073_741_824) return round($bytes / 1_073_741_824, 2) . ' GB';
        if ($bytes >= 1_048_576)     return round($bytes / 1_048_576, 2) . ' MB';
        if ($bytes >= 1_024)         return round($bytes / 1_024, 2) . ' KB';
        return $bytes . ' B';
    }
}
