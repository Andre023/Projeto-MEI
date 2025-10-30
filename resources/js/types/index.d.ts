export interface User {
  id: number;
  name: string;
  email: string;
  email_verified_at?: string;
}

export type PageProps<
  T extends Record<string, unknown> = Record<string, unknown>,
> = T & {
  auth: {
    user: User;
  };
};

// --- ADICIONE ESTAS DUAS INTERFACES ABAIXO ---

/**
 * Define a estrutura de uma Categoria
 */
export interface Categoria {
    id: number;
    categoria: string;
}


export interface Produto {
    id: number;
    nome: string;
    descricao: string;
    codigo: string;
    preco: number;
    categoria_id: number;
    categoria?: Categoria; // Categoria é opcional (vem do 'with')
    quantidade_estoque?: number;
}

