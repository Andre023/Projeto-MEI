<?php

namespace App\Providers;

use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;
use App\Models\Produto;
use App\Observers\ProdutoObserver;
use Illuminate\Support\Facades\URL;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // 🚨 CORREÇÃO: Força o Laravel a gerar todos os links com HTTPS
        URL::forceScheme('https');

        Vite::prefetch(concurrency: 3);

        Produto::observe(ProdutoObserver::class);
    }
}
