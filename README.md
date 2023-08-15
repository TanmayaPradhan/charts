
# react-native-charts

## Installation

`npm i @tanmaya_pradhan/react-native-charts`
`npm install --save @react-native-svg`

## Features

- Bar Chart
- Stacked Bar chart
- line chart
- multilinechart
- Combination of Line, Bar, Stack Bar chart, multi line chart
- clickable
- toot tip
  
<img width="352" alt="Screenshot 2023-08-13 at 2 15 32 PM" src="https://github.com/TanmayaPradhan/charts/assets/40633712/e9e9a116-6d8a-4d8d-86fd-1f861d6d2d11">


### Declarative Usage
```ruby
    import { View } from 'react-native'
    import React from 'react'
    import { StackedBarChart,ChartType } from '@tanmaya_pradhan/react-native-charts'
    
    const App = () => {
      return (
        <View style={{ flex: 1 }}>
          <StackedBarChart
            containerHeight={400}
            backgroundColor='#000'
            yAxisSubstring= ''
            y2AxisSubstring=''
            showGridX={true}
            showGridY={true}
            chartType={ChartType.ALL}
            y2Axis={true}
            chartData = {[
                { month: 'Jan', barValues: [100, 150, 120], multiLineValues: [100, 200] },
                { month: 'Feb', barValues: [140, 80, 120], multiLineValues: [100, 200] },
                { month: 'Mar', barValues: [70, 150, 90], multiLineValues: [100, 200] },
                { month: 'Apr', barValues: [70, 150, 90], multiLineValues: [100, 200] },
            ]}
            showTooltipPopup={false}
            onPressLineItem={(item) => console.log(item)}
            multiLineChartColors = {['red', 'blue']}
          />
        </View>
      )
    }
    
    export default App

```


### Properties

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `containerHeight`      | `integer` | chart height |
| `containerWidth`      | `integer` | chart width |
| `chartType`      | `string` | all, barchart, linechart, multilinechart |
| `backgroundColor`      | `string` | background color |
| `axisColor`      | `string` | axis color|
| `showAxisTicks`      | `boolean` | it shows x, y axis ticks |
| `showGridX`      | `boolean` | it shows x-axis grid |
| `showGridY`      | `boolean` | it shows y-axis grid |
| `gridColor`      | `string` | background grid color |
| `yAxisSubstring`      | `string` | add substring to y axis label |
| `y2AxisSubstring`      | `string` | add substring to y2 axis label |
| `y2Axis`      | `boolean` | it shows another y axis at the right side when both line chart and bar chart data are available |
| `lineColor`      | `string` | line chart color |
| `circleColor`      | `string` | line chart circle color |
| `circleColorHighPriority`      | `boolean` | circle color set as high priority color on line chart |
| `axisFontColor`      | `string` | x,y axis font color |
| `circleRadius`      | `integer` | all circle radius |
| `axisWidth`      | `integer` | x,y axis width |
| `axisFontSize`      | `integer` | x,y axis font size |
| `axisFontFamily`      | `string` | x,y axis font family |
| `barWidth`      | `integer` | bar chart width |
| `line_chart_width`      | `integer` | line chart width |
| `show_barchart_tooltips`      | `boolean` | show tooltip on the chart |
| `barchart_tooltip_axis_color`      | `string` | tooltip line color |
| `barchart_tooltip_color`      | `string` | tooltip color |
| `showTooltipPopup`      | `boolean` | show tooltip popup on the chart |
| `toolTipContainerStyle`      | `string` | toolTip container style |
| `toolTipTextStyle`      | `string` | toolTip text style |
| `scrollEnable`      | `boolean` | chart with scrollable |
| `toolTipTextStyle`      | `string` | toolTip text style |
| `onPressItem`      | `function` | returns clickable bar chart item |
| `onPressLineItem`      | `function` | returns clickable line chart item |
| `chartData`      | `object` | data required to show the chart |
| `chartColors`      | `array` | data required to show the chart colors |
| `multiLineChartColors`      | `array` | data required to show the lien chart colors |
