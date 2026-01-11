// A routine that allows to replicate the model comparison barplots shown in the paper.
function drawPlotFromCSV(csvText) {
    const data = d3.csvParse(csvText);

        // dimensions
    const margin = {top: 40, right: 150, bottom: 80, left: 60},
            width  = 900 - margin.left - margin.right,
            height = 400 - margin.top - margin.bottom;

    const svg = d3.select("#plot-container")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        // axis
    const x = d3.scaleBand()
            .domain(data.map(d => d.pitch))
            .range([0, width])
            .padding(0.2);

    svg.append("g")
            .attr("transform", `translate(0, ${height})`)
            .call(d3.axisBottom(x))
            .selectAll("text")
            .attr("transform", "rotate(45)")
            .style("text-anchor", "start");

    const y = d3.scaleLinear()
            .domain([0, d3.max(data, d => +d.dist_empirical)])
            .nice()
            .range([height, 0]);

    svg.append("g").call(d3.axisLeft(y));

    svg.selectAll(".domain").attr("stroke", "white");
    svg.selectAll(".tick line").attr("stroke", "white");
    svg.selectAll(".tick text").attr("fill", "white");

            // Label X axis
    svg.append("text")
            .attr("text-anchor", "middle")
            .attr("x", width / 2)
            .attr("y", height + margin.bottom - 5)
            .attr("fill", "white")            // to have the text/legend in white
            .style("font-size", "14px")
            .text("tonal pitch class");

        // Lable Y axis
    svg.append("text")
            .attr("text-anchor", "middle")
            .attr("transform", "rotate(-90)")
            .attr("x", -height / 2)
            .attr("y", -margin.left + 20)
            .attr("fill", "white")
            .style("font-size", "14px")
            .text("proportion");

        // the Barplot
    svg.selectAll("bars")
            .data(data)
            .enter()
            .append("rect")
            .attr("x", d => x(d.pitch))
            .attr("y", d => y(+d.dist_empirical))
            .attr("width", x.bandwidth())
            .attr("height", d => height - y(+d.dist_empirical))
            .attr("fill", "grey");


        // Lines (key is the name of the column in the dataset ; label the label for the legend)
    const models = [
            { key: "dist_binomial_tritones",         label: "TDM (binomial) tritones",     color: "blue" },
            { key: "dist_binomial",       label: "TDM (binomial)",        color: "orange" },
            { key: "dist_gamma",          label: "TDM (gamma)",           color: "brown" },
            { key: "dist_factor_poisson", label: "FactorModel poisson", color: "red" },
            { key: "dist_static",         label: "SimpleStaticModel",     color: "green" },
            
    ];  

        // draw the lines
    models.forEach(model => {

        const line = d3.line()
                .x(d => x(d.pitch) + x.bandwidth() / 2)
                .y(d => y(+d[model.key]));

        svg.append("path")
                .datum(data)
                .attr("fill", "none")
                .attr("stroke", model.color)
                .attr("stroke-width", 2)
                .attr("d", line);

            // Points
        svg.selectAll(`circle-${model.key}`)
                .data(data)
                .enter()
                .append("circle")
                .attr("cx", d => x(d.pitch) + x.bandwidth() / 2)
                .attr("cy", d => y(+d[model.key]))
                .attr("r", 3)
                .attr("fill", model.color);
    });

        // Legend (dots of color with labels)
    svg.selectAll("legend-dots")
            .data(models)
            .enter()
            .append("circle")
            .attr("cx", width * 0.76)
            .attr("cy", (d, i) => 20 + i * 25)
            .attr("r", 6)
            .style("fill", d => d.color);

    svg.selectAll("legend-labels")
            .data(models)
            .enter()
            .append("text")
            .attr("x", width * 0.78 )
            .attr("y", (d, i) => 20 + i * 26)
            .text(d => d.label)
            .style("font-size", "14px")
            .attr("alignment-baseline", "middle")
            .style("fill", "white");
               
}