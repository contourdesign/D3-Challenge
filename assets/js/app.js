// (づ｡◕‿‿◕｡)づ
function makeResponsive() {


// If SVG Area is not Empty When Browser Loads, Remove & Replace with a Resized Version of Chart
  var svgArea = d3.select("body").select("svg");

// Clear SVG is Not Empty
    if (!svgArea.empty()) {
      svgArea.remove();
    }

// set up svg attributes
var svgWidth = 980;
var svgHeight = 600;

var margin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// ----------------------------

// Initial Params
var chosenXAxis = "smokes";

var chosenYAxis = "poverty";

// function used for updating x-scale var upon click on axis label
function xScale(timesData, chosenXAxis) {
  // create scales
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(timesData, d => d[chosenXAxis]) * 0.8,
      d3.max(timesData, d => d[chosenXAxis]) * 1.2
    ])
    .range([0, width]);

  return xLinearScale;

}

// function used for updating xAxis var upon click on axis label
function renderAxes(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
}

// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, newXScale, chosenXAxis) {

  circlesGroup.transition()
    .duration(900)
    .attr("cx", d => newXScale(d[chosenXAxis]));

  return circlesGroup;
}


  // Function for Updating Text Group with a Transition to New Text
function renderText(txtGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {

    txtGroup.transition()
      .duration(1000)
      .attr("x", d => newXScale(d[chosenXAxis]))
      .attr("y", d => newYScale(d.poverty))
      .attr("text-anchor", "middle");

    return txtGroup;
}



// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, circlesGroup, txtGroup) {

  var label;

  if (chosenXAxis === "smokes") {
    label = "Smokes:";
  }
  else if (chosenXAxis === "obesity") {
    label = "Obesity: ";
  }

  var toolTip = d3.tip()
    .attr("class", "tooltip d3-tip")
    .offset([90, 90])
    .html(function(d) {
      return (`<strong>${d.abbr}</strong><br>${label} ${d[chosenXAxis]}`);
    });

  circlesGroup.call(toolTip);

  circlesGroup.on("mouseover", function(data) {
    toolTip.show(data, this);
  })
    // onmouseout event
    .on("mouseout", function(data) {
      toolTip.hide(data);
    });




  txtGroup.call(toolTip);
    // Create Event Listeners to Display and Hide the Text Tooltip
    txtGroup.on("mouseover", function(data) {
      toolTip.show(data, this);
    })
      // onmouseout Event
      .on("mouseout", function(data) {
        toolTip.hide(data);
      });




      
  return circlesGroup;
}



//  ------------------

// Load in data

d3.csv("/assets/data/data.csv").then(function(timesData, err) {
    if (err) throw err;
  
    // parse data
    timesData.forEach(function(data) {
      data.poverty = +data.poverty;
      data.abbr = data.abbr;
      data.age = +data.age;
      data.income = +data.income;
      data.obesity = +data.obesity;
      data.smokes = +data.smokes;
      console.log(data.id);
    });
// -------------


// xLinearScale function above csv import
var xLinearScale = xScale(timesData, chosenXAxis);

// Create y scale function
var yLinearScale = d3.scaleLinear()
  .domain([0, d3.max(timesData, d => d.poverty)])
  .range([height, 0]);

// Create initial axis functions
var bottomAxis = d3.axisBottom(xLinearScale);
var leftAxis = d3.axisLeft(yLinearScale);

// append x axis
var xAxis = chartGroup.append("g")
  .classed("x-axis", true)
  .attr("transform", `translate(0, ${height})`)
  .call(bottomAxis);

// append y axis
var yAxis = chartGroup.append("g")
  .classed("y-axis", true)
  .call(leftAxis);

// append initial circles
var circlesGroup = chartGroup.selectAll(".statecircle")
  .data(timesData)
  .enter()
  .append("circle")
  .attr("cx", d => xLinearScale(d[chosenXAxis]))
  .attr("cy", d => yLinearScale(d.poverty))
  .attr("class", "stateCircle")
  .attr("r", 20)
  .attr("fill", "green")
  .attr("opacity", ".5")


  var txtGroup = chartGroup.selectAll(".stateText")
  .data(timesData)
  .enter()
  .append("text")
  .attr("x", d => xLinearScale(d[chosenXAxis]))
  .attr("y", d => yLinearScale(d[chosenYAxis]*.98))
  .text(d => (d.abbr))
  .attr("class", "stateText")
  .attr("font-size", "12px")
  .attr("text-anchor", "middle")
  .attr("fill", "white");

// Create group for two x-axis labels
var xlabelsGroup = chartGroup.append("g")
  .attr("transform", `translate(${width / 2}, ${height + 20})`);

var smokeLabel = xlabelsGroup.append("text")
  .attr("x", 0)
  .attr("y", 20)
  .attr("value", "smokes") // value to grab for event listener
  .classed("active", true)
  .text("Smoking Score");

var obesityLabel = xlabelsGroup.append("text")
  .attr("x", 0)
  .attr("y", 40)
  .attr("value", "obesity") // value to grab for event listener
  .classed("inactive", true)
  .text("Obesity Score");

// append y axis
chartGroup.append("text")
  .attr("transform", "rotate(-90)")
  .attr("y", 0 - margin.left)
  .attr("x", 0 - (height / 2))
  .attr("dy", "1em")
  .classed("axis-text", true)
  .text("Poverty Score");




circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

// x axis labels event listener
xlabelsGroup.selectAll("text")
  .on("click", function() {
    // get value of selection
    var value = d3.select(d3.event.target).attr("value");
    if (value !== chosenXAxis) {

      // replaces chosenXAxis with value
      chosenXAxis = value;

      console.log(chosenXAxis)

    
      // updates x scale for new data
      xLinearScale = xScale(timesData, chosenXAxis);

      xAxis = renderXAxes(xLinearScale, xAxis);
      
      // updates x axis with transition
      xAxis = renderAxes(xLinearScale, xAxis);

      // updates circles with new x values
      circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis);

      txtGroup = renderText(txtGroup, xLinearScale, yLinearScale, chosenXAxis);
      
      // updates tooltips with new info
      circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup, txtGroup);

      // changes classes to change bold text
      if (chosenXAxis === "obesity") {
        obesityLabel
          .classed("active", true)
          .classed("inactive", false);
        smokeLabel
          .classed("active", false)
          .classed("inactive", true);
      }
      else {
        obesityLabel
          .classed("active", false)
          .classed("inactive", true);
        smokeLabel
          .classed("active", true)
          .classed("inactive", false);
      }
    }
  });
}).catch(function(error) {
console.log(error);
});

};
// When Browser Loads, makeResponsive() is Called
makeResponsive();

// When Browser Window is Resized, makeResponsive() is Called
d3.select(window).on("resize", makeResponsive);

// (づ｡◕‿‿◕｡)づ