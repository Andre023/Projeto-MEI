<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class ModifyProdutosForArvoreTable extends Migration
{
    public function up()
    {
        Schema::table('produtos', function (Blueprint $table) {
            // 1. Adicionar a nova coluna (como antes)
            $table->foreignId('subgrupo_id')->nullable()->constrained()->onDelete('set null');

            // 2. REMOVER A FOREIGN KEY ANTIGA (A CORREÇÃO ESTÁ AQUI)
            // Esta linha remove a "regra" da chave estrangeira.
            $table->dropForeign(['categoria_id']);

            // 3. Agora sim, remover a coluna antiga
            $table->dropColumn('categoria_id');
        });
    }

    public function down()
    {
        Schema::table('produtos', function (Blueprint $table) {
            $table->foreignId('categoria_id')->nullable(); // Recriar a coluna antiga

            $table->dropForeign(['subgrupo_id']);
            $table->dropColumn('subgrupo_id');
        });
    }
}
