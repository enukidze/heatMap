class Chart {
    constructor() {
        // Defining state attributes
        const attrs = {
            id: "ID" + Math.floor(Math.random() * 1000000),
            svgWidth: 400,
            svgHeight: 200,
            marginTop: 5,
            marginBottom: 145,
            marginRight: 25,
            marginLeft: 85,
            container: "body",
            defaultTextFill: "#2C3E50",
            defaultFont: "Helvetica",
            data: null,
            chartWidth: null,
            chartHeight: null
        };

        // Defining accessors
        this.getState = () => attrs;
        this.setState = (d) => Object.assign(attrs, d);

        // Automatically generate getter and setters for chart object based on the state properties;
        Object.keys(attrs).forEach((key) => {
            //@ts-ignore
            this[key] = function (_) {
                if (!arguments.length) {
                    return attrs[key];
                }
                attrs[key] = _;
                return this;
            };
        });

        // Custom enter exit update pattern initialization (prototype method)
        this.initializeEnterExitUpdatePattern();
    }


    render() {
        this.setDynamicContainer();
        this.calculateProperties();
        this.drawSvgAndWrappers();
        this.drawRects();
        return this;
    }

    calculateProperties() {
        const {
            marginLeft,
            marginTop,
            marginRight,
            marginBottom,
            svgWidth,
            svgHeight
        } = this.getState();

        //Calculated properties
        var calc = {
            id: null,
            chartTopMargin: null,
            chartLeftMargin: null,
            chartWidth: null,
            chartHeight: null
        };
        calc.id = "ID" + Math.floor(Math.random() * 1000000); // id for event handlings
        calc.chartLeftMargin = marginLeft;
        calc.chartTopMargin = marginTop;
        const chartWidth = svgWidth - marginRight - calc.chartLeftMargin;
        const chartHeight = svgHeight - marginBottom - calc.chartTopMargin;

        this.setState({
            calc,
            chartWidth,
            chartHeight
        });
    }

    drawRects() {
        const {
            chart,
            data,
            chartWidth,
            chartHeight
        } = this.getState();

        const realData = d3.json('https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json')
            .then(data => {






                const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
             
                const usableData = data.monthlyVariance.map(d => {
                    return {
                        year: d.year,
                        month: months[d.month - 1],
                        variance: d.variance
                    }
                })
                const axisYScale = d3.scaleBand()
                                     .domain(months)
                                     .range([chartHeight,0])
                
                const yAxisFunc = d3.axisLeft(axisYScale).tickFormat(d => d)

                const yAxis = chart._add({
                    tag: 'g',
                    className: 'month-axis'
                })
                .attr('transform', `translate(0, ${0})`)
                .attr('stroke-width', 2)
                .call(yAxisFunc);

                const [minYear, maxYear] = d3.extent(usableData, d => Math.ceil(d.year / 5 ) * 5)
                const yearLineData = d3.range(
                    minYear,
                    maxYear + 10,
                    10
                )

                // Math.ceil(d.year / 10) * 10

                const axisXScale = d3.scaleLinear()
                                     .domain([minYear,maxYear])
                                     .range([ 0,chartWidth])

                
                const axisScaleFunc = d3.axisBottom(axisXScale).tickValues(yearLineData).tickFormat(d => d)

                const xAxis = chart._add({
                    tag: 'g',
                    className: 'year-axis'
                })
                .attr('transform', `translate(0,${chartHeight})`)
                .attr('stroke-width', 2)
                .call(axisScaleFunc);



                const baseTemp = data.baseTemperature
                let [minVariance, maxVariance] = d3.extent(usableData, d => d.variance)
                minVariance = Math.round((minVariance + baseTemp) * 10) / 10
                maxVariance = Math.round((maxVariance + baseTemp) * 10) / 10

                const colorScale = d3.scaleLinear()
                    .domain([minVariance, maxVariance])
                    // .range(['#5074AF', '#C64032'])
                    .range(['cyan', 'red'])



                const legendValues = d3.range(
                    minVariance,
                    maxVariance + 1.1,
                    1.1
                ).map(d => Math.round(d * 10) / 10)
                legendValues.sort((a, b) => a - b);

                const legendXLineStart = 40
                const legendXLineEnd = 700
                const legendLineLength = legendXLineEnd - legendXLineStart
                const legendLineStrokeStep = legendLineLength / legendValues.length

                const legendScale = d3.scaleLinear()
                    .domain([d3.min(legendValues), d3.max(legendValues)])
                    .range([legendXLineStart, legendXLineEnd]);



                const legendAxis = d3.axisBottom(legendScale)
                     .tickValues(legendValues)
                    .tickFormat(d => d);

                const legendAxisGroup = chart._add({
                        tag: 'g',
                        className: 'legend-axis'
                    })
                    .attr('transform', `translate(0, ${chartHeight + 100})`)
                    .attr('stroke-width', 2)
                    .call(legendAxis)
        

                const legendValuesForRects = legendValues.slice(0, -1);

                const legendRects = chart._add({
                    tag: 'rect',
                    className: 'legend-rects',
                    data: legendValuesForRects
                })
                .attr('width', legendLineLength / legendValues.length + 4)
                .attr('height', legendLineStrokeStep / 2)
                .attr('x', d => legendScale(d))
                .attr('y', chartHeight + 100 - (legendLineStrokeStep / 2))
                .attr('fill', d => colorScale(d))
                .attr('stroke','black')
                .attr('stroke-width',2)


                const heatReactsXScale = d3.scaleLinear()
                                           .domain([])


                const heatReacts = chart._add({
                    tag: 'rect',
                    className: 'heat-rects',
                    data: usableData
                })
                .attr('width',5.4)
                .attr('height',40)
                .attr('x', (d,i) => axisXScale(d.year))
                .attr('y', (d,i) =>  axisYScale(d.month) )
                .attr('fill', d => colorScale(d.variance + baseTemp))

                console.log(axisXScale(minYear),minYear)
            })
    }

    drawSvgAndWrappers() {
        const {
            d3Container,
            svgWidth,
            svgHeight,
            defaultFont,
            calc,
            data,
            chartWidth,
            chartHeight
        } = this.getState();

        // Draw SVG
        const svg = d3Container
            ._add({
                tag: "svg",
                className: "svg-chart-container"
            })
            .attr("width", svgWidth)
            .attr("height", svgHeight)
            .attr("font-family", defaultFont);

        //Add container g element
        var chart = svg
            ._add({
                tag: "g",
                className: "chart"
            })
            .attr(
                "transform",
                "translate(" + calc.chartLeftMargin + "," + calc.chartTopMargin + ")"
            );

        // chart
        //     ._add({
        //         tag: "rect",
        //         selector: "rect-sample",
        //         data: [data]
        //     })
        //     .attr("width", chartWidth)
        //     .attr("height", chartHeight)
        //     .attr("fill", (d) => d.color);

        this.setState({
            chart,
            svg
        });
    }

    initializeEnterExitUpdatePattern() {
        d3.selection.prototype._add = function (params) {
            var container = this;
            var className = params.className;
            var elementTag = params.tag;
            var data = params.data || [className];
            var exitTransition = params.exitTransition || null;
            var enterTransition = params.enterTransition || null;
            // Pattern in action
            var selection = container.selectAll("." + className).data(data, (d, i) => {
                if (typeof d === "object") {
                    if (d.id) {
                        return d.id;
                    }
                }
                return i;
            });
            if (exitTransition) {
                exitTransition(selection);
            } else {
                selection.exit().remove();
            }

            const enterSelection = selection.enter().append(elementTag);
            if (enterTransition) {
                enterTransition(enterSelection);
            }
            selection = enterSelection.merge(selection);
            selection.attr("class", className);
            return selection;
        };
    }

    setDynamicContainer() {
        const attrs = this.getState();

        //Drawing containers
        var d3Container = d3.select(attrs.container);
        var containerRect = d3Container.node().getBoundingClientRect();
        if (containerRect.width > 0) attrs.svgWidth = containerRect.width;

        d3.select(window).on("resize." + attrs.id, function () {
            var containerRect = d3Container.node().getBoundingClientRect();
            if (containerRect.width > 0) attrs.svgWidth = containerRect.width;
            this.render();
        });

        this.setState({
            d3Container
        });
    }
}