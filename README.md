# ServerlessShop — Serverless AWS E-Commerce Platform

A production-style **serverless e-commerce application** built with **React + Vite, Node.js, Express, AWS Lambda, API Gateway, DynamoDB, S3, CloudFront, Route 53, ACM, SSM Parameter Store, IAM, CloudWatch, and GitHub Actions OIDC CI/CD**.

This project demonstrates how a traditional full-stack application can be modernized into a scalable, secure, cost-efficient, and fully serverless AWS architecture.

---

## Live Demo

**Application URL:** `https://serverless.rifkhan.xyz`

> Note: AWS resources may be stopped or deleted later to avoid cloud costs, but the full architecture, deployment proof, screenshots, and source code are documented in this repository.

---

## Project Showcase

![ServerlessShop Project Showcase](./docs/images/serverlessshop-project-showcase.png)

---

## Project Summary

**ServerlessShop** is a full-stack e-commerce platform that supports customer shopping flows and admin management features. The backend was modernized from a MySQL-style application into a serverless AWS backend using **Lambda + API Gateway + DynamoDB**.

The project includes:

- JWT authentication and role-based authorization
- Admin-only product and category management
- Product browsing, filtering, and searching
- Cart management
- Order creation and order status management
- Private S3 frontend hosting through CloudFront
- Serverless Express backend running on AWS Lambda
- DynamoDB single-table design
- SSM Parameter Store for production configuration and secrets
- GitHub Actions CI/CD using AWS OIDC with no long-lived IAM access keys

---

## Architecture Diagram

![ServerlessShop AWS Serverless Architecture](./docs/images/serverlessshop-architecture.png)

### High-Level Architecture Flow

```mermaid
flowchart TD
    User[Users / Browser] --> R53[Amazon Route 53 DNS]
    R53 --> ACM[AWS Certificate Manager SSL/TLS]
    ACM --> CF[Amazon CloudFront HTTPS 443]

    CF -->|Default behavior /*| S3[Amazon S3 Private Bucket]
    S3 --> FE[React + Vite Static Frontend]

    CF -->|/api/* behavior| APIGW[Amazon API Gateway HTTP API]
    APIGW --> LAMBDA[AWS Lambda Node.js + Express]
    LAMBDA --> DDB[Amazon DynamoDB Single-Table Design]

    LAMBDA --> SSM[AWS Systems Manager Parameter Store]
    LAMBDA --> CW[Amazon CloudWatch Logs]

    GHA[GitHub Actions] -->|OIDC Assume Role| IAM[AWS IAM Deploy Role]
    IAM -->|Deploy frontend| S3
    IAM -->|Invalidate cache| CF
    IAM -->|Deploy backend| LAMBDA
```

---

## Serverless Architecture

```text
User Browser
    ↓
Route 53 Custom Domain
    ↓
ACM SSL Certificate
    ↓
CloudFront HTTPS Distribution
    ├── Default behavior /*
    │       ↓
    │   Private S3 Bucket
    │       ↓
    │   React + Vite Static Frontend
    │
    └── API behavior /api/*
            ↓
        API Gateway HTTP API
            ↓
        AWS Lambda
            ↓
        Amazon DynamoDB
```

---

## CI/CD Pipeline

![ServerlessShop GitHub Actions CI/CD Pipeline](./docs/images/serverlessshop-cicd-pipeline.png)

```mermaid
flowchart TD
    Dev[Developer Pushes Code] --> Repo[GitHub Repository]
    Repo --> Actions[GitHub Actions]
    Actions --> OIDC[OIDC Authentication]
    OIDC --> Role[AWS IAM Deploy Role]

    Role --> FEPath{client/** changed?}
    FEPath -->|Yes| InstallFE[Install Frontend Dependencies]
    InstallFE --> BuildFE[Build React App]
    BuildFE --> UploadS3[Upload dist/ to S3]
    UploadS3 --> InvalidateCF[Invalidate CloudFront Cache]
    InvalidateCF --> LiveSite[Updated Live Website]

    Role --> BEPath{server/** changed?}
    BEPath -->|Yes| InstallBE[Install Production Dependencies]
    InstallBE --> ZipBE[Create Lambda ZIP Package]
    ZipBE --> UpdateLambda[Update Lambda Function Code]
    UpdateLambda --> LiveAPI[Updated Live API]
```

### CI/CD Highlights

- GitHub Actions uses **OIDC authentication** with AWS
- No IAM user access keys are stored in GitHub
- Frontend and backend deploy independently
- Frontend changes deploy to S3 and invalidate CloudFront
- Backend changes package the Express API and update Lambda
- Path-based workflows reduce unnecessary deployments

---

## Application Features

### Customer Features

- User registration and login
- JWT-based authentication
- Browse products
- Search products by name or description
- Filter products by category
- Add products to cart
- Update cart quantity
- Remove cart items
- Place orders
- View personal orders

### Admin Features

- Admin-only protected routes
- Create categories
- Delete categories
- Create products
- Update products
- Soft delete products
- View all customer orders
- Update order status

### Cloud / DevOps Features

- Serverless Express backend using AWS Lambda
- API Gateway HTTP API integration
- DynamoDB single-table design
- Private S3 frontend hosting
- CloudFront CDN with `/api/*` API routing
- Route 53 custom domain
- ACM SSL certificate
- SSM Parameter Store for secrets and configuration
- IAM least-privilege roles
- CloudWatch logs and monitoring
- GitHub Actions CI/CD with OIDC

---

## Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React, Vite, JavaScript |
| Frontend Hosting | Amazon S3 private bucket, Amazon CloudFront |
| Domain & SSL | Amazon Route 53, AWS Certificate Manager |
| Backend | Node.js, Express.js, serverless-http |
| Compute | AWS Lambda |
| API Layer | Amazon API Gateway HTTP API |
| Database | Amazon DynamoDB |
| Secrets & Config | AWS Systems Manager Parameter Store |
| Security | IAM roles, JWT, private S3, GitHub OIDC |
| CI/CD | GitHub Actions |
| Monitoring | Amazon CloudWatch |

---

## AWS Services Used

| Category | Services |
|---|---|
| Frontend Delivery | S3, CloudFront |
| Domain & HTTPS | Route 53, ACM |
| Backend API | API Gateway, Lambda |
| Database | DynamoDB |
| Security | IAM, SSM Parameter Store, JWT |
| CI/CD | GitHub Actions, OIDC IAM Role |
| Monitoring | CloudWatch |

---

## DynamoDB Single-Table Design

### Table Configuration

```text
Table name: serverlessshop-prod
Partition key: PK
Sort key: SK
Billing mode: PAY_PER_REQUEST
GSI1: GSI1PK + GSI1SK
GSI2: GSI2PK + GSI2SK
```

### Entity Patterns

| Entity | PK | SK | Purpose |
|---|---|---|---|
| User | `USER#userId` | `PROFILE` | User profile and authentication data |
| Category | `CATEGORY#categoryId` | `METADATA` | Product categories |
| Product | `PRODUCT#productId` | `METADATA` | Product information |
| Cart Item | `USER#userId` | `CART#productId` | User cart items |
| Order | `ORDER#orderId` | `METADATA` | Order data and embedded order items |

### DynamoDB Access Patterns

```mermaid
flowchart TD
    DDB[(DynamoDB Single Table)]

    Login[Login by email] --> EmailIndex[GSI1PK = EMAIL#email]
    EmailIndex --> DDB

    Categories[List categories] --> CategoryIndex[GSI1PK = CATEGORIES]
    CategoryIndex --> DDB

    Products[List products] --> ProductIndex[GSI1PK = PRODUCTS]
    ProductIndex --> DDB

    ProductsByCategory[Products by category] --> CategoryGSI[GSI2PK = CATEGORY#categoryId]
    CategoryGSI --> DDB

    Cart[Get user cart] --> CartQuery[PK = USER#userId and SK begins_with CART#]
    CartQuery --> DDB

    MyOrders[Get my orders] --> UserOrders[GSI2PK = USER#userId]
    UserOrders --> DDB

    AdminOrders[Admin list all orders] --> AllOrders[GSI1PK = ORDERS]
    AllOrders --> DDB
```

---

## API Endpoints

### Authentication

| Method | Endpoint | Access |
|---|---|---|
| POST | `/api/auth/register` | Public |
| POST | `/api/auth/login` | Public |
| GET | `/api/auth/me` | Authenticated |

### Categories

| Method | Endpoint | Access |
|---|---|---|
| GET | `/api/categories` | Public |
| POST | `/api/categories` | Admin |
| DELETE | `/api/categories/:id` | Admin |

### Products

| Method | Endpoint | Access |
|---|---|---|
| GET | `/api/products` | Public |
| GET | `/api/products/:id` | Public |
| POST | `/api/products` | Admin |
| PUT | `/api/products/:id` | Admin |
| DELETE | `/api/products/:id` | Admin |

### Cart

| Method | Endpoint | Access |
|---|---|---|
| GET | `/api/cart` | Authenticated |
| POST | `/api/cart` | Authenticated |
| PUT | `/api/cart/:id` | Authenticated |
| DELETE | `/api/cart/:id` | Authenticated |

### Orders

| Method | Endpoint | Access |
|---|---|---|
| POST | `/api/orders` | Authenticated |
| GET | `/api/orders/my-orders` | Authenticated |
| GET | `/api/orders` | Admin |
| PUT | `/api/orders/:id/status` | Admin |

---

## Security Design

```mermaid
flowchart TD
    Browser[Browser] -->|HTTPS| CloudFront[CloudFront]
    CloudFront -->|Private origin access| S3[S3 Private Bucket]
    CloudFront -->|/api/* HTTPS| APIGW[API Gateway]
    APIGW --> Lambda[Lambda]
    Lambda -->|IAM role only| DynamoDB[DynamoDB]
    Lambda -->|IAM role only| SSM[SSM Parameter Store]
    GitHub[GitHub Actions] -->|OIDC short-lived token| IAM[IAM Deploy Role]

    S3 -. Block public access .-> PublicAccess[No public bucket access]
    JWT[JWT Authentication] --> Lambda
    Admin[Admin Role Authorization] --> Lambda
```

### Security Highlights

| Component | Security Approach |
|---|---|
| S3 | Private bucket, no public access |
| CloudFront | Single public entry point with HTTPS |
| API Gateway | Public API entry routed through `/api/*` |
| Lambda | IAM execution role with least privilege |
| DynamoDB | Accessible only through Lambda IAM role |
| SSM Parameter Store | Stores secrets and production configuration |
| GitHub Actions | Uses OIDC instead of IAM access keys |
| Application Auth | JWT authentication and admin-only routes |

---

## Environment Variables

### Frontend

```env
VITE_API_BASE_URL=/api
```

### Lambda Production

```env
NODE_ENV=production
AWS_REGION=ap-south-1
SSM_PARAMETER_PREFIX=/serverlessshop
```

### SSM Parameter Store

```text
/serverlessshop/jwt/secret
/serverlessshop/jwt/expires-in
/serverlessshop/cors/origin
/serverlessshop/dynamodb/table-name
```

---

## Project Structure

```text
serverlessshop/
├── client/
│   ├── src/
│   ├── public/
│   ├── .env
│   └── package.json
│
├── server/
│   ├── src/
│   │   ├── app.js
│   │   ├── lambda.js
│   │   ├── server.js
│   │   ├── config/
│   │   │   ├── env.js
│   │   │   ├── ssm.js
│   │   │   └── db.js
│   │   ├── db/
│   │   │   └── dynamodb.js
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── routes/
│   │   ├── middleware/
│   │   └── utils/
│   └── package.json
│
├── .github/
│   └── workflows/
│       ├── deploy-frontend.yml
│       └── deploy-backend.yml
│
├── docs/
│   ├── images/
│   
│
└── README.md
```
---

## Deployment Flow

### Frontend Deployment

```bash
cd client
npm run build
aws s3 sync dist/ s3://YOUR_FRONTEND_BUCKET --delete
aws cloudfront create-invalidation --distribution-id YOUR_DISTRIBUTION_ID --paths "/*"
```

### Backend Deployment

```bash
cd server
npm ci --omit=dev
zip -r serverlessshop-api.zip . -x ".env" "*.zip" "node_modules/.cache/*"
aws lambda update-function-code \
  --function-name serverlessshop-api \
  --zip-file fileb://serverlessshop-api.zip
```

---

## GitHub Actions CI/CD Workflows

| Workflow | Trigger | Deployment |
|---|---|---|
| `deploy-frontend.yml` | `client/**` | Build React, upload to S3, invalidate CloudFront |
| `deploy-backend.yml` | `server/**` | Package backend ZIP, update Lambda |

This keeps deployments efficient because frontend-only changes do not redeploy the backend, and backend-only changes do not rebuild the frontend.

---

## Screenshots 

### Live Application

![Live Application](./docs/images/live-application.png)

### Home Page

![Home Page](./docs/images/home-page.png)

### Products Page

![Products Page](./docs/images/products-page.png)

### Product Details Page

![Product Details Page](./docs/images/product-details-page.png)

### Cart Page

![Cart Page](./docs/images/cart-page.png)

### Checkout / Order Page

![Checkout Order Page](./docs/images/checkout-order-page.png)

### Admin Dashboard

![Admin Dashboard](./docs/images/admin-dashboard.png)

### Admin Product Management

![Admin Product Management](./docs/images/admin-product-management.png)

### Route 53 Domain

![Route 53 Domain](./docs/images/route53-domain.png)

### ACM Certificate

![ACM Certificate](./docs/images/acm-certificate.png)

### CloudFront Distribution

![CloudFront Distribution](./docs/images/cloudfront-distribution.png)

### CloudFront Behaviors

![CloudFront Behaviors](./docs/images/cloudfront-behaviors.png)

### S3 Private Bucket

![S3 Private Bucket](./docs/images/s3-private-bucket.png)

### API Gateway HTTP API

![API Gateway HTTP API](./docs/images/api-gateway-http-api.png)

### Lambda Function

![Lambda Function](./docs/images/lambda-function.png)

### DynamoDB Table

![DynamoDB Table](./docs/images/dynamodb-table.png)

### DynamoDB Items

![DynamoDB Items](./docs/images/dynamodb-items.png)

### SSM Parameter Store

![SSM Parameter Store](./docs/images/ssm-parameter-store.png)

### IAM Lambda Role

![IAM Lambda Role](./docs/images/iam-lambda-role.png)

### GitHub Actions Frontend Success

![GitHub Actions Frontend Success](./docs/images/github-actions-frontend-success.png)

### GitHub Actions Backend Success

![GitHub Actions Backend Success](./docs/images/github-actions-backend-success.png)

---

## Problems Solved

### 1. Frontend calling localhost in production

Problem:

```text
POST http://localhost:5000/api/auth/register net::ERR_CONNECTION_REFUSED
```

Reason:

The production frontend bundle was built with the local API URL.

Solution:

```env
VITE_API_BASE_URL=/api
```

CloudFront routes `/api/*` to API Gateway, so the browser uses the same domain for frontend and backend.

---

### 3. Deploying Express on Lambda

The Express app is wrapped with `serverless-http`, allowing the same application structure to run on AWS Lambda behind API Gateway.

---

### 4. Securing CI/CD without IAM access keys

GitHub Actions uses OIDC to assume an AWS IAM role. This avoids storing long-lived AWS credentials in GitHub secrets.

---

## What This Project Demonstrates

This project proves hands-on experience with:

- Full-stack application deployment on AWS
- Serverless backend modernization
- Express.js running on AWS Lambda
- API Gateway HTTP API integration
- DynamoDB single-table design
- S3 private frontend hosting
- CloudFront CDN and `/api/*` routing
- Route 53 custom domain and ACM SSL
- Secure secrets management with SSM Parameter Store
- IAM least-privilege permissions
- GitHub Actions OIDC CI/CD
- Production-style cloud architecture documentation

---

## Future Improvements

- Add DynamoDB `TransactWriteItems` for stronger checkout consistency
- Add Terraform or CloudFormation infrastructure automation
- Add CloudWatch alarms and dashboards
- Add Lambda aliases and deployment versions
- Add blue/green Lambda deployments
- Add S3 pre-signed URL product image uploads
- Add payment gateway integration
- Add admin analytics dashboard
- Add automated API tests in GitHub Actions
- Add WAF protection for CloudFront

---

## Professional Summary

This project demonstrates the ability to design, build, migrate, secure, and deploy a real-world serverless e-commerce application on AWS using modern cloud-native and DevOps practices.

The most important production concept implemented in this project is:

```text
The browser uses one secure public domain.
CloudFront serves the React frontend from private S3.
CloudFront routes /api/* requests to API Gateway.
API Gateway invokes Lambda.
Lambda accesses DynamoDB and SSM using IAM roles.
GitHub Actions deploys through OIDC without static AWS keys.
```

---

## Author

**Mohammed Rifkhan**

AWS Certified Solutions Architect Associate  
Fullstack Developer | Cloud & DevOps Learner

