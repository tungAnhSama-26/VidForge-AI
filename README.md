# VidForge-AI (Monorepo)

Dự án VidForge-AI được xây dựng theo kiến trúc **Monorepo** sử dụng **Turborepo**, kết hợp **CQRS & Hexagonal Architecture**, và thiết kế **Multi-tenant**. Toàn bộ codebase được viết bằng **TypeScript 100%**.

## 🚀 Công nghệ sử dụng
- **Quản lý Package**: `pnpm` & `Turborepo`
- **Backend/Web**: Next.js (App Router)
- **Mobile**: React Native (Expo)
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM
- **Styling**: Tailwind CSS

---

## 🛠 Hướng dẫn cài đặt & Chạy dự án (Local Development)

### Yêu cầu hệ thống:
1. Đã cài đặt Node.js (phiên bản 18 trở lên).
2. Đã cài đặt `pnpm` (Chạy lệnh `npm install -g pnpm`).
3. Đã cài đặt **Docker** & **Docker Compose** (Dùng để chạy Database).
4. *(Tuỳ chọn)* Cài đặt ứng dụng **Expo Go** trên điện thoại để test App Mobile.

### Các bước chạy dự án:

#### Bước 1: Cài đặt thư viện
Mở Terminal ở thư mục gốc `VidForge-AI` và chạy:
```bash
npm install
```

#### Bước 2: Thiết lập Biến môi trường (.env)
Copy file mẫu để tạo file `.env` thật trên máy bạn:
```bash
cp .env.example .env
```
*(Bạn có thể mở file `.env` để điền các Key của Google Cloud, JWT, hay AI Providers)*

#### Bước 3: Khởi động Database (PostgreSQL)
Dự án sử dụng Docker để tạo Database cách ly hoàn toàn, không ảnh hưởng đến máy thật:
```bash
docker-compose up db -d
```
*(Database sẽ chạy ngầm ở port 5433).*

#### Bước 4: Tạo cấu trúc bảng cho Database (Migration)
Sau khi Database đã chạy, bạn đẩy toàn bộ schema (đã thiết kế chuẩn Multi-tenant) vào Postgres:
```bash
npm run db:push
```
*(Nếu console hỏi có muốn chạy các lệnh thay đổi không, hãy gõ `y` và Enter).*

#### Bước 5: Chạy toàn bộ ứng dụng (Web & Mobile)
```bash
npm run dev
```
Nhờ có Turborepo, hệ thống sẽ bật song song 2 server:
- **Next.js Web App**: Truy cập tại [http://localhost:3000](http://localhost:3000)
- **Expo Mobile App**: Hiện một mã QR trên Terminal. Bạn lấy app **Expo Go** quét mã này để chạy ứng dụng trên điện thoại, hoặc ấn phím `a` để chạy trên máy ảo Android.

---

## 🗄 Quản lý Database UI
Nếu bạn muốn xem hoặc sửa dữ liệu Database có sẵn, không cần phải tải các phần mềm nặng nề, chỉ cần gõ lệnh:
```bash
npm run db:studio
```
Drizzle sẽ mở ra một trang web quản trị giao diện cực kỳ trực quan.

## 🏗 Kiến trúc Codebase (CQRS & Hexagonal)
- `/packages/core`: Chứa toàn bộ core logic, các file BaseEntity, BaseCommand, BaseQuery...
- `/packages/db`: Thiết kế Database, Config Drizzle và Schema Migration.
- `/apps/web`: Ứng dụng Next.js (Dành cho trình duyệt web).
- `/apps/mobile`: Ứng dụng React Native Expo.
