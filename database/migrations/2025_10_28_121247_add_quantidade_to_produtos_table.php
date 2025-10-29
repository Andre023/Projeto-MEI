<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Use o nome da classe que o artisan criou para você
class AddQuantidadeToProdutosTable extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('produtos', function (Blueprint $table) {
            // Adiciona a coluna de quantidade atual, com valor padrão 0
            $table->integer('quantidade_estoque')->default(0)->after('preco');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('produtos', function (Blueprint $table) {
            $table->dropColumn('quantidade_estoque');
        });
    }
};
