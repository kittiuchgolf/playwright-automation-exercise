export interface BaseBody {
  responseCode: number;
  message?: string;
}

export interface Product {
  id: number;
  name: string;
  price: string;
  brand: string;
  category: { usertype: { usertype: string }; category: string };
}

export interface ProductsListBody extends BaseBody {
  products: Product[];
}

export interface Brand {
  id: number;
  brand: string;
}

export interface BrandsListBody extends BaseBody {
  brands: Brand[];
}

export interface UserDetailBody extends BaseBody {
  user: {
    id: number;
    name: string;
    email: string;
    title: string;
    first_name: string;
    last_name: string;
    country: string;
    city: string;
  };
}

export interface AccountPayload {
  name: string;
  email: string;
  password: string;
  title: string;
  birth_date: string;
  birth_month: string;
  birth_year: string;
  firstname: string;
  lastname: string;
  company: string;
  address1: string;
  address2: string;
  country: string;
  zipcode: string;
  state: string;
  city: string;
  mobile_number: string;
}

export interface ApiResult<T extends BaseBody> {
  status: number; // transport HTTP status — always 200 for this API
  body: T;
}
