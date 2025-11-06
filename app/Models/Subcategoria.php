<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Auth;

class Subcategoria extends Model
{
    use HasFactory;

    protected $fillable = ['nome', 'user_id', 'categoria_id'];

    // Copiado do seu model Categoria antigo
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

    // Relacionamento: Subcategoria -> Categoria (Pai)
    public function categoria()
    {
        return $this->belongsTo(CategoriaArvore::class, 'categoria_id');
    }

    // Relacionamento: Subcategoria -> Grupos (Filhos)
    public function grupos()
    {
        return $this->hasMany(Grupo::class);
    }
}
