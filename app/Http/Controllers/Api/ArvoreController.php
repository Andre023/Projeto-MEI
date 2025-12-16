<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\CategoriaArvore;
use App\Models\Subcategoria;
use App\Models\Grupo;
use App\Models\Subgrupo;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;

class ArvoreController extends Controller
{
    /**
     * Retorna a árvore de categorias completa.
     */
    public function index()
    {
        $userId = Auth::id();
        $cacheKey = "arvore.user_{$userId}";

        $arvore = Cache::remember($cacheKey, 60 * 60, function () {
            return CategoriaArvore::with([
                'subcategorias.grupos.subgrupos'
            ])->get();
        });

        return response()->json($arvore);
    }

    /**
     * Helper para limpar o cache do usuário atual
     */
    private function clearCache()
    {
        $userId = Auth::id();
        Cache::forget("arvore.user_{$userId}");
    }

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

        $this->clearCache();

        return response()->json($model, 201);
    }

    public function update(Request $request, $id)
    {
        $data = $request->validate([
            'nome' => 'required|string|max:100',
            'tipo' => 'required|string|in:categoria,subcategoria,grupo,subgrupo',
        ]);

        $model = $this->findModel($data['tipo'], $id);
        $model->update($data);

        $this->clearCache();

        return response()->json($model);
    }

    public function destroy(Request $request, $id)
    {
        $data = $request->validate([
            'tipo' => 'required|string|in:categoria,subcategoria,grupo,subgrupo',
        ]);

        $model = $this->findModel($data['tipo'], $id);
        $model->delete();

        $this->clearCache();

        return response()->json(null, 204);
    }

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
