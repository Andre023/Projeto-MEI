<?php

namespace Database\Factories;

use App\Models\Cliente;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class VendaFactory extends Factory
{
    public function definition(): array
    {
        return [
            'total_venda' => $this->faker->randomFloat(2, 50, 1000),
            'cliente_id' => Cliente::factory(),
            'user_id' => User::factory(),
        ];
    }
}
