<template>
  <div v-if="visible" class="profile-dialog-overlay" @click="handleOverlayClick">
    <div class="profile-dialog" @click.stop>
      <!-- 对话框头部 -->
      <div class="dialog-header">
        <div class="header-content">
          <el-icon class="user-icon" size="24"><User /></el-icon>
          <h3>个人设置</h3>
        </div>
        <el-button 
          type="text" 
          @click="$emit('close')" 
          class="close-btn"
          size="large"
        >
          <el-icon size="20"><Close /></el-icon>
        </el-button>
      </div>

      <!-- 对话框内容 -->
      <div class="dialog-content">
        <!-- 用户信息卡片 -->
        <div class="info-card">
          <div class="card-header">
            <el-icon class="card-icon"><InfoFilled /></el-icon>
            <span class="card-title">基本信息</span>
          </div>
          <div class="info-grid">
            <div class="info-item">
              <label>用户名</label>
              <span class="info-value">{{ userProfile?.username || '-' }}</span>
            </div>
            <div class="info-item">
              <label>昵称</label>
              <div class="nickname-edit-container">
                <span v-if="!isEditingNickname" class="info-value">{{ userProfile?.nickname || '-' }}</span>
                <el-input 
                  v-else
                  v-model="editNickname"
                  placeholder="请输入新昵称"
                  maxlength="20"
                  show-word-limit
                  class="nickname-input"
                  @keyup.enter="handleSaveNickname"
                  @keyup.esc="handleCancelEditNickname"
                />
                <div class="nickname-actions">
                  <el-button 
                    v-if="!isEditingNickname"
                    type="text" 
                    @click="handleEditNickname"
                    class="edit-btn"
                    size="small"
                  >
                    <el-icon><Edit /></el-icon>
                  </el-button>
                  <template v-else>
                    <el-button 
                      type="text" 
                      @click="handleSaveNickname"
                      :loading="isUpdatingNickname"
                      class="save-btn"
                      size="small"
                    >
                      <el-icon><Check /></el-icon>
                    </el-button>
                    <el-button 
                      type="text" 
                      @click="handleCancelEditNickname"
                      class="cancel-btn"
                      size="small"
                    >
                      <el-icon><Close /></el-icon>
                    </el-button>
                  </template>
                </div>
              </div>
            </div>
            <div class="info-item">
              <label>创建时间</label>
              <span class="info-value">{{ formatCreateTime(userProfile?.create_time) }}</span>
            </div>
          </div>
        </div>

        <!-- 密码修改卡片 -->
        <div class="password-card">
          <div class="card-header">
            <el-icon class="card-icon"><Lock /></el-icon>
            <span class="card-title">修改密码</span>
          </div>
          <el-form 
            ref="passwordFormRef" 
            :model="passwordForm" 
            :rules="passwordRules"
            label-width="100px"
            class="password-form"
          >
            <el-form-item label="当前密码" prop="currentPassword">
              <el-input
                v-model="passwordForm.currentPassword"
                type="password"
                placeholder="请输入当前密码"
                show-password
                clearable
              />
            </el-form-item>
            <el-form-item label="新密码" prop="newPassword">
              <el-input
                v-model="passwordForm.newPassword"
                type="password"
                placeholder="请输入新密码"
                show-password
                clearable
              />
            </el-form-item>
            <el-form-item label="确认密码" prop="confirmPassword">
              <el-input
                v-model="passwordForm.confirmPassword"
                type="password"
                placeholder="请再次输入新密码"
                show-password
                clearable
              />
            </el-form-item>
          </el-form>
        </div>
      </div>

      <!-- 对话框底部按钮 -->
      <div class="dialog-footer">
        <el-button @click="$emit('close')" size="large">
          取消
        </el-button>
        <el-button 
          type="primary" 
          @click="handleUpdatePassword"
          :loading="isUpdating"
          size="large"
        >
          <el-icon v-if="!isUpdating"><Check /></el-icon>
          {{ isUpdating ? '更新中...' : '保存修改' }}
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance } from 'element-plus'
import { User, Close, InfoFilled, Lock, Check, Edit } from '@element-plus/icons-vue'
import { userService, type UserProfile } from '../services/user'
import { useAuthStore } from '../stores/auth'

// Props
interface Props {
  visible: boolean
}

// Emits
interface Emits {
  (e: 'close'): void
  (e: 'updated'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()
const authStore = useAuthStore()

// 响应式数据
const userProfile = ref<UserProfile | null>(null)
const isLoading = ref(false)
const isUpdating = ref(false)
const isUpdatingNickname = ref(false)
const isEditingNickname = ref(false)
const passwordFormRef = ref<FormInstance>()
const editNickname = ref('')

// 密码表单
const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// 表单验证规则
const passwordRules = {
  currentPassword: [
    { required: true, message: '请输入当前密码', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    {
      validator: (_rule: unknown, value: string, callback: (error?: Error) => void) => {
        if (value !== passwordForm.newPassword) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

// 获取用户信息
const fetchUserProfile = async () => {
  try {
    isLoading.value = true
    userProfile.value = await userService.getUserProfile()
  } catch (error) {
    console.error('获取用户信息失败:', error)
    ElMessage.error('获取用户信息失败')
  } finally {
    isLoading.value = false
  }
}

// 格式化创建时间
const formatCreateTime = (createTime?: string): string => {
  if (!createTime) return '-'
  try {
    return new Date(createTime).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch {
    return createTime
  }
}

// 处理密码修改
const handleUpdatePassword = async () => {
  if (!passwordFormRef.value) return

  try {
    // 验证表单
    const isValid = await passwordFormRef.value.validate()
    if (!isValid) return

    // 确认对话框
    await ElMessageBox.confirm(
      '确定要修改密码吗？修改后需要重新登录。',
      '确认修改',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    isUpdating.value = true

    // 调用API修改密码
    const result = await userService.updatePassword({
      old_password: passwordForm.currentPassword,
      new_password: passwordForm.newPassword,
      confirm_password: passwordForm.confirmPassword
    })

    console.log('密码修改成功，返回用户信息:', result)
    ElMessage.success('密码修改成功，请重新登录')
    
    // 清空表单
    passwordForm.currentPassword = ''
    passwordForm.newPassword = ''
    passwordForm.confirmPassword = ''
    passwordFormRef.value.resetFields()

    // 通知父组件
    emit('updated')
    emit('close')

  } catch (error: unknown) {
    console.error('修改密码失败:', error)
    const message = (error as Error).message || '修改密码失败'
    ElMessage.error(message)
  } finally {
    isUpdating.value = false
  }
}

// 开始编辑昵称
const handleEditNickname = () => {
  editNickname.value = userProfile.value?.nickname || ''
  isEditingNickname.value = true
}

// 取消编辑昵称
const handleCancelEditNickname = () => {
  isEditingNickname.value = false
  editNickname.value = ''
}

// 保存昵称
const handleSaveNickname = async () => {
  if (!editNickname.value.trim()) {
    ElMessage.error('昵称不能为空')
    return
  }

  if (editNickname.value === userProfile.value?.nickname) {
    isEditingNickname.value = false
    return
  }

  try {
    isUpdatingNickname.value = true
    
    const result = await userService.updateNickname({
      nickname: editNickname.value.trim()
    })

    // 更新本地用户信息
    userProfile.value = result
    
    // 更新auth store中的用户信息
    if (authStore.userInfo) {
      authStore.userInfo.nickname = result.nickname
      localStorage.setItem('userInfo', JSON.stringify(authStore.userInfo))
    }

    isEditingNickname.value = false
    ElMessage.success('昵称修改成功')
    
  } catch (error: unknown) {
    console.error('修改昵称失败:', error)
    const message = (error as Error).message || '修改昵称失败'
    ElMessage.error(message)
  } finally {
    isUpdatingNickname.value = false
  }
}

// 处理遮罩层点击
const handleOverlayClick = () => {
  emit('close')
}

// 监听对话框显示状态
watch(() => props.visible, (newVisible) => {
  if (newVisible) {
    fetchUserProfile()
    // 重置表单
    if (passwordFormRef.value) {
      passwordFormRef.value.resetFields()
    }
    passwordForm.currentPassword = ''
    passwordForm.newPassword = ''
    passwordForm.confirmPassword = ''
    // 重置昵称编辑状态
    isEditingNickname.value = false
    editNickname.value = ''
  }
})

// 组件挂载时获取用户信息
onMounted(() => {
  if (props.visible) {
    fetchUserProfile()
  }
})
</script>

<style scoped>
.profile-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
  animation: fadeIn 0.3s ease;
}

.profile-dialog {
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow: hidden;
  animation: slideUp 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { 
    opacity: 0;
    transform: translateY(30px) scale(0.95);
  }
  to { 
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* 对话框头部 */
.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: linear-gradient(135deg, #72b6ea 0%, #3b82f6 100%);
  color: white;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-content h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}

.user-icon {
  background: rgba(255, 255, 255, 0.2);
  padding: 8px;
  border-radius: 50%;
}

.close-btn {
  color: white !important;
  background: rgba(255, 255, 255, 0.1) !important;
  border: none !important;
  border-radius: 8px !important;
  transition: all 0.3s ease;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.2) !important;
  transform: scale(1.05);
}

/* 对话框内容 */
.dialog-content {
  padding: 24px;
  max-height: 60vh;
  overflow-y: auto;
}

/* 卡片样式 */
.info-card, .password-card {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  transition: all 0.3s ease;
}

.info-card:hover, .password-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transform: translateY(-1px);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 2px solid #e2e8f0;
}

.card-icon {
  color: #3b82f6;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #2d3748;
}

/* 用户信息网格 */
.info-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #e2e8f0;
}

.info-item:last-child {
  border-bottom: none;
}

.info-item label {
  font-weight: 500;
  color: #4a5568;
  font-size: 14px;
}

.info-value {
  color: #2d3748;
  font-weight: 500;
  background: white;
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
  min-width: 120px;
  text-align: center;
}

/* 昵称编辑容器 */
.nickname-edit-container {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 200px;
}

.nickname-input {
  flex: 1;
  max-width: 180px;
}

.nickname-input :deep(.el-input__wrapper) {
  border-radius: 6px;
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;
}

.nickname-input :deep(.el-input__wrapper:hover) {
  border-color: #3b82f6;
}

.nickname-input :deep(.el-input__wrapper.is-focus) {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

.nickname-actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

.edit-btn, .save-btn, .cancel-btn {
  padding: 4px !important;
  min-width: 28px !important;
  height: 28px !important;
  border-radius: 4px !important;
  transition: all 0.3s ease;
}

.edit-btn {
  color: #6b7280 !important;
  background: transparent !important;
  border: none !important;
}

.edit-btn:hover {
  color: #3b82f6 !important;
  background: rgba(59, 130, 246, 0.1) !important;
}

.save-btn {
  color: #10b981 !important;
  background: transparent !important;
  border: none !important;
}

.save-btn:hover {
  color: #059669 !important;
  background: rgba(16, 185, 129, 0.1) !important;
}

.cancel-btn {
  color: #ef4444 !important;
  background: transparent !important;
  border: none !important;
}

.cancel-btn:hover {
  color: #dc2626 !important;
  background: rgba(239, 68, 68, 0.1) !important;
}

/* 密码表单 */
.password-form {
  margin-top: 8px;
}

.password-form :deep(.el-form-item) {
  margin-bottom: 20px;
}

.password-form :deep(.el-form-item__label) {
  color: #4a5568;
  font-weight: 500;
}

.password-form :deep(.el-input__wrapper) {
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;
}

.password-form :deep(.el-input__wrapper:hover) {
  border-color: #3b82f6;
}

.password-form :deep(.el-input__wrapper.is-focus) {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

/* 对话框底部 */
.dialog-footer {
  padding: 20px 24px;
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.dialog-footer .el-button {
  border-radius: 8px;
  padding: 12px 24px;
  font-weight: 500;
  transition: all 0.3s ease;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .profile-dialog {
    width: 95%;
    margin: 20px;
  }
  
  .dialog-header {
    padding: 20px;
  }
  
  .dialog-content {
    padding: 20px;
  }
  
  .info-grid {
    grid-template-columns: 1fr;
  }
  
  .info-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .info-value {
    width: 100%;
    text-align: left;
  }
  
  .password-form :deep(.el-form-item__label) {
    width: 80px !important;
  }
}

/* 滚动条样式 */
.dialog-content::-webkit-scrollbar {
  width: 6px;
}

.dialog-content::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.dialog-content::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.dialog-content::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>
