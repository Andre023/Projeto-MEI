<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\CategoriaArvore;
use App\Models\Subcategoria;
use App\Models\Grupo;
use App\Models\Subgrupo;
use Illuminate\Support\Facades\Auth;

class ArvoreController extends Controller
{
    /**
     * Retorna a árvore de categorias completa.
     */
    public function index()
    {
        $arvore = CategoriaArvore::with([
            'subcategorias.grupos.subgrupos'
        ])
            ->where('user_id', Auth::id()) // Garante que só puxe do usuário
            ->get();

        return response()->json($arvore);
    }

    /**
     * Armazena um novo nó (Categoria, Subcategoria, Grupo, ou Subgrupo).
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'nome' => 'required|string|max:100',
            'tipo' => 'required|string|in:categoria,subcategoria,grupo,subgrupo',
            'parent_id' => 'nullable|integer'
        ]);

        $model = null;

        switch ($data['tipo']) {
            case 'categoria':
                $model = CategoriaArvore::create($data);
                break;
            case 'subcategoria':
                $data['categoria_id'] = $data['parent_id'];
                $model = Subcategoria::create($data);
                break;
            case 'grupo':
                $data['subcategoria_id'] = $data['parent_id'];
                $model = Grupo::create($data);
                break;
            case 'subgrupo':
                $data['grupo_id'] = $data['parent_id'];
                $model = Subgrupo::create($data);
                break;
        }

        return response()->json($model, 201);
    }

    /**
     * Atualiza um nó.
     */
    public function update(Request $request, $id)
    {
        $data = $request->validate([
            'nome' => 'required|string|max:100',
            'tipo' => 'required|string|in:categoria,subcategoria,grupo,subgrupo',
        ]);

        $model = $this->findModel($data['tipo'], $id);
        $model->update($data);

        return response()->json($model);
    }

    /**
     * Remove um nó.
     */
    public function destroy(Request $request, $id)
    {
        $data = $request->validate([
            'tipo' => 'required|string|in:categoria,subcategoria,grupo,subgrupo',
        ]);

        $model = $this->findModel($data['tipo'], $id);
        $model->delete(); // O 'onDelete('cascade')' nas migrations cuidará dos filhos

        return response()->json(null, 204);
    }

    /**
     * Helper para encontrar o model correto.
     */
    private function findModel($tipo, $id)
    {
        switch ($tipo) {
            case 'categoria':
                return CategoriaArvore::findOrFail($id);
            case 'subcategoria':
                return Subcategoria::findOrFail($id);
            case 'grupo':
                return Grupo::findOrFail($id);
            case 'subgrupo':
                return Subgrupo::findOrFail($id);
        }
        throw new \Exception("Tipo de modelo inválido");
    }
}
