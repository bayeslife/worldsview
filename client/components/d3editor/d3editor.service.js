'use strict';

angular.module('worldsviewApp')
  .factory('D3Editor', function D3Editor($rootScope) {

    var focusedEditor=null;

     d3.select(window)                    
          .on('keydown', function() {focusedEditor.keydown();})
          .on('keyup', function(){focusedEditor.keyup();});
    
    // Public API here
    return {

      newView: function(editorId,absoluteUrl,nds,lnks,callbacks) {

        return {
          editorId: editorId,
          width: 800,
          height: 400,
          absUrl: absoluteUrl,
          svg: null,
          path: null,
          circle: null,
          colors: null,          
          nodes: nds,
          links: lnks,
          force: null,
          selected_node: null,
          callbacks: callbacks,
          selected_link: null,
          mousedown_node: null,
          mousedown_link: null,
          mouseup_node: null,          
          drag_line: null,
          attr: null,
          tip: null,
          lastKeyDown: -1, // only respond once per keydown
          
          clear: function(){
              this.svg = d3.select(editorId).selectAll("*").remove();
          },

          refresh: function(){
            this.restart();
          },

          render: function() {     
              var editor = this;

              // this.nds = this.network.getNodes();
              // this.lks = this.network.getLinks();
          
              this.colors = d3.scale.category10();
              
              this.svg = d3.select(this.editorId);
              // init D3 force layout
              this.force = d3.layout.force()
              .nodes(this.nodes)
              .links(this.links)
              .size([this.width, this.height])          
              .linkStrength(0.5)
              .charge(-200)                
              .on('tick', function(e){
                editor.tick(e);
              });

              this.force.linkDistance(this.linkDistance);

              this.force.gravity(0.1);

              var drag = this.force.drag().on("dragstart", function(d) { 
                editor.dragstart(this,d);
              });
        
              // line displayed when dragging new nodes
              this.drag_line = this.svg.append('svg:path')
                .attr('class', 'link dragline hidden')
                .attr('d', 'M0,0L0,0');

              // handles to link and node element groups
              this.path = this.svg.append('svg:g').selectAll('path'),
              this.circle = this.svg.append('svg:g').selectAll('g');

              // mouse event vars

              // app starts here
              this.svg
                .on('mouseover', function() {focusedEditor=editor;})
                .on('mousedown', function(s) { editor.mousedown(this);})
                .on('mousemove', function() {editor.mousemove(this);})
                .on('mouseup', function() {editor.mouseup(this);});

              
              this.tip = d3.tip()
                .attr('class', 'd3-tip')
                .offset([-10, 0])
                .html(function(d) {
                  //return $scope.renderPopup(d);
                  var res ='<div><table class="table-condensed">';
                  if(d.exception!=null){
                    res = res + '<tr><th>Exception:</th><td>'+d.exception+'</td></tr>';
                  }
                  if(d.script!=null && d.script.length>0){
                    res = res + '<tr><th>Expression:</th><td>'+d.script+'</td></tr>';
                  }
                  if(d.expression!=null && d.expression.length>0){
                      if(d.sourceId==null)
                          res = res + '<tr><th>Distribution:</th><td>'+d.expression+'</td><td>'+d.value+'</td></tr>';
                      else
                          res = res + '<tr><th>Condition:</th><td>'+d.expression+'</td><td>'+d.value+'</td></tr>';
                  }
                  if(d.series!=null && d.series.length>0){
                     res = res + '<tr><th>Series:</th><td>'+d.series+'</td></tr>';
                  }
                  res = res + '</table></div';
                  return res;
                })

              if(!this.svg.empty())
                this.svg.call(this.tip);

              this.restart();
          },

          restart: function() {
            var editor = this;

            var links = this.links;
            var nodes = this.nodes;
            // path (link) group
            this.path = this.path.data(links);

            // update existing links
            this.path
              .classed('selected', function(d) { return d === editor.selected_link; })
              .classed('interpreted', function(d) { 
                return d.value; 
              })  
              .classed('exception', function(d) { 
                return d.exception; 
              })  
              .style('marker-start', function(d) { 
                return d.left ? 'url('+editor.absUrl+'#start-arrow)' : ''; 
              })    
              .style('marker-end', function(d) { 
                return d.right ? 'url('+editor.absUrl+'#end-arrow)' : ''; 
              });
              

            // add new links
            this.path.enter().append('svg:path')
              .attr('class', 'link')
              .classed('selected', function(d) { return d === this.selected_link; })    
              .classed('interpreted', function(d) { 
                return d.value; 
              })
              .classed('exception', function(d) { 
                return d.exception; 
              })   
              .style('marker-start', function(d) { 
                return d.left ? 'url('+editor.absUrl+'#start-arrow)' : ''; })    
              .style('marker-end', function(d) { 
                return d.right ? 'url('+editor.absUrl+'#end-arrow)' : ''; })

              .on('mouseover', this.tip.show)
              .on('mouseout', this.tip.hide)

              .on('mousedown', function(d) {
                if(d3.event.ctrlKey) return;

                // select links
                editor.mousedown_link = d;
                if(editor.mousedown_link === editor.selected_link) {
                   editor.callbacks.deselectLink(editor.selected_link);
                   editor.selected_link = null;
                } else {
                  editor.selected_link = editor.mousedown_link;
                  editor.callbacks.selectLink(editor.selected_link);
                }
                if(editor.selected_node){
                  editor.callbacks.deselectNode(editor.selected_node);            
                }
                editor.selected_node = null;
                editor.restart();
              });

            // remove old links
            this.path.exit().remove();


            // circle (node) group
            // NB: the function arg is crucial here! nodes are known by id, not by index!
            this.circle = this.circle.data(this.nodes, function(d) { return d._id; });

            // update existing nodes (reflexive & selected visual states)
            this.circle.selectAll('circle')
              //.style('fill', function(d) { return (d === selected_node) ? d3.rgb(colors(d.color)).brighter().toString() : colors(d.color); })            
              .style('fill', function(d) {
                return d.exception!=null? 'red': 'white'
              })
              .attr('r',function(d) {return editor.node_radius(editor);})
              .classed('exception', function(d) { return d.exception; })
              .classed('reflexive', function(d) { return d.reflexive; })
              .classed('interpreterSource', function(d) { return d.hasOwnProperty('interpreterSource'); })
              .classed('unsaved', function(d) { return d.hasOwnProperty('unsaved'); });


            this.circle.selectAll('text').text(function(d) { return editor.callbacks.getNodeDisplayValue(d); });

            // add new nodes
            var g = this.circle.enter().append('svg:g');

            g.append('svg:circle')
              .attr('class', 'node')          
              .attr('r',function(d) {return editor.node_radius(editor);})
              //.style('fill', function(d) { return (d === selected_node) ? d3.rgb(colors(d.color)).brighter().toString() : colors(d.color); })
              .style('fill', function(d) {
                return d.exception!=null ? 'red' : 'white';
              })
              //.style('stroke', function(d) { return d3.rgb(colors(d.color)).darker().toString(); })
              .classed('reflexive', function(d) { return d.reflexive; })
              
              .on('mouseover', this.tip.show)
              .on('mouseout', this.tip.hide)

              // .on('mouseover', function(d) {
              //   if(!mousedown_node || d === mousedown_node) return;
              //   // enlarge target node
              //   d3.select(this).attr('transform', 'scale(1.1)');
              // })
              // .on('mouseout', function(d) {
              //   if(!mousedown_node || d === mousedown_node) return;
              //   // unenlarge target node
              //   d3.select(this).attr('transform', '');
              // })
              .on('mousedown', function(d) {
                if(d3.event.ctrlKey) return;

                // select node
                editor.mousedown_node = d;
                if(editor.mousedown_node === editor.selected_node) {
                  editor.callbacks.deselectNode(editor.selected_node);
                  editor.selected_node = null;
                } else {
                  editor.selected_node = editor.mousedown_node;
                  editor.callbacks.selectNode(editor.selected_node);              
                }

                if(editor.selected_link){
                  editor.callbacks.deselectLink(editor.selected_link);  
                }
                editor.selected_link = null;

                // reposition drag line
                editor.drag_line
                  .style('marker-end', 'url(#markerCircle)')        
                  .classed('hidden', false)
                  .attr('d', 'M' + editor.mousedown_node.x + ',' + editor.mousedown_node.y + 'L' + editor.mousedown_node.x + ',' + editor.mousedown_node.y);

                editor.restart();
              })
              .on('mouseup', function(d) {
                if(!editor.mousedown_node) return;

                // needed by FF
                editor.drag_line
                  .classed('hidden', true)
                  .style('marker-end', '');

                // check for drag-to-self
                editor.mouseup_node = d;
                if(editor.mouseup_node === editor.mousedown_node) { editor.resetMouseVars(); return; }

                // unenlarge target node
                d3.select(this).attr('transform', '');

                // add link to graph (update if exists)
                // NB: links are strictly source < target; arrows separately specified by booleans
                var source, target, direction;
                // if(mousedown_node._id < mouseup_node._id) {
                //   source = mousedown_node;
                //   target = mouseup_node;
                //   direction = 'right';
                // } else {
                //   source = mouseup_node;
                //   target = mousedown_node;
                //   direction = 'left';
                // }

                source = editor.mousedown_node;
                target = editor.mouseup_node;
                direction = 'right';

                var link;
                link = editor.links.filter(function(l) {
                  return (l.source === source && l.target === target);
                })[0];

                if(link) {
                  link[direction] = true;
                } else {
                  editor.callbacks.addLink(source,target,function(l){
                    if(l!=null){
                        l[direction] = true;
                        //worldnetwork.getLinks().push(l);
                        restart();
                      }  
                  });
                  //link = {source: source, target: target, left: false, right: false};              
                }

                // select new link
                editor.selected_link = link;            
                editor.selected_node = null;
                editor.restart();
              });

            // show node IDs
            g.append('svg:text')
                .attr('x', 0)
                .attr('y', 4)
                .attr('class', 'id')
                .attr('contentEditable', true)
                .on('keyup', function(d) { 
                  d.text = d3.select(this).text(); 
                })
                .text(function(d) { return editor.callbacks.getNodeDisplayValue(d); });

            // remove old nodes
            this.circle.exit().remove();

         

            // set the graph in motion
            this.force.start();

            //layoutNow();
          }, 

          node_radius: function(editor){
            return editor.callbacks.nodeRadius();
            //return node.probability>=0 && node.probability<=1 ? 10+node.probability*10 : 20;
           },

          linkDistance: function(link,index){
            return 100;
            //return 100 + $scope.getCorrelation(link,index)*-40;
          },

           // update force layout (called automatically each iteration)
          tick: function(e) {             

            var k = 6 * e.alpha;
            this.nodes.forEach(function(o, i) {

                // if(o.type=='outcome'){
                //   o.y += k;
                // }
                // else if(o.type=='capabilities'){
                //   o.y += 0.5+k;
                // }
                // else if(o.type=='choice'){
                //   o.y += -0.5*k;
                // } 
                // else if(o.type=='category'){
                //   o.y += -k;
                // } 
            });       

            // draw directed edges with proper padding from node centers
            this.path.attr('d', function(d) {
              var deltaX = d.target.x - d.source.x,
                  deltaY = d.target.y - d.source.y,
                  dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY),
                  normX = deltaX / dist,
                  normY = deltaY / dist,
                  sourcePadding = d.left ? 35 : 30,
                  targetPadding = d.right ? 35 : 30,
                  sourceX = d.source.x + (sourcePadding * normX),
                  sourceY = d.source.y + (sourcePadding * normY),
                  targetX = d.target.x - (targetPadding * normX),
                  targetY = d.target.y - (targetPadding * normY);        
              return 'M' + sourceX + ',' + sourceY + 'L' + targetX + ',' + targetY;
            });

            this.circle.attr('transform', function(d) {
              return 'translate(' + d.x + ',' + d.y + ')';
            });
            this.callbacks.applyChanges();
          },

          resetMouseVars: function() {
            this.mousedown_node = null;
            this.mouseup_node = null;
            this.mousedown_link = null;
          },

          mousedown: function(svg) {
            var editor = this;
            // prevent I-bar on drag
            //d3.event.preventDefault();
            
            // because :active only works in WebKit?
            this.svg.classed('active', true);

            if(d3.event.ctrlKey || this.mousedown_node || this.mousedown_link) return;

            if(d3.event.shiftKey){
              // insert new node at point
              var point = d3.mouse(svg);
 

              this.callbacks.addNode(function(node){
                //node = {_id: ++lastNodeId, name: 'new', color: 4, reflexive: false};
                node.x = point[0];
                node.y = point[1];          
                editor.restart();  
              });
            }
          },

          mousemove: function(svg) {
            if(!this.mousedown_node) return;
            // update drag line
            this.drag_line.attr('d', 'M' + this.mousedown_node.x + ',' + this.mousedown_node.y + 'L' + d3.mouse(svg)[0] + ',' + d3.mouse(svg)[1]);
            this.restart();
          },

          mouseup: function(svg) {
            if(this.mousedown_node) {
              // hide drag line
              this.drag_line
                .classed('hidden', true)
                .style('marker-end', '');
            }
            // because :active only works in WebKit?
            this.svg.classed('active', false);

            // clear mouse event vars
            this.resetMouseVars();
          },

          spliceLinksForNode: function(node) {
            var links = this.links;
            var toSplice = links.filter(function(l) {
              return (l.source === node || l.target === node);
            });
            toSplice.map(function(l) {
              links.splice(links.indexOf(l), 1);
            });
          },

          keydown: function() {
            //d3.event.preventDefault();
            var links = this.links;

            if(this.lastKeyDown !== -1) return;
            this.lastKeyDown = d3.event.keyCode;

            // ctrl
            if(d3.event.keyCode === 17) {
              this.circle.call(this.force.drag);
              this.svg.classed('ctrl', true);
            }

            //console.log(d3.event.shiftKey);
            //console.log(d3.event.keyCode);
            //console.log(d3.event.ctrlKey);
            {
              switch(d3.event.keyCode) {            
                case 46: // ctl-delete              
                  if(d3.event.ctrlKey){
                      if(this.selected_node) {
                        var nodes = this.nodes;
                        nodes.splice(nodes.indexOf(this.selected_node), 1);
                        this.spliceLinksForNode(this.selected_node);
                        this.callbacks.delNode(this.selected_node);
                      } else if(this.selected_link) {
                        links.splice(links.indexOf(this.selected_link), 1);
                        this.callbacks.delLink(this.selected_link);
                      }
                      this.selected_link = null;
                      this.selected_node = null;
                      this.restart();
                    }                
                break;
               
                case 66: // B
                  if(this.selected_link) {
                    // set link direction to both left and right
                    this.selected_link.left = true;
                    this.selected_link.right = true;
                  }
                  this.restart();
                  break;
                case 76: // L
                  if(this.selected_link) {
                    // set link direction to left only
                    this.selected_link.left = true;
                    this.selected_link.right = false;
                  }
                  this.restart();
                  break;
                case 82: // R
                  if(this.selected_node!=null) {
                    // toggle node reflexivity
                    this.selected_node.reflexive = !selected_node.reflexive;
                  } else if(this.selected_link) {
                    // set link direction to right only
                    this.selected_link.left = false;
                    this.selected_link.right = true;
                  }
                  this.restart();
                  break;
                case 190: // >
                  if(this.selected_link) {                                
                    //this.containerscope.increaseCorrelation(selected_link);
                    this.restart();
                  }              
                  break;
                case 188: // <
                  if(this.selected_link) {
                    //this.containerscope.decreaseCorrelation(selected_link);                                
                    this.restart();
                  }              
                  break;
                }
            }
          },

          keyup: function() {
            this.lastKeyDown = -1;

            // ctrl
            if(d3.event.keyCode === 17) {
              this.circle
                .on('mousedown.drag', null)
                .on('touchstart.drag', null);
              this.svg.classed('ctrl', false);
            }
          },

          dragstart: function(svg,d) {
             d3.select(svg).classed("fixed", d.fixed = true);
          }

        };

      }
  }        
});
