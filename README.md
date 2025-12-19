# Water Billing Management System
This project is a comprehensive solution designed to automate the management, calculation, and payment of water bills for urban water service providers. The system ensures accuracy, transparency in billing, and enhances operational efficiency for customers, employees, and administrators.

## 🚀 Key Features
The system is built with three distinct user roles:

### 1. For Customers (Owners)
- **Dashboard**: View the latest bills, water usage trends via charts, and current pricing tiers.

- **Billing Management**: Search billing history, view detailed cost breakdowns by tiers, and manage payments.

- **Meter Tracking**: Monitor active water meters associated with their contracts.

- **Requests**: Submit requests for information updates or service suspension.

### 2. For Employees
- **Meter Reading**: Record new water meter readings in the field.

- **Collection Management**: Handle direct cash collections and update payment statuses for invoices.

### 3. For Administrators
- **Entity Management**: Manage customers (owners), employees, contracts, facilities, and water meters.

- **Pricing Configuration**: Set up and update flexible tiered pricing for different contract types.

- **Billing Cycles**: Create, manage, and close periodic billing cycles.

- **Approval Workflow**: Verify meter readings recorded by employees before invoices are automatically generated.

## 🛠 Tech Stack
## Backend
- **Framework**: Java Spring Boot 3.4.3.

- **Security**: Spring Security with OAuth2 Resource Server & JWT.

- **Database**: MySQL.

- **Libraries**: * Lombok & MapStruct: For boilerplate reduction and object mapping.

- **iText7**: For PDF invoice generation.

- **Spring Mail**: For OTP and system notifications.

- **Jakarta Validation**: For data integrity.

## Frontend
- **Framework**: React 19 with Vite.

- **State Management**: Redux Toolkit & Redux Persist.

- **UI Components**: Tailwind CSS 4, Radix UI primitives (Shadcn/UI), and Lucide React icons.

- **Data Visualization**: Recharts.

- **Form Validation**: Zod.

- **API Client**: Axios.

## 📋 Prerequisites
- **Java**: 17 or higher.

- **Node.js**: Latest LTS version.

- **Database**: MySQL Server.

## 🔧 Installation & Setup
### 1. Backend Setup
1. Navigate to the server/ directory.

2. Configure your database credentials and mail settings in src/main/resources/application.properties or application.yaml.

3. The JWT Signer Key is pre-configured in the environment.

4. Build and run the application:
```bash
Bash

./mvnw spring-boot:run
```
### 2. Frontend Setup
1. Navigate to the client/ directory.

2. Install dependencies:
```bash
Bash

npm install
```
3. Start the development server:
```bash
Bash

npm run dev
```
## Conclusion
Detailed information about the project can be found in the **BaoCaoNMCNPM_nhom15.pdf** document 
