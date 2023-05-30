// set the dimensions and margins of the graph
let margin = { top: 20, right: 20, bottom: 30, left: 50 },
  width = 960 - margin.left - margin.right,
  height = 500 - margin.top - margin.bottom;

// parse the date / time
let parseTime = d3.timeParse("%Y");

// set the ranges
let x = d3.scaleTime().range([0, width]);
let y = d3.scaleLinear().range([height, 0]);

// define the line
let valueline = d3
  .line()
  .x((d) => {
    return x(d.year);
  })
  .y((d) => {
    // if crashes are selected
    if (document.getElementById("datatype").value === "crashes")
      return y(d.crashes);
    // if deaths are selected
    else {
      return y(d.deaths);

    }
  });

// append the svg obgect to the body of the page
// appends a 'group' element to 'svg'
// moves the 'group' element to the top left margin
let svg = d3
  .select("#root")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// Get the data
d3.csv("datasets/timeline.csv").then((data) => {
  // format the data
  draw(data);
});

// draw the chart
const draw = (data) => {
  data.forEach((d) => {
    d.year = parseTime(d.year);
    d.crashes = +d.crashes;
    d.deaths = +d.deaths;
  });

  // Scale the range of the data
  x.domain(
    d3.extent(data, (d) => {
      return d.year;
    })
  );
  y.domain([
    0,
    d3.max(data, (d) => {
      if (document.getElementById("datatype").value === "crashes")
        return d.crashes;
      else {
        return d.deaths;
      }
    }),
  ]);

  // Add the valueline path.
  let line = svg.append("path").data([data]).attr("class", "line").attr("d", valueline);

  // Add the x Axis
  let xAxis = svg
    .append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x));

  // Add the y Axis
  let yAxis = svg.append("g").call(d3.axisLeft(y));

  // Update the chart when slider is moved
  function updateChart(binNumber) {
    x.domain([
      d3.min(data, (d) => {
        return d.year;
      }),
      parseTime(binNumber),
    ]);

    // Update axis and line position
    xAxis.transition().duration(1000).call(d3.axisBottom(x));

    // Create new data with the selection?
    var dataFilter = data.filter((d) => {
      return d.year <= parseTime(binNumber);
    });


    // Give these new data to update line
    line
      .enter()
      .datum(dataFilter)
      .merge(line)
      .transition()
      .duration(1000)
      .attr(
        "d",
        d3
          .line()
          .x((d) => {
            return x(d.year);
          })
          .y((d) => {
            if (document.getElementById("datatype").value === "crashes")
              return y(d.crashes);
            else {
              return y(d.deaths);

            }
          })
      );
  }

  // Update the chart when type is changed
  function updateType(type) {
    y.domain([0, d3.max(data, (d) => (type === "deaths" ? d.deaths : d.crashes))]);
    yAxis.transition().duration(1000).call(d3.axisLeft(y));

    // Give these new data to update line
    line
      .enter()
      .merge(line)
      .transition()
      .duration(1000)
      .attr(
        "d",
        d3
          .line()
          .x((d) => {
            return x(d.year);
          })
          .y((d) => {
            return y(type === "deaths" ? d.deaths : d.crashes);
          })
      );
  }

  // Listen to the slider
  d3.select("#mySlider").on("change", (e) => {
    selectedValue = e.target.value;
    updateChart(selectedValue);
  });

  // Listen to the dropdown
  d3.select("#datatype").on("change", (e) => {
    selectedValue = e.target.value;
    updateType(selectedValue);
  });

};

// Selects title to display when dropdown value is changed as well as y-axis label
function selectInformation() {
  // crashes
  if (document.getElementById("datatype").value === "crashes") {
    document.getElementById("title").innerHTML = `Number of crashes time evolution`
    document.getElementById("y-axis").innerHTML = `Number of crashes`

  }
  //fatalities
  if (document.getElementById("datatype").value === "deaths") {
    document.getElementById("title").innerHTML = `Number of fatalities time evolution`
    document.getElementById("y-axis").innerHTML = `Number of fatalities`

  }
}