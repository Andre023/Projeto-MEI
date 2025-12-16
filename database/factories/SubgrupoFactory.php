<?php

namespace Database\Factories;

use App\Models\Grupo;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class SubgrupoFactory extends Factory
{
    public function definition(): array
    {
        return [
            'nome' => $this->faker->word(),
            'grupo_id' => Grupo::factory(),
            'user_id' => User::factory(),
        ];
    }
}
