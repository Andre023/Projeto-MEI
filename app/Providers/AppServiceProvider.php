<?php

namespace App\Providers;

use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;
use App\Models\Produto;       // <-- ADICIONAMOS ESTA LINHA
use App\Observers\ProdutoObserver; // <-- ADICIONAMOS ESTA LINHA

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
        Vite::prefetch(concurrency: 3);
        
        Produto::observe(ProdutoObserver::class); // <-- ADICIONAMOS ESTA LINHA
    }
}