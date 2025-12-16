<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Auth;
use Laravel\Scout\Searchable;

class Produto extends Model
{
    use HasFactory;
    use Searchable;

    protected $fillable = [
        'nome',
        'descricao',
        'preco',
        'preco_de_custo',
        'codigo',
        'subgrupo_id',
        'quantidade_estoque',
        'user_id',
    ];

    protected static function booted()
    {
        static::creating(function (Produto $produto) {
            if (Auth::check() && !$produto->user_id) {
                $produto->user_id = Auth::id();
            }
        });

        static::addGlobalScope('user', function (Builder $builder) {
            if (Auth::check()) {
                $builder->where('user_id', Auth::id());
            }
        });
    }

    public function subgrupo()
    {
        return $this->belongsTo(Subgrupo::class);
    }

    public function movimentacoes(): HasMany
    {
        return $this->hasMany(MovimentacaoEstoque::class);
    }

    public function auditorias(): HasMany
    {
        return $this->hasMany(AuditoriaProduto::class);
    }

    public function toSearchableArray()
    {
        return [
            'id' => $this->id,
            'nome' => $this->nome,
            'codigo' => $this->codigo,
            'descricao' => $this->descricao,
        ];
    }
}
