'use strict';

angular.module('worldsviewApp')
  .factory('TimeSeriesView', function TimeSeriesView($rootScope) {

return {

  clear: function(){
    d3.select('#timeseriesview').selectAll("*").remove();
  },

  render: function(data){

        var margin = {top: 20, right: 20, bottom: 30, left: 50},
            width = 800 - margin.left - margin.right,
            height = 200 - margin.top - margin.bottom;

        // var x = d3.time.scale()
        //     .range([0, width]);

        var domainX = d3.extent(data, function(d) { 
                  return d.index; 
            });

        var x = d3.scale.linear()          
            .domain(d3.extent(data, function(d) { 
                  return d.index; 
            }))
            .range([0, width]);

  
        var y = d3.scale.linear()
            .domain(d3.extent(data, function(d) { 
              return d.value; 
            }))
            .range([height, 0]);

        var xAxis = d3.svg.axis()
            .scale(x)
            .orient("bottom");

        var yAxis = d3.svg.axis()
            .scale(y)
            .orient("left");

        var line = d3.svg.line()
            .x(function(d) { 
              return x(d.index); })
            .y(function(d) { 
              return y(d.value); });

        var svg = d3.select('#timeseriesview')
                .append("g")
                  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

       

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
            .text("Value");

        svg.append("path")
            .datum(data)
            .attr("class", "line")
            .attr("d", line);
    }
  }

});
