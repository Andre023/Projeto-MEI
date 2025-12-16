<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Venda extends Model
{
  use HasFactory;

  protected $fillable = [
    'user_id',
    'cliente_id',
    'total_venda',
  ];

  /**
   * Define o relacionamento: Uma Venda pertence a um Usuário.
   */
  public function user(): BelongsTo
  {
    return $this->belongsTo(User::class);
  }

  /**
   * Define o relacionamento: Uma Venda pertence a um Cliente.
   */
  public function cliente(): BelongsTo
  {
    return $this->belongsTo(Cliente::class);
  }

  /**
   * Define o relacionamento: Uma Venda tem muitos Itens.
   */
  public function items(): HasMany
  {
    return $this->hasMany(VendaItem::class);
  }

  public function isVendaGrande(): bool
  {
    return $this->total_venda >= 1000.00;
  }
}
