# Front
項目的前端代碼

# Repository structure
```text
.
├── 1bit-forge-front/           # Vue 3 + Vite 前端專案
│   ├── public/
│   │   └── favicon.ico         # 網站 favicon
│   ├── src/
│   │   ├── api/                # API 請求封裝
│   │   │   ├── auth.js         # 認證相關 API
│   │   │   └── client.js       # HTTP 客戶端
│   │   ├── assets/             # 靜態資源
│   │   │   ├── auth.css        # 登入/註冊樣式
│   │   │   ├── base.css        # 基礎樣式
│   │   │   ├── logo.svg        # 網站標誌
│   │   │   └── main.css        # 主樣式
│   │   ├── components/         # Vue 元件
│   │   │   ├── auth/           # 認證相關元件
│   │   │   │   ├── AuthCard.vue
│   │   │   │   ├── AuthField.vue
│   │   │   │   └── PasswordField.vue
│   │   │   ├── Btn.vue         # 通用按鈕元件
│   │   │   ├── Calendar.vue    # 日曆元件
│   │   │   ├── CalendarEvent.vue # 日曆事件元件
│   │   │   ├── EventEdit.vue   # 事件編輯元件
│   │   │   └── MyDrawer.vue    # 抽屜元件
│   │   ├── composables/        # Vue Composables（可組合函式）
│   │   │   └── useAuth.js      # 認證邏輯組合
│   │   ├── constants/          # 常數定義
│   │   │   └── app.js
│   │   ├── layouts/            # 頁面布局
│   │   │   ├── AuthLayout.vue  # 認證頁面布局
│   │   │   └── MainLayout.vue  # 主頁面布局
│   │   ├── router/             # Vue Router 路由
│   │   │   └── index.js
│   │   ├── stores/             # Pinia 狀態管理
│   │   ├── utils/              # 工具函式
│   │   │   ├── authValidation.js # 認證驗證工具
│   │   │   └── cookie.js       # Cookie 操作工具
│   │   ├── views/              # 頁面視圖
│   │   │   ├── CalendarView.vue  # 日曆頁面
│   │   │   ├── LoginView.vue     # 登入頁面
│   │   │   ├── RegisterView.vue  # 註冊頁面
│   │   │   └── SettingView.vue   # 設定頁面
│   │   ├── App.vue             # 根元件
│   │   └── main.js             # 入口檔案
│   ├── .vscode/                # VSCode 設定
│   ├── index.html              # HTML 入口
│   ├── jsconfig.json           # JS 編譯設定
│   ├── package.json            # 專案依賴
│   ├── package-lock.json       # 依賴鎖定檔
│   ├── vite.config.js          # Vite 設定
│   └── README.md
├── .gitignore
├── LICENSE
└── README.md                   # 專案說明文件（本檔案）
```

# Local setup

These instructions assume you already have **Node.js 20.19.0** installed. If you don't, it is recommended to use **nvm** (Node Version Manager) to manage Node.js versions.

### Install nvm (Windows)

Download and install **nvm-windows** from: https://github.com/coreybutler/nvm-windows/releases

Once installed, open a new terminal and verify:

```bash
nvm version
```

### Install Node.js 20.19.0 via nvm

```bash
nvm install 20.19.0
nvm use 20.19.0
```

Verify the installation:

```bash
node --version   # should output v20.19.0
npm --version    # should output 10.x.x
```

Go into the Vue 3 project directory:

```bash
cd 1bit-forge-front
```

Install the dependencies:

```bash
npm install
```

> If installation fails, delete the `node_modules` folder and `package-lock.json`, then retry.

Start the development server:

```bash
npm run dev
```

The frontend should now be running at:

```text
http://localhost:5173/
```