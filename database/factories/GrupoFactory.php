<?php

namespace Database\Factories;

use App\Models\Subcategoria;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class GrupoFactory extends Factory
{
    public function definition(): array
    {
        return [
            'nome' => $this->faker->word(),
            'subcategoria_id' => Subcategoria::factory(),
            'user_id' => User::factory(),
        ];
    }
}
