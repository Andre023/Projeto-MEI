<?php

namespace Database\Factories;

use App\Models\Subgrupo;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class ProdutoFactory extends Factory
{
    public function definition(): array
    {
        return [
            'nome' => $this->faker->word() . ' ' . $this->faker->word(),
            'descricao' => $this->faker->sentence(),
            'preco' => $this->faker->randomFloat(2, 10, 500),
            'preco_de_custo' => $this->faker->randomFloat(2, 5, 200),
            'codigo' => $this->faker->unique()->ean8(),
            'quantidade_estoque' => $this->faker->numberBetween(0, 100),
            'subgrupo_id' => Subgrupo::factory(),
            'user_id' => User::factory(),
        ];
    }
}
