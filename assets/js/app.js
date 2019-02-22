// @TODO: YOUR CODE HERE!
//create a scatter plot between two of the data variables such as Healthcare vs. Poverty or Smokers vs. Age
//svg container
var svgHeight = 500;
var svgWidth = 1200;

//margins
var margin = {
    top: 20,
    right: 40,
    bottom: 80,
    left: 100
};

//area of chart (minus margins)
var chartHeight = svgHeight - margin.top - margin.bottom;
var chartWidth = svgWidth - margin.left - margin.right;

//svg container
var svg = d3.select(".scatter").append("svg")
.attr("width", svgWidth)    
.attr("height", svgHeight);

//shift all elements over according to margins(append and SVG group)
var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);


//initial parameters
var chosenXAxis = "income";

//function for updating x-scale var when the axis lable is clicked
function xScale(healthData, chosenXAxis) {
    //create scales
    //xLinearScale function the csv import data
    var xLinearScale = d3.scaleLinear()
        .domain([d3.min(healthData, d => d[chosenXAxis]) * 0.1,
            d3.max(healthData, d => d[chosenXAxis]) * 3
        ])
        .range([0, chartWidth]);

    return xLinearScale;
}

//function to update xAxis on click of axis label
function renderAxes(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);

    xAxis.transition()
        .duration(1000)
        .call(bottomAxis);

    return xAxis;
}

//function to update circles when axis transitions
function renderCircles(circlesGroup, newXScale, chosenXAxis) {
    circlesGroup.transition()
        .duration(1000)
        .attr("cx", d => newXScale(d[chosenXAxis]));
    return circlesGroup;
}

//function for updating circlesGroup with new tooltip
function updateToolTip(chosenXAxis, circlesGroup) {
    if (chosenXAxis === "income") {
        var label = "Income:";
    }
    else {
        var label = "Age:";
    }

    var toolTip = d3.tip()
        .attr("class", "tooltip")
        .offset([80, -60])
        .html(function(d) {
            return (`${"State:"} ${d.abbr}<br>${"BMI:"} ${d.obesity}<br>${label} ${d[chosenXAxis]}`);
        });
    circlesGroup.call(toolTip);

    circlesGroup.on("mouseover", function(data) {
        toolTip.show(data, this);
    })
    
        //on mouseout event
        .on("mouseout", function(data, index) {
            toolTip.hide(data);
        });
    return circlesGroup;
}

//pull in the data from data.csv by using the d3.csv function
d3.csv("assets/data/healthData.csv").then(function(healthData) {
    //if (err) throw err;
    console.log(healthData[0]);


//parse data
    healthData.forEach(function(data) {
        //data.id = +data.id;
        //data.state = +data.state;
        //data.abbr = +data.abbr;
        //data.poverty = +data.poverty;
        //data.povertyMoe = +data.povertyMoe;
        data.age = +data.age;
        //data.ageMoe = +data.ageMoe;
        data.income = +data.income;
        //data.incomeMoe = +data.incomeMoe;
        //data.healthcare = +data.healthcare;
        //data.healthcareLow = +data.healthcareLow;
        //data.healthcareHigh = +data.healthcareHigh;
        data.obesity = +data.obesity;
        //data.obesityLow = +data.obesityLow;
        //data.obesityHigh = +data.obesityHigh;
        //data.smokes = +data.smokes;
        //data.smokesLow = +data.smokesLow;
        //data.smokesHigh = +data.smokesHigh;
    });

//xLinearScale function the csv import data
var xLinearScale = xScale(healthData, chosenXAxis);

//yLinearScale function the csv import data
var yLinearScale = d3.scaleLinear()
    .domain([18, d3.max(healthData, d => d.obesity)])
    .range([chartHeight, 0]);

//create initial axis functions
var bottomAxis = d3.axisBottom(xLinearScale);
var leftAxis = d3.axisLeft(yLinearScale);

//append x axis
var xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${chartHeight})`)
    .call(bottomAxis);

//append y axis
chartGroup.append("g")
    .call(leftAxis);

//append initial circles
//represent each state with circle elements
//append data to chartGroup
var circlesGroup = chartGroup.selectAll("circle")
    .data(healthData)
    .enter()
    .append("circle")
    .attr("r", 10)
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d.obesity))
    .attr("fill", "white")
    .attr("opacity", "0.5")
    //Include state abbreviations in the circles.
    .attr("class", "abbr");
        
var circlesText = chartGroup.selectAll("abbr")
    .data(healthData)
    .enter()
    .append("text")
    .text(function (d) {
        return d.abbr;
    })
        .attr("x", function (d) {
            return xLinearScale(d[chosenXAxis]);
    })
    .attr("y", function (d) {
        return yLinearScale(d[chosenXAxis]);
    })
    .attr("font-size", "10px")
    .attr("text-anchor", "middle")
    .attr("fill", "black");


var labelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${chartWidth / 2}, ${chartHeight + 20})`);

var incomeLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "income") //value to grab for event listener
    .classed("active", true)
    .text("Income Level (US$ per year)");

var ageLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "age")//event listener, grab this value
    .classed("inactive", true)
    .text("Mean Age of State");

//append y axis
chartGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x", 0 - (chartHeight / 2))
    .attr("dy", "2em")
    .classed("axis-text", true)
    .text("Mean BMI");

//update tooltip for above csv import
var circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

//x axis labels event listener
labelsGroup.selectAll("text")
    .on("click", function() {
        //get value of selection
        var value = d3.select(this).attr("value");
        if (value !== chosenXAxis) {
            //replace chosen axis with value
            chosenXAxis = value;
            
            //  updates x scale for new data
            xLinearScale = xScale(healthData, chosenXAxis);
            xAxis = renderAxes(xLinearScale, xAxis);
            circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis);
            //update tooltips with new info
            circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

            var newCirclesText = chartGroup.selectAll("stateText")
                .data(healthData)
                .enter()
                .append("text")
                .text(function (d) {
                    return data.abbr;
                })
                .attr("x", function (d) {
                    return xLinearScale(d[chosenXAxis]);
                })
                .attr("y", function (d) {
                    return yLinearScale(d.obesity);
                })
                .attr("font-size", "10px")
                .attr("text-anchor", "middle")
                .attr("fill", "blue");

            //change classes to chage bold text
            if (chosenXAxis === "age") {
                ageLabel
                    .classed("active", true)
                    .classed("inactive", false);
                incomeLabel
                    .classed("active", false)
                    .classed("inactive", true);
            }
            else {
                    ageLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    incomeLabel
                        .classed("active", true)
                        .classed("inactive", false);
            }
        }
    });

});