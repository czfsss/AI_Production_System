# 安全升级指南

## 概述

本次升级为 FastAPI 后端添加了完整的安全认证系统，包括：

- ✅ JWT 访问令牌和刷新令牌
- ✅ 密码哈希存储（使用 bcrypt）
- ✅ OAuth2 兼容接口
- ✅ 完整的用户认证中间件
- ✅ 安全的密码验证

## 升级内容

### 1. 新增依赖包

- `passlib[bcrypt]>=1.7.4` - 密码哈希
- `pyjwt>=2.10.1` - JWT 令牌处理
- `python-jose[cryptography]>=3.3.0` - JWT 签名验证

### 2. 新增文件

```
app/
├── config/
│   └── auth_config.py           # JWT和认证配置
├── utils/
│   ├── auth_utils.py            # 认证工具类
│   ├── dependencies.py          # FastAPI依赖注入
│   └── migrate_passwords.py     # 密码迁移脚本
└── api/
    └── oauth2.py                # OAuth2兼容接口
```

### 3. 主要变更

- 用户密码现在使用 bcrypt 哈希存储
- 登录/注册返回 JWT 令牌而非用户信息
- 需要认证的接口使用 Bearer Token
- 添加了令牌刷新机制

## 迁移步骤

### 1. 数据库迁移（迁移现有用户密码）

**重要：请先备份数据库！**

```bash
cd fastapi-backend/app
python utils/migrate_passwords.py
```

这个脚本会：

- 将现有用户的明文密码转换为 bcrypt 哈希
- 自动跳过已经是哈希格式的密码
- 提供迁移进度反馈

### 2. 环境变量配置

复制 `env.example` 为 `.env` 并配置：

```bash
cp env.example .env
```

编辑 `.env` 文件，设置安全的 SECRET_KEY：

```env
SECRET_KEY=your-very-secure-secret-key-at-least-32-characters-long
```

## API 变更

### 用户认证接口

#### 1. 注册

```http
POST /api/user/register
Content-Type: application/json

{
    "username": "1234567",
    "password": "password123",
    "confirm_password": "password123",
    "nickname": "用户昵称"
}
```

**响应：**

```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "token_type": "bearer",
  "user_info": {
    "username": "1234567",
    "nickname": "用户昵称",
    "create_time": "2024-01-01T12:00:00"
  }
}
```

#### 2. 登录

```http
POST /api/user/login
Content-Type: application/json

{
    "username": "1234567",
    "password": "password123"
}
```

**响应格式同注册。**

#### 3. 获取用户信息（需要认证）

```http
GET /api/user/profile
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
```

#### 4. 刷新令牌

```http
POST /api/user/refresh
Content-Type: application/json

{
    "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

#### 5. 退出登录

```http
POST /api/user/logout
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
```

### OAuth2 接口

为了兼容标准 OAuth2 客户端，提供了以下接口：

#### 1. 获取令牌

```http
POST /oauth2/token
Content-Type: application/x-www-form-urlencoded

username=1234567&password=password123&grant_type=password
```

#### 2. 刷新令牌

```http
POST /oauth2/token/refresh
Content-Type: application/json

{
    "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

## 前端集成

### 1. 登录处理

```javascript
// 登录
const response = await fetch("/api/user/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ username, password }),
});

const data = await response.json();
if (response.ok) {
  // 存储令牌
  localStorage.setItem("access_token", data.access_token);
  localStorage.setItem("refresh_token", data.refresh_token);
  // 存储用户信息
  localStorage.setItem("user_info", JSON.stringify(data.user_info));
}
```

### 2. 请求拦截器

```javascript
// 在每个需要认证的请求中添加Authorization头
const token = localStorage.getItem("access_token");
if (token) {
  request.headers.Authorization = `Bearer ${token}`;
}
```

### 3. 令牌刷新

```javascript
// 当收到401错误时，尝试刷新令牌
if (response.status === 401) {
  const refreshToken = localStorage.getItem("refresh_token");
  if (refreshToken) {
    const refreshResponse = await fetch("/api/user/refresh", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (refreshResponse.ok) {
      const newTokens = await refreshResponse.json();
      localStorage.setItem("access_token", newTokens.access_token);
      localStorage.setItem("refresh_token", newTokens.refresh_token);
      // 重试原请求
    } else {
      // 刷新失败，重定向到登录页
      localStorage.clear();
      window.location.href = "/login";
    }
  }
}
```

## 安全特性

### 1. 密码安全

- 使用 bcrypt 进行密码哈希，自动加盐
- 密码最少 8 位长度要求
- 登录时使用安全的密码验证

### 2. JWT 安全

- 访问令牌 30 分钟过期
- 刷新令牌 7 天过期
- 使用 HS256 算法签名
- 令牌包含用户身份和过期时间

### 3. API 安全

- 所有敏感操作需要认证
- 统一的错误处理
- CORS 配置保护

## 测试验证

### 1. 使用 Swagger UI 测试

访问 `http://localhost:8001/docs` 使用内置的 API 文档测试接口。

### 2. 使用 Postman 测试

1. 先调用登录接口获取 token
2. 在后续请求的 Headers 中添加：`Authorization: Bearer <your_token>`

### 3. 使用 curl 测试

```bash
# 登录获取令牌
curl -X POST "http://localhost:8001/api/user/login" \
     -H "Content-Type: application/json" \
     -d '{"username":"1234567","password":"password123"}'

# 使用令牌访问受保护的接口
curl -X GET "http://localhost:8001/api/user/profile" \
     -H "Authorization: Bearer <your_token>"
```

## 故障排除

### 1. 登录失败

- 确认密码迁移已完成
- 检查用户名密码是否正确
- 查看服务器日志排查错误

### 2. 令牌验证失败

- 确认令牌格式正确（Bearer + 空格 + token）
- 检查令牌是否过期
- 确认 SECRET_KEY 配置正确

### 3. 数据库连接问题

- 确认数据库服务正常运行
- 检查数据库连接配置
- 确认用户表结构正确

## 性能优化建议

1. **生产环境配置**：

   - 使用强随机 SECRET_KEY
   - 启用 HTTPS
   - 配置适当的令牌过期时间

2. **缓存优化**：

   - 可考虑使用 Redis 缓存用户会话
   - 实现令牌黑名单功能

3. **监控告警**：
   - 监控认证失败次数
   - 记录异常登录行为

---

**升级完成！** 您的 FastAPI 后端现在具备了企业级的安全认证系统。
