import type { APIRequestContext, APIResponse } from '@playwright/test';
import { API } from '../data/constants.js';
import type {
  ApiResult, BaseBody, ProductsListBody, BrandsListBody, UserDetailBody, AccountPayload,
} from './types.js';

/**
 * Typed wrapper over Playwright's APIRequestContext.
 *
 * IMPORTANT: automationexercise APIs always return HTTP 200. The real status
 * lives in body.responseCode. Every method returns { status, body } so specs
 * assert on body.responseCode + body.message, never on the transport status.
 */
export class ApiClient {
  constructor(private readonly request: APIRequestContext) {}

  private async wrap<T extends BaseBody>(res: APIResponse): Promise<ApiResult<T>> {
    const status = res.status();
    const body = (await res.json()) as T;
    return { status, body };
  }

  // API 1
  getAllProducts(): Promise<ApiResult<ProductsListBody>> {
    return this.request.get(API.productsList).then((r) => this.wrap<ProductsListBody>(r));
  }
  // API 2 — unsupported method -> responseCode 405
  postProductsList(): Promise<ApiResult<BaseBody>> {
    return this.request.post(API.productsList).then((r) => this.wrap<BaseBody>(r));
  }
  // API 3
  getAllBrands(): Promise<ApiResult<BrandsListBody>> {
    return this.request.get(API.brandsList).then((r) => this.wrap<BrandsListBody>(r));
  }
  // API 4 — unsupported method -> responseCode 405
  putBrandsList(): Promise<ApiResult<BaseBody>> {
    return this.request.put(API.brandsList).then((r) => this.wrap<BaseBody>(r));
  }
  // API 5
  searchProduct(searchTerm: string): Promise<ApiResult<ProductsListBody>> {
    return this.request
      .post(API.searchProduct, { form: { search_product: searchTerm } })
      .then((r) => this.wrap<ProductsListBody>(r));
  }
  // API 6 — missing param -> responseCode 400
  searchProductNoParam(): Promise<ApiResult<BaseBody>> {
    return this.request.post(API.searchProduct).then((r) => this.wrap<BaseBody>(r));
  }
  // API 7 / 10 — valid or invalid creds
  verifyLogin(email: string, password: string): Promise<ApiResult<BaseBody>> {
    return this.request
      .post(API.verifyLogin, { form: { email, password } })
      .then((r) => this.wrap<BaseBody>(r));
  }
  // API 8 — missing email -> responseCode 400
  verifyLoginMissingEmail(password: string): Promise<ApiResult<BaseBody>> {
    return this.request
      .post(API.verifyLogin, { form: { password } })
      .then((r) => this.wrap<BaseBody>(r));
  }
  // API 9 — unsupported method -> responseCode 405
  deleteVerifyLogin(): Promise<ApiResult<BaseBody>> {
    return this.request.delete(API.verifyLogin).then((r) => this.wrap<BaseBody>(r));
  }
  // API 11 -> responseCode 201
  createAccount(payload: AccountPayload): Promise<ApiResult<BaseBody>> {
    return this.request
      .post(API.createAccount, { form: { ...payload } })
      .then((r) => this.wrap<BaseBody>(r));
  }
  // API 12 -> responseCode 200
  deleteAccount(email: string, password: string): Promise<ApiResult<BaseBody>> {
    return this.request
      .delete(API.deleteAccount, { form: { email, password } })
      .then((r) => this.wrap<BaseBody>(r));
  }
  // API 13 -> responseCode 200
  updateAccount(payload: AccountPayload): Promise<ApiResult<BaseBody>> {
    return this.request
      .put(API.updateAccount, { form: { ...payload } })
      .then((r) => this.wrap<BaseBody>(r));
  }
  // API 14 -> responseCode 200
  getUserDetailByEmail(email: string): Promise<ApiResult<UserDetailBody>> {
    return this.request
      .get(API.getUserDetailByEmail, { params: { email } })
      .then((r) => this.wrap<UserDetailBody>(r));
  }
}
