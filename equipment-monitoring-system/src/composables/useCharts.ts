import { ref, reactive, onMounted, onUnmounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts'
import { getMultipleRandomFaultNames } from '../data/faultNames'
import { createEChartsWebSocketService } from '../services/echartsWebSocket'
import { createEChartsHttpService, type EChartsPostData, type EChartsPostParams } from '../services/echartsHttp'
import { getCurrentShiftByTime } from '@/utils/shiftTimeUtils'

interface ChartFilters {
  dateRange: [Date, Date]
  shift: string
}

interface ChartDataItem {
  name: string
  value: number
}

interface PieDataItem {
  value: number
  name: string
}

export function useCharts() {
  // 图表引用
  const chart1Ref = ref<HTMLElement | null>(null)
  const chart2Ref = ref<HTMLElement | null>(null)
  const chart3Ref = ref<HTMLElement | null>(null)
  const chart4Ref = ref<HTMLElement | null>(null) // 产量图表
  const chart5Ref = ref<HTMLElement | null>(null) // 坏烟量图表
  
  // 图表实例
  let chart1Instance: echarts.ECharts | null = null
  let chart2Instance: echarts.ECharts | null = null
  let chart3Instance: echarts.ECharts | null = null
  let chart4Instance: echarts.ECharts | null = null
  let chart5Instance: echarts.ECharts | null = null

  // 图表过滤器
  const chartFilters = reactive<ChartFilters>({
    dateRange: [new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), new Date()],
    shift: ''
  })

  // 刷新状态
  const isRefreshing = ref(false)
  const refreshInterval = ref<number | null>(null)

  // WebSocket服务
  const echartsWebSocketService = createEChartsWebSocketService()
  const isWebSocketConnected = ref(false)
  const currentEquipmentName = ref('')
  const currentClassShift = ref('')
  
  // WebSocket数据
  const websocketData = ref<{
    stop_half: Array<{故障名称: string, 停机时长: number}>
    sort_result: Array<{故障名称: string, 故障次数: number}>
  }>({
    stop_half: [],
    sort_result: []
  })

  // HTTP服务
  const echartsHttpService = createEChartsHttpService()
  const httpData = ref<EChartsPostData>({
    fault_counts: [],
    production: [],
    bad_somke: []
  })
  const isHttpLoading = ref(false)
  const httpPollingTimer = ref<NodeJS.Timeout | null>(null)
  
  // 查询参数
  const queryParams = ref<EChartsPostParams>({
    equ_name: '',
    start_time: '',
    end_time: '',
    class_group: ''
  })

  // 初始化图表
  const initCharts = () => {
    // 使用 setTimeout 确保 DOM 已完全渲染
    setTimeout(() => {
      // 销毁已存在的图表实例
      if (chart1Instance) {
        chart1Instance.dispose()
        chart1Instance = null
      }
      if (chart2Instance) {
        chart2Instance.dispose()
        chart2Instance = null
      }
      if (chart3Instance) {
        chart3Instance.dispose()
        chart3Instance = null
      }
      if (chart4Instance) {
        chart4Instance.dispose()
        chart4Instance = null
      }
      if (chart5Instance) {
        chart5Instance.dispose()
        chart5Instance = null
      }
      
      // 重新初始化图表实例
      if (chart1Ref.value) {
        chart1Instance = echarts.init(chart1Ref.value)
        updateChart1()
      }
      if (chart2Ref.value) {
        chart2Instance = echarts.init(chart2Ref.value)
        updateChart2()
      }
      if (chart3Ref.value) {
        chart3Instance = echarts.init(chart3Ref.value)
        updateChart3()
      }
      if (chart4Ref.value) {
        chart4Instance = echarts.init(chart4Ref.value)
        updateChart4()
      }
      if (chart5Ref.value) {
        chart5Instance = echarts.init(chart5Ref.value)
        updateChart5()
      }
      
      // 确保图表尺寸正确
      resizeCharts()
    }, 50) // 50ms 延迟，确保 DOM 完全渲染
  }

  // 重新调整图表大小
  const resizeCharts = () => {
    // 使用 requestAnimationFrame 确保在下一次重绘时调整大小
    requestAnimationFrame(() => {
      if (chart1Instance) chart1Instance.resize()
      if (chart2Instance) chart2Instance.resize()
      if (chart3Instance) chart3Instance.resize()
      if (chart4Instance) chart4Instance.resize()
      if (chart5Instance) chart5Instance.resize()
    })
  }

  // 强制重新调整所有图表大小的函数
  const forceResizeCharts = () => {
    setTimeout(() => {
      resizeCharts()
    }, 100)
  }

  // 组件挂载时添加窗口大小改变监听
  onMounted(() => {
    window.addEventListener('resize', resizeCharts)
    
    // 设置WebSocket事件监听器
    echartsWebSocketService.on('connected', (data: any) => {
      console.log('[ECharts] WebSocket连接成功:', data)
      isWebSocketConnected.value = true
      currentEquipmentName.value = data.equipmentName
      currentClassShift.value = data.classShift
    })
    
    echartsWebSocketService.on('disconnected', (data: any) => {
      console.log('[ECharts] WebSocket连接断开:', data)
      isWebSocketConnected.value = false
    })
    
    echartsWebSocketService.on('message', (data: any) => {
      console.log('[ECharts] 收到WebSocket数据:', data)
      // 更新WebSocket数据
      websocketData.value = data
      
      // 更新图表2和图表3
      if (chart2Instance) {
        updateChart2WithRealData()
      }
      if (chart3Instance) {
        updateChart3WithRealData()
      }
    })
    
    echartsWebSocketService.on('error', (error: any) => {
      console.error('[ECharts] WebSocket错误:', error)
      isWebSocketConnected.value = false
    })
  })

  // 组件卸载时清理图表实例和事件监听
  onUnmounted(() => {
    window.removeEventListener('resize', resizeCharts)
    if (chart1Instance) chart1Instance.dispose()
    if (chart2Instance) chart2Instance.dispose()
    if (chart3Instance) chart3Instance.dispose()
    if (chart4Instance) chart4Instance.dispose()
    if (chart5Instance) chart5Instance.dispose()
    
    // 断开WebSocket连接
    echartsWebSocketService.disconnect()
  })

  // 连接WebSocket
  const connectWebSocket = async (equipmentName: string, classShift: string) => {
    try {
      // 直接使用基于当前时间的班次判断，不再依赖WebSocket的classlabel
      const currentShift = getCurrentShiftByTime()
      const finalClassShift = currentShift.name
      
      console.log(`[ECharts] 使用基于时间的班次判断: ${finalClassShift} (当前时间: ${new Date().toLocaleTimeString()})`)
      
      // 如果已经连接到相同的设备和班次，先断开连接
      if (isWebSocketConnected.value && currentEquipmentName.value === equipmentName && currentClassShift.value === finalClassShift) {
        disconnectWebSocket()
      }
      
      await echartsWebSocketService.connect(equipmentName, finalClassShift)
      console.log('[ECharts] WebSocket连接请求已发送')
    } catch (error) {
      console.error('[ECharts] WebSocket连接失败:', error)
      ElMessage.error('图表数据连接失败')
    }
  }

  // 断开WebSocket
  const disconnectWebSocket = () => {
    echartsWebSocketService.disconnect()
    console.log('[ECharts] WebSocket已断开')
  }

  // 使用真实数据更新图表2 - 本班故障停机时长统计
  const updateChart2WithRealData = () => {
    if (!chart2Instance) return
    
    // 如果没有WebSocket数据，不更新图表（由模板条件渲染处理）
    if (!websocketData.value.stop_half.length) {
      return
    }
    
    const data = websocketData.value.stop_half.map(item => item.停机时长);
    const faultNames = websocketData.value.stop_half.map(item => item.故障名称);

    const option = {
      title: { text: '本班故障停机时长统计', left: 'center', textStyle: { fontSize: 16 } },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' }
      },
      toolbox: {
        feature: {
          magicType: { type: ['line', 'bar'] },
          restore: {},
          saveAsImage: {}
        }
      },
      grid: { top: '20%', right: '3%', left: '3%', bottom: '20%', containLabel: true },
      xAxis: {
        type: 'category',
        data: faultNames,
        axisLabel: { 
          rotate: 45,
          fontSize: 10,
          interval: 0
        }
      },
      yAxis: {
        type: 'value',
        name: '停机时长(分钟)'
      },
      series: [{
        type: 'bar',
        smooth: true,
        data: data,
        itemStyle: {
          borderRadius: [4, 4, 0, 0],
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#FF8A80' },
            { offset: 1, color: '#FF5252' }
          ])
        },
      }]
    }
    chart2Instance.setOption(option)
  }

  // 使用真实数据更新图表3 - 故障分类统计
  const updateChart3WithRealData = () => {
    if (!chart3Instance) return
    
    // 如果没有WebSocket数据，不更新图表（由模板条件渲染处理）
    if (!websocketData.value.sort_result.length) {
      return
    }
    
    const data = websocketData.value.sort_result.map(item => ({
      value: item.故障次数,
      name: item.故障名称
    }))

    const option = {
      title: { text: '本班故障分类统计', left: 'center', textStyle: { fontSize: 16 } },
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c} ({d}%)',
        textStyle: {
          fontSize: 12
        }
      },
      legend: {
        orient: 'horizontal',
        bottom: '5%',
        left: 'center',
        textStyle: {
          fontSize: 10
        },
        formatter: function(name: string) {
          // 截断过长的故障名称
          return name.length > 15 ? name.substring(0, 15) + '...' : name
        }
      },
      grid: { top: '20%', right: '3%', left: '3%', bottom: '15%', containLabel: true },
      series: [{
        name: '故障次数',
        type: 'pie',
        radius: ['30%', '60%'], // 改为环形图，节省空间
        center: ['50%', '45%'], // 居中显示，向上偏移一点给底部图例留空间
        avoidLabelOverlap: false,
        itemStyle: {
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: true,
          formatter: '{c}次',
          position: 'outside',
          fontSize: 10
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 12,
            fontWeight: 'bold'
          },
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        },
        labelLine: {
          show: true,
          length: 8,
          length2: 12,
          maxSurfaceAngle: 80
        },
        data: data,
        color: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57', '#DDA0DD'] // 新的颜色方案
      }]
    }
    chart3Instance.setOption(option)
  }

  // 获取HTTP数据
  const fetchHttpData = async (params?: EChartsPostParams) => {
    try {
      isHttpLoading.value = true
      
      // 使用传入的参数或默认参数
      const requestParams = params || queryParams.value
      
      // 确保设备名称不为空
      if (!requestParams.equ_name) {
        console.warn('[ECharts HTTP] 设备名称为空，跳过请求')
        return
      }
      
      const data = await echartsHttpService.getEChartsData(requestParams)
      httpData.value = data
      
      // 更新图表1、图表4和图表5
      if (chart1Instance) {
        updateChart1WithRealData()
      }
      if (chart4Instance) {
        updateChart4WithRealData()
      }
      if (chart5Instance) {
        updateChart5WithRealData()
      }
      
      console.log('[ECharts HTTP] 数据获取成功:', data)
    } catch (error) {
      console.error('[ECharts HTTP] 获取数据失败:', error)
      ElMessage.error('获取图表数据失败')
    } finally {
      isHttpLoading.value = false
    }
  }

  // 开始HTTP轮询
  const startHttpPolling = (equipmentName: string) => {
    // 设置查询参数
    queryParams.value.equ_name = equipmentName
    
    // 立即获取一次数据
    fetchHttpData()
    
    // 每小时轮询一次
    httpPollingTimer.value = setInterval(() => {
      fetchHttpData()
    }, 60 * 60 * 1000) // 1小时
  }

  // 停止HTTP轮询
  const stopHttpPolling = () => {
    if (httpPollingTimer.value) {
      clearInterval(httpPollingTimer.value)
      httpPollingTimer.value = null
    }
  }

  // 更新查询参数并获取数据
  const updateQueryParamsAndFetch = async (params: EChartsPostParams) => {
    // 更新查询参数
    queryParams.value = { ...queryParams.value, ...params }
    
    // 立即使用新参数获取数据
    await fetchHttpData(params)
  }

  // 使用真实数据更新图表1 - 各班组当前设备故障次数统计
  const updateChart1WithRealData = () => {
    if (!chart1Instance) return
    
    console.log('[ECharts] 更新图表1，筛选条件:', chartFilters.shift)
    console.log('[ECharts] 图表1数据:', httpData.value.fault_counts)
    
    // 完全清空图表（使用第二个参数 true 进行完全替换）
    chart1Instance.clear()
    
    // 如果没有HTTP数据，显示空图表
    if (!httpData.value.fault_counts.length) {
      const option = {
        title: { text: '各班组当前设备故障次数统计', left: 'center', textStyle: { fontSize: 16 } },
        tooltip: {
          trigger: 'axis',
          axisPointer: { type: 'shadow' }
        },
        toolbox: {
          feature: {
            magicType: { type: ['line', 'bar'] },
            restore: {},
            saveAsImage: {}
          }
        },
        legend: { data: [], top: 40 },
        grid: { top: '25%', right: '3%', left: '3%', bottom: '3%', containLabel: true },
        xAxis: {
          type: 'category',
          data: []
        },
        yAxis: {
          type: 'value',
          name: '故障次数'
        },
        series: []
      }
      chart1Instance.setOption(option, true) // 使用 true 进行完全替换
      return
    }
    
    // 按班组分组数据
    const groupData = httpData.value.fault_counts.reduce((acc, item) => {
      if (!acc[item.班组]) {
        acc[item.班组] = []
      }
      acc[item.班组].push(item)
      return acc
    }, {} as Record<string, typeof httpData.value.fault_counts>)
    
    // 获取所有日期
    const dates = [...new Set(httpData.value.fault_counts.map(item => item.日期))]
    
    // 获取所有班组
    const teams = Object.keys(groupData)
    
    console.log('[ECharts] 图表1可用班组:', teams)
    console.log('[ECharts] 图表1筛选班组:', chartFilters.shift)
    
    // 确定要显示的班组：如果有筛选条件且在可用班组中，只显示筛选的班组
    let shifts: string[] = teams;
    if (chartFilters.shift && teams.includes(chartFilters.shift)) {
      shifts = [chartFilters.shift];
    }
    
    console.log('[ECharts] 图表1实际显示班组:', shifts)
    
    const series: any[] = [];
    const legendData: string[] = [];
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1']; // 新的颜色方案

    shifts.forEach((shift, index) => {
      const data = dates.map(date => {
        const item = groupData[shift]?.find(d => d.日期 === date)
        return item ? item.停机次数 : 0
      });
      
      series.push({
        name: shift,
        type: 'bar',
        smooth: true,
        data: data,
        itemStyle: { 
          borderRadius: [4, 4, 0, 0], 
          color: colors[index % colors.length] 
        },
      });
      legendData.push(shift);
    });

    const option = {
      title: { text: '各班组当前设备故障次数统计', left: 'center', textStyle: { fontSize: 16 } },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' }
      },
      legend: { data: legendData, top: 40 },
      toolbox: {
        feature: {
          magicType: { type: ['line', 'bar'] },
          restore: {},
          saveAsImage: {}
        }
      },
      grid: { top: '25%', right: '3%', left: '3%', bottom: '3%', containLabel: true },
      xAxis: {
        type: 'category',
        data: dates
      },
      yAxis: {
        type: 'value',
        name: '故障次数'
      },
      series: series
    }
    
    chart1Instance.setOption(option, true) // 使用 true 进行完全替换
    console.log('[ECharts] 图表1更新完成，系列数:', series.length, '图例数:', legendData.length)
  }

  // 使用真实数据更新图表4 - 产量统计
  const updateChart4WithRealData = () => {
    if (!chart4Instance) return
    
    console.log('[ECharts] 更新图表4，筛选条件:', chartFilters.shift)
    console.log('[ECharts] 图表4数据:', httpData.value.production)
    
    // 完全清空图表
    chart4Instance.clear()
    
    // 如果没有HTTP数据，显示空图表
    if (!httpData.value.production.length) {
      const option = {
        title: { text: '各班组产量统计', left: 'center', textStyle: { fontSize: 16 } },
        tooltip: {
          trigger: 'axis',
          axisPointer: { type: 'shadow' }
        },
        toolbox: {
          feature: {
            magicType: { type: ['line', 'bar'] },
            restore: {},
            saveAsImage: {}
          }
        },
        legend: { data: [], top: 40 },
        grid: { top: '25%', right: '3%', left: '3%', bottom: '3%', containLabel: true },
        xAxis: {
          type: 'category',
          data: []
        },
        yAxis: {
          type: 'value',
          name: '产量(箱)'
        },
        series: []
      }
      chart4Instance.setOption(option, true)
      return
    }
    
    // 按班组分组数据
    const groupData = httpData.value.production.reduce((acc, item) => {
      if (!acc[item.班组名称]) {
        acc[item.班组名称] = []
      }
      acc[item.班组名称].push(item)
      return acc
    }, {} as Record<string, typeof httpData.value.production>)
    
    // 获取所有日期
    const dates = [...new Set(httpData.value.production.map(item => item.日期))]
    
    // 获取所有班组
    const teams = Object.keys(groupData)
    
    console.log('[ECharts] 图表4可用班组:', teams)
    console.log('[ECharts] 图表4筛选班组:', chartFilters.shift)
    
    // 确定要显示的班组：如果有筛选条件且在可用班组中，只显示筛选的班组
    let shifts: string[] = teams;
    if (chartFilters.shift && teams.includes(chartFilters.shift)) {
      shifts = [chartFilters.shift];
    }
    
    console.log('[ECharts] 图表4实际显示班组:', shifts)
    
    const series: any[] = [];
    const legendData: string[] = [];
    const colors = ['#9B59B6', '#3498DB', '#2ECC71']; // 新的颜色方案

    shifts.forEach((shift, index) => {
      const data = dates.map(date => {
        const item = groupData[shift]?.find(d => d.日期 === date)
        return item ? item['产量(箱)'] : 0
      });
      
      series.push({
        name: shift,
        type: 'bar',
        data: data,
        itemStyle: { 
          borderRadius: [4, 4, 0, 0], 
          color: colors[index % colors.length] 
        },
      });
      legendData.push(shift);
    });

    const option = {
      title: { text: '各班组产量统计', left: 'center', textStyle: { fontSize: 16 } },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' }
      },
      legend: { data: legendData, top: 40 },
      toolbox: {
        feature: {
          magicType: { type: ['line', 'bar'] },
          restore: {},
          saveAsImage: {}
        }
      },
      grid: { top: '25%', right: '3%', left: '3%', bottom: '3%', containLabel: true },
      xAxis: {
        type: 'category',
        data: dates
      },
      yAxis: {
        type: 'value',
        name: '产量(箱)'
      },
      series: series
    }
    
    chart4Instance.setOption(option, true)
    console.log('[ECharts] 图表4更新完成，系列数:', series.length, '图例数:', legendData.length)
  }

  // 使用真实数据更新图表5 - 坏烟统计
  const updateChart5WithRealData = () => {
    if (!chart5Instance) return
    
    console.log('[ECharts] 更新图表5，筛选条件:', chartFilters.shift)
    console.log('[ECharts] 图表5数据:', httpData.value.bad_somke)
    
    // 完全清空图表
    chart5Instance.clear()
    
    // 如果没有HTTP数据，显示空图表
    if (!httpData.value.bad_somke.length) {
      const option = {
        title: { text: '各班组坏烟消耗统计', left: 'center', textStyle: { fontSize: 16 } },
        tooltip: {
          trigger: 'axis',
          axisPointer: { type: 'cross' }
        },
        legend: { 
          data: [], 
          top: '12%',
          type: 'scroll',
          bottom: 10 // 将图例放在底部，避免重叠
        },
        toolbox: {
          feature: {
            magicType: { type: ['line', 'bar'] },
            restore: {},
            saveAsImage: {}
          }
        },
        grid: { top: '30%', right: '3%', left: '3%', bottom: '5%', containLabel: true }, // 调整底部空间
        xAxis: {
          type: 'category',
          data: []
        },
        yAxis: [
          {
            type: 'value',
            name: '坏烟总量(公斤)',
            position: 'left'
          },
          {
            type: 'value',
            name: '坏烟单耗(公斤/箱)',
            position: 'right'
          }
        ],
        series: []
      }
      chart5Instance.setOption(option, true)
      return
    }
    
    // 按班组分组数据
    const groupData = httpData.value.bad_somke.reduce((acc, item) => {
      if (!acc[item.班组]) {
        acc[item.班组] = []
      }
      acc[item.班组].push(item)
      return acc
    }, {} as Record<string, typeof httpData.value.bad_somke>)
    
    // 获取所有日期
    const dates = [...new Set(httpData.value.bad_somke.map(item => item.日期))]
    
    // 获取所有班组
    const teams = Object.keys(groupData)
    
    console.log('[ECharts] 图表5可用班组:', teams)
    console.log('[ECharts] 图表5筛选班组:', chartFilters.shift)
    
    // 确定要显示的班组：如果有筛选条件且在可用班组中，只显示筛选的班组
    let shifts: string[] = teams;
    if (chartFilters.shift && teams.includes(chartFilters.shift)) {
      shifts = [chartFilters.shift];
    }
    
    console.log('[ECharts] 图表5实际显示班组:', shifts)
    
    const series: any[] = [];
    const legendData: string[] = [];
    const colors = ['#E74C3C', '#F39C12', '#27AE60']; // 新的颜色方案

    shifts.forEach((shift, index) => {
      // 坏烟总量 - 柱状图
      const totalData = dates.map(date => {
        const item = groupData[shift]?.find(d => d.日期 === date)
        return item ? item['坏烟数量(公斤)'] : 0
      });
      
      series.push({
        name: `${shift}总量`,
        type: 'bar',
        data: totalData,
        itemStyle: { 
          borderRadius: [4, 4, 0, 0], 
          color: colors[index % colors.length] 
        },
      });
      
      // 坏烟单耗 - 折线图
      const consumptionData = dates.map(date => {
        const item = groupData[shift]?.find(d => d.日期 === date)
        return item ? item['坏烟单耗(公斤/箱)'] : 0
      });
      
      series.push({
        name: `${shift}单耗`,
        type: 'line',
        data: consumptionData,
        smooth: true,
        lineStyle: {
          color: colors[index % colors.length],
          width: 1.5 // 折线改细
        },
        symbol: 'circle',
        symbolSize: 8,
        yAxisIndex: 1, // 使用第二个Y轴
      });
      
      legendData.push(`${shift}总量`);
      legendData.push(`${shift}单耗`);
    });

    const option = {
      title: { text: '各班组坏烟消耗统计', left: 'center', textStyle: { fontSize: 16 } },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'cross' }
      },
      legend: { 
        data: legendData, 
        top: '12%',
        type: 'scroll',
        bottom: 10 // 将图例放在底部，避免重叠
      },
      toolbox: {
        feature: {
          magicType: { type: ['line', 'bar'] },
          restore: {},
          saveAsImage: {}
        }
      },
      grid: { top: '30%', right: '3%', left: '3%', bottom: '5%', containLabel: true }, // 调整底部空间
      xAxis: {
        type: 'category',
        data: dates
      },
      yAxis: [
        {
          type: 'value',
          name: '坏烟总量(公斤)',
          position: 'left'
        },
        {
          type: 'value',
          name: '坏烟单耗(公斤/箱)',
          position: 'right'
        }
      ],
      series: series
    }
    
    chart5Instance.setOption(option, true)
    console.log('[ECharts] 图表5更新完成，系列数:', series.length, '图例数:', legendData.length)
  }

  // 更新图表1 - 各班组当前设备故障次数统计
  const updateChart1 = () => {
    if (!chart1Instance) return
    
    // 使用真实数据
    updateChart1WithRealData()
  }

  // 更新图表2 - 本班故障停机时长统计
  const updateChart2 = () => {
    if (!chart2Instance) return
    
    // 使用真实数据
    updateChart2WithRealData()
  }

  // 更新图表3 - 故障分类统计
  const updateChart3 = () => {
    if (!chart3Instance) return
    
    // 使用真实数据
    updateChart3WithRealData()
  }

  // 更新图表4 - 产量统计（柱状图）
  const updateChart4 = () => {
    if (!chart4Instance) return
    
    // 使用真实数据
    updateChart4WithRealData()
  }

  // 更新图表5 - 各班组坏烟消耗统计
const updateChart5 = () => {
  if (!chart5Instance) return
  
  // 使用真实数据
  updateChart5WithRealData()
}

  // 将班组名称转换为枚举值
  const convertShiftToEnum = (shiftName: string): string => {
    switch (shiftName) {
      case '甲班':
        return '01'
      case '乙班':
        return '02'
      case '丙班':
        return '03'
      default:
        return '01' // 默认返回甲班
    }
  }

  // 格式化日期为YYYY-MM-DD格式
  const formatDate = (date: Date): string => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  // 刷新图表
  const refreshCharts = async () => {
    isRefreshing.value = true
    
    try {
      // 构建请求参数
      const params: EChartsPostParams = {
        equ_name: queryParams.value.equ_name
      }
      
    // 添加日期范围参数
    if (chartFilters.dateRange && chartFilters.dateRange.length === 2) {
      params.start_time = formatDate(chartFilters.dateRange[0])
      params.end_time = formatDate(chartFilters.dateRange[1])
    }
      
      // 添加班组参数（转换为枚举值）
      if (chartFilters.shift) {
        params.class_group = convertShiftToEnum(chartFilters.shift)
      }
      
      console.log('[ECharts] 刷新图表，使用参数:', params)
      
      // 等待数据更新完成（不再重复调用图表更新，因为fetchHttpData会自动更新）
      await updateQueryParamsAndFetch(params)
      
      // 如果WebSocket已连接，重新建立连接
      if (isWebSocketConnected.value && currentEquipmentName.value && currentClassShift.value) {
        disconnectWebSocket()
        setTimeout(() => {
          connectWebSocket(currentEquipmentName.value, currentClassShift.value)
        }, 500)
      }
      
      ElMessage.success('图表数据已刷新')
    } catch (error) {
      console.error('[ECharts] 图表刷新失败:', error)
      ElMessage.error('图表数据刷新失败')
    } finally {
      isRefreshing.value = false
    }
  }

  // 开始自动刷新
  const startAutoRefresh = () => {
    if (refreshInterval.value) {
      clearInterval(refreshInterval.value)
    }
    refreshInterval.value = setInterval(() => {
      refreshCharts()
    }, 3 * 60 * 1000) // 3分钟
  }

  // 停止自动刷新
  const stopAutoRefresh = () => {
    if (refreshInterval.value) {
      clearInterval(refreshInterval.value)
      refreshInterval.value = null
    }
  }

  // 组件卸载时清理图表实例
  onUnmounted(() => {
    if (chart1Instance) chart1Instance.dispose()
    if (chart2Instance) chart2Instance.dispose()
    if (chart3Instance) chart3Instance.dispose()
    if (chart4Instance) chart4Instance.dispose()
    if (chart5Instance) chart5Instance.dispose()
  })

  return {
    chart1Ref,
    chart2Ref,
    chart3Ref,
    chart4Ref,
    chart5Ref,
    chartFilters,
    isRefreshing,
    refreshInterval,
    initCharts,
    refreshCharts,
    startAutoRefresh,
    stopAutoRefresh,
    resizeCharts,
    forceResizeCharts,
    connectWebSocket,
    disconnectWebSocket,
    isWebSocketConnected,
    currentEquipmentName,
    currentClassShift,
    
    // HTTP相关
    fetchHttpData,
    startHttpPolling,
    stopHttpPolling,
    updateQueryParamsAndFetch,
    isHttpLoading,
    httpData,
    queryParams,
    
    // WebSocket数据
    websocketData,
    
    // 工具函数
    formatDate
  }
}
