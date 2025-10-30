<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Produto extends Model
{
    use HasFactory;

    protected $fillable = [
        'nome',
        'descricao',
        'preco',
        'codigo',
        'categoria_id',
        'quantidade_estoque',
    ];

    /**
     * Define o relacionamento: um produto pertence a uma categoria.
     */
    public function categoria(): BelongsTo
    {
        return $this->belongsTo(Categoria::class);
    }

    /**
     * Define o relacionamento: um produto tem muitas movimentações de estoque.
     * (Mantendo o nome 'movimentacoes' como está no seu arquivo)
     */
    public function movimentacoes(): HasMany
    {
        return $this->hasMany(MovimentacaoEstoque::class);
    }

    /**
     * Define o relacionamento: um produto tem muitas auditorias de alteração.
     */
    public function auditorias(): HasMany
    {
        return $this->hasMany(AuditoriaProduto::class);
    }
}