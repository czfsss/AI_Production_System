# 生产环境部署脚本

# 1. 安装依赖
Write-Host "安装前端依赖..." -ForegroundColor Green
Set-Location "equipment-monitoring-system"
pnpm install

# 2. 构建生产版本
Write-Host "构建生产版本..." -ForegroundColor Green
pnpm build

# 3. 预览生产版本（可选）
Write-Host "启动生产预览..." -ForegroundColor Yellow
Write-Host "访问地址: http://10.43.32.231:1130" -ForegroundColor Cyan
pnpm preview