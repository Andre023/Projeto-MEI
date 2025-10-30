<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AuditoriaProduto extends Model
{
    use HasFactory;

    /**
     * A tabela associada ao modelo.
     * @var string
     */
    protected $table = 'auditoria_produtos';

    /**
     * Os atributos que podem ser preenchidos em massa.
     * @var array
     */
    protected $fillable = [
        'produto_id',
        'campo_alterado',
        'valor_antigo',
        'valor_novo',
    ];

    /**
     * Define o relacionamento inverso: uma auditoria pertence a um produto.
     */
    public function produto(): BelongsTo
    {
        return $this->belongsTo(Produto::class);
    }
}