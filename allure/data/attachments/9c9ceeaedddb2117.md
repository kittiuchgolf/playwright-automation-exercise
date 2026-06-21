# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: web/auth.spec.ts >> Authentication >> TC5: register with an existing email shows error
- Location: tests/web/auth.spec.ts:16:3

# Error details

```
Error: apiRequestContext.post: Max redirect count exceeded
Call log:
  - → POST https://automationexercise.com/api/createAccount
    - user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36
    - accept: */*
    - accept-encoding: gzip,deflate,br
    - content-type: application/x-www-form-urlencoded
    - content-length: 326
  - ← 302 Found
    - date: Sun, 21 Jun 2026 18:43:13 GMT
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
    - report-to: {"group":"cf-nel","max_age":604800,"endpoints":[{"url":"https://a.nel.cloudflare.com/report/v4?s=i%2FBecCdKK0pafCdXsAffuZYtpP5CncYr79w22oF%2Fw3BNqUh%2FgE8rs7MN9ACSszzYaKB0B7m99hLZp%2FzuqVwTvudtJMSZp3el6CTv0Dc6uCgXyJeQG4mw2Hmd2LXdnUT3mgraHllApFiB"}]}
    - cf-ray: a0f528571fc725f7-IAD
    - alt-svc: h3=":443"; ma=86400
  - → GET https://automationexercise.com/
    - user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36
    - accept: */*
    - accept-encoding: gzip,deflate,br
  - ← 302 Found
    - date: Sun, 21 Jun 2026 18:43:13 GMT
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
    - report-to: {"group":"cf-nel","max_age":604800,"endpoints":[{"url":"https://a.nel.cloudflare.com/report/v4?s=sLDbbtRrnFxj2jsN7GORy9zGssrYfR6AcHHAEF06nXdCgWiN8sXEPa7CIfTAd%2F%2FEqJLQjeCNf49sIISMmm2B%2FJ1E0Y7OHe1YkGDQMhFN9pnF1Z%2BSNVdodRdHq3AbVRi8cxkLmbnYsrZt"}]}
    - cf-ray: a0f52859a9a94f53-IAD
    - alt-svc: h3=":443"; ma=86400
  - → GET https://automationexercise.com/
    - user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36
    - accept: */*
    - accept-encoding: gzip,deflate,br
  - ← 302 Found
    - date: Sun, 21 Jun 2026 18:43:14 GMT
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
    - report-to: {"group":"cf-nel","max_age":604800,"endpoints":[{"url":"https://a.nel.cloudflare.com/report/v4?s=9dysTGd43UWWR65cXsfQ6yth4E%2B9bjCFwEFiISWQdxS7brMaSfuBk07tYCDUd5qFAut6KzeXpz36G4TGI%2BvqDjl5zkzGR7%2FdvjtuetbQcoUM2Z8lwS7jA0VDOt3%2Fy4WLzds1x%2BUNVjmh"}]}
    - nel: {"report_to":"cf-nel","success_fraction":0.0,"max_age":604800}
    - cf-ray: a0f5285c1952817e-IAD
    - alt-svc: h3=":443"; ma=86400
  - → GET https://automationexercise.com/
    - user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36
    - accept: */*
    - accept-encoding: gzip,deflate,br
  - ← 302 Found
    - date: Sun, 21 Jun 2026 18:43:14 GMT
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
    - report-to: {"group":"cf-nel","max_age":604800,"endpoints":[{"url":"https://a.nel.cloudflare.com/report/v4?s=ne956GjRCaWd0KxvLBZccdavCZYKsWcJP8T7YFIv8SfgzgsTNrQTgyja6QEoqYuu6EnBma2bof0uvDECly7azTOhMIe1hU4kavb0b7xkK6Hp3XQM6YHZmU2hGcwyw7y8TWH68w6gtQpq"}]}
    - cf-ray: a0f5285e8d7e2fa3-IAD
    - alt-svc: h3=":443"; ma=86400
  - → GET https://automationexercise.com/
    - user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36
    - accept: */*
    - accept-encoding: gzip,deflate,br
  - ← 302 Found
    - date: Sun, 21 Jun 2026 18:43:14 GMT
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
    - report-to: {"group":"cf-nel","max_age":604800,"endpoints":[{"url":"https://a.nel.cloudflare.com/report/v4?s=ii3nN7KrWSvagUNR6%2F8s1t8kcZhtO8clA%2Fjqte9fvA4TTFW23Gv%2F%2F1wjBT2RDg3uMbrSNUAVboKDS%2B0XxBmc0BRuczW1iEc5gEm72OrUDjY24zssw0XBYO29X8GY%2FCKmTyKVm3sRJrQO"}]}
    - nel: {"report_to":"cf-nel","success_fraction":0.0,"max_age":604800}
    - cf-ray: a0f52860f81c8f57-IAD
    - alt-svc: h3=":443"; ma=86400
  - → GET https://automationexercise.com/
    - user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36
    - accept: */*
    - accept-encoding: gzip,deflate,br
  - ← 302 Found
    - date: Sun, 21 Jun 2026 18:43:15 GMT
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
    - report-to: {"group":"cf-nel","max_age":604800,"endpoints":[{"url":"https://a.nel.cloudflare.com/report/v4?s=HflzURFJ7sbyEtpLty4%2FB%2F6y2%2B8SBN39N9Uj9VEZ1QALeuBn86HtoopfH%2B9vBLd0Yaa5Mh8xZowRHZhQfssf3Co97Hgl0ICVdVFgGFvgywLnJSKC3pk6dtBypfwx79u1MYUpTCgrJscV"}]}
    - nel: {"report_to":"cf-nel","success_fraction":0.0,"max_age":604800}
    - cf-ray: a0f528637c470fbe-IAD
    - alt-svc: h3=":443"; ma=86400
  - → GET https://automationexercise.com/
    - user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36
    - accept: */*
    - accept-encoding: gzip,deflate,br
  - ← 302 Found
    - date: Sun, 21 Jun 2026 18:43:15 GMT
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
    - report-to: {"group":"cf-nel","max_age":604800,"endpoints":[{"url":"https://a.nel.cloudflare.com/report/v4?s=nbEofv0eOCNCywVrSV%2BQD3ElZtS0kUBtzPSyDu1oN3Q2nCOoXs3qoF8P1Lp8TShxc1NAPl0jEv3dJHqNhRCwXgfwqVrucZEUqjK2%2FN%2BKYANzRCpA%2FYz%2BqA4%2BjIjkJom6y3K4sSjuhMDv"}]}
    - nel: {"report_to":"cf-nel","success_fraction":0.0,"max_age":604800}
    - cf-ray: a0f52865fc8488d0-IAD
    - alt-svc: h3=":443"; ma=86400
  - → GET https://automationexercise.com/
    - user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36
    - accept: */*
    - accept-encoding: gzip,deflate,br
  - ← 302 Found
    - date: Sun, 21 Jun 2026 18:43:16 GMT
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
    - report-to: {"group":"cf-nel","max_age":604800,"endpoints":[{"url":"https://a.nel.cloudflare.com/report/v4?s=gAcvKVNiV5AN5omIK5XGyrzh88tk0X4hwKFawo6nmvzuK2bjH9W4%2B31iOBU4wa3G9SyVH%2BtwC6Y%2Bo9vNTJ8foVBkp27sS%2BR2Sxc796YBBehm39OEthgFwjzCLBh6LFpKo2J9nsqLeWHs"}]}
    - cf-ray: a0f528686a4ac994-IAD
    - alt-svc: h3=":443"; ma=86400
  - → GET https://automationexercise.com/
    - user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36
    - accept: */*
    - accept-encoding: gzip,deflate,br
  - ← 302 Found
    - date: Sun, 21 Jun 2026 18:43:17 GMT
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
    - report-to: {"group":"cf-nel","max_age":604800,"endpoints":[{"url":"https://a.nel.cloudflare.com/report/v4?s=DmBrbjRd09Jv%2B0bxGchjqgHE1BqbU%2BFK2AmU8fNRV4Bl1SgLUjjKDfyIiqtGu4FT%2F6nSe0hkRk%2FhIBRVHwjbuLsWGPs6dECkiYt9jYJsmw%2FYgMJfwa757cpLLRlhnk2hcxr2rqdZYIHY"}]}
    - nel: {"report_to":"cf-nel","success_fraction":0.0,"max_age":604800}
    - cf-ray: a0f5286c69bc9c22-IAD
    - alt-svc: h3=":443"; ma=86400
  - → GET https://automationexercise.com/
    - user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36
    - accept: */*
    - accept-encoding: gzip,deflate,br
  - ← 302 Found
    - date: Sun, 21 Jun 2026 18:43:17 GMT
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
    - report-to: {"group":"cf-nel","max_age":604800,"endpoints":[{"url":"https://a.nel.cloudflare.com/report/v4?s=Fxh6sCuYVr0cHrHRHV5dOGp8h3s6WNm0kxu68NXKoab19pQHP0AUFpNhkbiqaLqdrPEyMYDi0n%2Byqgi1PHuIqULe8PmDnuA%2BLrvufF%2FNov5wNcT1uwB06kLOU6IK885WxVa6BdXGGagD"}]}
    - nel: {"report_to":"cf-nel","success_fraction":0.0,"max_age":604800}
    - cf-ray: a0f528720ee03c85-IAD
    - alt-svc: h3=":443"; ma=86400
  - → GET https://automationexercise.com/
    - user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36
    - accept: */*
    - accept-encoding: gzip,deflate,br
  - ← 302 Found
    - date: Sun, 21 Jun 2026 18:43:18 GMT
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
    - report-to: {"group":"cf-nel","max_age":604800,"endpoints":[{"url":"https://a.nel.cloudflare.com/report/v4?s=9iqJyvBYoDQmMPW4xe466FOPtxjnUDSQCbwv6vQlWt7wUF5qryPIrT57dHBSzygmMjFvl8sqqI87Btm6%2BsRtiqCDZSq95AypVhgNHQgwiqw8jv7zAQKlpyOMda4HU3q9opfzkN2zzpoX"}]}
    - nel: {"report_to":"cf-nel","success_fraction":0.0,"max_age":604800}
    - cf-ray: a0f52875bfe8f542-IAD
    - alt-svc: h3=":443"; ma=86400
  - → GET https://automationexercise.com/
    - user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36
    - accept: */*
    - accept-encoding: gzip,deflate,br
  - ← 302 Found
    - date: Sun, 21 Jun 2026 18:43:18 GMT
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
    - report-to: {"group":"cf-nel","max_age":604800,"endpoints":[{"url":"https://a.nel.cloudflare.com/report/v4?s=jK4scPOETGyyFUh9vTgVrzDGw76VWPG%2Faa7Tpv3nCVFPDT6MNALqDZpGsq91odvBksCtbtIL52uewJTBoZqpZhpkA1w5cld%2BQ3Xp4PrM%2FN36MeLYJyxrAl35X5YMpCOJyBForRcOSHJ1"}]}
    - cf-ray: a0f528782f36dc5f-IAD
    - alt-svc: h3=":443"; ma=86400
  - → GET https://automationexercise.com/
    - user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36
    - accept: */*
    - accept-encoding: gzip,deflate,br
  - ← 302 Found
    - date: Sun, 21 Jun 2026 18:43:18 GMT
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
    - report-to: {"group":"cf-nel","max_age":604800,"endpoints":[{"url":"https://a.nel.cloudflare.com/report/v4?s=tGeV94NZkdmUM2zMXqTNrQFUY7VnwkQZmpOolc0kFGcGh%2Fu%2Bg8ZskCj5dxLzMysSsnTux8l1JfP2UuI2M2cg8AxU4rywCYrPm6GofLcTS%2FD1jCW0cWGQwmxTkKbeqoIgDDLNTTu%2Fy2Zn"}]}
    - cf-ray: a0f5287aab4125f7-IAD
    - alt-svc: h3=":443"; ma=86400
  - → GET https://automationexercise.com/
    - user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36
    - accept: */*
    - accept-encoding: gzip,deflate,br
  - ← 302 Found
    - date: Sun, 21 Jun 2026 18:43:19 GMT
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
    - report-to: {"group":"cf-nel","max_age":604800,"endpoints":[{"url":"https://a.nel.cloudflare.com/report/v4?s=D4SlFN9pNv3dGtDq6tlx7WKX3Utvo8g7St2wPlilEjOSpFz8SeObxeM2gwTaiWPNKLGan2RRo2FebvSWjJ1syVybkTubbR4EMwAY0%2FWVllMmYAWKmhXJtpzJcGrD1LKyTk%2FVdStnNHp%2F"}]}
    - cf-ray: a0f5287d1cd19307-IAD
    - alt-svc: h3=":443"; ma=86400
  - → GET https://automationexercise.com/
    - user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36
    - accept: */*
    - accept-encoding: gzip,deflate,br
  - ← 302 Found
    - date: Sun, 21 Jun 2026 18:43:19 GMT
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
    - report-to: {"group":"cf-nel","max_age":604800,"endpoints":[{"url":"https://a.nel.cloudflare.com/report/v4?s=W0sowkUif%2B4Rh%2F5w0enxDveSQH68DDUoc3SfMAfjfMbF6rjDDdkdVx1PJjTUlKL8SByzS%2FkmvPLkBGANzL7FiubtETz%2FmaJSAuRXdGMDeaNnKEnLSXDuiCqL4R82%2FJxXIPwfjAaDHKYx"}]}
    - cf-ray: a0f5287f88583b92-IAD
    - alt-svc: h3=":443"; ma=86400
  - → GET https://automationexercise.com/
    - user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36
    - accept: */*
    - accept-encoding: gzip,deflate,br
  - ← 302 Found
    - date: Sun, 21 Jun 2026 18:43:20 GMT
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
    - report-to: {"group":"cf-nel","max_age":604800,"endpoints":[{"url":"https://a.nel.cloudflare.com/report/v4?s=Y41jGYP%2Bc0OOaTT%2F4TATCWNQBIhfsk9f0mGcttI9yP9iBTTgINW0pYtXE%2FvPH3tZJcfLoka4ajCMAyGhmCOhZNXEyF7RjK1nfVivI5qSY46BKyGX4qa7OVMlgw1kRXFiX6F5ou8j3l9G"}]}
    - nel: {"report_to":"cf-nel","success_fraction":0.0,"max_age":604800}
    - cf-ray: a0f528820cdee633-IAD
    - alt-svc: h3=":443"; ma=86400
  - → GET https://automationexercise.com/
    - user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36
    - accept: */*
    - accept-encoding: gzip,deflate,br
  - ← 302 Found
    - date: Sun, 21 Jun 2026 18:43:20 GMT
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
    - report-to: {"group":"cf-nel","max_age":604800,"endpoints":[{"url":"https://a.nel.cloudflare.com/report/v4?s=1pXOvHeqteBUK3HvFni3Cjv%2FRkKpCSMX67LlzBo4vRALWyDI0hT%2BiqRA%2Bfg7iY7MvsZu%2BWzwN6XpNtVt8SU72s6i4m8Q9RDxHyNIE%2Fp2krkYi%2BoLNyfAgB024e%2B7YfLIlueth0uBNknK"}]}
    - nel: {"report_to":"cf-nel","success_fraction":0.0,"max_age":604800}
    - cf-ray: a0f528849ded4f53-IAD
    - alt-svc: h3=":443"; ma=86400
  - → GET https://automationexercise.com/
    - user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36
    - accept: */*
    - accept-encoding: gzip,deflate,br
  - ← 302 Found
    - date: Sun, 21 Jun 2026 18:43:20 GMT
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
    - report-to: {"group":"cf-nel","max_age":604800,"endpoints":[{"url":"https://a.nel.cloudflare.com/report/v4?s=YyGBkDCdUBh9%2BbSvphomgeUiJr7MY%2BqKMsHcEKq2FfNbs8h8KExkWIbQCm%2B9Lxsi8aTe5uwhEo6VsVwB1ijwPEFug%2B7wLMhkac8C98tYAYvsoKvzNZ%2F8KDCR%2B0DKYuBsQoqLmqAIO%2Bv5"}]}
    - nel: {"report_to":"cf-nel","success_fraction":0.0,"max_age":604800}
    - cf-ray: a0f528874d8f2fa3-IAD
    - alt-svc: h3=":443"; ma=86400
  - → GET https://automationexercise.com/
    - user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36
    - accept: */*
    - accept-encoding: gzip,deflate,br
  - ← 302 Found
    - date: Sun, 21 Jun 2026 18:43:21 GMT
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
    - report-to: {"group":"cf-nel","max_age":604800,"endpoints":[{"url":"https://a.nel.cloudflare.com/report/v4?s=SL%2Bv5Ho51ZJKwKvEzoNmQmDkI5ST%2BVgew9V7jGL6bvCe9qIWoE1MyBFxMlf5N7fPoYzx33Zvpgi6qfvFLnPsKFlVxj894LJx668a0uj1r%2F5VRmXoeiL%2FwoyrWFna3UU6uu7Qz8%2B7PYkG"}]}
    - cf-ray: a0f52889ba8d821b-IAD
    - alt-svc: h3=":443"; ma=86400
  - → GET https://automationexercise.com/
    - user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36
    - accept: */*
    - accept-encoding: gzip,deflate,br
  - ← 302 Found
    - date: Sun, 21 Jun 2026 18:43:21 GMT
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
    - report-to: {"group":"cf-nel","max_age":604800,"endpoints":[{"url":"https://a.nel.cloudflare.com/report/v4?s=BLiynX03u%2BpqQv7TnI5IQVIkOtuQWE6dyrgHjR9gZEIq5AEHjkpoETMOknJNW9Efh6bhwuffXELn1HIMP6RgcO1x7QSuYCq4UKc2qX3tanXHL9esLo56qspr29PkRWEDYitxj5yDhg4F"}]}
    - cf-ray: a0f5288c5e0a817e-IAD
    - alt-svc: h3=":443"; ma=86400
  - → GET https://automationexercise.com/
    - user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36
    - accept: */*
    - accept-encoding: gzip,deflate,br
  - ← 302 Found
    - date: Sun, 21 Jun 2026 18:43:22 GMT
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
    - report-to: {"group":"cf-nel","max_age":604800,"endpoints":[{"url":"https://a.nel.cloudflare.com/report/v4?s=8YU6CQLxlX1RHzFigzBi83BJOeYdHfZbdND7yS%2BKy1xQemeSM8f1WgrE8oQ%2FiuOX02nbYpf3LMaM6i5yijAUJ8kjcovAvHGAzPfpttiQ1sd1oC0Obk8Puvq6Mu2icw2mo6Z11ouw3RM%2B"}]}
    - cf-ray: a0f5288ec9cac994-IAD
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