// @TODO: YOUR CODE HERE!
var svgWidth = 960;
var svgHeight = 620;

var margin = {
    top: 20,
    bottom: 200,
    right: 40,
    left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
var svg = d3
    .select("#scatter")
    .append("svg")
    .attr("height", svgHeight)
    .attr("width", svgWidth);

// Append an SVG group
var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
var chosenXAxis = "poverty";
var chosenYAxis = "healthcare";

// function used for updating x-scale var upon click on axis label
function xScale(censusData, chosenXAxis) {
    // create scales
    var xLinearScale = d3.scaleLinear()
        .domain([d3.min(censusData, d => d[chosenXAxis]) * 0.8,
        d3.max(censusData, d => d[chosenXAxis]) * 1.2])
        .range([0, width])

    return xLinearScale;
}

// function used for updating y-scale var upon click on axis label
function yScale(censusData, chosenYAxis) {
    // create scales
    var yLinearScale = d3.scaleLinear()
        .domain([d3.min(censusData, d => d[chosenYAxis]) * 0.8,
        d3.max(censusData, d => d[chosenYAxis]) * 1.2])
        .range([height, 0])

    return yLinearScale;
}


// function used for updating xAxis var upon click on axis label
function renderAxesX(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);

    xAxis.transition()
        .duration(1000)
        .call(bottomAxis);

    return xAxis;
}


// function used for updating yAxis var upon click on axis label
function renderAxesY(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);

    yAxis.transition()
        .duration(1000)
        .call(leftAxis);

    return yAxis;
}

// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {
    circlesGroup.transition()
        .duration(1000)
        .attr("cx", data => newXScale(data[chosenXAxis]))
        .attr("cy", data => newYScale(data[chosenYAxis]));

    return circlesGroup;
}

// function used for updating state labels with a transition to new
function renderText(textGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {
    textGroup.transition()
        .duration(1000)
        .attr("x", d => newXScale(d[chosenXAxis]))
        .attr("y", d => newYScale(d[chosenYAxis]));

    return textGroup;
}

//function to stylize x-axis values for tooltips
function styleX(value, chosenXAxis) {
    if (chosenXAxis === 'poverty') {
        return `${value}%`;
    }
    else if (chosenXAxis === 'income') {
        return `$${value}`;
    }
    else {
        return `${value}`;
    }
}

function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {
    if (chosenXAxis === 'poverty') {
        var xLabel = "Poverty:";
    }
    else if (chosenXAxis === 'income') {
        var xLabel = "Median Income:";
    }
    else {
        var xLabel = "Age:";
    }

    //select y label
    if (chosenYAxis === 'healthcare') {
        var yLabel = "No Healthcare:";
    }
    else if (chosenYAxis === 'obesity') {
        var yLabel = "Obebsity:";
    }

    else {
        var yLabel = "Smokers:";
    }

    // create tooltip
    var toolTip = d3.tip()
        .attr("class", "d3-tip")
        .offset([80, -60])
        .html(function (d) {
            return (`${d.state}<br>${xLabel} ${styleX(d[chosenXAxis], chosenXAxis)}<br> ${yLabel} ${d[chosenYAxis]}%`);
        });
    circlesGroup.call(toolTip);

    circlesGroup.on("mouseover", toolTip.show)
        .on("mouseout", toolTip.hide);

    return circlesGroup;
}

//retrieve csv data
d3.csv("./assets/data/data.csv").then(function (censusData) {

    console.log(censusData);
    // parse data
    censusData.forEach(function (data) {
        data.obesity = +data.obesity;
        data.income = +data.income;
        data.smokes = +data.smokes;
        data.age = +data.age;
        data.healthcare = +data.healthcare;
        data.poverty = +data.poverty;
    });

    //LinearScales functions above csv import
    var xLinearScale = xScale(censusData, chosenXAxis);
    var yLinearScale = yScale(censusData, chosenYAxis);

    // Create initial axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    //append x axis
    var xAxis = chartGroup.append("g")
        .classed("x-axis", true)
        .attr("transform", `translate(0, ${height})`)
        .call(bottomAxis);

    //append y axis
    var yAxis = chartGroup.append("g")
        .classed("y-axis", true)
        .call(leftAxis);

    //append initial circles
    var circlesGroup = chartGroup.selectAll("circle")
        .data(censusData)
        .enter()
        .append("circle")
        .classed("stateCircle", true)
        .attr("cx", d => xLinearScale(d[chosenXAxis]))
        .attr("cy", d => yLinearScale(d[chosenYAxis]))
        .attr("r", 12)
        .attr("opacity", ".5");

    var textGroup = chartGroup.selectAll(".stateText")
        .data(censusData)
        .enter()
        .append("text")
        .classed("stateText", true)
        .attr("x", d => xLinearScale(d[chosenXAxis]))
        .attr("y", d => yLinearScale(d[chosenYAxis]))
        .attr("dy", 3)
        .attr("font-size", "10px")
        .text(function (d) { return d.abbr });

    // Create group for  3 x- axis labels
    var xLabelsGroup = chartGroup.append("g")
        .attr("transform", `translate(${width / 2}, ${height + 20})`);


    var povertyLabel = xLabelsGroup.append("text")
        .classed("aText", true)
        .classed("active", true)
        .attr("x", 0)
        .attr("y", 20)
        .attr("value", "poverty")
        .text("In Poverty(%)");

    var ageLabel = xLabelsGroup.append("text")
        .classed("aText", true)
        .classed("inactive", true)
        .attr("x", 0)
        .attr("y", 40)
        .attr("value", "age")
        .text("Age (Median)");

    var incomeLabel = xLabelsGroup.append("text")
        .classed("aText", true)
        .classed("inactive", true)
        .attr("x", 0)
        .attr("y", 60)
        .attr("dy", "1em")
        .attr("value", "income")
        .text("Household Income(Median)");

    // Create group for  3 y- axis labels
    var yLabelsGroup = chartGroup.append("g")
        .attr("transform", `translate(${0 - margin.left / 4}, ${(height / 2)})`);


    var healthcareLabel = yLabelsGroup.append("text")
        .classed("aText", true)
        .classed("active", true)
        .attr("x", 0)
        .attr("y", 0 - 20)
        .attr("dy", "1em")
        .attr("transform", "rotate(-90)")
        .attr("value", "healthcare")
        .text("Lacks Healthcare (%)");

    var smokesLabel = yLabelsGroup.append("text")
        .classed("aText", true)
        .classed("inactive", true)
        .attr("x", 0)
        .attr("y", 0 - 40)
        .attr("dy", "1em")
        .attr("transform", "rotate(-90)")
        .attr("value", "smokes")
        .text("Smokes (%)");

    var obesityLabel = yLabelsGroup.append("text")
        .classed("aText", true)
        .classed("inactive", true)
        .attr("x", 0)
        .attr("y", 0 - 60)
        .attr("dy", "1em")
        .attr("transform", "rotate(-90)")
        .attr("value", "obesity")
        .text("Obese (%)");

    //updateToolTip function with data

    var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

    //x axis labels event listener
    xLabelsGroup.selectAll("text")
        .on("click", function () {
            var value = d3.select(this).attr("value");

            if (value != chosenXAxis) {
                // replaces chosenXAxis with value
                chosenXAxis = value;

                // updates x scale for new data
                xLinearScale = xScale(censusData, chosenXAxis);

                // updates x axis with transition
                xAxis = renderAxesX(xLinearScale, xAxis);

                // updates circles with new x values
                circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);


                textGroup = renderText(textGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

                // updates tooltips with new info
                circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

                // changes classes to change bold text
                if (chosenXAxis === "poverty") {
                    povertyLabel.classed("active", true).classed("inactive", false);
                    ageLabel.classed("active", false).classed("inactive", true);
                    incomeLabel.classed("active", false).classed("inactive", true);
                } else if (chosenXAxis === "age") {
                    povertyLabel.classed("active", false).classed("inactive", true);
                    ageLabel.classed("active", true).classed("inactive", false);
                    incomeLabel.classed("active", false).classed("inactive", true);

                } else {
                    povertyLabel.classed("active", false).classed("inactive", true);
                    ageLabel.classed("active", false).classed("inactive", true);
                    incomeLabel.classed("active", true).classed("inactive", false);
                }
            }
        });

    //y axis labels event listener
    yLabelsGroup.selectAll("text")
    .on("click", function() {
        //get value of selection
        var value = d3.select(this).attr("value");

        //check if value is same as current axis
        if (value != chosenYAxis) {

            //replace chosenYAxis with value
            chosenYAxis = value;

            //update y scale for new data
            yLinearScale = yScale(censusData, chosenYAxis);

            //update x axis with transition
            yAxis = renderAxesY(yLinearScale, yAxis);

            //update circles with new y values
            circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

            //update text with new y values
            textGroup = renderText(textGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis)

            //update tooltips with new info
            circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

            //change classes to change bold text
            if (chosenYAxis === "obesity") {
                obesityLabel.classed("active", true).classed("inactive", false);
                smokesLabel.classed("active", false).classed("inactive", true);
                healthcareLabel.classed("active", false).classed("inactive", true);
            }
            else if (chosenYAxis === "smokes") {
                obesityLabel.classed("active", false).classed("inactive", true);
                smokesLabel.classed("active", true).classed("inactive", false);
                healthcareLabel.classed("active", false).classed("inactive", true);
            }
            else {
                obesityLabel.classed("active", false).classed("inactive", true);
                smokesLabel.classed("active", false).classed("inactive", true);
                healthcareLabel.classed("active", true).classed("inactive", false);
            }
        }
    });   
});










