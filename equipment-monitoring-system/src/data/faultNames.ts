/**
 * 设备故障名称数据
 * 包含各种设备可能出现的故障情况
 */

export const FAULT_NAMES = [
  'SE跑条',
  'SE后道烟条断裂',
  'MAX搓板堵塞',
  'MAX搓接块堵塞',
  'SE前道烟条断裂',
  'MAX手动停止',
  'MAX下游机器的程控停机',
  'MAX上激光器堵塞',
  'SE断纸',
  '连接机器停止',
  'VE风道堵塞',
  'HCF堵塞',
  'MAX张紧辊',
  'MAX下防护罩2',
  '连接机器程序停止',
  'MAX激光器左侧堵塞',
  'VE烟丝料位',
  'MAX卷曲器水松纸断裂',
  'MAX过滤嘴棒监测',
  'MAX下防护罩1',
  'SE刀头防护罩',
  'B15.0滤嘴丢失超限',
  'VE料仓料位低',
  'MAX转交处堵塞',
  'MAX搓板位置',
  'SE后道烟枪入口区断纸',
  'MAX缺嘴',
  'SE前道烟枪入口区断纸',
  'MAX下游机器堵塞',
  'SE后道卷烟纸断裂',
  'SE前道卷烟纸断裂',
  'MAX水松纸断',
  'MAX前门',
  '下游机器停机',
  'LASER隔离器',
  '下游机器程序停机',
  'SE烟条断裂',
  'MAX时钟脉冲',
  'HCF满',
  'SE烟条断裂 B1M',
  'SE烟枪入口区前的纸断裂',
  'MAX上防护罩',
  'VE已进行排空运行',
  'MAX滤嘴储库的滤嘴料位',
  'MAX激光器右侧堵塞',
  'SE前道烟枪入口区烟纸断裂',
  'SE接纸胶架',
  'MAX滤嘴切刀1的滞后故障',
  'MAX加热器水松纸断裂',
  'SE下方烟纸断裂',
  'SE后道烟枪入口区烟纸断裂',
  'MAX加热器 B65M上的纸断裂',
  'MAX顶部滤嘴监测',
  'MAX检测轮堵塞',
  'SE烙铁温度',
  'SE布带轮防护罩',
  'MAX BOB未准备就绪',
  'MAX传递堵塞',
  'MAX驱动装置：滤嘴储库的滑动驱动装置',
  'MAX水松纸断纸',
  'MAX底部滤棒监测',
  'SE BOB未处于准备就绪状态',
  'SE粘接段传感器上的纸断裂',
  '盘纸自动更换机1 SE',
  'VE无烟丝',
  '图文显示系统已重新启动',
  'MAX出烟口堵塞',
  'SE时钟脉冲',
  '下游机器堵塞',
  'MAX滤嘴棒检测',
  'SE后道直径调节装置的极限',
  'MAX拉纸辊滞后故障',
  'SE纸盘',
  'HCF进料堵塞',
  'MAX减速鼓的滞后故障',
  'MAX手动操作',
  'VE辅助驱动状态',
  'MAX滤嘴堵塞',
  'MAX水松纸储备',
  'SE前道直径调节装置的极限',
  'MAX展平器上的纸断裂',
  'MAX移位寄存鼓的滞后故障',
  'SE接缝胶水储备',
  'VE烟丝堵塞',
  'MAX左侧激光器鼓的滞后故障',
  'MAX调头轮防护罩',
  'MAX激光器',
  'VE气闸门',
  'FM352_5未运行',
  'MAX胶水循环',
  'SE BOB纸断裂',
  'VE/SE后道重量调节装置',
  '陶瓷烙铁2防护罩',
  'MAX出烟堵塞',
  '陶瓷烙铁1防护罩',
  'MAX料位闸板',
  'VE吸丝带张紧',
  'MAX水松纸边沿调节器止挡',
  'VE风室未关',
  'SE烙铁2未降下',
  'VE前道吸丝带断裂',
  'MAX断路器',
  '*VE断路器',
  'VE堆料槽空',
  'MAX水松纸上胶剔出太高',
  'VE子站3故障',
  'SE油压低',
  '*VE/SE传感器/执行机构总线',
  'SE纸宽调节驱动装置滞后故障',
  'SE变频器子站6故障',
  '*VE QEF/QES针辊',
  'MAX换水松纸',
  'MAX阀岛子站9故障',
  'VE烟梗漏斗堵塞',
  'SE纵向驱动装置滞后误差',
  'SE切刀进给',
  'MAX子站5故障',
  'VE计量槽空',
  'MAX阀岛子站11故障',
  'SE前道下方烟纸断裂',
  '关断SE辅助驱动器',
  'VE烟梗螺旋式输送机的转速监测',
  'MAX油泵',
  'SE压缩空气',
  'MAX无水松纸',
  'SE左侧印刷器防护罩',
  'MAX上胶系统的胶水进口压力太低',
  'MAX压缩空气开关',
  'SE子站4故障',
  'MAX张紧盘纸',
  '陶瓷烙铁2位置',
  '*VE后道吸丝带调整辊',
  'MAX烟支切刀的滞后故障',
  'SE供墨Ⅰ料位空',
  'MAX材料停机',
  'MAX展平器上缺少水松纸',
  'VE液压系统运行时间',
  'MAX风机',
  '*VE前道吸丝带调整辊',
  'VE供丝门罩',
  'MAX无胶水',
  'MAX搓板温度',
  'VE/SE前道重量调节装置',
  'SE卷烟纸切口的剔出太高',
  'VE空气压力',
  'SE关闭废烟输送皮带',
  'MAX胶水罐位置',
  'MAX烟支切割鼓的滞后故障',
  'VISU用户联系不上',
  'VE修正器滞后误差',
  'MAX切刀电机连锁',
  'VE气闸闸板的打开运动',
  'MAX水松纸温度',
  'MAX右侧喷嘴上胶1转盘的驱动装置',
  'VE右门',
  'SE油箱的油位 B124S',
  'SE拉纸辊位置',
  '*MAX电机断路器',
  'MAX HID最大透气度',
  'SE进刀次数',
  'MAX右侧激光器鼓的滞后故障',
  '*SE烙铁加热器断线',
  'MAX烟条配属错误'
] as const

/**
 * 故障类型分类
 */
export const FAULT_CATEGORIES = {
  // SE相关故障
  SE: FAULT_NAMES.filter(name => name.includes('SE')),
  // MAX相关故障
  MAX: FAULT_NAMES.filter(name => name.includes('MAX')),
  // VE相关故障
  VE: FAULT_NAMES.filter(name => name.includes('VE')),
  // HCF相关故障
  HCF: FAULT_NAMES.filter(name => name.includes('HCF')),
  // 其他故障
  OTHER: FAULT_NAMES.filter(name => 
    !name.includes('SE') && 
    !name.includes('MAX') && 
    !name.includes('VE') && 
    !name.includes('HCF')
  )
} as const

/**
 * 随机获取一个故障名称
 * @returns 随机故障名称
 */
export function getRandomFaultName(): string {
  const randomIndex = Math.floor(Math.random() * FAULT_NAMES.length)
  return FAULT_NAMES[randomIndex]
}

/**
 * 根据设备类型随机获取故障名称
 * @param deviceType 设备类型 ('SE' | 'MAX' | 'VE' | 'HCF' | 'OTHER')
 * @returns 对应设备类型的随机故障名称
 */
export function getRandomFaultNameByCategory(deviceType: keyof typeof FAULT_CATEGORIES): string {
  const categoryFaults = FAULT_CATEGORIES[deviceType]
  if (categoryFaults.length === 0) {
    return getRandomFaultName() // 如果该类型没有故障，返回通用随机故障
  }
  const randomIndex = Math.floor(Math.random() * categoryFaults.length)
  return categoryFaults[randomIndex]
}

/**
 * 获取多个随机故障名称（不重复）
 * @param count 需要获取的故障数量
 * @returns 随机故障名称数组
 */
export function getMultipleRandomFaultNames(count: number): string[] {
  if (count >= FAULT_NAMES.length) {
    return [...FAULT_NAMES] // 如果需要的数量超过总数，返回所有故障名称
  }
  
  const shuffled = [...FAULT_NAMES].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, count)
}

/**
 * 根据关键词搜索故障名称
 * @param keyword 搜索关键词
 * @returns 包含关键词的故障名称数组
 */
export function searchFaultNames(keyword: string): string[] {
  return FAULT_NAMES.filter(name => 
    name.toLowerCase().includes(keyword.toLowerCase())
  )
}