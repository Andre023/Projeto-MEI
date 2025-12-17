<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\URL; // Não se esqueça de importar a classe URL

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        // 🚨 SOLUÇÃO PARA O ERRO MIXED CONTENT NO RAILWAY/RENDER
        if (config('app.env') === 'production') {
            URL::forceScheme('https');
        }
    }
}
