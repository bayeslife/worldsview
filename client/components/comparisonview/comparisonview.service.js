'use strict';

angular.module('worldsviewApp')
  .factory('ComparisonView', function ComparisonView($rootScope) {

return {

  clear: function(){
    d3.select('#comparisonview').selectAll("*").remove();
  },

  render: function(divWidth,divHeight,parameters,strategies,data){

    var dataset = data;

    var margin = {top: 40, right: 20, bottom: 30, left: 40},
    width = divWidth - margin.left - margin.right,
    height = divHeight - margin.top - margin.bottom;

    //var formatPercent = d3.format(".0%");

    var formatXAxis = d3.format(".2r");

    var x = d3.scale.ordinal()        
        .rangeRoundBands([0, width]);

    var y = d3.scale.linear()
        .range([height, 0]);

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom")
        .tickFormat(function(t){
          return formatXAxis(dataset[t].median);
          //return t;
        });

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left")
        .tickFormat(function(t){
          return t;
        });

    var tip = d3.tip()
      .attr('class', 'd3-tip')
      .offset([-10, 0])
      .html(function(d) {
        return "<strong>Parameter:</strong> <span style='color:red'>" + this.attributes['strategy'].value+ "</span>";
      })

    var svg = d3.select('#comparisonview')
                .append("g")
                  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    if(!svg.empty())
      svg.call(tip);

      svg.selectAll('*').remove();

      x.domain(data.map(function(d) { return d.band; }));
      y.domain([0, d3.max(data, function(d) { 
        var maxy = d3.max(d.values); 
        return maxy; 
      })]);

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
          .attr("dy", "0.71em")
          .style("text-anchor", "end")
          .text("Frequency");

      var g = svg.selectAll(".bars")
        .data(data)
        .enter().append("g")


        var i=0;
        for(var i=0;i<strategies.length;i++){
          var strategyName = strategies[i].name;
          g.append("rect")
              .attr("class", "bar"+i)
              .attr("strategy",strategyName)
              .attr("x", function(d) { 
                var xi = x(d.band);
                var dx = x.rangeBand();
                dx = 0.2*dx*(i+1)/2;
                return xi+dx;
              })
              .attr("width", function(d) {
                var dx = x.rangeBand();
                dx= dx- 0.2*dx*(i+1);
                return dx;
              })
              .attr("y", function(d) { 
                var yi = y(d.values[i]);
                return yi;
              })
              .attr("height", function(d) { 
                var yi = y(d.values[i]);
                return height - yi; })
              .on('mouseover', tip.show)
              .on('mouseout', tip.hide);   
        }


  
        

    }
  }


});
