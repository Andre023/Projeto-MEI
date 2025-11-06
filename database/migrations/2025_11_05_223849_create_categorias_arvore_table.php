<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateCategoriasArvoreTable extends Migration
{
    public function up()
    {
        Schema::create('categorias_arvore', function (Blueprint $table) {
            $table->id();
            $table->string('nome', 100);
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('categorias_arvore');
    }
}
