// D3 Scatterplot Assignment

// Students:
// =========
// Follow your written instructions and create a scatter plot with D3.js.

d3.select(window).on("resize", makeResponsive);

// When the browser loads, makeResponsive() is called.
makeResponsive();

// The code for the chart is wrapped inside a function that automatically resizes the chart
function makeResponsive() {
  // if the SVG area isn't empty when the browser loads, remove it and replace it with a resized version of the chart
  	var svgArea = d3.select("svg");
  	if (!svgArea.empty()) {
    	svgArea.remove();
      makeScatter();
  }
}

//Make Chart
makeScatter();

function makeScatter() {
  var svgWidth = window.innerWidth;
  var svgHeight = window.innerHeight;

  var margin = { top: 20, right: 40, bottom: 100, left: 100 };

  // width = svgWidth - margin.left - margin.right
  // height = svgHeight - margin.top - margin.bottom
  if (svgWidth - margin.left - margin.right > 300) {
  	width = svgWidth - margin.left - margin.right;
  }	else {
  		width = 300;
  	}

  if (svgHeight - margin.top - margin.bottom > 300) {
  	height = svgHeight - margin.top - margin.bottom;
  }	else {
  		height = 300;
  	}

  // Create an SVG wrapper, append an SVG group that will hold our chart, and shift the latter by left and top margins.
  var svg = d3
    .select(".chart")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight)
    // .attr("viewBox", "0 0 860 500")
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // Append an SVG group
  var chart = svg.append("g");

  // Append a div to the bodyj to create tooltips, assign it a class
  d3.select("#scatter")
  	.append("div")
  	.attr("class", "tooltip")
  	.style("opacity", 0);

  // Retrieve data from the CSV file and execute everything below
  d3.csv("data/correlations.csv", function(err, corrData) {
    if (err) throw err;

    corrData.forEach(function(data) {
    	data.stateFull = data.state
    	data.stateAbbr = data.stateAbbr;
      data.divorced = +data.divorced;
      data.incomeAbove50k = +data.incomeAbove50k;
      data.obese = +data.obese;
      data.femaleHouseKids = +data.femaleHouseKids;
      data.employed = +data.employed;
      data.internet = +data.internet;    
    });

    // Create scale functions
    var yLinearScale = d3.scaleLinear().range([height, 0]);

    var xLinearScale = d3.scaleLinear().range([0, width]);

    // Create axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // These variables store the minimum and maximum values in a column in data.csv
    var xMin;
    var xMax;
    var yMax;

    function findMinAndMaxX(dataColumnX) {
      xMin = d3.min(corrData, function(data) {
        return +data[dataColumnX] * 0.8;
      });

      xMax = d3.max(corrData, function(data) {
        return +data[dataColumnX] * 1.1;
      });
    }

    function findMinAndMaxY(dataColumnY) {
     yMin = d3.min(corrData, function(data) {
        return +data[dataColumnY] * 0.8;
      });
      yMax = d3.max(corrData, function(data) {
        return +data[dataColumnY] * 1.1;
      });
    }

    var currentAxisLabelX = "internet";
    findMinAndMaxX(currentAxisLabelX);

    var currentAxisLabelY = "employed";
    findMinAndMaxY(currentAxisLabelY);

    // Set the domain of an axis to extend from the min to the max value of the data column
    xLinearScale.domain([xMin, xMax]);
    yLinearScale.domain([yMin, yMax]);

    // Initialize tooltip
    var toolTip = d3
      .tip()
      .attr("class", "tooltip")
      // Define position
      // .offset([80, -60])
      // The html() method allows us to mix JavaScript with HTML in the callback function
      .html(function(data) {
        var stateFull = data.state;
        var statInfoX = +data[currentAxisLabelX];
        var statInfoY = +data[currentAxisLabelY];
        var statString;
        // Tooltip text depends on which axis is active/has been clicked
        if (currentAxisLabelX === "internet") {
          xString = "Internet: ";
        }
        else if (currentAxisLabelX === "incomeAbove50k") {
        	xString = "Percent with Income > 50k: "
        }
        else {
          xString = "Percent Female Head of Household: ";
        }

  	  if (currentAxisLabelY === "employed") {
          yString = "Percent employed: ";
        }
        else if (currentAxisLabelY === "obese") {
        	yString = "Percent obese: "
        }
        else {
          yString = "Percent divorced: ";
        }

        return stateFull +
          "<br> X - " +
          xString +
          statInfoX + '%' +
          "<br> Y - " +
          yString +
          statInfoY + '%';
      });

    // Create tooltip
    chart.call(toolTip);

    chart
      .selectAll("circle")
      .data(corrData)
      .enter()
      .append("circle")
      .attr("cx", function(data, index) {
        return xLinearScale(+data[currentAxisLabelX]);
      })
      .attr("cy", function(data, index) {
        return yLinearScale(+data[currentAxisLabelY]);
      })
      .attr("r", "15")
      .attr("fill", "#05386B")

      // display tooltip on click
      .on("click", function(data) {
        toolTip.show(data);
      })
      .on("mouseover", function(data) {
        d3.select(this).style("fill", "#EDF5E1")
      })
      .on("mouseout", function(data) {
        d3.select(this).style("fill", "#05386B");
        toolTip.hide(data);
      });

      //Anchor stateAbbr to middle of circles
      chart.selectAll(null)
          .data(corrData)
          .enter()
          .append("text")
          .attr("x", function(data, index) {
            return xLinearScale(+data[currentAxisLabelX]);
          })
          .attr("y", function(data, index) {
            return yLinearScale(+data[currentAxisLabelY]) +4;
          })
          .attr("text-anchor", "middle")
          .text(function(data){
              return data.stateAbbr;
          })
          .attr("class", "circleLabel")
          .attr("font-size", "12px")
          .attr("fill", "#EDF5E1");


    // Append an SVG group for the x-axis, then display the x-axis
    chart
      .append("g")
      .attr("transform", "translate(0," + height + ")")
      // The class name assigned here will be used for transition effects
      .attr("class", "x-axis")
      .call(bottomAxis);

    // Append a group for y-axis, then display it
    chart
    	.append("g")
    	.attr("class", "y-axis")
    	.call(leftAxis);

    // Append y-axis label variations

    chart
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left + 15)
      .attr("x", 0 - height / 2)
      .attr("dy", "1em")
      .attr("class", "axis-text active yLabel")
      .attr("data-axis-name", "divorced")
      .text("Divorced (%)");
    chart
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left + 35)
      .attr("x", 0 - height / 2)
      .attr("dy", "1em")
      .attr("class", "axis-text inactive yLabel")
      .attr("data-axis-name", "obese")
      .text("Obese (%)");
    chart
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left + 55)
      .attr("x", 0 - height / 2)
      .attr("dy", "1em")
      .attr("class", "axis-text inactive yLabel")
      .attr("data-axis-name", "employed")
      .text("Employed (%)");

    // Append x-axis labels
    chart
      .append("text")
      .attr(
        "transform",
        "translate(" + width / 2 + " ," + (height + margin.top + 20) + ")"
      )
      // This axis label is active by default
      .attr("class", "axis-text active xLabel")
      .attr("data-axis-name", "internet")
      .text("Have Internet (%)");

    chart
      .append("text")
      .attr(
        "transform",
        "translate(" + width / 2 + " ," + (height + margin.top + 45) + ")"
      )
      // This axis label is inactive by default
      .attr("class", "axis-text inactive xLabel")
      .attr("data-axis-name", "incomeAbove50k")
      .text("Income above $50k (%)");

    chart
      .append("text")
      .attr(
        "transform",
        "translate(" + width / 2 + " ," + (height + margin.top + 70) + ")"
      )
      // This axis label is inactive by default
      .attr("class", "axis-text inactive xLabel")
      .attr("data-axis-name", "femaleHouseKids")
      .text("Female Head of Household with Kids (%)");
    // Change an axis's status from inactive to active when clicked (if it was inactive)

  ////////////////////////////

  // Change the status of all active axes to inactive otherwise
  function xlabelChange(clickedXAxis) {
    d3.selectAll(".xLabel")
      .filter(".active")
      // An alternative to .attr("class", <className>) method. Used to toggle classes.
      .classed("active", false)
      .classed("inactive", true);

    clickedXAxis
    	.classed("inactive", false)
    	.classed("active", true);
  }

  d3.selectAll(".xLabel").on("click", function() {
    // Assign a variable to current axis
    var clickedSelection = d3.select(this);
    // "true" or "false" based on whether the axis is currently selected
    var isClickedSelectionInactive = clickedSelection.classed("inactive");
    // console.log("this axis is inactive", isClickedSelectionInactive)
    // Grab the data-attribute of the axis and assign it to a variable
    // e.g. if data-axis-name is "poverty," var clickedXAxis = "poverty"
    var clickedXAxis = clickedSelection.attr("data-axis-name");
    console.log("current axis: ", clickedXAxis);

    // The onclick events below take place only if the x-axis is inactive
    // Clicking on an already active axis will therefore do nothing
    if (isClickedSelectionInactive) {
      // Assign the clicked axis to the variable currentAxisLabelX
      currentAxisLabelX = clickedXAxis;
      // Call findMinAndMax() to define the min and max domain values.
      findMinAndMaxX(currentAxisLabelX);
      // Set the domain for the x-axis
      xLinearScale.domain([xMin, xMax]);
      // Create a transition effect for the x-axis
      svg.select(".x-axis")
      	.transition()
        // .ease(d3.easeElastic)
        .duration(1800)
        .call(bottomAxis);
      // Select all circles to create a transition effect, then relocate its horizontal location
      // based on the new axis that was selected/clicked
      d3.selectAll("circle").each(function() {
        d3.select(this)
          .transition()
          // .ease(d3.easeBounce)
          .attr("cx", function(data) {
            return xLinearScale(+data[currentAxisLabelX]);
          })
          .duration(1800);
      });
      d3.selectAll(".circleLabel").each(function() {
        d3.select(this)
          .transition()
          .attr("x", function(data) {
            return xLinearScale(+data[currentAxisLabelX]);
          })
          .duration(1000);
      });
      // Change the status of the axes. See above for more info on this function.
      xlabelChange(clickedSelection);
    }
   }); 

  /////////////////////////

  // Change the status of all active axes to inactive otherwise
  function ylabelChange(clickedYAxis) {
    d3.selectAll(".yLabel")
      .filter(".active")
      // An alternative to .attr("class", <className>) method. Used to toggle classes.
      .classed("active", false)
      .classed("inactive", true);

    clickedYAxis
    	.classed("inactive", false)
    	.classed("active", true);
  }
    d3.selectAll(".yLabel").on("click", function() {
      // Assign a variable to current axis
      var clickedSelection = d3.select(this);
      // "true" or "false" based on whether the axis is currently selected
      var isClickedSelectionInactive = clickedSelection.classed("inactive");
      // console.log("this axis is inactive", isClickedSelectionInactive)
      // Grab the data-attribute of the axis and assign it to a variable
      // e.g. if data-axis-name is "poverty," var clickedYAxis = "poverty"
      var clickedYAxis = clickedSelection.attr("data-axis-name");
      console.log("current axis: ", clickedYAxis);
      if (isClickedSelectionInactive) {
        // Assign the clicked axis to the variable currentAxisLabelY
        currentAxisLabelY = clickedYAxis;
        // Call findMinAndMax() to define the min and max domain values.
        findMinAndMaxY(currentAxisLabelY);
        // Set the domain for the x-axis
        yLinearScale.domain([yMin, yMax]);
        // Create a transition effect for the x-axis
        svg.select(".y-axis")
        	.transition()
          // .ease(d3.easeElastic)
          .duration(1800)
          .call(leftAxis);
        // Select all circles to create a transition effect, then relocate its horizontal location
        // based on the new axis that was selected/clicked
        d3.selectAll("circle").each(function() {
          d3.select(this)
            .transition()
            // .ease(d3.easeBounce)
            .attr("cy", function(data) {
              return yLinearScale(+data[currentAxisLabelY]);
            })
            .duration(1800);
        });
        d3.selectAll(".circleLabel").each(function() {
          d3.select(this)
          .transition()
          .attr("y", function(data) {
            return yLinearScale(+data[currentAxisLabelY]) + 3.5;
          })
          .duration(1000);
      });

        // Change the status of the axes. See above for more info on this function.
        ylabelChange(clickedSelection);
      }
    });

  });
}