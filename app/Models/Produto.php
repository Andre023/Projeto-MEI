<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Produto extends Model
{
    protected $fillable = ['nome', 'descricao', 'codigo', 'categoria_id', 'preco'];

    public function categoria()
    {
        return $this->belongsTo(Categoria::class);
    }
}