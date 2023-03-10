let data_url = "twitter-users-data.json";
const TWITTER_LAUNCH = new Date(2006, 2, 21);

// set the dimensions and margins of the graph
var margin = {top: 50, right: 100, bottom: 50, left: 100},
    width = window.innerWidth * 4 - margin.left - margin.right,
    height = window.innerHeight * 1 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg = d3.select("#chart")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");


d3.json(data_url)
  .then(res => {

    const formatDate = d3.timeFormat("%d %b");
    let max = Date.now() - TWITTER_LAUNCH;
    let min = d3.min(Object.values(res.existing_users), d => Date.parse(d.user_data.created_at)) - TWITTER_LAUNCH
    let median = d3.median(Object.values(res.existing_users), d => Date.parse(d.user_data.created_at)) - TWITTER_LAUNCH
    console.log(min);
    //console.log(Date.parse("2008-07-07T23:12:53.000Z") - TWITTER_LAUNCH);

    // Add X axis
    var x = d3.scaleSqrt()
        .domain([ min, max ])
        .range([ 0, width ]) 

    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x)
                .ticks(30)
                /*
                .tickFormat(x => (new Date(x).getFullYear()) + 
                        (TWITTER_LAUNCH.getFullYear() - new Date(0).getFullYear())));
                        */
                .tickFormat(x => {
                    let date = (new Date(x + TWITTER_LAUNCH.getTime()));
                    return date.toLocaleString('default', { month: 'short' }) + " " 
                    + date.getFullYear()
                }));

    // Add Y axis
    var y = d3.scaleLog()
        .domain([300000, 5000000])
        .range([ height, 0])

    svg.append("g")
        .call(d3.axisLeft(y).ticks(10).tickFormat(y => y.toLocaleString("en-US")));

    
    //let parseDate = d3.time.format.utc("%Y-%m-%dT%H:%M:%S.%LZ").parse;
    function map_range(value, low1, high1, low2, high2) {
        return low2 + (high2 - low2) * Math.max(value - low1, 0) / (high1 - low1);
    }

    // Add dots
    let node = svg.append('g')
        .selectAll("dot")
        .data(Object.values(res.existing_users))
        .enter()
    
    let text = svg.append('g')
        .selectAll("label")
        .data(Object.values(res.existing_users))
        .enter()

    text.append("text")
        .attr("class", "text-handle")
        .attr("id", function (d) { return ("label-" + d.name.toLowerCase()); } )
        .attr("x", function (d) { 
            return x(Date.parse(d.user_data.created_at) - TWITTER_LAUNCH); } )
        .attr("y", function (d) { return y(d.name_popularity); } )
        .text(function (d) { return ("@" + d.name.toLowerCase()); } )
        .on('mouseover', function (d, i) {
          d3.select("#circle-" + d.name.toLowerCase()).transition()
               .style('fill', 'rgba(29, 161, 242, 1.0)');
          d3.select(this).transition()
               .style("opacity", 1);
            d3.select("#bg-" + d.name.toLowerCase()).transition()
                .style("opacity", 1);
        })
        .on('mouseout', function (d, i) {
            d3.select("#circle-" + d.name.toLowerCase()).transition()
                .style("fill", "rgba(29, 161, 242, 0.3)")
            d3.select(this).transition()
                .style("opacity", 0);
            d3.select("#bg-" + d.name.toLowerCase()).transition()
                .style("opacity", 0);
        })
        //.call(getBB);   

        /*
    text.insert("rect","text")
        .attr("class", "text-handle-bg")
        .attr("id", function (d) { return ("bg-" + d.name.toLowerCase()); } )
        .attr("x", function (d) { 
            let circRadius = map_range(Math.log10(d.user_data.follower_count), 3, 10, 10, 250)  
            return (d.bbox.height > circRadius ?
                x(Date.parse(d.user_data.created_at)) + circRadius + 5 :
                x(Date.parse(d.user_data.created_at)) - 0.5 * d.bbox.width)
            ; 
        })
        .attr("y", function (d) { 
            let circRadius = map_range(Math.log10(d.user_data.follower_count), 3, 10, 10, 250)  
            return (d.bbox.height > circRadius ?
                y(d.name_popularity) + circRadius - 8 :
                y(d.name_popularity) - 0.5 * d.bbox.height - 8)
            ; 
        })
        .attr("width", function(d){return d.bbox.width + 5})
        .attr("height", function(d){return d.bbox.height + 5})
        */

    function getBB(selection) {
        selection.each(function(d){d.bbox = this.getBBox();})
    }
    

    node.append("circle")
        .attr("class", "node")
        .attr("id", function (d) { return ("circle-" + d.name.toLowerCase()); } )
        .attr("cx", function (d) { 
            return x(Date.parse(d.user_data.created_at) - TWITTER_LAUNCH);
        })
        .attr("cy", function (d) { return y(d.name_popularity); } )
        .attr("r", function(d) { return map_range(Math.log10(d.user_data.follower_count), 3, 10, 10, 250) })
        .attr("alt", function (d) { return (d.user_data.display_name); } )
        .style("z-index", -1)
        .on('mouseover', function (d, i) {
          d3.select(this).transition()
               .style('fill', 'rgba(29, 161, 242, 1.0)');
          d3.select("#label-" + d.name.toLowerCase()).transition()
               .style("opacity", 1);
            d3.select("#bg-" + d.name.toLowerCase()).transition()
                .style("opacity", 1);
        })
        .on('mouseout', function (d, i) {
            d3.select(this).transition()
                .duration('100')
                .style("fill", "rgba(29, 161, 242, 0.3)")
            d3.select("#label-" + d.name.toLowerCase()).transition()
                .duration('100')
                .style("opacity", 0);
            d3.select("#bg-" + d.name.toLowerCase()).transition()
                .style("opacity", 0);
        });

    

  })
  .catch(() => {

  })

//Read the data
d3.csv("https://raw.githubusercontent.com/holtzy/data_to_viz/master/Example_dataset/2_TwoNum.csv", function(data) {


  // Add dots
  svg.append('g')
    .selectAll("dot")
    .data(data)
    .enter()
    .append("circle")
      .attr("cx", function (d) { return x(d.GrLivArea); } )
      .attr("cy", function (d) { return y(d.SalePrice); } )
      .attr("r", 1.5)
      .style("fill", "#69b3a2")

})