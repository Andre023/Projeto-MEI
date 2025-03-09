<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Produto;
use Illuminate\Http\Request;

class ProdutoController extends Controller
{
    public function index() {
        return response()->json(Produto::with('categoria')->get());
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'nome' => 'required|string|max:255',
            'descricao' => 'required|string|max:500',
            'codigo' => 'required|integer',
            'categoria_id' => 'required|exists:categorias,id',
            'preco' => 'required|numeric|min:0',
        ]);

        $produto = Produto::create($data);
        return response()->json($produto, 201);
    }

    public function show($id)
    {
        $produto = Produto::with('categoria')->findOrFail($id);
        return response()->json($produto);
    }

    public function update(Request $request, $id)
    {
        $produto = Produto::findOrFail($id);
        $data = $request->validate([
            'nome' => 'required|string|max:255',
            'descricao' => 'required|string|max:500',
            'codigo' => 'required|integer',
            'categoria_id' => 'required|exists:categorias,id',
            'preco' => 'required|numeric|min:0',
        ]);
        $produto->update($data);
        return response()->json($produto);
    }

    public function destroy($id)
    {
        $produto = Produto::findOrFail($id);
        $produto->delete();
        return response()->json(null, 204);
    }
}