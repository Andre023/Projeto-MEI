<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// O nome da classe não importa, mas o conteúdo sim
class CreateMovimentacoesEstoqueTable extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // CORREÇÃO: O nome da tabela deve ser 'movimentacao_estoques' (plural de MovimentacaoEstoque)
        Schema::create('movimentacao_estoques', function (Blueprint $table) {
            $table->id();
            $table->foreignId('produto_id')->constrained('produtos')->onDelete('cascade');
            
            // 'entrada' (compra, devolução) ou 'saida' (venda, perda)
            $table->enum('tipo', ['entrada', 'saida']); 
            
            // A quantidade que mudou (sempre positiva)
            $table->integer('quantidade'); 
            
            // Opcional: para ligar a movimentação a uma venda ou compra
            $table->unsignedBigInteger('origem_id')->nullable();
            $table->string('origem_tipo')->nullable(); // Ex: 'App\Models\Venda'

            $table->text('descricao')->nullable(); // Ex: "Venda #1" ou "Compra fornecedor X"
            $table->timestamps(); // Registra *quando* a movimentação ocorreu
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // CORREÇÃO: O nome aqui também deve bater com o de cima
        Schema::dropIfExists('movimentacao_estoques');
    }
};

