var svg = d3.select("svg"),
projection = d3.geoAlbersUsa(),
path = d3.geoPath(projection);

d3.json("https://cdn.jsdelivr.net/npm/us-atlas@3/counties-10m.json").then(function(us){
    var states = topojson.feature(us, us.objects.states),
    borders = topojson.mesh(us, us.objects.states, (a,b) => a != b);

    states.features.filter(d => ![60,66,69,72,78].includes(Number(d.id))).forEach(function(state){
        svg.datum(state)
            .append("g")
            .attr("id", state.id)
            .on("click", function(d){
                var p = projection.invert(path.centroid(d));
                projection.rotate([-p[0], -p[1]]);

                svg.transition().duration(750)
                    .selectAll("path:not(#borders)")
                    .attr("d", path);

                var [[x0,y0],[x1,y1]] = path.bounds(d);
                svg.transition().duration(750)
                    .attr("viewBox", `${x0-5} ${y0-5} ${x1-x0+10} ${y1-y0+10}`)
                    .select("#borders")
                    .attr("d", path(borders));
            })
            .selectAll("path")
            .data(topojson.feature(us, us.objects.counties).features.filter(d => d.id.slice(0,2) == state.id))
            .enter().append("path")
            .attr("id", d => d.id)
            .attr("d", path);
    });

    svg.append("path")
        .attr("id", "borders")
        .attr("d", path(borders));

    var box = svg.node().getBBox();
    svg.attr("viewBox", `${box.x} ${box.y} ${box.width} ${box.height}`);

    projection = d3.geoMercator().scale([1000]);
    path.projection(projection);
});