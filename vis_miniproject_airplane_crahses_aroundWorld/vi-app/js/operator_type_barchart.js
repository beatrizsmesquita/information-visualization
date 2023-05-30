var military = "military";
var private = "private";
var others = "others";



// start of the function that builds the chart
window.onload = function () {
    build_chart(["military", "private", "others"]);
}

// function that builds the chart
function build_chart(selected) {
    /*
        Clean SVG
    */
    d3.selectAll("svg > *").remove();

    //Defining the SVG
    var svg = d3.select("svg"),
        margin = { top: 20, right: 20, bottom: 30, left: 40 },
        width = +svg.attr("width") - margin.left - margin.right,
        height = +svg.attr("height") - margin.top - margin.bottom,
        g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");


    //X-axis
    var x0 = d3.scaleBand()
        .rangeRound([0, width])
        .paddingInner(0.1);

    var x1 = d3.scaleBand()
        .padding(0.05);

    //Y-axis
    var y = d3.scaleLinear()
        .rangeRound([height, 0]);


    //Defining colors for the bars 

    if (selected.length == "3") {
        var z = d3.scaleOrdinal()
            .range(["#ffa500", "#87cefa	", "#ff4500"]);
    }
    else if (selected.length == "2") {
        var z = d3.scaleOrdinal()
            .range(["#ffa500", "#87cefa	"]);
    }
    else if (selected.length == "1") {
        var z = d3.scaleOrdinal().range(["#ffa500"])
    }
    else {
        var z = d3.scaleOrdinal().range(["#ffa500"])
    }



    //read CSV file
    var line = 1;
    d3.csv("datasets/operatortype.csv", function (d, i, columns, rows) {

        for (var i = 1; i < columns.length; ++i) {
            if (i == 1) {
                if (selected.includes("military")) {
                    d[columns[i]] = +d[columns[i]];
                }
            }
            else if (i == 2) {
                if (selected.includes("private")) {
                    d[columns[i]] = +d[columns[i]];
                }
            }
            else if (i == 3) {
                if (selected.includes("others")) {
                    d[columns[i]] = +d[columns[i]];
                }
            }
        }
        line += 1;
        return d;
    }).then(function (data) {

        // create an array with the keys of the data (i.e. the types of operators)
        var keys = data.columns.slice(1);
        // use only the keys that are passed (i.e. the types of operators desired), the data of the removed keys will not be displayed
        for (x in keys) {
            if (selected.includes("military") == false) {
                if (keys[x] == "Military") {
                    keys.splice(x, 1);
                }
            }
            if (selected.includes("private") == false) {
                if (keys[x] == "Private") {
                    keys.splice(x, 1);
                }
            }
            if (selected.includes("others") == false) {
                if (keys[x] == "Others") {
                    keys.splice(x, 1);
                }
            }
        }


        // Defining the domain for the X and Y axis
        x0.domain(data.map(function (d) { return d.OperatorType; }));
        x1.domain(keys).rangeRound([0, x0.bandwidth()]);
        y.domain([0, d3.max(data, function (d) { return d3.max(keys, function (key) { return d[key]; }); })]).nice();

        // Defining the bars
        g.append("g")
            .selectAll("g")
            .data(data)
            .enter().append("g")
            .attr("class", "bar")
            .attr("transform", function (d) { return "translate(" + x0(d.OperatorType) + ",0)"; })
            .selectAll("rect")
            .data(function (d) { return keys.map(function (key) { return { key: key, value: d[key] }; }); })
            .enter().append("rect")
            .attr("x", function (d) { return x1(d.key); })
            .attr("y", function (d) { return y(d.value); })
            .attr("width", x1.bandwidth())
            .attr("height", function (d) { return height - y(d.value); })
            .attr("fill", function (d) { return z(d.key); });

        // Defining the X and Y axis
        g.append("g")
            .attr("class", "axis")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x0))
            .append("text")
            .attr("x", 950)
            .attr("y", y(y.ticks().pop()) + 15)
            .attr("dy", "0.32em")
            .attr("fill", "#000")
            .attr("font-weight", "bold")
            .attr("text-anchor", "start")
            .text("Type of Flight")
            .style('fill', 'white');
        ;

        
        g.append("g")
            .attr("class", "y axis")
            .call(d3.axisLeft(y).ticks(null, "s"))
            .append("text")
            .attr("x", 2)
            .attr("y", y(y.ticks().pop()) + 0)
            .attr("dy", "0.32em")
            .attr("fill", "#000")
            .attr("font-weight", "bold")
            .attr("text-anchor", "start")
            .text("% of Crashes")
            .style('fill', 'white');
        ;

        // Defining the legend
        var subtitle = g.append("g")
            .attr("font-family", "sans-serif")
            .attr("font-size", 10)
            .attr("text-anchor", "end")
            .selectAll("g")
            .data(keys.slice().reverse())
            .enter().append("g")
            .attr("transform", function (d, i) { return "translate(0," + i * 20 + ")"; })
            .style('fill', 'white');

        // Defining the legend rectangles
        subtitle.append("rect")
            .attr("x", width - 17)
            .attr("width", 15)
            .attr("height", 15)
            .attr("fill", z)
            .attr("stroke", z)
            .attr("stroke-width", 2)
            .on("click", function (d) { update(d) });

        // Defining the legend text
        subtitle.append("text")
            .attr("x", width - 24)
            .attr("y", 9.5)
            .attr("dy", "0.32em")
            .text(function (d) { return d; });

        // Defining the function that will be called when a legend rectangle is clicked
        var filtered = [];
        function update(d) {
            // if the key is not in the filtered array, add it
            if (filtered.indexOf(d) == -1) {
                filtered.push(d);
                if (filtered.length == keys.length) filtered = [];
            }
            // if the key is in the filtered array, remove it
            else {
                filtered.splice(filtered.indexOf(d), 1);
            }
            var newKeys = [];
            keys.forEach(function (d) {
                if (filtered.indexOf(d) == -1) {
                    newKeys.push(d);
                }
            })
            // update the domain of the axis
            x1.domain(newKeys).rangeRound([0, x0.bandwidth()]);
            y.domain([0, d3.max(data, function (d) { return d3.max(keys, function (key) { if (filtered.indexOf(key) == -1) return d[key]; }); })]).nice();

            // update the axis
            svg.select(".y")
                .transition()
                .call(d3.axisLeft(y).ticks(null, "s"))
                .duration(500);

            // update the bars
            var bars = svg.selectAll(".bar").selectAll("rect")
                .data(function (d) { return keys.map(function (key) { return { key: key, value: d[key] }; }); })


            bars.filter(function (d) {
                return filtered.indexOf(d.key) > -1;
            })
                .transition()
                .attr("x", function (d) {
                    return (+d3.select(this).attr("x")) + (+d3.select(this).attr("width")) / 2;
                })
                .attr("height", 0)
                .attr("width", 0)
                .attr("y", function (d) { return height; })
                .duration(500);

            bars.filter(function (d) {
                return filtered.indexOf(d.key) == -1;
            })
                .transition()
                .attr("x", function (d) { return x1(d.key); })
                .attr("y", function (d) { return y(d.value); })
                .attr("height", function (d) { return height - y(d.value); })
                .attr("width", x1.bandwidth())
                .attr("fill", function (d) { return z(d.key); })
                .duration(500);
            subtitle.selectAll("rect")
                .transition()
                .attr("fill", function (d) {
                    if (filtered.length) {
                        if (filtered.indexOf(d) == -1) {
                            return z(d);
                        }
                        else {
                            return "white";
                        }
                    }
                    else {
                        return z(d);
                    }
                })
                .duration(100);
        }

    });

}



// call the function to build the chart with the default selection
var selected = ["military", "private", "others"];
d3.selectAll("input").on("change", function (d) {
    if (d3.select(this).property("checked")) {
        selected.push(this.value);
    }
    else {
        for (var i = 0; i < selected.length; i++) {
            if (selected[i] === this.value) {
                selected.splice(i, 1);
            }
        }
    }
    build_chart(selected);
});




