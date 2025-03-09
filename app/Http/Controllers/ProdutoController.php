<?php

namespace App\Http\Controllers;

use App\Models\Produto;
use Illuminate\Http\Request;

class ProdutoController extends Controller
{
    public function index()
    {
        return response()->json(Produto::with('categoria')->get());
    }

    public function create()
    {
        $categorias = \App\Models\Categoria::all();
        return view('produtos.create', compact('categorias'));
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

        Produto::create($data);
        return redirect()->route('produtos')->with('success', 'Produto criado com sucesso!');
    }

    public function edit($id)
    {
        $produto = Produto::findOrFail($id);
        $categorias = \App\Models\Categoria::all();
        return view('produtos.edit', compact('produto', 'categorias'));
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
        return redirect()->route('produtos')->with('success', 'Produto atualizado com sucesso!');
    }

    public function destroy($id)
    {
        $produto = Produto::findOrFail($id);
        $produto->delete();
        return redirect()->route('produtos')->with('success', 'Produto excluído com sucesso!');
    }
}