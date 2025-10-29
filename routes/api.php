<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ClienteController;
use App\Http\Controllers\Api\CategoriaController;
use App\Http\Controllers\Api\ProdutoController;

Route::post('produtos/{produto}/movimentar-estoque', [ProdutoController::class, 'movimentarEstoque']);

Route::apiResource('clientes', ClienteController::class);
Route::apiResource('categorias', CategoriaController::class);
Route::apiResource('produtos', ProdutoController::class);

Route::middleware(['auth:sanctum'])->get('/user', function (Request $request) {
    return $request->user();
});
