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
    STACK_BAR: 'stack_barchart',
    LINE: 'linechart'
}
const StackedBarChart = ({
    containerHeight = 400,
    containerWidth = Dimensions.get('window').width,
    backgroundColor = '#000',
    axisColor = '#9cc',
    showAxisTicks = true,
    showGrid = true,
    gridColor = '#EDEDED',
    yAxisSubstring = 'k',
    y2AxisSubstring = '%',
    y2Axis = true, // if only single chart. set to false
    circleColor = '#DAA520',
    axisFontColor = '#fff',
    barchartColor = '#73ff00',
    chartType = ChartType.ALL,
    stackedSecondaryBarColor = '#ccc',
    lineColor = '#DAA520',
    circleRadius = 5,
    axisWidth = 2,
    axisFontSize = 10,
    axisFontFamily,
    barWidth = 30,
    line_chart_width = 2,
    showTooltip = false,
    showTooltipPopup = true,
    toolTipContainerStyle,
    toolTipTextStyle,
    scrollEnable = false,
    onPressItem = (item) => { }, //set showTooltipPopup to false
    onPressLineItem = (item) => { }, //set showTooltipPopup to false
    // chartData = [
    //     { month: 'Jan', barValue: 150},
    //     { month: 'Feb', barValue: 450},
    //     { month: 'Mar', barValue: 600},
    // ],
    // chartData = [
    //     { month: 'Jan', lineValue: 100 },
    //     { month: 'Feb', lineValue: 250 },
    //     { month: 'Mar', lineValue: 500 },
    // ],
    chartData = [
        { month: 'Jan', barValue: 150, stackedSecondaryBarValue: 100, lineValue: 100 },
        { month: 'Feb', barValue: 450, stackedSecondaryBarValue: 150, lineValue: 250 },
        { month: 'Mar', barValue: 600, stackedSecondaryBarValue: 100, lineValue: 500 },
    ],
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
    let maxValue = Math.max.apply(
        Math,
        chartData?.map((item) => item.barValue),
    );
    if (chartType === ChartType.STACK_BAR || chartType === ChartType.ALL) {
        let stackedBarMaxValue = Math.max.apply(
            Math,
            chartData?.map((item) => item.stackedSecondaryBarValue),
        );
        if (stackedBarMaxValue > maxValue) {
            maxValue = stackedBarMaxValue
        }
    }
    else if (chartType === ChartType.LINE) {
        maxValue = Math.max.apply(
            Math,
            chartData?.map((item) => item.lineValue),
        );
    }
    else {

    }
    const y2maxValue = Math.max.apply(
        Math,
        chartData?.map((item) => item.lineValue),
    );
    const gapBetweenYaxisValues = (maxValue - minValue) / 4;
    const gapBetweenY2axisValues = (y2maxValue - minValue) / 4;

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
        const newLabels = Array.from({ length: 6 }).map(
            (_, index) => minValue + gapBetweenYaxisValues * index,
        );
        const newY2Labels = Array.from({ length: 6 }).map(
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

    const onPressBarchartItem = (item, type = ChartType.BAR) => {
        if (showTooltipPopup) {
            const obj = {
                month: item?.month,
                value: type === ChartType.BAR ? item?.barValue : item?.stackedSecondaryBarValue
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
        const gap_between_y_axis_ticks = y_axis_height / (yAxisData?.length - 1);
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
        const gap_between_y_axis_ticks = y_axis_height / (y2AxisData?.length - 1);
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

    const renderGrid = () => {
        const gap_between_y_axis_ticks = y_axis_height / (yAxisData?.length - 1);
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
    const render_barchart = () => {
        const gap_between_y_axis_ticks = y_axis_height / (yAxisData?.length - 1);
        return chartData?.map((item, index) => {
            let x_point_x_axis_tick =
                gap_between_x_axis_ticks +
                x_axis_x1_point +
                gap_between_x_axis_ticks * index;
            let height =
                (item?.barValue * gap_between_y_axis_ticks) / gapBetweenYaxisValues;
            let isStackedbarVisible = Boolean(chartType === ChartType.STACK_BAR || chartType === ChartType.ALL) && Boolean(item?.stackedSecondaryBarValue)
            let secondBarHeight = isStackedbarVisible &&
                (item?.stackedSecondaryBarValue * gap_between_y_axis_ticks) / gapBetweenYaxisValues;
            let second_bar_y1_point = isStackedbarVisible && -height + x_axis_y1_point - secondBarHeight

            return (
                <G key={`bar chart${index}`}>
                    <AnimatedRect
                        x={x_point_x_axis_tick - barWidth / 2}
                        y={x_axis_y1_point}
                        height={-height}
                        width={barWidth}
                        fill={barchartColor}
                        onPress={() => onPressBarchartItem(item, ChartType.BAR)}
                    />
                    {isStackedbarVisible && (
                        <AnimatedRect
                            x={x_point_x_axis_tick - barWidth / 2}
                            y={second_bar_y1_point}
                            height={secondBarHeight}
                            width={barWidth}
                            fill={stackedSecondaryBarColor}
                            onPress={() => onPressBarchartItem(item, ChartType.STACK_BAR)}
                        />
                    )}
                </G>
            );
        });
    };
    const getDPath = () => {
        let dPath = '';
        const gap_between_y_axis_ticks = y_axis_height / (y2AxisData?.length - 1);
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
        const gap_between_y_axis_ticks = y_axis_height / (y2AxisData?.length - 1);
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

    const render_tooltips = () => {
        const gap_between_y_axis_ticks = y_axis_height / (yAxisData?.length - 1);
        return chartData?.map((item, index) => {
            let x_point_x_axis_tick =
                gap_between_x_axis_ticks +
                x_axis_x1_point +
                gap_between_x_axis_ticks * index;
            let height =
                (item?.barValue * gap_between_y_axis_ticks) / gapBetweenYaxisValues;
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
                        fontFamily={axisFontFamily}
                        fill={barchartColor}
                        textAnchor="middle"
                        opacity={animated_axis_tick_circle_opacity}>
                        {item?.barValue}
                    </AnimatedSvgText>
                </G>
            );
        });
    };
    return (
        <View style={[styles.container, { height: containerHeight, backgroundColor: backgroundColor }]}>
            <ScrollView
                horizontal={scrollEnable}
                scrollEnabled={scrollEnable}
                contentContainerStyle={{ flexGrow: 1 }}>
                <View style={{ height: containerHeight, width: scrollWidth }}>
                    <AnimatedSvg height="100%"
                        width="100%"
                        style={{ backgroundColor: 'transparent' }}>
                        {showGrid && renderGrid()}
                        {render_x_axis()}
                        {render_x_axis_ticks_labels()}
                        {Boolean(chartType === ChartType.BAR || chartType === ChartType.STACK_BAR || chartType === ChartType.ALL) && render_barchart()}
                        {showTooltip && render_tooltips()}
                        {!scrollEnable && Boolean(yAxisData?.length) && render_y_axis()}
                        {!scrollEnable && Boolean(yAxisData?.length) && render_y_axis_ticks_labels()}
                        {y2Axis && Boolean(yAxisData?.length) && render_y2_axis()}
                        {y2Axis && Boolean(yAxisData?.length) && render_y2_axis_ticks_labels()}
                        {Boolean(chartType === ChartType.LINE || chartType === ChartType.ALL) && Boolean(yAxisData?.length) && render_line_chart()}
                        {Boolean(chartType === ChartType.LINE || chartType === ChartType.ALL) && Boolean(yAxisData?.length) && render_line_chart_circles()}
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
            <Text style={[styles.toolTipTextStyle, textStyle]}>{selectedChartItem?.value ?? ''}</Text>
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