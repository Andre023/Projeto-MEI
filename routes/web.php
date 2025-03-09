<?php

use App\Http\Controllers\ClienteController;
use App\Http\Controllers\CategoriaController;
use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', function () {
        return Inertia::render('Dashboard');
    })->name('dashboard');
});

// rota para clientes
Route::get('/clientes', function () {
    return Inertia::render('Clientes');
})->middleware(['auth', 'verified'])->name('clientes');

// rota para categorias
Route::get('/categorias', function () {
    return Inertia::render('Categorias');
})->middleware(['auth', 'verified'])->name('categorias');

// rota para produtos
Route::get('/produtos', function () {
    return Inertia::render('Produtos');
})->middleware(['auth', 'verified'])->name('produtos');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});


require __DIR__.'/auth.php';
