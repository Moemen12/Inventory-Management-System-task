export type SignupFields = {
  username: string;
  email: string;
  password: string;
};

export type LoginFields = {
  username: string;
  password: string;
};

interface GlobalRes {
  status: number;
  success: boolean;
}

export interface ErrorRes extends GlobalRes {
  data: null;
  errors: {
    [key: string]: string[];
  };
}

export interface ErrorResult {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
  status?: number;
}

export interface SuccessRes extends GlobalRes {
  data: Record<string, string>[];
  message: string;
}

export interface MeRes extends SuccessRes {
  data: {
    name: string;
    user_id: string;
    added_product_types_count: number;
    added_products_count: number;
    sold_products_count: number;
    human_time: string;
    last_added_products: {
      id: string;
      name: string;
      created_at: string;
    }[];
    last_added_product_types: {
      id: string;
      name: string;
      created_at: string;
    }[];
  };
}

export type BarcodeFormat =
  | "aztec"
  | "code_128"
  | "code_39"
  | "code_93"
  | "codabar"
  | "databar"
  | "databar_expanded"
  | "databar_limited"
  | "data_matrix"
  | "dx_film_edge"
  | "ean_13"
  | "ean_8"
  | "itf"
  | "linear_codes"
  | "matrix_codes"
  | "maxi_code"
  | "micro_qr_code"
  | "pdf417"
  | "qr_code"
  | "rm_qr_code"
  | "upc_a"
  | "upc_e";
