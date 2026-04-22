💳 Bank Transaction System (Backend)
A fully functional backend banking system built using Node.js, Express, and MongoDB that simulates real-world financial transactions using a ledger-based accounting architecture.

This project demonstrates production-level backend concepts such as idempotent APIs, secure authentication, transaction integrity, and email notifications.

🚀 Features
🔐 Authentication & Security
User Registration & Login using JWT
Cookie-based authentication
Token blacklisting on logout for enhanced security
Protected routes using middleware

🏦 Account Management
Users can create multiple bank accounts
Each account has:
unique \_id
accountNumber
status (active/inactive)
Secure ownership validation (user can only access their own accounts)

💰 Ledger-Based Accounting System
Instead of storing balance directly, the system uses a ledger model:
Each transaction creates:
DEBIT entry (sender loses money)
CREDIT entry (receiver gains money)

👉 Balance is dynamically calculated using ledger entries.

Why this approach?
Prevents inconsistencies
Enables full audit history
Matches real-world banking systems

🔁 Idempotent Transactions
Each transaction requires a unique idempotencyKey
Prevents duplicate transactions in case of:
network retries
accidental repeated requests

🔄 Transaction System
Supports user-to-user money transfers
Includes validation:
account ownership
account status
sufficient balance
Transaction lifecycle:
PENDING
COMPLETED
MongoDB session-based atomicity with rollback safety

🏦 System User (Bank Simulation)
Special user with systemUser: true
Used to:
fund accounts (initial balance)
simulate real bank behavior

📩 Email Notifications
Integrated using Nodemailer + Gmail OAuth2

Emails are sent for:

✅ Successful transactions
❌ Failed transactions (e.g., insufficient balance)
👋 User registration (welcome email)

🧠 Middleware & Validation
Authentication middleware (protect)
Ownership verification
Account status validation
Input validation and error handling

🧠 How the System Works
Example Transaction Flow:
User sends a transfer request
Backend validates:
input fields
idempotency key
account ownership
account status
sufficient balance
Creates transaction (PENDING)
Creates ledger entries:
DEBIT (sender)
CREDIT (receiver)
Marks transaction as COMPLETED
Sends email notification

🛠️ Tech Stack
Node.js
Express.js
MongoDB
Mongoose
JWT (Authentication)
Nodemailer (Email Service)
Cookie Parser

📁 Project Structure
src/
│
├── config/ # Database connection
├── controllers/ # Business logic
├── middleware/ # Auth middleware
├── models/ # MongoDB schemas
├── routes/ # API routes
├── services/ # Email service
├── utils/ # Helper functions (e.g., balance calculation)
│
server.js # Entry point
⚙️ Installation & Setup

1. Clone the repository
   git clone https://github.com/YOUR_USERNAME/bank-transaction-system.git
   cd bank-transaction-system
2. Install dependencies
   npm install
3. Setup environment variables

Create a .env file in root:

PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
EMAIL_USER=your_email@gmail.com
CLIENT_ID=your_client_id
CLIENT_SECRET=your_client_secret
REFRESH_TOKEN=your_refresh_token 4. Run the project

npm run dev

Server will run on:
http://localhost:5000

🔌 API Endpoints
🔐 Auth Routes
Method Endpoint Description
POST /api/auth/register Register user
POST /api/auth/login Login user
POST /api/auth/logout Logout user

🏦 Account Routes
Method Endpoint Description
POST /api/accounts Create account
GET /api/accounts Get user accounts
GET /api/accounts/:id/balance Get account balance

💸 Transaction Routes
Method Endpoint Description
POST /api/transactions Transfer money
POST /api/transactions/system/initial-funds Initial funding (system user only)

📊 Example Flow
Register user
Login
Create account
Fund account (via system user)
Perform transactions
Check balance
Receive email notifications

🔒 Security Features
JWT-based authentication
Cookie-based session management
Token blacklist system
Ownership validation
Idempotency protection
Input validation & error handling

📈 Future Improvements
MongoDB transactions (atomic operations)
Transaction history API
Admin dashboard
Rate limiting
Swagger API documentation
Frontend integration (React)

👨‍💻 Author

Muneeb Bhatti
Backend Developer (MERN Stack)

⭐ Final Note

This project demonstrates real-world backend engineering practices including:

financial transaction handling
system design thinking
secure API development
scalable architecture
