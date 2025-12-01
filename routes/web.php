<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

use App\Http\Controllers\Api\ArvoreController;
use App\Http\Controllers\Api\ClienteController;
use App\Http\Controllers\Api\ProdutoController;
use App\Http\Controllers\Api\VendaController;
use App\Http\Controllers\Api\EstatisticaController;

use App\Models\Cliente;
use Illuminate\Support\Facades\Auth;


Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

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

    Route::get('/vendas', function () {
        return Inertia::render('Vendas');
    })->name('vendas');

    // Rota da Página de Estatísticas
    Route::get('/estatisticas', function () {
        return Inertia::render('Estatisticas');
    })->name('estatisticas');

    Route::get('/vendas/nova', function () {
        $clientes = Cliente::where('user_id', Auth::id())->get();
        return Inertia::render('Vendas/Create', [
            'clientes' => $clientes,
            'produtos' => []
        ]);
    })->name('vendas.create');

    // --- ROTAS DE PERFIL ---
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // --- API (JSON) ---
    Route::prefix('api')->group(function () {
        Route::apiResource('clientes', ClienteController::class);

        // Rotas de Produto
        Route::post('produtos/{produto}/estoque', [ProdutoController::class, 'movimentarEstoque']);
        Route::get('produtos/{produto}/historico', [ProdutoController::class, 'historico']);
        Route::apiResource('produtos', ProdutoController::class);

        // Rotas da Árvore de Categorias
        Route::apiResource('arvore', ArvoreController::class);

        // Rotas de Venda
        Route::apiResource('vendas', VendaController::class);

        // Rota de Dados das Estatísticas (Faltava esta!)
        Route::get('/estatisticas', [EstatisticaController::class, 'index']);

        Route::get('/estatisticas/produto/{id}', [EstatisticaController::class, 'produto']);
    });
});

require __DIR__ . '/auth.php';
