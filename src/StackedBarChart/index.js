import React, { useEffect, useRef, useState } from 'react';
import {
    View,
    Animated,
    Dimensions,
    Easing,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
} from 'react-native';
import Svg, { G, Line, Circle, Rect, Text as SvgText, Path } from 'react-native-svg';

const AnimatedLine = Animated.createAnimatedComponent(Line);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedRect = Animated.createAnimatedComponent(Rect);
const AnimatedSvg = Animated.createAnimatedComponent(Svg);
const AnimatedSvgText = Animated.createAnimatedComponent(SvgText);
const AnimatedPath = Animated.createAnimatedComponent(Path);

export const ChartType = {
    ALL: 'all',
    BAR: 'barchart',
    LINE: 'linechart',
    MULTILINE: 'multilinechart'
}
const StackedBarChart = ({
    containerHeight = 400,
    containerWidth = Dimensions.get('window').width,
    backgroundColor = '#000',
    axisColor = '#9cc',
    showAxisTicks = true,
    showGridX = false,
    showGridY = false,
    gridColor = '#EDEDED',
    yAxisSubstring = 'k',
    y2AxisSubstring = '%',
    y2Axis = true, // if only single chart. set to false
    circleColor = '#DAA520',
    circleColorHighPriority = false,
    axisFontColor = '#fff',
    chartType = ChartType.ALL,
    lineColor = '#DAA520',
    circleRadius = 5,
    axisWidth = 2,
    axisFontSize = 10,
    axisFontFamily,
    barWidth = 30,
    line_chart_width = 2,
    show_barchart_tooltips = true,
    barchart_tooltip_axis_color = '#fff',
    barchart_tooltip_color = '#fff',
    showTooltipPopup = true,
    toolTipContainerStyle,
    toolTipTextStyle,
    scrollEnable = false,
    onPressItem = (item) => { }, //set showTooltipPopup to false
    onPressLineItem = (item) => { }, //set showTooltipPopup to false
    y_axis_label_count = 6,
    chartData = [
        { month: 'Jan', barValues: [100, 120], lineValue: 125, multiLineValues: [125, 120] },
        { month: 'Feb', barValues: [140, 210], lineValue: 250, multiLineValues: [250, 140] },
        { month: 'Mar', barValues: [70, 100], lineValue: 300, multiLineValues: [300, 90] },
        { month: 'Apr', barValues: [70, 90], lineValue: 350, multiLineValues: [40, 100] },
    ],
    chartColors = ['#f90', '#9c9', '#f99', '#999'],
    multiLineChartColors = chartColors
}) => {
    const marginLeft_for_y_axis = 50;
    const marginRight_for_y2_axis = 30;
    const marginBottom_for_x_axis = 50;
    const padding_from_screen = 20;

    const x_axis_x1_point = marginLeft_for_y_axis;
    const x_axis_y1_point = containerHeight - marginBottom_for_x_axis;
    let x_axis_x2_point;
    const x_axis_y2_point = x_axis_y1_point;
    let x_axis_width;
    let gap_between_x_axis_ticks;
    let scrollWidth;

    if (scrollEnable) {
        gap_between_x_axis_ticks = 40;
        x_axis_x2_point =
            gap_between_x_axis_ticks +
            x_axis_x1_point +
            gap_between_x_axis_ticks * chartData?.length;
        scrollWidth = x_axis_x2_point + circleRadius;
    } else {
        x_axis_x2_point = containerWidth - padding_from_screen - marginRight_for_y2_axis;
        x_axis_width = containerWidth - padding_from_screen - marginLeft_for_y_axis - marginRight_for_y2_axis;
        gap_between_x_axis_ticks = x_axis_width / (chartData.length + 1);
        scrollWidth = containerWidth;
    }

    const y_axis_x1_point = marginLeft_for_y_axis;
    const y_axis_y1_point = padding_from_screen;
    const y_axis_x2_point = marginLeft_for_y_axis;
    const y_axis_y2_point = containerHeight - marginBottom_for_x_axis;
    const y_axis_height =
        containerHeight - padding_from_screen - marginBottom_for_x_axis;

    const [yAxisData, setYaxisData] = useState([]);
    const [y2AxisData, setY2axisData] = useState([]);
    const [pathLength, setPathLength] = useState(0);
    const line_chart_ref = useRef(null);
    const [isTooltipPopupVisible, setIsTooltipPopupVisible] = useState(false)
    const [selectedChartItem, setSelectedChartItem] = useState({})

    const minValue = 0;
    let maxValue = 0;
    let y2maxValue = 0;
    let x_axis_wiseMultiLineValues = []

    if (chartType === ChartType.LINE) {
        maxValue = Math.max.apply(
            Math,
            chartData?.map((item) => item.lineValue),
        );
    }
    else if (chartType === ChartType.MULTILINE) {
        let allLineValues = chartData.map((item) => item.multiLineValues)
        const maxRow = allLineValues.map(function (row) { return Math.max.apply(Math, row); });
        maxValue = Math.max.apply(
            Math,
            maxRow?.map((item) => item),
        );
    }
    else {
        let allBarValues = chartData.map((item) => item.barValues)
        const newSumOfMaxValues = allBarValues.map((item) => item.reduce((sum, item) => sum + item), 0)
        maxValue = Math.max.apply(
            Math,
            newSumOfMaxValues?.map((item) => item),
        );
    }
    const numberOfLinesInMultilineChart = chartData?.length > 1 ? chartData[0]?.multiLineValues?.length : 0
    if (numberOfLinesInMultilineChart && (chartType === ChartType.ALL || chartType === ChartType.MULTILINE)) {
        x_axis_wiseMultiLineValues = Array.from({ length: numberOfLinesInMultilineChart })?.map((_, index) => {
            return chartData?.map((item => item?.multiLineValues[index]))
        })
        const maxRow = x_axis_wiseMultiLineValues.map(function (row) { return Math.max.apply(Math, row); });
        y2maxValue = Math.max.apply(
            Math,
            maxRow?.map((item) => item),
        );
    }
    else {
        y2maxValue = Math.max.apply(
            Math,
            chartData?.map((item) => item.lineValue),
        );
    }

    const gapBetweenYaxisValues = (maxValue - minValue) / (y_axis_label_count - 2);
    const gapBetweenY2axisValues = (y2maxValue - minValue) / (y_axis_label_count - 2);
    let gap_between_y_axis_ticks = y_axis_height / (y_axis_label_count - 1);


    const animated_axis_tick_circle_opacity = useRef(
        new Animated.Value(0),
    ).current;
    const animated_x_axis_width = useRef(
        new Animated.Value(x_axis_x1_point),
    ).current;
    const animated_y_axis_height = useRef(
        new Animated.Value(y_axis_y2_point),
    ).current;
    const animatedPathLength = useRef(new Animated.Value(0)).current;
    const animatedPathOpacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const newLabels = Array.from({ length: y_axis_label_count }).map(
            (_, index) => minValue + gapBetweenYaxisValues * index,
        );
        const newY2Labels = Array.from({ length: y_axis_label_count }).map(
            (_, index) => minValue + gapBetweenY2axisValues * index,
        );
        setYaxisData(newLabels);
        setY2axisData(newY2Labels)
        animation_x_axis_y_axis(false);
    }, [scrollEnable]);

    const animation_x_axis_y_axis = (animation = true) => {
        Animated.timing(animated_axis_tick_circle_opacity, {
            toValue: 1,
            duration: animation ? 1500 : 0,
            useNativeDriver: true,
            easing: Easing.linear,
        }).start();
        Animated.timing(animated_x_axis_width, {
            toValue: x_axis_x2_point,
            duration: animation ? 1000 : 0,
            delay: animation ? 500 : 0,
            useNativeDriver: true,
            easing: Easing.linear,
        }).start();
        Animated.timing(animated_y_axis_height, {
            toValue: y_axis_y1_point,
            duration: animation ? 1000 : 0,
            delay: animation ? 500 : 0,
            useNativeDriver: true,
            easing: Easing.linear,
        }).start();
    };

    useEffect(() => {
        animatedPathLength.setValue(pathLength);
        const length = pathLength - pathLength * (100 / 100);
        Animated.timing(animatedPathOpacity, {
            toValue: 1,
            duration: 100,
            useNativeDriver: true,
            easing: Easing.ease,
        }).start();
        Animated.timing(animatedPathLength, {
            toValue: length,
            duration: 1500,
            delay: 1000,
            useNativeDriver: true,
            easing: Easing.ease,
        }).start();
    }, [pathLength]);

    const onPressBarchartItem = (item) => {
        if (showTooltipPopup) {
            const obj = {
                month: item?.month,
                value: item?.barValues
            }
            setSelectedChartItem(obj)
            setIsTooltipPopupVisible(true)
            console.log(item)
        }
        else {
            onPressItem(item)
        }
    }
    const onPressLinechartItem = (item) => {
        if (showTooltipPopup) {
            const obj = {
                month: item?.month,
                value: item?.lineValue
            }
            setSelectedChartItem(obj)
            setIsTooltipPopupVisible(true)
            console.log(item)
        }
        else {
            onPressLineItem(item)
        }
    }
    const onPressMultiLinechartItem = (item, monthIndex) => {
        const obj = {
            month: chartData[monthIndex]?.month ?? '',
            value: item
        }
        if (showTooltipPopup) {
            setSelectedChartItem(obj)
            setIsTooltipPopupVisible(true)
            console.log(obj)
        }
        else {
            onPressLineItem(obj)
        }
    }

    const render_x_axis = () => (
        <G key="x-axis">
            <AnimatedCircle
                cx={x_axis_x2_point}
                cy={x_axis_y2_point}
                fill={axisColor}
                r={circleRadius}
                opacity={animated_axis_tick_circle_opacity}
            />
            <AnimatedLine
                x1={x_axis_x1_point}
                y1={x_axis_y1_point}
                x2={animated_x_axis_width}
                y2={x_axis_y2_point}
                strokeWidth={axisWidth}
                stroke={axisColor}
            />
        </G>
    );
    const render_x_axis_ticks_labels = () => {
        return chartData.map((item, index) => {
            const x_point_x_axis_tick =
                gap_between_x_axis_ticks +
                x_axis_x1_point +
                gap_between_x_axis_ticks * index;
            return (
                <G key={`x-axis ticks and labels ${index}`}>
                    {showAxisTicks && (
                        <AnimatedLine
                            x1={x_point_x_axis_tick}
                            y1={x_axis_y1_point}
                            x2={x_point_x_axis_tick}
                            y2={x_axis_y1_point + 10}
                            strokeWidth={axisWidth}
                            stroke={axisColor}
                            opacity={animated_axis_tick_circle_opacity}
                        />
                    )}
                    <SvgText
                        x={x_point_x_axis_tick}
                        y={x_axis_y1_point + 10 + axisFontSize}
                        fill={axisFontColor}
                        textAnchor="middle"
                        fontSize={axisFontSize}
                        fontFamily={axisFontFamily}
                    // opacity={animated_axis_tick_circle_opacity}
                    >
                        {item?.month}
                    </SvgText>
                </G>
            );
        });
    };
    const render_y_axis = () => (
        <G key="y-axis">
            <AnimatedCircle
                cx={y_axis_x1_point}
                cy={y_axis_y1_point}
                fill={axisColor}
                r={circleRadius}
                opacity={animated_axis_tick_circle_opacity}
            />
            <AnimatedCircle
                cx={y_axis_x2_point}
                cy={y_axis_y2_point}
                fill={axisColor}
                r={circleRadius}
                opacity={animated_axis_tick_circle_opacity}
            />
            <AnimatedLine
                x1={y_axis_x1_point}
                y1={animated_y_axis_height}
                x2={y_axis_x2_point}
                y2={y_axis_y2_point}
                stroke={axisColor}
                strokeWidth={axisWidth}
            />
        </G>
    );
    const render_y_axis_ticks_labels = () => {
        return yAxisData?.map((item, index) => {
            const y_point_y_axis_ticks =
                y_axis_y2_point - gap_between_y_axis_ticks * index;
            const yValue = item + yAxisSubstring
            return (
                <G key={`y-axis ticks and labels ${index}`}>
                    {showAxisTicks && (
                        <AnimatedLine
                            x1={y_axis_x2_point}
                            y1={y_point_y_axis_ticks}
                            x2={y_axis_x2_point - 10}
                            y2={y_point_y_axis_ticks}
                            stroke={axisColor}
                            strokeWidth={axisWidth}
                            opacity={animated_axis_tick_circle_opacity}
                        />
                    )}
                    <SvgText
                        x={y_axis_x2_point - 10 - 5}
                        y={y_point_y_axis_ticks + axisFontSize / 3}
                        fill={axisFontColor}
                        textAnchor="end"
                        fontSize={axisFontSize}
                        fontFamily={axisFontFamily}
                    // opacity={animated_axis_tick_circle_opacity}
                    >
                        {yValue}
                    </SvgText>
                </G>
            );
        });
    };
    const render_y2_axis = () => (
        <G key="y2-axis">
            <AnimatedCircle
                cx={x_axis_x2_point}
                cy={y_axis_y1_point}
                fill={axisColor}
                r={circleRadius}
                opacity={animated_axis_tick_circle_opacity}
            />
            <AnimatedCircle
                cx={x_axis_x2_point}
                cy={y_axis_y2_point}
                fill={axisColor}
                r={circleRadius}
                opacity={animated_axis_tick_circle_opacity}
            />
            <AnimatedLine
                x1={x_axis_x2_point}
                y1={animated_y_axis_height}
                x2={x_axis_x2_point}
                y2={y_axis_y2_point}
                stroke={axisColor}
                strokeWidth={axisWidth}
            />
        </G>
    );
    const render_y2_axis_ticks_labels = () => {
        return y2AxisData?.map((item, index) => {
            const y_point_y_axis_ticks = y_axis_y2_point - gap_between_y_axis_ticks * index;
            const yValue = item + y2AxisSubstring
            return (
                <G key={`y2-axis ticks and labels ${index}`}>
                    {showAxisTicks && (
                        <AnimatedLine
                            x1={x_axis_x2_point}
                            y1={y_point_y_axis_ticks}
                            x2={x_axis_x2_point + 10}
                            y2={y_point_y_axis_ticks}
                            stroke={axisColor}
                            strokeWidth={axisWidth}
                            opacity={animated_axis_tick_circle_opacity}
                        />
                    )}
                    <SvgText
                        x={x_axis_x2_point + 10 + 5}
                        y={y_point_y_axis_ticks + axisFontSize / 3}
                        fill={axisFontColor}
                        // textAnchor="end"
                        fontSize={axisFontSize}
                        fontFamily={axisFontFamily}
                    >
                        {yValue}
                    </SvgText>
                </G>
            )
        })

    };

    const render_grid_x = () => {
        return Array.from({ length: chartData?.length + 1 })?.map((item, index) => {
            let x_axis_point_test_gap = x_axis_width / chartData?.length
            let x_point_x_axis_grid = x_axis_x1_point + x_axis_point_test_gap * index;
            const x_point_x_axis_tick =
                gap_between_x_axis_ticks +
                x_axis_x1_point +
                gap_between_x_axis_ticks * index;
            const y_point_y_axis_ticks =
                y_axis_y2_point - gap_between_y_axis_ticks * index;
            return (
                <G key={`grid-axis ${index}`}>
                    <Line
                        key={`grid-x-axis ${index}`}
                        x1={x_point_x_axis_tick}
                        y1={x_axis_y1_point}
                        x2={x_point_x_axis_tick}
                        y2={x_axis_y1_point - y_axis_height}
                        stroke={gridColor}
                        strokeWidth={1}
                    // opacity={animated_axis_tick_circle_opacity}
                    />
                </G>
            );
        });
    };
    const render_grid_y = () => {
        return yAxisData?.map((item, index) => {
            let x_axis_point_test_gap = x_axis_width / chartData?.length
            let x_point_x_axis_grid = x_axis_x1_point + x_axis_point_test_gap * index;
            const x_point_x_axis_tick =
                gap_between_x_axis_ticks +
                x_axis_x1_point +
                gap_between_x_axis_ticks * index;
            const y_point_y_axis_ticks =
                y_axis_y2_point - gap_between_y_axis_ticks * index;
            return (
                <G key={`grid-axis ${index}`}>
                    <Line
                        key={`grid-y-axis ${index}`}
                        x1={y_axis_x2_point}
                        y1={y_point_y_axis_ticks}
                        x2={x_axis_x2_point}
                        y2={y_point_y_axis_ticks}
                        stroke={gridColor}
                        strokeWidth={1}
                    // opacity={animated_axis_tick_circle_opacity}
                    />
                </G>
            );
        });
    };
    const render_barchart = () => {
        return chartData?.map((item, index) => {
            let x_point_x_axis_tick =
                gap_between_x_axis_ticks +
                x_axis_x1_point +
                gap_between_x_axis_ticks * index;
            let prevBarHeight = 0;
            return item?.barValues?.map((item2, index2) => {
                prevBarHeight = index2 !== 0 ? prevBarHeight + (item?.barValues[index2 - 1] * gap_between_y_axis_ticks) / gapBetweenYaxisValues : 0;
                let height = (item2 * gap_between_y_axis_ticks) / gapBetweenYaxisValues;
                return (
                    <AnimatedRect
                        key={`${index}${'rect'}${index2}`}
                        x={x_point_x_axis_tick - barWidth / 2}
                        y={x_axis_y1_point - prevBarHeight}
                        width={barWidth}
                        height={-height}
                        fill={chartColors[index2]}
                        onPress={() => onPressBarchartItem(item, ChartType.BAR)}
                    />
                )
            })
        })
    }
    const render_barchart_tooltips = () => {
        return chartData?.map((item, index) => {
            let x_point_x_axis_tick =
                gap_between_x_axis_ticks +
                x_axis_x1_point +
                gap_between_x_axis_ticks * index;
            let prevBarHeight = 0;
            return item?.barValues?.map((item2, index2) => {
                prevBarHeight = index2 !== 0 ? prevBarHeight + (item?.barValues[index2 - 1] * gap_between_y_axis_ticks) / gapBetweenYaxisValues : 0;
                let isStackBar = item?.barValues?.length > 1
                let height = isStackBar ? 0 : (item2 * gap_between_y_axis_ticks) / gapBetweenYaxisValues;
                return (
                    <G key={`tooltp ${index}`}>
                        <AnimatedLine
                            x1={x_point_x_axis_tick}
                            y1={x_axis_y1_point - prevBarHeight - height}
                            x2={x_point_x_axis_tick}
                            y2={x_axis_y1_point - prevBarHeight - height - 10}
                            strokeWidth={axisWidth}
                            stroke={barchart_tooltip_axis_color}
                            opacity={animated_axis_tick_circle_opacity}
                        />
                        <AnimatedSvgText
                            x={x_point_x_axis_tick}
                            y={x_axis_y1_point - prevBarHeight - height - 10 - 2}
                            fontSize={axisFontSize}
                            fill={barchart_tooltip_color}
                            textAnchor="middle"
                            opacity={animated_axis_tick_circle_opacity}>
                            {item2}
                        </AnimatedSvgText>
                    </G>
                )
            })
        })
    }
    const render_tooltipsDemo = () => {
        return chartData?.map((item, index) => {
            let x_point_x_axis_tick =
                gap_between_x_axis_ticks +
                x_axis_x1_point +
                gap_between_x_axis_ticks * index;
            let height =
                (item?.barValues[0] * gap_between_y_axis_ticks) / gapBetweenYaxisValues;
            return (
                <G key={`tooltp ${index}`}>
                    <AnimatedLine
                        x1={x_point_x_axis_tick}
                        y1={y_axis_y2_point - height}
                        x2={x_point_x_axis_tick}
                        y2={y_axis_y2_point - height - 10}
                        strokeWidth={axisWidth}
                        stroke={axisColor}
                        opacity={animated_axis_tick_circle_opacity}
                    />
                    <AnimatedSvgText
                        x={x_point_x_axis_tick}
                        y={y_axis_y2_point - height - 10 - 2}
                        fontSize={axisFontSize}
                        fill={'red'}
                        textAnchor="middle"
                        opacity={animated_axis_tick_circle_opacity}>
                        {item?.barValues[0]}
                    </AnimatedSvgText>
                </G>
            );
        });
    };

    const getDPath = () => {
        let dPath = '';
        const minMaxGap = y2maxValue - minValue;
        const gapBetweenYvalues = minMaxGap / 4;

        const highestValueAtYAxis = y2AxisData[y2AxisData.length - 1];
        if (highestValueAtYAxis) {
            chartData.map((item, index) => {
                let x_point_x_axis_tick =
                    gap_between_x_axis_ticks +
                    x_axis_x1_point +
                    gap_between_x_axis_ticks * index;
                let xPoint = x_point_x_axis_tick;
                let yPoint =
                    (gap_between_y_axis_ticks / gapBetweenYvalues) *
                    (highestValueAtYAxis - item.lineValue) +
                    padding_from_screen;
                if (index === 0) {
                    dPath += `M${xPoint} ${yPoint}`;
                } else {
                    dPath += ` L${xPoint} ${yPoint}`;
                }
            });
        }
        return dPath;
    };

    const render_line_chart_circles = () => {
        const minMaxGap = y2maxValue - minValue;
        const gapBetweenYvalues = minMaxGap / 4;
        const highestValueAtYAxis = y2AxisData[y2AxisData.length - 1];
        return chartData.map((item, index) => {
            const x_point_x_axis_tick =
                gap_between_x_axis_ticks +
                x_axis_x1_point +
                gap_between_x_axis_ticks * index;
            let y_point =
                (gap_between_y_axis_ticks / gapBetweenYvalues) *
                (highestValueAtYAxis - item.lineValue) +
                padding_from_screen;
            return (
                <G key={`line chart circle ${index}`}>
                    <Circle
                        key={`line chart value circle${index}`}
                        cx={x_point_x_axis_tick}
                        cy={y_point}
                        r={circleRadius}
                        fill={circleColor}
                        opacity={1}
                        onPress={() => onPressLinechartItem(item)}
                    />
                </G>
            );
        });
    };
    const render_line_chart = () => {
        const dPath = getDPath();
        return (
            <G key={'line chart'}>
                <AnimatedPath
                    key={'line chart path'}
                    ref={line_chart_ref}
                    d={dPath}
                    // onLayout={() => setPathLength(line_chart_ref?.current.getTotalLength())}
                    stroke={lineColor}
                    strokeWidth={line_chart_width}
                    strokeDasharray={pathLength}
                    strokeDashoffset={animatedPathLength}
                    opacity={animatedPathOpacity}
                    fill="transparent"
                />
            </G>
        );
    };

    const getMultiLineDPath = ({ lineDataList = [] }) => {
        let dPath = '';
        const minMaxGap = y2maxValue - minValue;
        const gapBetweenYvalues = minMaxGap / 4;

        const highestValueAtYAxis = y2AxisData[y2AxisData.length - 1];
        if (highestValueAtYAxis) {
            lineDataList.map((item, index) => {
                let x_point_x_axis_tick =
                    gap_between_x_axis_ticks +
                    x_axis_x1_point +
                    gap_between_x_axis_ticks * index;
                let xPoint = x_point_x_axis_tick;
                let yPoint =
                    (gap_between_y_axis_ticks / gapBetweenYvalues) *
                    (highestValueAtYAxis - item) +
                    padding_from_screen;
                if (index === 0) {
                    dPath += `M${xPoint} ${yPoint}`;
                } else {
                    dPath += ` L${xPoint} ${yPoint}`;
                }
            });
        }
        return dPath;
    };
    const render_multiline_chart = () => {
        return (
            <G key={'multi line chart'}>
                {
                    x_axis_wiseMultiLineValues?.map((singleLine, index) => {
                        const dPath = getMultiLineDPath({ lineDataList: singleLine });
                        return (<AnimatedPath
                            key={`multi line chart path${index}`}
                            // ref={line_chart_ref}
                            d={dPath}
                            // onLayout={() => setPathLength(line_chart_ref?.current.getTotalLength())}
                            stroke={multiLineChartColors[index] || lineColor}
                            strokeWidth={line_chart_width}
                            strokeDasharray={pathLength}
                            strokeDashoffset={animatedPathLength}
                            opacity={animatedPathOpacity}
                            fill="transparent"
                        />)

                    })
                }

            </G>
        );
    };

    const render_multiline_chart_circles = () => {
        const minMaxGap = y2maxValue - minValue;
        const gapBetweenYvalues = minMaxGap / 4;
        const highestValueAtYAxis = y2AxisData[y2AxisData.length - 1];
        return (
            <G key={'multi line chart circle'}>
                {
                    x_axis_wiseMultiLineValues?.map((singleLine, parentIndex) => {
                        return singleLine.map((item, x_axis_wise_index) => {
                            const x_point_x_axis_tick =
                                gap_between_x_axis_ticks +
                                x_axis_x1_point +
                                gap_between_x_axis_ticks * x_axis_wise_index;
                            let y_point =
                                (gap_between_y_axis_ticks / gapBetweenYvalues) *
                                (highestValueAtYAxis - item) +
                                padding_from_screen;
                            return (
                                <Circle
                                    key={`multi line chart value circle${x_axis_wise_index}`}
                                    cx={x_point_x_axis_tick}
                                    cy={y_point}
                                    r={circleRadius}
                                    fill={circleColorHighPriority ? circleColor : multiLineChartColors[parentIndex] || circleColor}
                                    opacity={1}
                                    onPress={() => onPressMultiLinechartItem(item, x_axis_wise_index)}
                                />
                            );
                        });

                    })
                }
            </G>
        );
    };

    return (
        <View style={[styles.container, { height: containerHeight, backgroundColor: backgroundColor }]}>
            <ScrollView
                horizontal={scrollEnable}
                scrollEnabled={scrollEnable}
                contentContainerStyle={{ flexGrow: 1 }}>
                <View style={{ height: containerHeight, width: scrollWidth + gap_between_x_axis_ticks }}>
                    <AnimatedSvg height="100%"
                        width="100%"
                        style={{ backgroundColor: 'transparent' }}>
                        {showGridX && render_grid_x()}
                        {showGridY && render_grid_y()}
                        {render_x_axis()}
                        {render_x_axis_ticks_labels()}
                        {Boolean(chartType === ChartType.BAR || chartType === ChartType.ALL) && render_barchart()}
                        {Boolean(chartType === ChartType.BAR || chartType === ChartType.ALL) && show_barchart_tooltips && render_barchart_tooltips()}
                        {!scrollEnable && Boolean(yAxisData?.length) && render_y_axis()}
                        {!scrollEnable && Boolean(yAxisData?.length) && render_y_axis_ticks_labels()}
                        {y2Axis && Boolean(yAxisData?.length) && render_y2_axis()}
                        {y2Axis && Boolean(yAxisData?.length) && render_y2_axis_ticks_labels()}
                        {Boolean(chartType === ChartType.LINE || chartType === ChartType.ALL) && !numberOfLinesInMultilineChart && Boolean(yAxisData?.length) && render_line_chart()}
                        {Boolean(chartType === ChartType.LINE || chartType === ChartType.ALL) && !numberOfLinesInMultilineChart && Boolean(yAxisData?.length) && render_line_chart_circles()}
                        {Boolean(chartType === ChartType.MULTILINE || chartType === ChartType.ALL) && numberOfLinesInMultilineChart && Boolean(yAxisData?.length) && render_multiline_chart()}
                        {Boolean(chartType === ChartType.MULTILINE || chartType === ChartType.ALL) && numberOfLinesInMultilineChart && Boolean(yAxisData?.length) && render_multiline_chart_circles()}
                    </AnimatedSvg>
                </View>
            </ScrollView>
            {scrollEnable &&
                <View
                    style={[
                        StyleSheet.absoluteFillObject,
                        {
                            width: marginLeft_for_y_axis + circleRadius,
                            backgroundColor: backgroundColor,
                        },
                    ]}>
                    <AnimatedSvg height="100%"
                        width="100%"
                        style={{ backgroundColor: 'transparent' }}>
                        {Boolean(yAxisData?.length) && render_y_axis()}
                        {Boolean(yAxisData?.length) && render_y_axis_ticks_labels()}
                    </AnimatedSvg>
                </View>}
            {showTooltipPopup && isTooltipPopupVisible &&
                <ToolTipPopup
                    selectedChartItem={selectedChartItem}
                    onClose={() => setIsTooltipPopupVisible(false)}
                    containerStyle={toolTipContainerStyle}
                    textStyle={toolTipTextStyle}
                />}
        </View>
    );
}

const ToolTipPopup = ({ selectedChartItem, onClose, containerStyle, textStyle }) => {
    return (
        <TouchableOpacity style={[styles.toolTipPopup, containerStyle]} onPress={onClose}>
            <Text style={[styles.toolTipTextStyle, textStyle]}>{selectedChartItem?.value?.length > 0 ? selectedChartItem?.value?.join() : selectedChartItem?.value ?? ''}</Text>
        </TouchableOpacity>
    )
}
export default StackedBarChart

export const styles = StyleSheet.create({
    container: {
        backgroundColor: '#000',
    },
    toolTipPopup: {
        position: 'absolute',
        left: 80,
        right: 80,
        top: 50,
        height: 80,
        backgroundColor: '#cfcfcf',
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center'
    },
    toolTipTextStyle: {
        fontSize: 20,
        color: '#000',
        fontWeight: '600'
    }
});