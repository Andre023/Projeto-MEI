<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MovimentacaoEstoque extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'produto_id',
        'tipo',
        'quantidade',
        'origem_id',
        'origem_tipo',
        'descricao',
    ];

    /**
     * Get the produto that owns the movimentacao.
     */
    public function produto(): BelongsTo
    {
        return $this->belongsTo(Produto::class);
    }
}