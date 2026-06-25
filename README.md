# VidForge-AI (Monorepo)

The VidForge-AI project is built with a **Monorepo** architecture using **Turborepo**, combining **CQRS & Hexagonal Architecture**, and utilizing a **Multi-tenant** design. The entire codebase is written in **100% TypeScript**.

## 🚀 Technologies Used
- **Package Manager**: `pnpm` & `Turborepo`
- **Backend/Web**: Next.js (App Router)
- **Mobile**: React Native (Expo)
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM
- **Styling**: Tailwind CSS

---

## 🛠 Installation & Setup (Local Development)

### System Requirements:
1. Node.js installed (version 18 or higher).
2. `pnpm` installed (Run `npm install -g pnpm`).
3. **Docker** & **Docker Compose** installed (Used to run the Database).
4. *(Optional)* Install the **Expo Go** app on your phone to test the Mobile App.

### Steps to run the project:

#### Step 1: Install dependencies
Open the Terminal in the root directory `VidForge-AI` and run:
```bash
npm install
```

#### Step 2: Set up Environment Variables (.env)
Copy the example file to create the real `.env` file on your machine:
```bash
cp .env.example .env
```
*(You can open the `.env` file to fill in the Keys for Google Cloud, JWT, or AI Providers)*

#### Step 3: Start the Database (PostgreSQL)
The project uses Docker to create a completely isolated Database, without affecting your local machine:
```bash
docker-compose up db -d
```
*(The Database will run in the background on port 5433).*

#### Step 4: Create Database structure (Migration)
After the Database is running, push the entire schema (designed for Multi-tenant) into Postgres:
```bash
npm run db:push
```
*(If the console asks whether you want to execute the modifying commands, type `y` and press Enter).*

#### Step 5: Run the entire application (Web & Mobile)
```bash
npm run dev
```
Thanks to Turborepo, the system will start 2 servers in parallel:
- **Next.js Web App**: Access at [http://localhost:3000](http://localhost:3000)
- **Expo Mobile App**: A QR code will appear in the Terminal. Use the **Expo Go** app to scan this code to run the application on your phone, or press the `a` key to run it on the Android emulator.

---

## 🗄 Database Management UI
If you want to view or edit the existing Database data without downloading heavy software, just run:
```bash
npm run db:studio
```
Drizzle will open an extremely intuitive web interface for database management.

## 🏗 Codebase Architecture (CQRS & Hexagonal)
- `/packages/core`: Contains the entire core logic, BaseEntity, BaseCommand, BaseQuery files...
- `/packages/db`: Database design, Drizzle Config, and Schema Migration.
- `/apps/web`: Next.js application (For web browsers).
- `/apps/mobile`: React Native Expo application.
- `/apps/extension`: Chrome Browser Extension for content extraction.

---

## ✨ Key Features
- 🤖 **AI-Powered Script Generation** — Automatically generate detailed video scripts from topics or extracted web content using Gemini / Groq AI.
- 🖼 **AI Image Generation** — Generate scene illustrations from scripts directly within the chat interface.
- 💬 **Multi-turn Chat** — Conversational interface with full chat history and session management.
- 🔗 **Browser Extension** — Extract content from any webpage with one click and auto-fill it into the generator.
- 🌐 **Internationalization (i18n)** — Built-in multi-language support (English & Vietnamese).
- 🔐 **Authentication** — Secure login, registration, password reset, and Google OAuth.
- 👤 **Multi-tenant Admin Panel** — Full admin dashboard for managing users, content, configs, and logs.
- 📱 **Cross-platform** — Web app + Mobile app (React Native) sharing the same monorepo.

---

## 🌍 Environment Variables
Key variables required in your `.env` file:

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `GEMINI_API_KEY` | Google Gemini AI API key |
| `GROQ_API_KEY` | Groq AI API key |
| `NEXTAUTH_SECRET` | Secret key for NextAuth sessions |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Client Secret |

Refer to `.env.example` for the full list of required variables.

---

## 🤝 Contributing
Contributions are welcome! Please follow these steps:

1. Fork the repository.
2. Create a new branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m 'feat: add some feature'`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Open a Pull Request.

---

## 📄 License
This project is licensed under the **MIT License**. See the [LICENSE](./LICENSE) file for details.

---

<p align="center">Built with ❤️ by the VidForge AI Team</p>

