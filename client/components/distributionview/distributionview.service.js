'use strict';

angular.module('worldsviewApp')
  .factory('DistributionView', function DistributionView($rootScope) {

return {

  clear: function(){
    d3.select('#distributionview').selectAll("*").remove();
  },

  render: function(data){

    var margin = {top: 40, right: 20, bottom: 30, left: 40},
    width = 800 - margin.left - margin.right,
    height = 200 - margin.top - margin.bottom;

    var formatPercent = d3.format(".0%");

    var formatXAxis = d3.format(".2r");

    // var x = d3.scale.ordinal()
    //     .domain([0,2,4,6,8,10,12,14,16,18,20])
    //     .rangeRoundBands([0, width]);

    var x = d3.scale.ordinal()        
        .rangeRoundBands([0, width]);

    var y = d3.scale.linear()
        .range([height, 0]);

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom")
        .tickFormat(function(t){
          return formatXAxis(data[t].median);
        });

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left")
        .tickFormat(formatPercent);

    var tip = d3.tip()
      .attr('class', 'd3-tip')
      .offset([-10, 0])
      .html(function(d) {
        return "<strong>Frequency:</strong> <span style='color:red'>" + d.frequency + "</span>";
      })

    var svg = d3.select('#distributionview')
                .append("g")
                  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    if(!svg.empty())
      svg.call(tip);

      svg.selectAll('*').remove();

      x.domain(data.map(function(d) { return d.band; }));
      y.domain([0, d3.max(data, function(d) { return d.frequency; })]);

      svg.append("g")
          .attr("class", "x axis")
          .attr("transform", "translate(0," + height + ")")
          .call(xAxis);

      svg.append("g")
          .attr("class", "y axis")
          .call(yAxis)
        .append("text")
          .attr("transform", "rotate(-90)")
          .attr("y", 6)
          .attr("dy", ".71em")
          .style("text-anchor", "end")
          .text("Frequency");

      svg.selectAll(".bar")
          .data(data)
        .enter().append("rect")
          .attr("class", "bar")
          .attr("x", function(d) { return x(d.band); })
          .attr("width", x.rangeBand())
          .attr("y", function(d) { return y(d.frequency); })
          .attr("height", function(d) { return height - y(d.frequency); })
          .on('mouseover', tip.show)
          .on('mouseout', tip.hide);    
    }
  }

  // function type(d) {
  //   d.frequency = +d.frequency;
  //   return d;
  // }

});
