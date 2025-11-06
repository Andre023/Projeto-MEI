<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Auth;

class Grupo extends Model
{
    use HasFactory;

    protected $fillable = ['nome', 'user_id', 'subcategoria_id'];

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

    // Relacionamento: Grupo -> Subcategoria (Pai)
    public function subcategoria()
    {
        return $this->belongsTo(Subcategoria::class);
    }

    // Relacionamento: Grupo -> Subgrupos (Filhos)
    public function subgrupos()
    {
        return $this->hasMany(Subgrupo::class);
    }
}
