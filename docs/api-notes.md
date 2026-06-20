# API Notes

Source: https://automationexercise.com/api_list (14 endpoints).

## The responseCode quirk
Every endpoint returns transport **HTTP 200**. The logical status is in
`body.responseCode` with a human `body.message`. Tests assert on the body.

| # | Method | Path | responseCode | Notes |
|---|--------|------|--------------|-------|
| 1 | GET | /api/productsList | 200 | products[] |
| 2 | POST | /api/productsList | 405 | method not supported |
| 3 | GET | /api/brandsList | 200 | brands[] |
| 4 | PUT | /api/brandsList | 405 | method not supported |
| 5 | POST | /api/searchProduct | 200 | form: search_product |
| 6 | POST | /api/searchProduct | 400 | param missing |
| 7 | POST | /api/verifyLogin | 200 | form: email,password → "User exists!" |
| 8 | POST | /api/verifyLogin | 400 | missing email |
| 9 | DELETE | /api/verifyLogin | 405 | method not supported |
| 10 | POST | /api/verifyLogin | 404 | invalid creds → "User not found!" |
| 11 | POST | /api/createAccount | 201 | full account form → "User created!" |
| 12 | DELETE | /api/deleteAccount | 200 | form: email,password → "Account deleted!" |
| 13 | PUT | /api/updateAccount | 200 | full account form → "User updated!" |
| 14 | GET | /api/getUserDetailByEmail | 200 | query: email |

Request bodies are form-encoded. `createAccount`/`updateAccount` need the full
account field set (see `AccountPayload` in `src/api/types.ts`).
