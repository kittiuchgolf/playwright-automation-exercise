# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: web/checkout.spec.ts >> Checkout >> TC23: verify delivery address matches the registered user
- Location: tests/web/checkout.spec.ts:38:3

# Error details

```
Error: apiRequestContext.post: Max redirect count exceeded
Call log:
  - → POST https://automationexercise.com/api/createAccount
    - user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36
    - accept: */*
    - accept-encoding: gzip,deflate,br
    - content-type: application/x-www-form-urlencoded
    - content-length: 343
  - ← 302 Found
    - date: Sun, 21 Jun 2026 18:46:41 GMT
    - content-type: text/html; charset=utf-8
    - transfer-encoding: chunked
    - connection: keep-alive
    - referrer-policy: same-origin
    - x-frame-options: DENY
    - x-content-type-options: nosniff
    - x-powered-by: Phusion Passenger(R) 6.1.2
    - location: /
    - status: 302 Found
    - nel: {"report_to":"cf-nel","success_fraction":0.0,"max_age":604800}
    - server: cloudflare
    - cf-cache-status: DYNAMIC
    - report-to: {"group":"cf-nel","max_age":604800,"endpoints":[{"url":"https://a.nel.cloudflare.com/report/v4?s=uo9jalEhR0GW9cmLnTYzH7moko4PTgmS51N%2BIxrRB8qMR%2FSpJtLTI82wTIVMV7Pc0s2gl%2FJV6wjHgbFVoShDB02XpIqJozaCv9jaojz%2Bau7%2FUxSCMbz7YuPh2M3GvJA3pybE32q1DPfm"}]}
    - cf-ray: a0f52d6f3a6c8053-IAD
    - alt-svc: h3=":443"; ma=86400
  - → GET https://automationexercise.com/
    - user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36
    - accept: */*
    - accept-encoding: gzip,deflate,br
  - ← 302 Found
    - date: Sun, 21 Jun 2026 18:46:42 GMT
    - content-type: text/html; charset=utf-8
    - transfer-encoding: chunked
    - connection: keep-alive
    - referrer-policy: same-origin
    - x-frame-options: DENY
    - x-content-type-options: nosniff
    - x-powered-by: Phusion Passenger(R) 6.1.2
    - location: /
    - status: 302 Found
    - server: cloudflare
    - cf-cache-status: DYNAMIC
    - report-to: {"group":"cf-nel","max_age":604800,"endpoints":[{"url":"https://a.nel.cloudflare.com/report/v4?s=KRk%2F5zz61LBlYn2GCjDco7mZ1ZoiJ%2BZ5dH8R2vU7%2F%2FS1mMNodvnjRX4Z759BUepAr8nkhX3VsohOyt%2FCxbEwqm4Af3SzsXM2%2BbmNb%2FLxN9Md%2Briyw%2BXTZs5S7UtGwDGn7poES0do8ztG"}]}
    - nel: {"report_to":"cf-nel","success_fraction":0.0,"max_age":604800}
    - cf-ray: a0f52d71afb5ef5e-IAD
    - alt-svc: h3=":443"; ma=86400
  - → GET https://automationexercise.com/
    - user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36
    - accept: */*
    - accept-encoding: gzip,deflate,br
  - ← 302 Found
    - date: Sun, 21 Jun 2026 18:46:42 GMT
    - content-type: text/html; charset=utf-8
    - transfer-encoding: chunked
    - connection: keep-alive
    - referrer-policy: same-origin
    - x-frame-options: DENY
    - x-content-type-options: nosniff
    - x-powered-by: Phusion Passenger(R) 6.1.2
    - location: /
    - status: 302 Found
    - server: cloudflare
    - cf-cache-status: DYNAMIC
    - report-to: {"group":"cf-nel","max_age":604800,"endpoints":[{"url":"https://a.nel.cloudflare.com/report/v4?s=VeeOHqGrPGqPggPrteG5BcAYr0URNcZB7FVQ3pKihNR4irodxMMWjKjO6gQSeimrJEkfutpTpl6Ey6mT9aY%2FFsVFYsZM%2BFoDoUW%2BA3fpZg6KEULhX8x9HAv9QDFHuicpItrGYK9y7ris"}]}
    - nel: {"report_to":"cf-nel","success_fraction":0.0,"max_age":604800}
    - cf-ray: a0f52d754cd7c07e-IAD
    - alt-svc: h3=":443"; ma=86400
  - → GET https://automationexercise.com/
    - user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36
    - accept: */*
    - accept-encoding: gzip,deflate,br
  - ← 302 Found
    - date: Sun, 21 Jun 2026 18:46:43 GMT
    - content-type: text/html; charset=utf-8
    - transfer-encoding: chunked
    - connection: keep-alive
    - referrer-policy: same-origin
    - x-frame-options: DENY
    - x-content-type-options: nosniff
    - x-powered-by: Phusion Passenger(R) 6.1.2
    - location: /
    - status: 302 Found
    - server: cloudflare
    - cf-cache-status: DYNAMIC
    - nel: {"report_to":"cf-nel","success_fraction":0.0,"max_age":604800}
    - report-to: {"group":"cf-nel","max_age":604800,"endpoints":[{"url":"https://a.nel.cloudflare.com/report/v4?s=281MflDkPivJHrjeO16lZFepGCDAEiyfmBDeW7%2B%2BdywIuD%2BlqihDsHPZTV9%2BhfyIiH%2FpwqetrdIdo29U86oUQwtEsM9mYJ2qiefVuz3zVBYfsvHwck0wS%2FpBQ5yE8dMVOMVYxFvOYsBd"}]}
    - cf-ray: a0f52d77aac6e633-IAD
    - alt-svc: h3=":443"; ma=86400
  - → GET https://automationexercise.com/
    - user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36
    - accept: */*
    - accept-encoding: gzip,deflate,br
  - ← 302 Found
    - date: Sun, 21 Jun 2026 18:46:43 GMT
    - content-type: text/html; charset=utf-8
    - transfer-encoding: chunked
    - connection: keep-alive
    - referrer-policy: same-origin
    - x-frame-options: DENY
    - x-content-type-options: nosniff
    - x-powered-by: Phusion Passenger(R) 6.1.2
    - location: /
    - status: 302 Found
    - server: cloudflare
    - cf-cache-status: DYNAMIC
    - nel: {"report_to":"cf-nel","success_fraction":0.0,"max_age":604800}
    - report-to: {"group":"cf-nel","max_age":604800,"endpoints":[{"url":"https://a.nel.cloudflare.com/report/v4?s=4CaoW%2F1PsZKLn%2FkzhuFE3%2F6uzPguDlgA%2FymdH4zFQDQVO8iqsCmz4SzmsSBs%2F8YAgkHlA2iBLe00UhzG2ey9cjvN4Rj2UNHdw6ixYbUEXILJWB1mOgkrvbtz4MQNDGvAY26%2BIDn2wHJb"}]}
    - cf-ray: a0f52d7b3be0bb25-IAD
    - alt-svc: h3=":443"; ma=86400
  - → GET https://automationexercise.com/
    - user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36
    - accept: */*
    - accept-encoding: gzip,deflate,br
  - ← 302 Found
    - date: Sun, 21 Jun 2026 18:46:44 GMT
    - content-type: text/html; charset=utf-8
    - transfer-encoding: chunked
    - connection: keep-alive
    - referrer-policy: same-origin
    - x-frame-options: DENY
    - x-content-type-options: nosniff
    - x-powered-by: Phusion Passenger(R) 6.1.2
    - location: /
    - status: 302 Found
    - server: cloudflare
    - cf-cache-status: DYNAMIC
    - report-to: {"group":"cf-nel","max_age":604800,"endpoints":[{"url":"https://a.nel.cloudflare.com/report/v4?s=BQ2KOsPfxFerHP2foqT4fI7z2gRSF%2BAP%2BQqufII6Guy%2B3zNkvPvvV5sPWigPpvy%2FW8rQN3rFt0ZGOEZWbzjdZBC1AM52qRWNlpIBOt1Ls8XtVLOiO2IViVKYRJX71nAbrMcvyulNvRYX"}]}
    - nel: {"report_to":"cf-nel","success_fraction":0.0,"max_age":604800}
    - cf-ray: a0f52d7dadd02fa3-IAD
    - alt-svc: h3=":443"; ma=86400
  - → GET https://automationexercise.com/
    - user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36
    - accept: */*
    - accept-encoding: gzip,deflate,br
  - ← 302 Found
    - date: Sun, 21 Jun 2026 18:46:44 GMT
    - content-type: text/html; charset=utf-8
    - transfer-encoding: chunked
    - connection: keep-alive
    - referrer-policy: same-origin
    - x-frame-options: DENY
    - x-content-type-options: nosniff
    - x-powered-by: Phusion Passenger(R) 6.1.2
    - location: /
    - status: 302 Found
    - server: cloudflare
    - cf-cache-status: DYNAMIC
    - report-to: {"group":"cf-nel","max_age":604800,"endpoints":[{"url":"https://a.nel.cloudflare.com/report/v4?s=mP8G4r8J%2FGeZbDBkZC6RffaJbs2uZ2Yn0cmMZWa8KSgTjQHLCLWnFJfkDJF%2FkEjGe%2BhJ3REnboLuAFg4YGSBIwJSC3JviQKqAHZEc5xz4%2BKExbpSh3fkO8bnTFmWEDy4r2zdSSdO2k7j"}]}
    - nel: {"report_to":"cf-nel","success_fraction":0.0,"max_age":604800}
    - cf-ray: a0f52d8019fa0fbe-IAD
    - alt-svc: h3=":443"; ma=86400
  - → GET https://automationexercise.com/
    - user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36
    - accept: */*
    - accept-encoding: gzip,deflate,br
  - ← 302 Found
    - date: Sun, 21 Jun 2026 18:46:45 GMT
    - content-type: text/html; charset=utf-8
    - transfer-encoding: chunked
    - connection: keep-alive
    - referrer-policy: same-origin
    - x-frame-options: DENY
    - x-content-type-options: nosniff
    - x-powered-by: Phusion Passenger(R) 6.1.2
    - location: /
    - status: 302 Found
    - server: cloudflare
    - cf-cache-status: DYNAMIC
    - report-to: {"group":"cf-nel","max_age":604800,"endpoints":[{"url":"https://a.nel.cloudflare.com/report/v4?s=E7KQsWQ%2FTHKRSCsYSvhFnQgd7vhK%2FuOQtlo%2FYg8OyJgG3AmKPTrh8e2Zf9mtitRYtWvEFh8M1IEBFolVTG29L7J2EOpGYR0w7dsnTixvW3JGQOMlrUoeHjt0X3zoi5JtjJ7nlT4z5B0y"}]}
    - nel: {"report_to":"cf-nel","success_fraction":0.0,"max_age":604800}
    - cf-ray: a0f52d8289549307-IAD
    - alt-svc: h3=":443"; ma=86400
  - → GET https://automationexercise.com/
    - user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36
    - accept: */*
    - accept-encoding: gzip,deflate,br
  - ← 302 Found
    - date: Sun, 21 Jun 2026 18:46:45 GMT
    - content-type: text/html; charset=utf-8
    - transfer-encoding: chunked
    - connection: keep-alive
    - referrer-policy: same-origin
    - x-frame-options: DENY
    - x-content-type-options: nosniff
    - x-powered-by: Phusion Passenger(R) 6.1.2
    - location: /
    - status: 302 Found
    - server: cloudflare
    - cf-cache-status: DYNAMIC
    - nel: {"report_to":"cf-nel","success_fraction":0.0,"max_age":604800}
    - report-to: {"group":"cf-nel","max_age":604800,"endpoints":[{"url":"https://a.nel.cloudflare.com/report/v4?s=%2BVeQlLxKwLPYCWTD%2F%2BpY3lFHMTv9pjkmm5JZhybrRH4StnNxYq%2BaMrnBkIZxCKtaB9RzFFOPLklq9r8BhZ%2BPLnU6IvbxCt0S%2FKYpjZRGBlUn%2Fl3UM3EIbF%2FGM%2BPYWuCraFs%2BCO2Yjm2g"}]}
    - cf-ray: a0f52d861a72821b-IAD
    - alt-svc: h3=":443"; ma=86400
  - → GET https://automationexercise.com/
    - user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36
    - accept: */*
    - accept-encoding: gzip,deflate,br
  - ← 302 Found
    - date: Sun, 21 Jun 2026 18:46:46 GMT
    - content-type: text/html; charset=utf-8
    - transfer-encoding: chunked
    - connection: keep-alive
    - referrer-policy: same-origin
    - x-frame-options: DENY
    - x-content-type-options: nosniff
    - x-powered-by: Phusion Passenger(R) 6.1.2
    - location: /
    - status: 302 Found
    - server: cloudflare
    - cf-cache-status: DYNAMIC
    - report-to: {"group":"cf-nel","max_age":604800,"endpoints":[{"url":"https://a.nel.cloudflare.com/report/v4?s=gqANL4Wv79Jj%2FrMbuYqOpR833oCr%2BKCz5Zb6OPnt1VP%2F0CjOWmsunVkiR3iu1ZTUI96K5zRwm%2B2tg48DY6VLkrXgKXW6wNcUxE8z86aCuWjI4t8MRdzLwbSGIGyhVddB03Pxf81u3iAJ"}]}
    - nel: {"report_to":"cf-nel","success_fraction":0.0,"max_age":604800}
    - cf-ray: a0f52d89bf844f53-IAD
    - alt-svc: h3=":443"; ma=86400
  - → GET https://automationexercise.com/
    - user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36
    - accept: */*
    - accept-encoding: gzip,deflate,br
  - ← 302 Found
    - date: Sun, 21 Jun 2026 18:46:46 GMT
    - content-type: text/html; charset=utf-8
    - transfer-encoding: chunked
    - connection: keep-alive
    - referrer-policy: same-origin
    - x-frame-options: DENY
    - x-content-type-options: nosniff
    - x-powered-by: Phusion Passenger(R) 6.1.2
    - location: /
    - status: 302 Found
    - server: cloudflare
    - cf-cache-status: DYNAMIC
    - report-to: {"group":"cf-nel","max_age":604800,"endpoints":[{"url":"https://a.nel.cloudflare.com/report/v4?s=EVRA09Iz9UoRMIbD%2FhwCHg61sfYL%2Fch94n4B74IF9u2mB2nSRDYybJwVQSXgkiDrOd2MePcbCMsWqJZafJvwbhQlByNMbQbRhWIwGBdBzuLXdyxIibZJrv7mixc1JcABiWK%2FMZmjGUsH"}]}
    - nel: {"report_to":"cf-nel","success_fraction":0.0,"max_age":604800}
    - cf-ray: a0f52d8c3b3e20a8-IAD
    - alt-svc: h3=":443"; ma=86400
  - → GET https://automationexercise.com/
    - user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36
    - accept: */*
    - accept-encoding: gzip,deflate,br
  - ← 302 Found
    - date: Sun, 21 Jun 2026 18:46:47 GMT
    - content-type: text/html; charset=utf-8
    - transfer-encoding: chunked
    - connection: keep-alive
    - referrer-policy: same-origin
    - x-frame-options: DENY
    - x-content-type-options: nosniff
    - x-powered-by: Phusion Passenger(R) 6.1.2
    - location: /
    - status: 302 Found
    - server: cloudflare
    - cf-cache-status: DYNAMIC
    - report-to: {"group":"cf-nel","max_age":604800,"endpoints":[{"url":"https://a.nel.cloudflare.com/report/v4?s=lBmZEvQ9ymVWf82G0WINd28pnDzxH2y7r9twfULDMRDwngmp1sK%2FCtgJ2z11PoO7Enh39uF%2FJ7OA%2B2gJ9iYh8iUxkZH0FepOVVoxXtXUf8DTDUccSTETxeyJRfzV247uQV7qK2LAbTo6"}]}
    - nel: {"report_to":"cf-nel","success_fraction":0.0,"max_age":604800}
    - cf-ray: a0f52d8ff85c8f57-IAD
    - alt-svc: h3=":443"; ma=86400
  - → GET https://automationexercise.com/
    - user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36
    - accept: */*
    - accept-encoding: gzip,deflate,br
  - ← 302 Found
    - date: Sun, 21 Jun 2026 18:46:47 GMT
    - content-type: text/html; charset=utf-8
    - transfer-encoding: chunked
    - connection: keep-alive
    - referrer-policy: same-origin
    - x-frame-options: DENY
    - x-content-type-options: nosniff
    - x-powered-by: Phusion Passenger(R) 6.1.2
    - location: /
    - status: 302 Found
    - server: cloudflare
    - cf-cache-status: DYNAMIC
    - report-to: {"group":"cf-nel","max_age":604800,"endpoints":[{"url":"https://a.nel.cloudflare.com/report/v4?s=2njgYQyJ7RnfCCAcNt%2BjWXhd4oDezIjNJYjqMdjfFsEvp4rWzLENf%2BtcB3WVV%2BzUiyIAFpFo0cOQgG7HbLlFCrgiSmCOvaj5D10oxvqfBeK2ITxr8b%2FE%2F62NfKFXFUv9aPbWkktMHu%2B9"}]}
    - nel: {"report_to":"cf-nel","success_fraction":0.0,"max_age":604800}
    - cf-ray: a0f52d926c768053-IAD
    - alt-svc: h3=":443"; ma=86400
  - → GET https://automationexercise.com/
    - user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36
    - accept: */*
    - accept-encoding: gzip,deflate,br
  - ← 302 Found
    - date: Sun, 21 Jun 2026 18:46:48 GMT
    - content-type: text/html; charset=utf-8
    - transfer-encoding: chunked
    - connection: keep-alive
    - referrer-policy: same-origin
    - x-frame-options: DENY
    - x-content-type-options: nosniff
    - x-powered-by: Phusion Passenger(R) 6.1.2
    - location: /
    - status: 302 Found
    - server: cloudflare
    - cf-cache-status: DYNAMIC
    - report-to: {"group":"cf-nel","max_age":604800,"endpoints":[{"url":"https://a.nel.cloudflare.com/report/v4?s=XrOav4YoT%2F0%2FbNSVBUB1GMJlpYBYvzyfJvBhdVan0sbmZhc3pDd%2BsfHGuHV%2FgWQ31tqS6UQHRgdggFTDrJBmKDygjzsGT4HMSWaqw2F2UUFqR%2F7PC0RolfSuLO4yxPfShmirNTyuybTM"}]}
    - nel: {"report_to":"cf-nel","success_fraction":0.0,"max_age":604800}
    - cf-ray: a0f52d94da6ed65c-IAD
    - alt-svc: h3=":443"; ma=86400
  - → GET https://automationexercise.com/
    - user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36
    - accept: */*
    - accept-encoding: gzip,deflate,br
  - ← 302 Found
    - date: Sun, 21 Jun 2026 18:46:48 GMT
    - content-type: text/html; charset=utf-8
    - transfer-encoding: chunked
    - connection: keep-alive
    - referrer-policy: same-origin
    - x-frame-options: DENY
    - x-content-type-options: nosniff
    - x-powered-by: Phusion Passenger(R) 6.1.2
    - location: /
    - status: 302 Found
    - server: cloudflare
    - cf-cache-status: DYNAMIC
    - report-to: {"group":"cf-nel","max_age":604800,"endpoints":[{"url":"https://a.nel.cloudflare.com/report/v4?s=uGCWIcD9c7QaBGOW32vTGHmLrFgVPm1VaQ6HDqBA7IPw9hyzVYyteCFdaajoLVZLFWowFANYumOuj1eQDxiq%2BdCtJaJeZr9ZjcbJTIyYgrh8sic6rNw1tbiWHfOJb%2BKlFSARXyxqCb%2FR"}]}
    - nel: {"report_to":"cf-nel","success_fraction":0.0,"max_age":604800}
    - cf-ray: a0f52d986fc7f289-IAD
    - alt-svc: h3=":443"; ma=86400
  - → GET https://automationexercise.com/
    - user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36
    - accept: */*
    - accept-encoding: gzip,deflate,br
  - ← 302 Found
    - date: Sun, 21 Jun 2026 18:46:49 GMT
    - content-type: text/html; charset=utf-8
    - transfer-encoding: chunked
    - connection: keep-alive
    - referrer-policy: same-origin
    - x-frame-options: DENY
    - x-content-type-options: nosniff
    - x-powered-by: Phusion Passenger(R) 6.1.2
    - location: /
    - status: 302 Found
    - server: cloudflare
    - cf-cache-status: DYNAMIC
    - report-to: {"group":"cf-nel","max_age":604800,"endpoints":[{"url":"https://a.nel.cloudflare.com/report/v4?s=wvMBsMtmk05I55jStQwCCa8qPNOOHSrf4h4uSBr5Per465ITvN8ZItctdDJqImIZW6rBUdSstFZ2xxGmIxBT62QDNhD%2FYC7IqYE%2B%2BST%2FBC4ynhCtROp5yKJTe%2BX9rMMJ4vobdT8%2B1yD4"}]}
    - nel: {"report_to":"cf-nel","success_fraction":0.0,"max_age":604800}
    - cf-ray: a0f52d9c0aa2e633-IAD
    - alt-svc: h3=":443"; ma=86400
  - → GET https://automationexercise.com/
    - user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36
    - accept: */*
    - accept-encoding: gzip,deflate,br
  - ← 302 Found
    - date: Sun, 21 Jun 2026 18:46:49 GMT
    - content-type: text/html; charset=utf-8
    - transfer-encoding: chunked
    - connection: keep-alive
    - referrer-policy: same-origin
    - x-frame-options: DENY
    - x-content-type-options: nosniff
    - x-powered-by: Phusion Passenger(R) 6.1.2
    - location: /
    - status: 302 Found
    - server: cloudflare
    - cf-cache-status: DYNAMIC
    - nel: {"report_to":"cf-nel","success_fraction":0.0,"max_age":604800}
    - report-to: {"group":"cf-nel","max_age":604800,"endpoints":[{"url":"https://a.nel.cloudflare.com/report/v4?s=x85pL3cR13ekp66TmV1hgPRoBt2KHn819mzChyriR63JYRqGRQ72V13N7l7E1rJWElUl7E6gsdZH6h9Ka5hIFerBkDW3vvW05PIWMIvnWV12cxCjt48FRbTc9B8hZzfp9xMhKdkWV3MV"}]}
    - cf-ray: a0f52d9fae8fef5e-IAD
    - alt-svc: h3=":443"; ma=86400
  - → GET https://automationexercise.com/
    - user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36
    - accept: */*
    - accept-encoding: gzip,deflate,br
  - ← 302 Found
    - date: Sun, 21 Jun 2026 18:46:50 GMT
    - content-type: text/html; charset=utf-8
    - transfer-encoding: chunked
    - connection: keep-alive
    - referrer-policy: same-origin
    - x-frame-options: DENY
    - x-content-type-options: nosniff
    - x-powered-by: Phusion Passenger(R) 6.1.2
    - location: /
    - status: 302 Found
    - server: cloudflare
    - cf-cache-status: DYNAMIC
    - report-to: {"group":"cf-nel","max_age":604800,"endpoints":[{"url":"https://a.nel.cloudflare.com/report/v4?s=leQ6n37%2Bfq7nY%2BGmpXA%2F3Qd3dR%2Bq4vxMZVvHd2wJHmr0KLQo4kJM%2FcOdoxk%2FrJM3Jqt6ayQGsmGJUHR1VThU7i0NXNLfKRd366IW3ExogL3i9S7aIkBjoXf%2BgTw7T4brWD%2F%2F9iHUhrLc"}]}
    - nel: {"report_to":"cf-nel","success_fraction":0.0,"max_age":604800}
    - cf-ray: a0f52da34a022fa3-IAD
    - alt-svc: h3=":443"; ma=86400
  - → GET https://automationexercise.com/
    - user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36
    - accept: */*
    - accept-encoding: gzip,deflate,br
  - ← 302 Found
    - date: Sun, 21 Jun 2026 18:46:50 GMT
    - content-type: text/html; charset=utf-8
    - transfer-encoding: chunked
    - connection: keep-alive
    - referrer-policy: same-origin
    - x-frame-options: DENY
    - x-content-type-options: nosniff
    - x-powered-by: Phusion Passenger(R) 6.1.2
    - location: /
    - status: 302 Found
    - server: cloudflare
    - cf-cache-status: DYNAMIC
    - report-to: {"group":"cf-nel","max_age":604800,"endpoints":[{"url":"https://a.nel.cloudflare.com/report/v4?s=jpuU6OW23KX1htPQim8CqV%2BRii44vm9LlsFm%2FVUklpkLHT8kSdcZuzCIyvTbqLWnTBEctoOBvAM7Fan4YOLiYBL9rZIUh8AnPdrN7Q2gf6UBKbwO42NuGeb9vvqutlO1dAaj5cL5WwMU"}]}
    - nel: {"report_to":"cf-nel","success_fraction":0.0,"max_age":604800}
    - cf-ray: a0f52da5cab91777-IAD
    - alt-svc: h3=":443"; ma=86400
  - → GET https://automationexercise.com/
    - user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36
    - accept: */*
    - accept-encoding: gzip,deflate,br
  - ← 302 Found
    - date: Sun, 21 Jun 2026 18:46:51 GMT
    - content-type: text/html; charset=utf-8
    - transfer-encoding: chunked
    - connection: keep-alive
    - referrer-policy: same-origin
    - x-frame-options: DENY
    - x-content-type-options: nosniff
    - x-powered-by: Phusion Passenger(R) 6.1.2
    - location: /
    - status: 302 Found
    - server: cloudflare
    - cf-cache-status: DYNAMIC
    - nel: {"report_to":"cf-nel","success_fraction":0.0,"max_age":604800}
    - report-to: {"group":"cf-nel","max_age":604800,"endpoints":[{"url":"https://a.nel.cloudflare.com/report/v4?s=y0yWMIBH7Du3P2weD66cD%2FLH4bcvLTKdjvzeR2kDRdYGbKLrfJ1nYfOd6WtGhQ8HvlCDdjwVmaxrMB86mTx6BxZvITLIr5JpCqyyFZTKrsv3rOCM3zVxIoAqklrlyCSUoy1jIEz%2FzJKd"}]}
    - cf-ray: a0f52da83dbf3e81-IAD
    - alt-svc: h3=":443"; ma=86400
  - → GET https://automationexercise.com/
    - user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36
    - accept: */*
    - accept-encoding: gzip,deflate,br
  - ← 302 Found
    - date: Sun, 21 Jun 2026 18:46:51 GMT
    - content-type: text/html; charset=utf-8
    - transfer-encoding: chunked
    - connection: keep-alive
    - referrer-policy: same-origin
    - x-frame-options: DENY
    - x-content-type-options: nosniff
    - x-powered-by: Phusion Passenger(R) 6.1.2
    - location: /
    - status: 302 Found
    - server: cloudflare
    - cf-cache-status: DYNAMIC
    - report-to: {"group":"cf-nel","max_age":604800,"endpoints":[{"url":"https://a.nel.cloudflare.com/report/v4?s=VMMUveG7HaBkD%2Bu7cFqNk%2Bbw2oDp3o3FPC8EigzC%2Fh9Qb%2B0cRs09Tkv67ANNkpw19D1EYbK9OzNGVuWg69spqPpm%2F3FsERiP%2BSgzA5Xpsa6Zlrc2kuKQ1GsK8F915%2FL5vdezABBsc2en"}]}
    - nel: {"report_to":"cf-nel","success_fraction":0.0,"max_age":604800}
    - cf-ray: a0f52dabdce50fbe-IAD
    - alt-svc: h3=":443"; ma=86400

```

# Test source

```ts
  1  | import type { APIRequestContext, APIResponse } from '@playwright/test';
  2  | import { API } from '../data/constants.js';
  3  | import type {
  4  |   ApiResult,
  5  |   BaseBody,
  6  |   ProductsListBody,
  7  |   BrandsListBody,
  8  |   UserDetailBody,
  9  |   AccountPayload,
  10 | } from './types.js';
  11 | 
  12 | /**
  13 |  * Typed wrapper over Playwright's APIRequestContext.
  14 |  *
  15 |  * IMPORTANT: automationexercise APIs always return HTTP 200. The real status
  16 |  * lives in body.responseCode. Every method returns { status, body } so specs
  17 |  * assert on body.responseCode + body.message, never on the transport status.
  18 |  */
  19 | export class ApiClient {
  20 |   constructor(private readonly request: APIRequestContext) {}
  21 | 
  22 |   private async wrap<T extends BaseBody>(res: APIResponse): Promise<ApiResult<T>> {
  23 |     const status = res.status();
  24 |     const body = (await res.json()) as T;
  25 |     return { status, body };
  26 |   }
  27 | 
  28 |   // API 1
  29 |   getAllProducts(): Promise<ApiResult<ProductsListBody>> {
  30 |     return this.request.get(API.productsList).then((r) => this.wrap<ProductsListBody>(r));
  31 |   }
  32 |   // API 2 — unsupported method -> responseCode 405
  33 |   postProductsList(): Promise<ApiResult<BaseBody>> {
  34 |     return this.request.post(API.productsList).then((r) => this.wrap<BaseBody>(r));
  35 |   }
  36 |   // API 3
  37 |   getAllBrands(): Promise<ApiResult<BrandsListBody>> {
  38 |     return this.request.get(API.brandsList).then((r) => this.wrap<BrandsListBody>(r));
  39 |   }
  40 |   // API 4 — unsupported method -> responseCode 405
  41 |   putBrandsList(): Promise<ApiResult<BaseBody>> {
  42 |     return this.request.put(API.brandsList).then((r) => this.wrap<BaseBody>(r));
  43 |   }
  44 |   // API 5
  45 |   searchProduct(searchTerm: string): Promise<ApiResult<ProductsListBody>> {
  46 |     return this.request
  47 |       .post(API.searchProduct, { form: { search_product: searchTerm } })
  48 |       .then((r) => this.wrap<ProductsListBody>(r));
  49 |   }
  50 |   // API 6 — missing param -> responseCode 400
  51 |   searchProductNoParam(): Promise<ApiResult<BaseBody>> {
  52 |     return this.request.post(API.searchProduct).then((r) => this.wrap<BaseBody>(r));
  53 |   }
  54 |   // API 7 / 10 — valid or invalid creds
  55 |   verifyLogin(email: string, password: string): Promise<ApiResult<BaseBody>> {
  56 |     return this.request
  57 |       .post(API.verifyLogin, { form: { email, password } })
  58 |       .then((r) => this.wrap<BaseBody>(r));
  59 |   }
  60 |   // API 8 — missing email -> responseCode 400
  61 |   verifyLoginMissingEmail(password: string): Promise<ApiResult<BaseBody>> {
  62 |     return this.request
  63 |       .post(API.verifyLogin, { form: { password } })
  64 |       .then((r) => this.wrap<BaseBody>(r));
  65 |   }
  66 |   // API 9 — unsupported method -> responseCode 405
  67 |   deleteVerifyLogin(): Promise<ApiResult<BaseBody>> {
  68 |     return this.request.delete(API.verifyLogin).then((r) => this.wrap<BaseBody>(r));
  69 |   }
  70 |   // API 11 -> responseCode 201
  71 |   createAccount(payload: AccountPayload): Promise<ApiResult<BaseBody>> {
  72 |     return this.request
> 73 |       .post(API.createAccount, { form: { ...payload } })
     |        ^ Error: apiRequestContext.post: Max redirect count exceeded
  74 |       .then((r) => this.wrap<BaseBody>(r));
  75 |   }
  76 |   // API 12 -> responseCode 200
  77 |   deleteAccount(email: string, password: string): Promise<ApiResult<BaseBody>> {
  78 |     return this.request
  79 |       .delete(API.deleteAccount, { form: { email, password } })
  80 |       .then((r) => this.wrap<BaseBody>(r));
  81 |   }
  82 |   // API 13 -> responseCode 200
  83 |   updateAccount(payload: AccountPayload): Promise<ApiResult<BaseBody>> {
  84 |     return this.request
  85 |       .put(API.updateAccount, { form: { ...payload } })
  86 |       .then((r) => this.wrap<BaseBody>(r));
  87 |   }
  88 |   // API 14 -> responseCode 200
  89 |   getUserDetailByEmail(email: string): Promise<ApiResult<UserDetailBody>> {
  90 |     return this.request
  91 |       .get(API.getUserDetailByEmail, { params: { email } })
  92 |       .then((r) => this.wrap<UserDetailBody>(r));
  93 |   }
  94 | }
  95 | 
```