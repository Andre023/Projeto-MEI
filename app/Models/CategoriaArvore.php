<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Auth;

class CategoriaArvore extends Model
{
    use HasFactory;

    // Define o nome da tabela manualmente
    protected $table = 'categorias_arvore';

    protected $fillable = ['nome', 'user_id'];

    // Copiado do seu model Categoria antigo, para garantir que o user_id seja salvo
    protected static function booted()
    {
        static::creating(function ($model) {
            if (Auth::check() && !$model->user_id) {
                $model->user_id = Auth::id();
            }
        });

        static::addGlobalScope('user', function (Builder $builder) {
            if (Auth::check()) {
                $builder->where('user_id', Auth::id());
            }
        });
    }

    // Relacionamento: Categoria -> Subcategorias
    public function subcategorias()
    {
        return $this->hasMany(Subcategoria::class, 'categoria_id');
    }
}
