import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts'
import { getMultipleRandomFaultNames } from '../data/faultNames'

interface ChartFilters {
  dateRange: [Date, Date]
  shift: string
}

interface MockDataItem {
  date: string
  甲班?: number
  乙班?: number
  丙班?: number
  [key: string]: any
}

interface ChartDataItem {
  name: string
  value: number
}

interface PieDataItem {
  value: number
  name: string
}

interface ProductionDataItem {
  date: string
  甲班?: number
  乙班?: number
  丙班?: number
  [key: string]: any
}

interface DefectiveDataItem {
  time: string
  甲班总量?: number
  甲班单耗?: number
  乙班总量?: number
  乙班单耗?: number
  丙班总量?: number
  丙班单耗?: number
  [key: string]: any
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

  // 初始化图表
  const initCharts = () => {
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
  }

  // 重新调整图表大小
  const resizeCharts = () => {
    if (chart1Instance) chart1Instance.resize()
    if (chart2Instance) chart2Instance.resize()
    if (chart3Instance) chart3Instance.resize()
    if (chart4Instance) chart4Instance.resize()
    if (chart5Instance) chart5Instance.resize()
  }

  // 组件挂载时添加窗口大小改变监听
  onMounted(() => {
    window.addEventListener('resize', resizeCharts)
  })

  // 组件卸载时清理图表实例和事件监听
  onUnmounted(() => {
    window.removeEventListener('resize', resizeCharts)
    if (chart1Instance) chart1Instance.dispose()
    if (chart2Instance) chart2Instance.dispose()
    if (chart3Instance) chart3Instance.dispose()
    if (chart4Instance) chart4Instance.dispose()
    if (chart5Instance) chart5Instance.dispose()
  })

  // 更新图表1 - 各班组当前设备故障次数统计
  const updateChart1 = () => {
    if (!chart1Instance) return
    
    // 生成模拟数据
    const generateMockData = (): MockDataItem[] => {
      const startDate = new Date(chartFilters.dateRange[0]);
      const endDate = new Date(chartFilters.dateRange[1]);
      const data: MockDataItem[] = [];
      let currentDate = new Date(startDate);

      while (currentDate <= endDate) {
        const dateStr = currentDate.toISOString().split('T')[0];
        const item: MockDataItem = { date: dateStr };

        // 如果选择了班组，只生成该班组的数据
        if (chartFilters.shift) {
          item[chartFilters.shift] = Math.floor(Math.random() * 6) + 1;
        } else {
          // 否则生成所有班组的数据
          item['甲班'] = Math.floor(Math.random() * 6) + 1;
          item['乙班'] = Math.floor(Math.random() * 6) + 1;
          item['丙班'] = Math.floor(Math.random() * 6) + 1;
        }

        data.push(item);
        currentDate.setDate(currentDate.getDate() + 1);
      }

      return data;
    };

    const mockData = generateMockData();

    // 确定要显示的班组
    const series: any[] = [];
    const legendData: string[] = [];
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1']; // 新的颜色方案
    const shifts = chartFilters.shift ? [chartFilters.shift] : ['甲班', '乙班', '丙班'];

    shifts.forEach((shift, index) => {
      const data = mockData.map(item => item[shift] || 0);
      const maxValue = Math.max(...data);
      const minValue = Math.min(...data);
      const maxIndex = data.indexOf(maxValue);
      const minIndex = data.indexOf(minValue);
      
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
        data: mockData.map(item => item.date)
      },
      yAxis: {
        type: 'value',
        name: '故障次数'
      },
      series: series
    }
    chart1Instance.setOption(option)
  }

  // 更新图表2 - 本班故障停机时长统计
  const updateChart2 = () => {
    if (!chart2Instance) return
    
    // 使用真实的故障名称数据
    const randomFaultNames = getMultipleRandomFaultNames(6)
    const mockData: ChartDataItem[] = randomFaultNames.map(faultName => ({
      name: faultName,
      value: Math.floor(Math.random() * 40) + 20 // 20-60分钟的随机停机时长
    }))

    const data = mockData.map(item => item.value);
    const maxValue = Math.max(...data);
    const minValue = Math.min(...data);

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
        data: mockData.map(item => item.name),
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

  // 更新图表3 - 故障分类统计
  const updateChart3 = () => {
    if (!chart3Instance) return
    
    // 使用真实的故障名称数据
    const randomFaultNames = getMultipleRandomFaultNames(6)
    const mockData: PieDataItem[] = randomFaultNames.map(faultName => ({
      value: Math.floor(Math.random() * 15) + 5, // 5-20次的随机故障次数
      name: faultName
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
        data: mockData,
        color: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57', '#DDA0DD'] // 新的颜色方案
      }]
    }
    chart3Instance.setOption(option)
  }

  // 更新图表4 - 产量统计（柱状图）
  const updateChart4 = () => {
    if (!chart4Instance) return
    
    // 生成模拟产量数据
    const generateProductionData = (): ProductionDataItem[] => {
      const startDate = new Date(chartFilters.dateRange[0]);
      const endDate = new Date(chartFilters.dateRange[1]);
      const data: ProductionDataItem[] = [];
      let currentDate = new Date(startDate);

      while (currentDate <= endDate) {
        const dateStr = currentDate.toISOString().split('T')[0];
        const item: ProductionDataItem = { date: dateStr };

        // 生成各班组的产量数据
        item['甲班'] = Math.floor(Math.random() * 50 + 100); // 100-150
        item['乙班'] = Math.floor(Math.random() * 50 + 120); // 120-170
        item['丙班'] = Math.floor(Math.random() * 50 + 90); // 90-140

        data.push(item);
        currentDate.setDate(currentDate.getDate() + 1);
      }

      return data;
    };

    const productionData = generateProductionData();

    // 确定要显示的班组
    const series: any[] = [];
    const legendData: string[] = [];
    const colors = ['#9B59B6', '#3498DB', '#2ECC71']; // 新的颜色方案
    const shifts = chartFilters.shift ? [chartFilters.shift] : ['甲班', '乙班', '丙班'];

    shifts.forEach((shift, index) => {
      const data = productionData.map(item => item[shift] || 0);
      const maxValue = Math.max(...data);
      const minValue = Math.min(...data);
      
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
        data: productionData.map(item => item.date)
      },
      yAxis: {
        type: 'value',
        name: '产量(箱)'
      },
      series: series
    };
    
    chart4Instance.setOption(option);
  }

  // 更新图表5 - 坏烟消耗统计（柱折混合图）
  const updateChart5 = () => {
    if (!chart5Instance) return
    
    // 生成模拟坏烟数据
    const generateDefectiveData = (): DefectiveDataItem[] => {
      const startDate = new Date(chartFilters.dateRange[0]);
      const endDate = new Date(chartFilters.dateRange[1]);
      const data: DefectiveDataItem[] = [];
      let currentDate = new Date(startDate);

      while (currentDate <= endDate) {
        const dateStr = currentDate.toISOString().split('T')[0];
        const item: DefectiveDataItem = { time: dateStr };

        // 生成各班组的坏烟总量和单耗数据
        item['甲班总量'] = Math.floor(Math.random() * 20 + 10); // 10-30
        item['甲班单耗'] = parseFloat((Math.random() * 2 + 1).toFixed(2)); // 1.00-3.00
        
        item['乙班总量'] = Math.floor(Math.random() * 20 + 12); // 12-32
        item['乙班单耗'] = parseFloat((Math.random() * 2 + 1.2).toFixed(2)); // 1.20-3.20
        
        item['丙班总量'] = Math.floor(Math.random() * 20 + 8); // 8-28
        item['丙班单耗'] = parseFloat((Math.random() * 2 + 0.8).toFixed(2)); // 0.80-2.80

        data.push(item);
        currentDate.setDate(currentDate.getDate() + 1);
      }

      return data;
    };

    const defectiveData = generateDefectiveData();

    // 确定要显示的班组
    const series: any[] = [];
    const legendData: string[] = [];
    const colors = ['#E74C3C', '#F39C12', '#27AE60']; // 新的颜色方案
    const shifts = chartFilters.shift ? [chartFilters.shift] : ['甲班', '乙班', '丙班'];

    shifts.forEach((shift, index) => {
      // 坏烟总量 - 柱状图
      const totalData = defectiveData.map(item => item[`${shift}总量`] || 0);
      const maxTotal = Math.max(...totalData);
      const minTotal = Math.min(...totalData);
      
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
      const consumptionData = defectiveData.map(item => item[`${shift}单耗`] || 0);
      const maxConsumption = Math.max(...consumptionData);
      const minConsumption = Math.min(...consumptionData);
      
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
        data: defectiveData.map(item => item.time)
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
    };
    
    chart5Instance.setOption(option);
  }

  // 刷新图表
  const refreshCharts = () => {
    isRefreshing.value = true
    setTimeout(() => {
      updateChart1()
      updateChart2()
      updateChart3()
      updateChart4()
      updateChart5()
      isRefreshing.value = false
      ElMessage.success('图表数据已刷新')
    }, 1000)
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
    stopAutoRefresh
  }
}
