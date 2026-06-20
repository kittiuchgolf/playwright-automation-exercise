export const ROUTES = {
  home: '/',
  login: '/login',
  signup: '/signup',
  products: '/products',
  contact: '/contact_us',
  cart: '/view_cart',
  checkout: '/checkout',
  payment: '/payment',
  testCases: '/test_cases',
} as const;

export const API = {
  productsList: '/api/productsList',
  brandsList: '/api/brandsList',
  searchProduct: '/api/searchProduct',
  verifyLogin: '/api/verifyLogin',
  createAccount: '/api/createAccount',
  deleteAccount: '/api/deleteAccount',
  updateAccount: '/api/updateAccount',
  getUserDetailByEmail: '/api/getUserDetailByEmail',
} as const;

export const MESSAGES = {
  methodNotSupported: 'This request method is not supported.',
  searchParamMissing: 'Bad request, search_product parameter is missing in POST request.',
  loginParamMissing: 'Bad request, email or password parameter is missing in POST request.',
  userExists: 'User exists!',
  userNotFound: 'User not found!',
  userCreated: 'User created!',
  userUpdated: 'User updated!',
  accountDeleted: 'Account deleted!',
} as const;

export const PAYMENT_CARD = {
  nameOnCard: 'Test Tester',
  cardNumber: '4111111111111111',
  cvc: '311',
  expiryMonth: '12',
  expiryYear: '2030',
} as const;
