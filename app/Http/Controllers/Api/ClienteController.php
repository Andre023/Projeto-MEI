<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreClienteRequest;
use App\Models\Cliente;
use Illuminate\Http\Request;

class ClienteController extends Controller
{
    public function index(Request $request)
    {
        $perPage = $request->input('per_page', 10);
        $sortKey = $request->input('sort_key', 'id');
        $sortDir = $request->input('sort_direction', 'desc');
        $search = $request->input('search');

        $validSortKeys = ['id', 'nome', 'telefone', 'created_at'];
        if (!in_array($sortKey, $validSortKeys)) {
            $sortKey = 'id';
        }

        $query = Cliente::query();

        // Filtro de Busca
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('nome', 'LIKE', "%{$search}%")
                    ->orWhere('telefone', 'LIKE', "%{$search}%");
            });
        }

        // Ordenação
        $query->orderBy($sortKey, $sortDir);

        // Paginação
        $clientes = $query->paginate($perPage);

        return response()->json($clientes);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'nome' => 'required|string|max:255',
            'telefone' => 'required|string|max:20',
        ]);

        $cliente = Cliente::create($data);
        return response()->json($cliente, 201);
    }

    public function show($id)
    {
        $cliente = Cliente::findOrFail($id);
        return response()->json($cliente);
    }

    public function update(Request $request, $id)
    {
        $cliente = Cliente::findOrFail($id);
        $data = $request->validate([
            'nome' => 'sometimes|required|string|max:255',
            'telefone' => 'sometimes|required|string|max:20',
        ]);
        $cliente->update($data);
        return response()->json($cliente);
    }

    public function destroy($id)
    {
        $cliente = Cliente::findOrFail($id);
        $cliente->delete();
        return response()->json(null, 204);
    }
}
