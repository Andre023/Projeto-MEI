// resources/js/Utils/helpContent.ts

export type HelpStep = {
  title: string;
  description: string;
  image?: string;
};

export type HelpContentMap = {
  [key: string]: {
    title: string;
    steps: HelpStep[];
  };
};

export const helpData: HelpContentMap = {
  'dashboard': {
    title: 'Como usar o Dashboard',
    steps: [
      { title: 'Visão Geral', description: 'Aqui você vê o resumo financeiro do mês.' },
      { title: 'Funcionalidades em diversas telas', description: 'Todos as tabelas possuem ordenação por cabeçalho, basta clicar em seu título que irá ordenar em ordem crescente ou decrescente. As tabelas também possuem um campo de busca para a procura dos dados.' },
      { title: 'Funcionalidades em diversas telas', description: 'Clique nos ícones de sol e lua para alternar entre o modo claro e escuro no canto direito superior da tela.' }
    ]
  },
  'clientes': {
    title: 'Gerenciando Clientes',
    steps: [
      { title: 'Novo Cliente', description: 'Clique no botão "Novo Cliente" no canto superior direito. Irá abrir uma tela de cadastro, coloque o nome o telefone e salve.', image: 'images/help/create_cli.webp' },
      { title: 'Edição e exclusão', description: 'Clique no botão amarelo (Lápis) para editar (o processo é semelhante ao de criar, o campo será automaticamente alterado). Clique no botão vermelho (Lixeira) para excluir.', image: '/images/help/edit_delete.webp' }

    ]
  },
  'produtos': {
    title: 'Gerenciando produtos',
    steps: [
      { title: 'Novo produto', description: 'Clique no botão "Novo Produto" Irá abrir uma tela de cadastro, coloque o nome, descrição, código de barras, estoque inicial, preço de custo e venda. Na árvore mercadológica deve ser colocado nesta ordem: Categoria -> Subcategoria -> Grupo -> Subgrupo.', image: '/images/help/cadastro_prod.webp' },
      { title: 'Estoque', description: 'Clique no botão de estoque (cubo azul) para editar o estoque, realizando entrada ou saída do produto. Selecione o tipo de movimentação, a quantidade e o motivo da operação.', image: '/images/help/estoque.webp' },
      { title: 'Histórico', description: 'Clique no botão de histórico (papel cinza) para abrir o histórico de modificações do produto.', image: '/images/help/historico.webp' },
      { title: 'Edição e exclusão', description: 'Clique no botão amarelo (Lápis) para editar (o processo é semelhante ao de criar, o campo será automaticamente alterado). Clique no botão vermelho (Lixeira) para excluir.', image: '/images/help/edit_delete.webp' }

    ]
  },
  'vendas': {
    title: 'Realizando Vendas',
    steps: [
      { title: 'Realziando venda', description: 'Clique em "Nova Venda", selecione os produtos que serão vendidos e suas quantidades, selecione o cliente, clique em finalziar venda.', image: '/images/help/vendas.png' },
      { title: 'Realziando venda', description: 'A nova venda irá aparecer na tabela da página de vendas.', image: '/images/help/tabela.webp' },
      { title: 'Realziando venda', description: 'Clique no botão de visualização (olho) para ver os detalhes da venda.', image: '/images/help/visu.webp' }
    ]
  },
  'arvore': {
    title: 'Navegando na Árvore Mercadológica',
    steps: [
      { title: 'Primeiro acesso', description: 'Esta página permite criar e editar árvores de categorias que serão utilizadas pelos produtos. Utiliza-se o sistema de quatro níveis de profundidade na árvore.', image: '/images/help/exemplo_arvore.webp' },
      { title: 'Cadastrar nova categoria', description: 'Insira o nome da categoria no campo e clique em cadastrar.', image: '/images/help/nova_categoria.webp' },
      { title: 'Cadastrar subcategoria', description: 'Clique no ícone + da sua categoria, após isso o campo de cadastro será automaticamente alterado para cadastrar a subcategoria, insira o nome para sua subcategoria e a cadastre.', image: '/images/help/subcat.webp' },
      { title: 'Cadastrar grupo e subgrupo', description: 'Clique no ícone ^ para expandir sua categoria e clique no ícone + da sua subcategoria, após isso o campo de cadastro será automaticamente alterado para cadastrar o grupo, insira o nome para seu grupo e o cadastre. O método é o mesmo para o subgrupo.', image: '/images/help/grupo_subgrupo.webp' },
      { title: 'Edição e exclusão', description: 'Clique no botão amarelo (Lápis) para editar (o processo é semelhante ao de criar, o campo será automaticamente alterado). Clique no botão vermelho (Lixeira) para excluir.', image: '/images/help/edit_delete.webp' }
    ]
  },
  // Adicione mais conforme necessário
};
