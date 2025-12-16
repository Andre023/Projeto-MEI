<?php

namespace Database\Factories;

use App\Models\CategoriaArvore;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class SubcategoriaFactory extends Factory
{
    public function definition(): array
    {
        return [
            'nome' => $this->faker->word(),
            'categoria_id' => CategoriaArvore::factory(),
            'user_id' => User::factory(),
        ];
    }
}
