<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('job_titles', function (Blueprint $table) {
            $table->id();
            $table->string('title', 200);
            $table->string('grade', 50)->nullable();
            $table->foreignId('department_id')->nullable()->constrained()->nullOnDelete();
        });
    }
    public function down(): void { Schema::dropIfExists('job_titles'); }
};
