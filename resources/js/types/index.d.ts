export interface User {
  id: number;
  name: string;
  email: string;
  email_verified_at?: string;
  profile_photo_path: string | null;
  profile_photo_url: string | null;
}

export type PageProps<
  T extends Record<string, unknown> = Record<string, unknown>,
> = T & {
  auth: {
    user: User;
  };
};

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
    categoria?: Categoria;
    quantidade_estoque?: number;
}

