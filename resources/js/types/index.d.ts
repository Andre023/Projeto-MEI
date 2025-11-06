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

export interface Subgrupo {
  id: number;
  nome: string;
  grupo?: Grupo;
}

export interface Grupo {
  id: number;
  nome: string;
  subcategoria?: Subcategoria;
  subgrupos?: Subgrupo[];
}

export interface Subcategoria {
  id: number;
  nome: string;
  categoria?: CategoriaArvore;
  grupos?: Grupo[];
}

export interface CategoriaArvore {
  id: number;
  nome: string;
  subcategorias?: Subcategoria[];
}


export interface Produto {
    id: number;
    nome: string;
    descricao: string;
    codigo: string;
    preco: number;
    preco_de_custo?: number;
    quantidade_estoque?: number;

    subgrupo_id: number;
    subgrupo?: Subgrupo;
}

export interface Cliente {
  id: number;
  nome: string;
  cpf_cnpj: string;
  endereco: string;
  telefone: string;
  email: string;
}