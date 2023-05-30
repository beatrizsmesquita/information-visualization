// Selects title to display when dropdown value is changed
function selectInformation() {
    // crashes
    if (document.getElementById("datatype").value === "crashes") {
        document.getElementById("title").innerHTML = `Plane Crashes over the World`
        update("crashes", true)
    }
    //fatalities
    if (document.getElementById("datatype").value === "deaths") {
        document.getElementById("title").innerHTML = `Plane Fatalities over the World`
        update("deaths", true)

    }
}
// Legend ranges
var range_crashes = [0, 5, 10, 15, 20, 30, 50, 75, 100];
var range_fatalities = [0, 20, 50, 100, 200, 300, 400, 500, 700];
// call the function to update info displayed
update(document.getElementById("datatype").value, false)

// function which updates the state information above the map
function displayInfo(name, number) {
    if (number == -1)
        document.getElementById("info").innerHTML = name + `: no information found`
    else
        document.getElementById("info").innerHTML = name + `: ` + number

}

// function to update the information on the page
// type: crashes or fatalities
// flag: true if legend needs to be updated
function update(type, flag) {
    // The svg
    var svg = d3.select("svg"),
        width = 4200,
        height = 1300;

    // Map and projection
    var path = d3.geoPath();
    var projection = d3.geoMercator()
        .scale(600)
        .center([0, 20])
        .translate([width / 2, height / 2]);

    // Load external data and boot
    // if crashes are selected
    if (type === "crashes") {
        // Data and color scale
        var data = d3.map();
        var colorScale = d3.scaleThreshold()
            .domain([0, 5, 10, 15, 20, 30, 50, 75, 100])
            .range(d3.schemeReds[9]);

        // Load local json data and dataset created from csv
        d3.queue()
            .defer(d3.json, "./datasets/map/us-states.json")
            .defer(d3.csv, "./datasets/map/usa_crashes.csv", function (d) { data.set(d.code, +d.crashes); })
            .await(ready);
    }
    // if type is fatalities
    if (type === "deaths") {
        // Data and color scale
        var data = d3.map();
        var colorScale = d3.scaleThreshold()
            .domain([0, 20, 50, 100, 200, 300, 400, 500, 700])
            .range(d3.schemeReds[9]);

        d3.queue()
            .defer(d3.json, "./datasets/map/us-states.json")
            .defer(d3.csv, "./datasets/map/usa_deaths.csv", function (d) { data.set(d.code, +d.fatalities); })
            .await(ready);
    }
    // function to update the page after the data is loaded
    function ready(_error, topo) {
        // Allows mouse over effect
        let mouseOver = function () {
            d3.selectAll(".State")
                .transition()
                .duration(200)
                .style("opacity", .2)
            d3.select(this)
                .transition()
                .duration(200)
                .style("opacity", 1)
        }

        // Restores opacity when mouse leaves
        let mouseLeave = function () {
            d3.selectAll(".State")
                .transition()
                .duration(200)
                .style("opacity", .8)
            d3.select(this)
                .transition()
                .duration(200)
        }
        // Draw the map
        svg.append("g")
            .selectAll("path")
            .data(topo.features)
            .enter()
            .append("path")
            .attr("id", function (d) { return d.id })
            // draw each state
            .attr("d", d3.geoPath()
                .projection(projection)
            )
            //Shows information about the state where mouse is over
            .attr("onmouseover", function (d) {
                d.total = data.get(d.id)
                return "displayInfo(\"" + (d.properties.name) + "\"," + (d.total) + ")"
            })
            // set the color of each state
            .attr("fill", function (d) {
                d.total = data.get(d.id) || 0;
                return colorScale(d.total);
            }).style("stroke", "transparent")
            .attr("class", function (d) { return "Country" })
            .style("opacity", .8)
            .on("mouseover", mouseOver)
            .on("mouseleave", mouseLeave)
            ;
    }
    if (flag) {
        // update the legend
        update_legend(type);
    }
    else {
        //Define quantile scale to sort data values into buckets of color
        var colors = d3.schemeReds[9];
        // initiates id for each legend element
        var id = -1;
        // Add one dot in the legend for each name.
        var legend = svg.selectAll('g.legendEntry')
            .data(colors)
            .enter()
            .append('g').attr('class', 'legendEntry')
            .attr('height', '200')

        // Add a rect for each color    
        legend
            .append('rect')
            .attr("x", 3)
            .attr("y", function (d, i) {
                return i * 22;
            })
            .attr("width", 10)
            .attr("height", 10)
            .style("stroke", "black")
            .style("stroke-width", 1)
            .style("fill", function (d) { return d; });
        //the data objects are the fill colors

        // Add text to each legend element
        legend
            .append('text')
            .style('fill', 'white')
            .attr("x", 15) //leave 15 pixel space after the <rect>
            .attr("y", function (d, i) {
                return i * 22;
            })
            .attr("dy", "0.7em") //place text one line *below* the x,y point
            .text(function (d) {
                //extent will be a two-element array, format it however you want:
                var format = d3.format("0.0f");
                // increment id
                id++;

                if (type === 'crashes') {
                    if (id == 8)
                        return " > " + format(range_crashes[id]);
                    else
                        return format(range_crashes[id]) + " - " + format(range_crashes[id + 1]);
                }
                if (type === 'deaths') {
                    if (id == 8)
                        return " > " + format(range_fatalities[id]);
                    else
                        return format(range_fatalities[id]) + " - " + format(range_fatalities[id + 1]);
                }
            })
            .attr("id", function (d, i) {
                return "legend_line_" + i.toString();
            })
    }
}

// function to update the legend
function update_legend(type) {
    var html_legend;
    for (var j = 0; j < 9; j++) {
        // the legend is updated according to the type of data
        if (type === 'deaths') {
            // if the value is the last one of the range
            if (j == 8)
                html_legend = " > " + range_fatalities[j].toString();
            // if the value is not the last one of the range
            else
                html_legend = range_fatalities[j].toString() + " - " + range_fatalities[j + 1].toString();
        }
        // if the type is crashes
        if (type === 'crashes') {
            // if the value is the last one of the range
            if (j == 8)
                html_legend = " > " + range_crashes[j].toString();
            // if the value is not the last one of the range
            else
                html_legend = range_crashes[j].toString() + " - " + range_crashes[j + 1].toString();
        }
        // sets id for html element
        id = "legend_line_" + j.toString();
        // replace the text of the html element
        document.getElementById(id).innerHTML = html_legend;
    }

}
