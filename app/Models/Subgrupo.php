<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Auth;

class Subgrupo extends Model
{
    use HasFactory;

    protected $fillable = ['nome', 'user_id', 'grupo_id'];

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

    // Relacionamento: Subgrupo -> Grupo (Pai)
    public function grupo()
    {
        return $this->belongsTo(Grupo::class);
    }

    // Relacionamento: Subgrupo -> Produtos (Filhos)
    public function produtos()
    {
        return $this->hasMany(Produto::class);
    }
}
