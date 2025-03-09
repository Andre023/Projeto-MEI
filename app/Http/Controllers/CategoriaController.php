<?php

namespace App\Http\Controllers;

use App\Models\Categoria;
use Illuminate\Http\Request;

class CategoriaController extends Controller
{
    public function index()
    {
        return response()->json(Categoria::all());
    }

    public function create()
    {
        return view('categorias.create');
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'categoria' => 'required|string|max:20',
        ]);

        Categoria::create($data);
        return redirect()->route('categorias')->with('success', 'Categoria criada com sucesso!');
    }

    public function edit($id)
    {
        $Categoria = Categoria::findOrFail($id);
        return view('categorias.edit', compact('categoria'));
    }

    public function update(Request $request, $id)
    {
        $Categoria = Categoria::findOrFail($id);
        $data = $request->validate([
            'categoria' => 'required|string|max:20',
        ]);
        $Categoria->update($data);
        return redirect()->route('categorias')->with('success', 'Categoria atualizada com sucesso!');
    }

    public function destroy($id)
    {
        $Categoria = Categoria::findOrFail($id);
        $Categoria->delete();
        return redirect()->route('categorias')->with('success', 'Categoria excluída com sucesso!');
    }
}