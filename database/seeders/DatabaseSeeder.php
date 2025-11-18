<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     *
     * @return void
     */
    public function run()
    {
        // 1. Criar usuários (users)
        $user1 = DB::table('users')->insertGetId([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
            'password' => Hash::make('password'),
            'profile_photo_path' => 'profile-photos/XUvoC3RWmfwpmZguMSBMVoDi3cbBtZIZ4K7ioVWc.jpg',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $user2 = DB::table('users')->insertGetId([
            'name' => 'Regular User',
            'email' => 'user@example.com',
            'password' => Hash::make('password'),
            'profile_photo_path' => 'photos/user2.jpg',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $user3 = DB::table('users')->insertGetId([
            'name' => 'Store Manager',
            'email' => 'manager@example.com',
            'password' => Hash::make('password'),
            'profile_photo_path' => null,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // 2. Criar clientes (associados a users)
        $cliente1 = DB::table('clientes')->insertGetId([
            'nome' => 'João Silva',
            'telefone' => 123456789,
            'user_id' => $user1,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $cliente2 = DB::table('clientes')->insertGetId([
            'nome' => 'Maria Santos',
            'telefone' => 987654321,
            'user_id' => $user2,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $cliente3 = DB::table('clientes')->insertGetId([
            'nome' => 'Pedro Oliveira',
            'telefone' => 456789123,
            'user_id' => $user1,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $cliente4 = DB::table('clientes')->insertGetId([
            'nome' => 'Ana Costa',
            'telefone' => 789123456,
            'user_id' => $user3,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // 3. Criar 10 categorias_arvore diversificadas
        $categorias = [
            ['nome' => 'Eletrônicos', 'user_id' => $user1],
            ['nome' => 'Roupas e Moda', 'user_id' => $user2],
            ['nome' => 'Alimentos e Bebidas', 'user_id' => $user1],
            ['nome' => 'Livros e Papelaria', 'user_id' => $user3],
            ['nome' => 'Esportes e Fitness', 'user_id' => $user2],
            ['nome' => 'Casa e Decoração', 'user_id' => $user1],
            ['nome' => 'Beleza e Cuidados Pessoais', 'user_id' => $user3],
            ['nome' => 'Brinquedos e Games', 'user_id' => $user2],
            ['nome' => 'Automotivo', 'user_id' => $user1],
            ['nome' => 'Ferramentas e Construção', 'user_id' => $user3],
        ];

        $categoriaIds = [];
        foreach ($categorias as $cat) {
            $categoriaIds[] = DB::table('categorias_arvore')->insertGetId([
                'nome' => $cat['nome'],
                'user_id' => $cat['user_id'],
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // 4. Criar subcategorias para cada categoria
        $subcategorias = [
            // Eletrônicos
            ['nome' => 'Smartphones', 'categoria_id' => $categoriaIds[0], 'user_id' => $user1],
            ['nome' => 'Notebooks', 'categoria_id' => $categoriaIds[0], 'user_id' => $user1],
            ['nome' => 'Áudio', 'categoria_id' => $categoriaIds[0], 'user_id' => $user1],

            // Roupas e Moda
            ['nome' => 'Camisetas', 'categoria_id' => $categoriaIds[1], 'user_id' => $user2],
            ['nome' => 'Calças', 'categoria_id' => $categoriaIds[1], 'user_id' => $user2],
            ['nome' => 'Calçados', 'categoria_id' => $categoriaIds[1], 'user_id' => $user2],

            // Alimentos e Bebidas
            ['nome' => 'Bebidas', 'categoria_id' => $categoriaIds[2], 'user_id' => $user1],
            ['nome' => 'Snacks', 'categoria_id' => $categoriaIds[2], 'user_id' => $user1],

            // Livros e Papelaria
            ['nome' => 'Livros Ficção', 'categoria_id' => $categoriaIds[3], 'user_id' => $user3],
            ['nome' => 'Material Escolar', 'categoria_id' => $categoriaIds[3], 'user_id' => $user3],

            // Esportes e Fitness
            ['nome' => 'Academia', 'categoria_id' => $categoriaIds[4], 'user_id' => $user2],
            ['nome' => 'Futebol', 'categoria_id' => $categoriaIds[4], 'user_id' => $user2],

            // Casa e Decoração
            ['nome' => 'Móveis', 'categoria_id' => $categoriaIds[5], 'user_id' => $user1],
            ['nome' => 'Decoração', 'categoria_id' => $categoriaIds[5], 'user_id' => $user1],

            // Beleza e Cuidados Pessoais
            ['nome' => 'Perfumaria', 'categoria_id' => $categoriaIds[6], 'user_id' => $user3],
            ['nome' => 'Cuidados com a Pele', 'categoria_id' => $categoriaIds[6], 'user_id' => $user3],

            // Brinquedos e Games
            ['nome' => 'Videogames', 'categoria_id' => $categoriaIds[7], 'user_id' => $user2],
            ['nome' => 'Brinquedos Infantis', 'categoria_id' => $categoriaIds[7], 'user_id' => $user2],

            // Automotivo
            ['nome' => 'Acessórios', 'categoria_id' => $categoriaIds[8], 'user_id' => $user1],
            ['nome' => 'Manutenção', 'categoria_id' => $categoriaIds[8], 'user_id' => $user1],

            // Ferramentas e Construção
            ['nome' => 'Ferramentas Manuais', 'categoria_id' => $categoriaIds[9], 'user_id' => $user3],
            ['nome' => 'Ferramentas Elétricas', 'categoria_id' => $categoriaIds[9], 'user_id' => $user3],
        ];

        $subcategoriaIds = [];
        foreach ($subcategorias as $sub) {
            $subcategoriaIds[] = DB::table('subcategorias')->insertGetId([
                'nome' => $sub['nome'],
                'categoria_id' => $sub['categoria_id'],
                'user_id' => $sub['user_id'],
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // 5. Criar grupos
        $grupos = [
            ['nome' => 'Android', 'subcategoria_id' => $subcategoriaIds[0], 'user_id' => $user1],
            ['nome' => 'iOS', 'subcategoria_id' => $subcategoriaIds[0], 'user_id' => $user1],
            ['nome' => 'Gaming', 'subcategoria_id' => $subcategoriaIds[1], 'user_id' => $user1],
            ['nome' => 'Ultrabook', 'subcategoria_id' => $subcategoriaIds[1], 'user_id' => $user1],
            ['nome' => 'Fones de Ouvido', 'subcategoria_id' => $subcategoriaIds[2], 'user_id' => $user1],
            ['nome' => 'Algodão', 'subcategoria_id' => $subcategoriaIds[3], 'user_id' => $user2],
            ['nome' => 'Poliéster', 'subcategoria_id' => $subcategoriaIds[3], 'user_id' => $user2],
            ['nome' => 'Jeans', 'subcategoria_id' => $subcategoriaIds[4], 'user_id' => $user2],
            ['nome' => 'Tênis', 'subcategoria_id' => $subcategoriaIds[5], 'user_id' => $user2],
            ['nome' => 'Refrigerantes', 'subcategoria_id' => $subcategoriaIds[6], 'user_id' => $user1],
            ['nome' => 'Sucos', 'subcategoria_id' => $subcategoriaIds[6], 'user_id' => $user1],
            ['nome' => 'Salgados', 'subcategoria_id' => $subcategoriaIds[7], 'user_id' => $user1],
            ['nome' => 'Ficção Científica', 'subcategoria_id' => $subcategoriaIds[8], 'user_id' => $user3],
            ['nome' => 'Cadernos', 'subcategoria_id' => $subcategoriaIds[9], 'user_id' => $user3],
            ['nome' => 'Halteres', 'subcategoria_id' => $subcategoriaIds[10], 'user_id' => $user2],
            ['nome' => 'Bolas', 'subcategoria_id' => $subcategoriaIds[11], 'user_id' => $user2],
            ['nome' => 'Sofás', 'subcategoria_id' => $subcategoriaIds[12], 'user_id' => $user1],
            ['nome' => 'Quadros', 'subcategoria_id' => $subcategoriaIds[13], 'user_id' => $user1],
            ['nome' => 'Perfumes Masculinos', 'subcategoria_id' => $subcategoriaIds[14], 'user_id' => $user3],
            ['nome' => 'Hidratantes', 'subcategoria_id' => $subcategoriaIds[15], 'user_id' => $user3],
            ['nome' => 'PlayStation', 'subcategoria_id' => $subcategoriaIds[16], 'user_id' => $user2],
            ['nome' => 'Bonecas', 'subcategoria_id' => $subcategoriaIds[17], 'user_id' => $user2],
            ['nome' => 'GPS', 'subcategoria_id' => $subcategoriaIds[18], 'user_id' => $user1],
            ['nome' => 'Óleos', 'subcategoria_id' => $subcategoriaIds[19], 'user_id' => $user1],
            ['nome' => 'Chaves', 'subcategoria_id' => $subcategoriaIds[20], 'user_id' => $user3],
            ['nome' => 'Furadeiras', 'subcategoria_id' => $subcategoriaIds[21], 'user_id' => $user3],
        ];

        $grupoIds = [];
        foreach ($grupos as $grupo) {
            $grupoIds[] = DB::table('grupos')->insertGetId([
                'nome' => $grupo['nome'],
                'subcategoria_id' => $grupo['subcategoria_id'],
                'user_id' => $grupo['user_id'],
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // 6. Criar subgrupos
        $subgrupos = [
            ['nome' => 'Samsung', 'grupo_id' => $grupoIds[0], 'user_id' => $user1],
            ['nome' => 'Xiaomi', 'grupo_id' => $grupoIds[0], 'user_id' => $user1],
            ['nome' => 'iPhone 15', 'grupo_id' => $grupoIds[1], 'user_id' => $user1],
            ['nome' => 'Lenovo Legion', 'grupo_id' => $grupoIds[2], 'user_id' => $user1],
            ['nome' => 'Dell XPS', 'grupo_id' => $grupoIds[3], 'user_id' => $user1],
            ['nome' => 'Bluetooth', 'grupo_id' => $grupoIds[4], 'user_id' => $user1],
            ['nome' => 'Tamanho M', 'grupo_id' => $grupoIds[5], 'user_id' => $user2],
            ['nome' => 'Tamanho G', 'grupo_id' => $grupoIds[5], 'user_id' => $user2],
            ['nome' => 'Slim Fit', 'grupo_id' => $grupoIds[7], 'user_id' => $user2],
            ['nome' => 'Nike', 'grupo_id' => $grupoIds[8], 'user_id' => $user2],
            ['nome' => 'Coca-Cola', 'grupo_id' => $grupoIds[9], 'user_id' => $user1],
            ['nome' => 'Natural', 'grupo_id' => $grupoIds[10], 'user_id' => $user1],
            ['nome' => 'Chips', 'grupo_id' => $grupoIds[11], 'user_id' => $user1],
            ['nome' => 'Clássicos', 'grupo_id' => $grupoIds[12], 'user_id' => $user3],
            ['nome' => 'Universitário', 'grupo_id' => $grupoIds[13], 'user_id' => $user3],
            ['nome' => '5kg', 'grupo_id' => $grupoIds[14], 'user_id' => $user2],
            ['nome' => 'Profissional', 'grupo_id' => $grupoIds[15], 'user_id' => $user2],
            ['nome' => '3 Lugares', 'grupo_id' => $grupoIds[16], 'user_id' => $user1],
            ['nome' => 'Abstrato', 'grupo_id' => $grupoIds[17], 'user_id' => $user1],
            ['nome' => 'Importados', 'grupo_id' => $grupoIds[18], 'user_id' => $user3],
            ['nome' => 'Facial', 'grupo_id' => $grupoIds[19], 'user_id' => $user3],
            ['nome' => 'PS5', 'grupo_id' => $grupoIds[20], 'user_id' => $user2],
            ['nome' => 'Barbie', 'grupo_id' => $grupoIds[21], 'user_id' => $user2],
            ['nome' => 'Garmin', 'grupo_id' => $grupoIds[22], 'user_id' => $user1],
            ['nome' => 'Sintético', 'grupo_id' => $grupoIds[23], 'user_id' => $user1],
            ['nome' => 'Combinadas', 'grupo_id' => $grupoIds[24], 'user_id' => $user3],
            ['nome' => 'Impacto', 'grupo_id' => $grupoIds[25], 'user_id' => $user3],
        ];

        $subgrupoIds = [];
        foreach ($subgrupos as $subgrupo) {
            $subgrupoIds[] = DB::table('subgrupos')->insertGetId([
                'nome' => $subgrupo['nome'],
                'grupo_id' => $subgrupo['grupo_id'],
                'user_id' => $subgrupo['user_id'],
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // 7. Criar 30 produtos diversificados
        $produtos = [
            ['nome' => 'Galaxy S21', 'descricao' => 'Smartphone Android premium', 'codigo' => 'GALAXY-S21', 'preco' => 1500.00, 'preco_de_custo' => 1000.00, 'quantidade_estoque' => 10, 'subgrupo_id' => $subgrupoIds[0], 'user_id' => $user1],
            ['nome' => 'Xiaomi Redmi Note 12', 'descricao' => 'Celular com excelente custo-benefício', 'codigo' => 'XIAOMI-RN12', 'preco' => 899.90, 'preco_de_custo' => 600.00, 'quantidade_estoque' => 25, 'subgrupo_id' => $subgrupoIds[1], 'user_id' => $user1],
            ['nome' => 'iPhone 15 Pro', 'descricao' => 'Último lançamento Apple', 'codigo' => 'IPHONE-15-PRO', 'preco' => 6999.00, 'preco_de_custo' => 5000.00, 'quantidade_estoque' => 5, 'subgrupo_id' => $subgrupoIds[2], 'user_id' => $user1],
            ['nome' => 'Lenovo Legion 5', 'descricao' => 'Notebook gamer RTX 3060', 'codigo' => 'LEGION-5', 'preco' => 5499.00, 'preco_de_custo' => 4200.00, 'quantidade_estoque' => 8, 'subgrupo_id' => $subgrupoIds[3], 'user_id' => $user1],
            ['nome' => 'Dell XPS 13', 'descricao' => 'Ultrabook para profissionais', 'codigo' => 'DELL-XPS13', 'preco' => 7899.00, 'preco_de_custo' => 6000.00, 'quantidade_estoque' => 6, 'subgrupo_id' => $subgrupoIds[4], 'user_id' => $user1],
            ['nome' => 'Fone JBL Tune 510BT', 'descricao' => 'Fone bluetooth com graves potentes', 'codigo' => 'JBL-510BT', 'preco' => 199.90, 'preco_de_custo' => 120.00, 'quantidade_estoque' => 30, 'subgrupo_id' => $subgrupoIds[5], 'user_id' => $user1],
            ['nome' => 'Camiseta Básica Branca', 'descricao' => 'Camiseta de algodão tamanho M', 'codigo' => 'CAMI-BASIC-M', 'preco' => 49.90, 'preco_de_custo' => 20.00, 'quantidade_estoque' => 50, 'subgrupo_id' => $subgrupoIds[6], 'user_id' => $user2],
            ['nome' => 'Camiseta Estampada G', 'descricao' => 'Camiseta com estampa exclusiva', 'codigo' => 'CAMI-EST-G', 'preco' => 79.90, 'preco_de_custo' => 35.00, 'quantidade_estoque' => 40, 'subgrupo_id' => $subgrupoIds[7], 'user_id' => $user2],
            ['nome' => 'Calça Jeans Slim', 'descricao' => 'Calça jeans masculina slim fit', 'codigo' => 'JEANS-SLIM', 'preco' => 149.90, 'preco_de_custo' => 80.00, 'quantidade_estoque' => 35, 'subgrupo_id' => $subgrupoIds[8], 'user_id' => $user2],
            ['nome' => 'Tênis Nike Air Max', 'descricao' => 'Tênis esportivo confortável', 'codigo' => 'NIKE-AIRMAX', 'preco' => 499.90, 'preco_de_custo' => 300.00, 'quantidade_estoque' => 20, 'subgrupo_id' => $subgrupoIds[9], 'user_id' => $user2],
            ['nome' => 'Coca-Cola 2L', 'descricao' => 'Refrigerante Coca-Cola 2 litros', 'codigo' => 'COCA-2L', 'preco' => 8.99, 'preco_de_custo' => 5.50, 'quantidade_estoque' => 100, 'subgrupo_id' => $subgrupoIds[10], 'user_id' => $user1],
            ['nome' => 'Suco de Laranja Natural', 'descricao' => 'Suco natural 1L', 'codigo' => 'SUCO-LAR-1L', 'preco' => 12.90, 'preco_de_custo' => 7.00, 'quantidade_estoque' => 60, 'subgrupo_id' => $subgrupoIds[11], 'user_id' => $user1],
            ['nome' => 'Chips Ruffles 100g', 'descricao' => 'Batata chips sabor queijo', 'codigo' => 'RUFFLES-100G', 'preco' => 6.49, 'preco_de_custo' => 3.50, 'quantidade_estoque' => 150, 'subgrupo_id' => $subgrupoIds[12], 'user_id' => $user1],
            ['nome' => 'Livro Duna', 'descricao' => 'Ficção científica clássica', 'codigo' => 'LIVRO-DUNA', 'preco' => 45.90, 'preco_de_custo' => 25.00, 'quantidade_estoque' => 30, 'subgrupo_id' => $subgrupoIds[13], 'user_id' => $user3],
            ['nome' => 'Caderno Universitário 200 Folhas', 'descricao' => 'Caderno espiral 10 matérias', 'codigo' => 'CAD-UNI-200', 'preco' => 24.90, 'preco_de_custo' => 12.00, 'quantidade_estoque' => 80, 'subgrupo_id' => $subgrupoIds[14], 'user_id' => $user3],
            ['nome' => 'Par de Halteres 5kg', 'descricao' => 'Halteres emborrachados', 'codigo' => 'HALT-5KG', 'preco' => 89.90, 'preco_de_custo' => 50.00, 'quantidade_estoque' => 25, 'subgrupo_id' => $subgrupoIds[15], 'user_id' => $user2],
            ['nome' => 'Bola de Futebol Profissional', 'descricao' => 'Bola oficial tamanho 5', 'codigo' => 'BOLA-FUT-PRO', 'preco' => 129.90, 'preco_de_custo' => 70.00, 'quantidade_estoque' => 18, 'subgrupo_id' => $subgrupoIds[16], 'user_id' => $user2],
            ['nome' => 'Sofá 3 Lugares Cinza', 'descricao' => 'Sofá retrátil e reclinável', 'codigo' => 'SOFA-3L-CINZA', 'preco' => 1899.00, 'preco_de_custo' => 1200.00, 'quantidade_estoque' => 5, 'subgrupo_id' => $subgrupoIds[17], 'user_id' => $user1],
            ['nome' => 'Quadro Abstrato 60x80cm', 'descricao' => 'Quadro decorativo moderno', 'codigo' => 'QUADRO-ABS-60', 'preco' => 159.90, 'preco_de_custo' => 80.00, 'quantidade_estoque' => 15, 'subgrupo_id' => $subgrupoIds[18], 'user_id' => $user1],
            ['nome' => 'Perfume Importado 100ml', 'descricao' => 'Fragrância masculina amadeirada', 'codigo' => 'PERF-IMP-100', 'preco' => 289.90, 'preco_de_custo' => 150.00, 'quantidade_estoque' => 20, 'subgrupo_id' => $subgrupoIds[19], 'user_id' => $user3],
            ['nome' => 'Hidratante Facial 50g', 'descricao' => 'Creme hidratante para rosto', 'codigo' => 'HIDR-FAC-50', 'preco' => 49.90, 'preco_de_custo' => 25.00, 'quantidade_estoque' => 45, 'subgrupo_id' => $subgrupoIds[20], 'user_id' => $user3],
            ['nome' => 'God of War Ragnarök PS5', 'descricao' => 'Jogo exclusivo PlayStation 5', 'codigo' => 'GOW-RAG-PS5', 'preco' => 299.90, 'preco_de_custo' => 200.00, 'quantidade_estoque' => 12, 'subgrupo_id' => $subgrupoIds[21], 'user_id' => $user2],
            ['nome' => 'Boneca Barbie Fashionista', 'descricao' => 'Boneca com acessórios', 'codigo' => 'BARBIE-FASH', 'preco' => 89.90, 'preco_de_custo' => 45.00, 'quantidade_estoque' => 35, 'subgrupo_id' => $subgrupoIds[22], 'user_id' => $user2],
            ['nome' => 'GPS Garmin Edge 530', 'descricao' => 'GPS para ciclismo', 'codigo' => 'GARMIN-E530', 'preco' => 1799.00, 'preco_de_custo' => 1200.00, 'quantidade_estoque' => 8, 'subgrupo_id' => $subgrupoIds[23], 'user_id' => $user1],
            ['nome' => 'Óleo Sintético 5W30 1L', 'descricao' => 'Óleo de motor sintético', 'codigo' => 'OLEO-SINT-1L', 'preco' => 49.90, 'preco_de_custo' => 28.00, 'quantidade_estoque' => 50, 'subgrupo_id' => $subgrupoIds[24], 'user_id' => $user1],
            ['nome' => 'Jogo de Chaves Combinadas', 'descricao' => 'Kit com 12 chaves', 'codigo' => 'CHAVE-COMB-12', 'preco' => 119.90, 'preco_de_custo' => 65.00, 'quantidade_estoque' => 22, 'subgrupo_id' => $subgrupoIds[25], 'user_id' => $user3],
            ['nome' => 'Furadeira de Impacto Bosch', 'descricao' => 'Furadeira 650W', 'codigo' => 'FUR-BOSCH-650', 'preco' => 349.90, 'preco_de_custo' => 220.00, 'quantidade_estoque' => 15, 'subgrupo_id' => $subgrupoIds[26], 'user_id' => $user3],
            ['nome' => 'Galaxy Buds 2', 'descricao' => 'Fones bluetooth Samsung', 'codigo' => 'BUDS-2', 'preco' => 499.00, 'preco_de_custo' => 320.00, 'quantidade_estoque' => 18, 'subgrupo_id' => $subgrupoIds[0], 'user_id' => $user1],
            ['nome' => 'Mochila Notebook 15"', 'descricao' => 'Mochila executiva impermeável', 'codigo' => 'MOCH-NB-15', 'preco' => 149.90, 'preco_de_custo' => 80.00, 'quantidade_estoque' => 28, 'subgrupo_id' => $subgrupoIds[4], 'user_id' => $user1],
            ['nome' => 'Mouse Gamer RGB', 'descricao' => 'Mouse com 6 botões programáveis', 'codigo' => 'MOUSE-GAMER-RGB', 'preco' => 159.90, 'preco_de_custo' => 90.00, 'quantidade_estoque' => 32, 'subgrupo_id' => $subgrupoIds[3], 'user_id' => $user1],
        ];

        $produtoIds = [];
        foreach ($produtos as $prod) {
            $produtoIds[] = DB::table('produtos')->insertGetId([
                'nome' => $prod['nome'],
                'descricao' => $prod['descricao'],
                'codigo' => $prod['codigo'],
                'preco' => $prod['preco'],
                'preco_de_custo' => $prod['preco_de_custo'],
                'quantidade_estoque' => $prod['quantidade_estoque'],
                'subgrupo_id' => $prod['subgrupo_id'],
                'user_id' => $prod['user_id'],
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // 8. Criar movimentacoes_estoque para alguns produtos
        $movimentacoes = [
            ['produto_id' => $produtoIds[0], 'tipo' => 'entrada', 'quantidade' => 10, 'descricao' => 'Estoque inicial Galaxy S21'],
            ['produto_id' => $produtoIds[1], 'tipo' => 'entrada', 'quantidade' => 25, 'descricao' => 'Estoque inicial Xiaomi'],
            ['produto_id' => $produtoIds[6], 'tipo' => 'entrada', 'quantidade' => 50, 'descricao' => 'Estoque inicial Camisetas'],
            ['produto_id' => $produtoIds[10], 'tipo' => 'entrada', 'quantidade' => 100, 'descricao' => 'Estoque inicial Coca-Cola'],
            ['produto_id' => $produtoIds[0], 'tipo' => 'saida', 'quantidade' => 2, 'descricao' => 'Venda Galaxy S21'],
            ['produto_id' => $produtoIds[6], 'tipo' => 'saida', 'quantidade' => 5, 'descricao' => 'Venda Camisetas'],
            ['produto_id' => $produtoIds[15], 'tipo' => 'entrada', 'quantidade' => 25, 'descricao' => 'Reposição halteres'],
            ['produto_id' => $produtoIds[21], 'tipo' => 'entrada', 'quantidade' => 12, 'descricao' => 'Estoque inicial God of War'],
            ['produto_id' => $produtoIds[23], 'tipo' => 'entrada', 'quantidade' => 8, 'descricao' => 'Estoque GPS Garmin'],
            ['produto_id' => $produtoIds[26], 'tipo' => 'saida', 'quantidade' => 3, 'descricao' => 'Venda furadeiras'],
        ];

        foreach ($movimentacoes as $mov) {
            DB::table('movimentacao_estoques')->insert([
                'produto_id' => $mov['produto_id'],
                'tipo' => $mov['tipo'],
                'quantidade' => $mov['quantidade'],
                'origem_id' => null,
                'origem_tipo' => null,
                'descricao' => $mov['descricao'],
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // 9. Criar auditoria_produtos
        $auditorias = [
            ['produto_id' => $produtoIds[0], 'campo_alterado' => 'preco', 'valor_antigo' => '1400.00', 'valor_novo' => '1500.00'],
            ['produto_id' => $produtoIds[2], 'campo_alterado' => 'preco', 'valor_antigo' => '6499.00', 'valor_novo' => '6999.00'],
            ['produto_id' => $produtoIds[6], 'campo_alterado' => 'quantidade_estoque', 'valor_antigo' => '40', 'valor_novo' => '50'],
            ['produto_id' => $produtoIds[9], 'campo_alterado' => 'preco', 'valor_antigo' => '449.90', 'valor_novo' => '499.90'],
            ['produto_id' => $produtoIds[17], 'campo_alterado' => 'preco_de_custo', 'valor_antigo' => '1100.00', 'valor_novo' => '1200.00'],
            ['produto_id' => $produtoIds[21], 'campo_alterado' => 'quantidade_estoque', 'valor_antigo' => '10', 'valor_novo' => '12'],
        ];

        foreach ($auditorias as $aud) {
            DB::table('auditoria_produtos')->insert([
                'produto_id' => $aud['produto_id'],
                'campo_alterado' => $aud['campo_alterado'],
                'valor_antigo' => $aud['valor_antigo'],
                'valor_novo' => $aud['valor_novo'],
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // 10. Criar vendas
        $vendas = [
            ['user_id' => $user1, 'cliente_id' => $cliente1, 'total_venda' => 1549.90],
            ['user_id' => $user2, 'cliente_id' => $cliente2, 'total_venda' => 49.90],
            ['user_id' => $user1, 'cliente_id' => $cliente3, 'total_venda' => 708.89],
            ['user_id' => $user3, 'cliente_id' => $cliente4, 'total_venda' => 389.80],
            ['user_id' => $user2, 'cliente_id' => $cliente1, 'total_venda' => 229.80],
            ['user_id' => $user1, 'cliente_id' => $cliente2, 'total_venda' => 5698.90],
        ];

        $vendaIds = [];
        foreach ($vendas as $venda) {
            $vendaIds[] = DB::table('vendas')->insertGetId([
                'user_id' => $venda['user_id'],
                'cliente_id' => $venda['cliente_id'],
                'total_venda' => $venda['total_venda'],
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // 11. Criar venda_items
        $vendaItems = [
            // Venda 1 - Galaxy S21 + Camiseta
            ['venda_id' => $vendaIds[0], 'produto_id' => $produtoIds[0], 'quantidade' => 1, 'preco_unitario' => 1500.00],
            ['venda_id' => $vendaIds[0], 'produto_id' => $produtoIds[6], 'quantidade' => 1, 'preco_unitario' => 49.90],

            // Venda 2 - Camiseta
            ['venda_id' => $vendaIds[1], 'produto_id' => $produtoIds[6], 'quantidade' => 1, 'preco_unitario' => 49.90],

            // Venda 3 - Xiaomi + Coca-Cola
            ['venda_id' => $vendaIds[2], 'produto_id' => $produtoIds[1], 'quantidade' => 1, 'preco_unitario' => 899.90],
            ['venda_id' => $vendaIds[2], 'produto_id' => $produtoIds[10], 'quantidade' => 1, 'preco_unitario' => 8.99],

            // Venda 4 - Perfume + Livro + Hidratante
            ['venda_id' => $vendaIds[3], 'produto_id' => $produtoIds[19], 'quantidade' => 1, 'preco_unitario' => 289.90],
            ['venda_id' => $vendaIds[3], 'produto_id' => $produtoIds[13], 'quantidade' => 1, 'preco_unitario' => 45.90],
            ['venda_id' => $vendaIds[3], 'produto_id' => $produtoIds[20], 'quantidade' => 1, 'preco_unitario' => 49.90],

            // Venda 5 - Calça Jeans + Camiseta G
            ['venda_id' => $vendaIds[4], 'produto_id' => $produtoIds[8], 'quantidade' => 1, 'preco_unitario' => 149.90],
            ['venda_id' => $vendaIds[4], 'produto_id' => $produtoIds[7], 'quantidade' => 1, 'preco_unitario' => 79.90],

            // Venda 6 - Lenovo Legion + Fone JBL + God of War
            ['venda_id' => $vendaIds[5], 'produto_id' => $produtoIds[3], 'quantidade' => 1, 'preco_unitario' => 5499.00],
            ['venda_id' => $vendaIds[5], 'produto_id' => $produtoIds[5], 'quantidade' => 1, 'preco_unitario' => 199.90],
            ['venda_id' => $vendaIds[5], 'produto_id' => $produtoIds[21], 'quantidade' => 1, 'preco_unitario' => 299.90],
        ];

        foreach ($vendaItems as $item) {
            DB::table('venda_items')->insert([
                'venda_id' => $item['venda_id'],
                'produto_id' => $item['produto_id'],
                'quantidade' => $item['quantidade'],
                'preco_unitario' => $item['preco_unitario'],
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // 12. Password reset tokens e sessions
        DB::table('password_reset_tokens')->insert([
            ['email' => 'admin@example.com', 'token' => 'example_token_admin', 'created_at' => now()],
            ['email' => 'user@example.com', 'token' => 'example_token_user', 'created_at' => now()],
        ]);

        DB::table('sessions')->insert([
            [
                'id' => 'session_admin_' . uniqid(),
                'user_id' => $user1,
                'ip_address' => '127.0.0.1',
                'user_agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
                'payload' => 'admin_session_payload',
                'last_activity' => time(),
            ],
            [
                'id' => 'session_user_' . uniqid(),
                'user_id' => $user2,
                'ip_address' => '192.168.1.100',
                'user_agent' => 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
                'payload' => 'user_session_payload',
                'last_activity' => time(),
            ],
            [
                'id' => 'session_manager_' . uniqid(),
                'user_id' => $user3,
                'ip_address' => '192.168.1.50',
                'user_agent' => 'Mozilla/5.0 (X11; Linux x86_64)',
                'payload' => 'manager_session_payload',
                'last_activity' => time(),
            ],
        ]);
    }
}
