<?php

/* COMANDO PARA INSERIR DADOS NO BANCO DE DADOS
 * php artisan tinker
*/

use App\Models\Cliente;

$cliente = Cliente::create([
    'nome' => 'teste',
    'telefone' => '37 333176189',
]);


/* COMANDO PARA DELETAR DADOS NO BANCO DE DADOS
 * php artisan tinker
*/
$user = App\Models\User::find(1); // Substitua 1 pelo ID desejado
$user->delete();