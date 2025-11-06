<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateSubgruposTable extends Migration
{
    public function up()
    {
        Schema::create('subgrupos', function (Blueprint $table) {
            $table->id();
            $table->string('nome', 100);
            $table->foreignId('grupo_id')->constrained()->onDelete('cascade'); // Link para a tabela 'pai'
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('subgrupos');
    }
}
