<?php

namespace App\Observers;

use App\Models\Produto;
use Illuminate\Support\Facades\DB;

class ProdutoObserver
{
    public function updating(Produto $produto): void
    {
        $camposModificados = $produto->getDirty();
        $camposAuditaveis = ['nome', 'descricao', 'codigo', 'preco', 'categoria_id'];

        foreach ($camposModificados as $campo => $valorNovo) {
            if (in_array($campo, $camposAuditaveis)) {
                $valorAntigo = $produto->getOriginal($campo);

                if ($campo === 'categoria_id') {
                    $campo = 'categoria_id';
                }

                DB::table('auditoria_produtos')->insert([
                    'produto_id' => $produto->id,
                    'campo_alterado' => $campo,
                    'valor_antigo' => $valorAntigo,
                    'valor_novo' => $valorNovo,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }
    }

    public function created(Produto $produto): void {}
    public function updated(Produto $produto): void {}
    public function deleted(Produto $produto): void {}
    public function restored(Produto $produto): void {}
    public function forceDeleted(Produto $produto): void {}
}
