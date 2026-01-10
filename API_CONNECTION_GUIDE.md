# API Connection Guide

## Overview
The frontend connects to the backend using a proxy configured in `vite.config.js` or via base URL in Axios.

## Endpoints

### Authentication
- **POST** `/api/auth/signup-init`
  - Body: `{ email, password, captchaToken }`
  - Desc: Validates password, checks captcha, sends OTP to email.
  
- **POST** `/api/auth/signup-verify`
  - Body: `{ email, otp }`
  - Desc: Verifies OTP, creates user, returns JWT.

- **POST** `/api/auth/login`
  - Body: `{ email, password }`
  - Desc: Validates credentials, sends MFA OTP.

- **POST** `/api/auth/login-verify`
  - Body: `{ email, otp }`
  - Desc: Verifies OTP, returns JWT.

## Setup
1. Ensure `server/.env` has `EMAIL_USER` and `EMAIL_PASS` (App Password) for OTP to work.
2. If running locally, check console logs for mocked OTPs if email is not set up.