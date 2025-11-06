<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// --- 1. IMPORTE OS CONTROLLERS DA API CORRETAMENTE ---
use App\Http\Controllers\Api\ArvoreController;
use App\Http\Controllers\Api\ClienteController;
use App\Http\Controllers\Api\ProdutoController;


Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

// --- 2. COLOQUE TODAS AS ROTAS AUTENTICADAS EM UM ÚNICO GRUPO ---
Route::middleware(['auth', 'verified'])->group(function () {

    // --- ROTAS DAS PÁGINAS (INERTIA) ---
    Route::get('/dashboard', function () {
        return Inertia::render('Dashboard');
    })->name('dashboard');

    Route::get('/clientes', function () {
        return Inertia::render('Clientes');
    })->name('clientes');

    Route::get('/arvore', function () {
        return Inertia::render('Arvore');
    })->name('arvore');

    Route::get('/produtos', function () {
        return Inertia::render('Produtos');
    })->name('produtos');

    // --- ROTAS DE PERFIL ---
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // --- 3. ADICIONE AS ROTAS DA API AQUI DENTRO ---
    // (Isto fará com que o Auth::check() funcione para elas)
    Route::prefix('api')->group(function () {
        Route::apiResource('clientes', ClienteController::class);

        // Rotas de Produto
        Route::post('produtos/{produto}/estoque', [ProdutoController::class, 'movimentarEstoque']);
        Route::get('produtos/{produto}/historico', [ProdutoController::class, 'historico']);
        Route::apiResource('produtos', ProdutoController::class);

        // Rotas da Árvore de Categorias
        Route::get('arvore', [ArvoreController::class, 'index']);
        Route::post('arvore', [ArvoreController::class, 'store']);
        Route::put('arvore/{id}', [ArvoreController::class, 'update']);
        Route::delete('arvore/{id}', [ArvoreController::class, 'destroy']);
    });
}); // --- FIM DO GRUPO 'auth' ---


require __DIR__ . '/auth.php';
