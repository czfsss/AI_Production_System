/**
 * 班次时间判断工具函数
 * 班次是根据时间自动判断的：
 * 早班：7:30-16:00
 * 中班：16:00-00:30
 * 晚班：00:30-7:30
 */

export interface ShiftTime {
  name: string
  label: string
  code: number
  startTime: string
  endTime: string
}

// 班次定义（基于时间的班次）
export const SHIFT_DEFINITIONS: ShiftTime[] = [
  {
    name: '早班',
    label: '早班',
    code: 1,
    startTime: '07:30',
    endTime: '16:00'
  },
  {
    name: '中班', 
    label: '中班',
    code: 2,
    startTime: '16:00',
    endTime: '00:30'
  },
  {
    name: '晚班',
    label: '晚班', 
    code: 3,
    startTime: '00:30',
    endTime: '07:30'
  }
]

/**
 * 将时间字符串转换为分钟数（从00:00开始计算）
 * @param timeStr 时间字符串，格式：HH:MM
 * @returns 分钟数
 */
function timeToMinutes(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number)
  return hours * 60 + minutes
}

/**
 * 根据当前时间判断班次（注意：这是班次，不是班组）
 * @param currentTime 当前时间，可选，默认为当前时间
 * @returns 班次信息
 */
export function getCurrentShiftByTime(currentTime?: Date): ShiftTime {
  const now = currentTime || new Date()
  const currentMinutes = now.getHours() * 60 + now.getMinutes()
  
  // 早班：7:30-16:00
  const morningStart = timeToMinutes('07:30')  // 450
  const morningEnd = timeToMinutes('16:00')    // 960
  
  // 中班：16:00-00:30 (跨天)
  const afternoonStart = timeToMinutes('16:00') // 960
  const afternoonEnd = timeToMinutes('00:30')   // 30 (第二天)
  
  if (currentMinutes >= morningStart && currentMinutes < morningEnd) {
    // 早班：7:30-16:00
    return SHIFT_DEFINITIONS[0]
  } else if (currentMinutes >= afternoonStart || currentMinutes < afternoonEnd) {
    // 中班：16:00-00:30 (跨天，所以是 >= 16:00 或 < 00:30)
    return SHIFT_DEFINITIONS[1]
  } else {
    // 晚班：00:30-7:30 (其他时间段)
    return SHIFT_DEFINITIONS[2]
  }
}

/**
 * 根据班次代码获取班次名称
 * @param shiftCode 班次代码 1-早班，2-中班，3-晚班
 * @returns 班次名称
 */
export function getShiftNameByCode(shiftCode: number): string {
  const shift = SHIFT_DEFINITIONS.find(s => s.code === shiftCode)
  return shift ? shift.name : '未知班次'
}

/**
 * 获取班次时间范围描述
 * @param shiftCode 班次代码
 * @returns 时间范围描述
 */
export function getShiftTimeRange(shiftCode: number): string {
  const shift = SHIFT_DEFINITIONS.find(s => s.code === shiftCode)
  if (!shift) return '未知时间'
  
  if (shift.code === 2) {
    // 中班跨天显示
    return `${shift.startTime} - 次日${shift.endTime}`
  }
  return `${shift.startTime} - ${shift.endTime}`
}

/**
 * 获取当前班次的详细信息（包含时间范围）
 * @param currentTime 当前时间，可选
 * @returns 包含时间范围的班次信息
 */
export function getCurrentShiftInfo(currentTime?: Date): ShiftTime & { timeRange: string } {
  const shift = getCurrentShiftByTime(currentTime)
  return {
    ...shift,
    timeRange: getShiftTimeRange(shift.code)
  }
}