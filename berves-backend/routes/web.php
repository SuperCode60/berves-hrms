<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

// Railway health check endpoints
Route::get('/up', function () {
    return response()->json(['status' => 'ok', 'timestamp' => now()]);
});

Route::get('/health', function () {
    return response()->json(['status' => 'healthy']);
});
