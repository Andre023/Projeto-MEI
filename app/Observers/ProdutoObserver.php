<?php

namespace App\Observers;

use App\Models\Produto;
use Illuminate\Support\Facades\DB; // <-- IMPORTANTE: Adicionamos isso

class ProdutoObserver
{
    /**
     * Handle the Produto "updating" event.
     * Este método é chamado ANTES do 'update' ser salvo no banco.
     */
    public function updating(Produto $produto): void
    {
        // Pega todos os campos que foram modificados
        $camposModificados = $produto->getDirty();

        // Lista dos campos que queremos auditar
        $camposAuditaveis = ['nome', 'descricao', 'codigo', 'preco', 'categoria_id'];

        foreach ($camposModificados as $campo => $valorNovo) {
            // Só registra se for um dos campos que nos interessam
            if (in_array($campo, $camposAuditaveis)) {
                
                // Pega o valor antigo
                $valorAntigo = $produto->getOriginal($campo);

                // No caso da categoria, queremos o NOME, não o ID
                if ($campo === 'categoria_id') {
                    $campo = 'categoria'; // Muda o nome do campo no log
                    $valorAntigo = DB::table('categorias')->find($valorAntigo)?->categoria ?? 'N/A';
                    $valorNovo = DB::table('categorias')->find($valorNovo)?->categoria ?? 'N/A';
                }

                // Insere na tabela de auditoria
                DB::table('auditoria_produtos')->insert([
                    'produto_id' => $produto->id,
                    'campo_alterado' => $campo,
                    'valor_antigo' => $valorAntigo,
                    'valor_novo' => $valorNovo,
                    'created_at' => now(), // Registra a data e hora
                    'updated_at' => now(), // Registra a data e hora
                ]);
            }
        }
    }

    /* Os outros métodos (created, deleted, etc.) podem ficar aqui
       mas não precisamos mexer neles por enquanto.
    */
    public function created(Produto $produto): void {}
    public function updated(Produto $produto): void {}
    public function deleted(Produto $produto): void {}
    public function restored(Produto $produto): void {}
    public function forceDeleted(Produto $produto): void {}
}