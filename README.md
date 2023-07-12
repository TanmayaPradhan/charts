
# react-native-charts

## Installation

`npm i @tanmaya_pradhan/react-native-charts`
`npm install --save @react-native-svg`

## Features

- Bar Chart
- Stacked Bar chart
- line chart
- Combination of Line, Bar, Stack Bar chart
- clickable
- toot tip
  
<img width="375" alt="Screenshot 2023-07-11 at 10 56 28 PM" src="https://github.com/TanmayaPradhan/charts/assets/40633712/23d0705e-8f8b-4df6-86de-dbaef6635296">


### Declarative Usage
```ruby
    import { View } from 'react-native'
    import React from 'react'
    import { StackedBarChart } from '@tanmaya_pradhan/react-native-charts'
    
    const App = () => {
      return (
        <View style={{ flex: 1 }}>
          <StackedBarChart
            containerHeight={400}
            backgroundColor='#000'
            yAxisSubstring='K'
            showGrid={false}
            chartType={'linechart'}
            y2Axis={false}
            chartData={[
              { month: 'Jan', lineValue: 100 },
              { month: 'Feb', lineValue: 250 },
              { month: 'Mar', lineValue: 500 },
            ]}
            showTooltipPopup={false}
            onPressLineItem={(item) => console.log(item)}
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
| `chartType`      | `string` | all, barchart, stack_barchart, linechart |
| `backgroundColor`      | `string` | background color |
| `axisColor`      | `string` | axis color|
| `showAxisTicks`      | `boolean` | it shows x, y axis ticks |
| `showGrid`      | `boolean` | it shows grid |
| `gridColor`      | `string` | background grid color |
| `yAxisSubstring`      | `string` | add substring to y axis label |
| `y2AxisSubstring`      | `string` | add substring to y2 axis label |
| `y2Axis`      | `boolean` | it shows another y axis at the right side when both line chart and bar chart data are available |
| `lineColor`      | `string` | line chart color |
| `circleColor`      | `string` | line chart circle color |
| `axisFontColor`      | `string` | x,y axis font color |
| `barchartColor`      | `string` | bar chart color |
| `stackedSecondaryBarColor`      | `string` | stack bar chart color |
| `circleRadius`      | `integer` | all circle radius |
| `axisWidth`      | `integer` | x,y axis width |
| `axisFontSize`      | `integer` | x,y axis font size |
| `axisFontFamily`      | `string` | x,y axis font family |
| `barWidth`      | `integer` | bar chart width |
| `line_chart_width`      | `integer` | line chart width |
| `showTooltip`      | `boolean` | show tooltip on the chart |
| `showTooltipPopup`      | `boolean` | show tooltip popup on the chart |
| `toolTipContainerStyle`      | `string` | toolTip container style |
| `toolTipTextStyle`      | `string` | toolTip text style |
| `scrollEnable`      | `boolean` | chart with scrollable |
| `toolTipTextStyle`      | `string` | toolTip text style |
| `onPressItem`      | `function` | returns clickable bar chart item |
| `onPressLineItem`      | `function` | returns clickable line chart item |
| `chartData`      | `object` | data required to show the chart |
