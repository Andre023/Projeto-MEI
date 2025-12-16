<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class CategoriaArvoreFactory extends Factory
{
    public function definition(): array
    {
        return [
            'nome' => $this->faker->word(),
            'user_id' => User::factory(),
        ];
    }
}
