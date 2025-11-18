<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class VendaItem extends Model
{
  use HasFactory;

  // A tabela é 'venda_items' (plural)
  protected $table = 'venda_items';

  protected $fillable = [
    'venda_id',
    'produto_id',
    'quantidade',
    'preco_unitario',
  ];

  /**
   * Define o relacionamento: Um Item pertence a uma Venda.
   */
  public function venda(): BelongsTo
  {
    return $this->belongsTo(Venda::class);
  }

  /**
   * Define o relacionamento: Um Item refere-se a um Produto.
   */
  public function produto(): BelongsTo
  {
    return $this->belongsTo(Produto::class);
  }
}
