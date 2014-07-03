/*jslint browser: true, vars:true, plusplus:true*/
/*global TH, d3, $, chrome*/
"use strict";
var Views = TH.Views;
var Models = TH.Models;
var Util = TH.Util;


Views.plotGraph = function () {
    // chrome.tabs.create({url: "network.html"});
    // var width = TH.Para.tagGraph.width,
        // height = TH.Para.tagGraph.height,
    // var contiainer = TH.Para.tagGraph.contiainer;
    var contiainer = "network_dialog",
        tg = TH.Util.graph.tagGraph();
    TH.Para.tagGraph.width = $(window).width() * 0.7;
    TH.Para.tagGraph.height = $(window).height() * 0.7;
    $("#" + contiainer).dialog({
        width: TH.Para.tagGraph.width * 1.2,
        height: TH.Para.tagGraph.height * 1.2
    });

    Views.D3Graph.sel_elements = {};
    // debugger;
    Views.D3Graph($.extend({type: "tag"}, TH.Para.tagGraph, tg));
};

// set up SVG for D3
Views.D3Graph = function (para) {

    (function cleanView() {
        $("#network_dialog_nav").html("");
        d3.select('svg').remove();
    }());

    if (para.type === "item") {
        (function moveBack(para) {
            $("#network_dialog_nav").html("<a class='action'>back</a>");
            $("#network_dialog_nav").on("click", function () {
                console.log("dialog_nav is clicked!");
                var newPara = $.extend({}, para, TH.Util.graph.tagGraph());
                newPara.type = "tag";
                Views.D3Graph(newPara);
            });
        }(para));
    }
    var colors = d3.scale.category10();
    var links = para.links;
    var nodes = para.nodes;

    var svg = d3.select('#' + para.contiainer)
            .append('svg')
            .attr('width', para.width)
            .attr('height', para.height);

    // var lastNodeId = para.nodes.length - 1;

    // init D3 force layout
    var force = d3.layout.force()
        .nodes(nodes)
        .links(links)
        .size([para.width, para.height])
        .linkDistance(150)
        .charge(-500)
        .on('tick', tick);

    // define arrow markers for graph links
    svg.append('svg:defs').append('svg:marker')
        .attr('id', 'end-arrow')
        .attr('viewBox', '0 -5 10 10')
        .attr('refX', 6)
        .attr('markerWidth', 3)
        .attr('markerHeight', 3)
        .attr('orient', 'auto')
        .append('svg:path')
        .attr('d', 'M0,-5L10,0L0,5')
        .attr('fill', '#000');

    svg.append('svg:defs').append('svg:marker')
        .attr('id', 'start-arrow')
        .attr('viewBox', '0 -5 10 10')
        .attr('refX', 4)
        .attr('markerWidth', 3)
        .attr('markerHeight', 3)
        .attr('orient', 'auto')
        .append('svg:path')
        .attr('d', 'M10,-5L0,0L10,5')
        .attr('fill', '#000');

    // line displayed when dragging new nodes
    var drag_line = svg.append('svg:path')
        .attr('class', 'link dragline hidden')
        .attr('d', 'M0,0L0,0');

    // handles to link and node element groups
    var path = svg.append('svg:g').selectAll('path'),
        circle = svg.append('svg:g').selectAll('g');

    // mouse event vars
    var selected_node = null,
        selected_link = null,
        mousedown_link = null,
        mousedown_node = null,
        mouseup_node = null;

    var mouseVars = {
        sel_elements: Views.D3Graph.sel_elements,
        toggle: function (obj0) {
            var cache = this.sel_elements;
            var obj = $.extend({}, obj0);
            obj.x = 0;
            obj.y = 0;
            obj.px = 0;
            obj.py = 0;
            console.log("a node is toggled");
            var key = JSON.stringify(obj);
            if (cache[key] === "yes") {
                cache[key] = undefined;
            } else {
                cache[key] = "yes";
            }
        },

        reset: function () {
            this.sel_elements = {};
        },

        list: function () {
            var keys = [],
                key;
            for (key in this.sel_elements) {
                if (this.sel_elements.hasOwnProperty(key)) {
                    keys.push(key);
                }
            }
            return keys;
        }
    };


    function removeNodes(nodes, keys) {
        function idInKey(keys, id) {
            var i = 0, N = keys.length;
            for (i = 0; i < N; ++i) {
                if (keys[i].id === id) {
                    return true;
                }
            }
            return false;
        }

        var i, new_nodes = [];
        var keyObjs = [];
        for (i = 0; i < keys.length; ++i) {
            keyObjs.push(JSON.parse(keys[i]));
        }
        for (i = 0; i < nodes.length; ++i) {
            // debugger;
            if (!idInKey(keyObjs, nodes[i].id)) {
                new_nodes.push(nodes[i]);
            }
        }
        return new_nodes;
    }

    // update force layout (called automatically each iteration)
    function tick() {
      // draw directed edges with proper padding from node centers
        path.attr('d', function (d) {
            var deltaX = d.target.x - d.source.x,
                deltaY = d.target.y - d.source.y,
                dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY),
                normX = deltaX / dist,
                normY = deltaY / dist,
                sourcePadding = d.left ? 17 : 12,
                targetPadding = d.right ? 17 : 12,
                sourceX = d.source.x + (sourcePadding * normX),
                sourceY = d.source.y + (sourcePadding * normY),
                targetX = d.target.x - (targetPadding * normX),
                targetY = d.target.y - (targetPadding * normY);
            return 'M' + sourceX + ',' + sourceY + 'L' + targetX + ',' + targetY;
        });

        circle.attr('transform', function (d) {
            return 'translate(' + d.x + ',' + d.y + ')';
        });
    }

    // update graph (called when needed)
    function restart() {
      // path (link) group
        path = path.data(links);

      // update existing links
        path.classed('selected', function (d) { return d === selected_link; })
            .style('marker-start', function (d) { return d.left ? 'url(#start-arrow)' : ''; })
            .style('marker-end', function (d) { return d.right ? 'url(#end-arrow)' : ''; });


      // add new links
        path.enter().append('svg:path')
            .attr('class', 'link')
            .classed('selected', function (d) { return d === selected_link; })
            .style('marker-start', function (d) { return d.left ? 'url(#start-arrow)' : ''; })
            .style('marker-end', function (d) { return d.right ? 'url(#end-arrow)' : ''; })
            .on('mousedown', function (d) {
                mouseVars.toggle(d); // select link
                restart();
            });

      // remove old links
        path.exit().remove();


        // circle (node) group
        // NB: the function arg is crucial here! nodes are known by id, not by index!
        // debugger;
        // console.log("nodes #: " + nodes.length);
        // circle = circle.data(nodes, function (d) { return d.id; });
        circle = circle.data(nodes);

      // update existing nodes (reflexive & selected visual states)
        circle.selectAll('circle')
            .style('fill', function (d) { return (d === selected_node) ? d3.rgb(colors(d.id)).brighter().toString() : colors(d.id); })
            .classed('reflexive', function (d) { return d.reflexive; });

      // add new nodes
        var g = circle.enter().append('svg:g');

        g.append('svg:circle')
            .attr('class', 'node')
            .attr('r', 12)
            .style('fill', function (d) { return (d === selected_node) ? d3.rgb(colors(d.id)).brighter().toString() : colors(d.id); })
            .style('stroke', function (d) { return d3.rgb(colors(d.id)).darker().toString(); })
            .classed('reflexive', function (d) { return d.reflexive; })
            .on('mouseover', function (d) {
                //TODO change it to show information when mouse over
                // if (!mousedown_node || d === mousedown_node) {
                //     return;
                // }
                // enlarge target node
                d3.select(this).attr('transform', 'scale(3)');
            })
            .on('mouseout', function (d) {
                // if (!mousedown_node || d === mousedown_node) {
                //     return;
                // }
                // unenlarge target node
                d3.select(this).attr('transform', '');
            })
            .on('mousedown', function (d) {

                if (d3.event.ctrlKey) {
                    // select node
                    mousedown_node = d;
                    if (mousedown_node === selected_node) {
                        selected_node = null;
                    } else {
                        selected_node = mousedown_node;
                    }
                    mouseVars.toggle(d);
                    console.log("node selected");
                    // debugger;
                    selected_link = null;
                // reposition drag line
                    drag_line
                        .style('marker-end', 'url(#end-arrow)')
                        .classed('hidden', false)
                        .attr('d', 'M' + mousedown_node.x + ',' + mousedown_node.y + 'L' + mousedown_node.x + ',' + mousedown_node.y);
                    restart();
                    console.log("run here");
                    return;
                }

                if (para.type === "tag") {
                    var ig = Util.graph.itemGraph(d.id);
                    var new_para = $.extend({}, para, ig);
                    new_para.type = "item";
                    Views.D3Graph(new_para);
                } else if (para.type === "item") {
                    chrome.tabs.create({ url: "https://github.com/hbhzwj"});
                }



                restart();
            });

          // show node IDs
        g.append('svg:text')
            .attr('x', 0)
            .attr('y', 4)
            .attr('class', 'id')
            .text(function (d) { 
                if (d.type === 'item') {
                    return d.item.title; 
                } else {
                    return d.id;
                }
            });

        // remove old nodes
        circle.exit().remove();

          // set the graph in motion
        force.start();
    }

    function spliceLinksForNode(node) {
        var toSplice = links.filter(function (l) {
            return (l.source === node || l.target === node);
        });
        toSplice.map(function (l) {
            links.splice(links.indexOf(l), 1);
        });
    }

    // only respond once per keydown
    var lastKeyDown = -1;

    function keydown() {
        d3.event.preventDefault();

        if (lastKeyDown !== -1) {return; }
        lastKeyDown = d3.event.keyCode;

        if (d3.event.keyCode === 17) { // ctrl
            circle.call(force.drag);
            svg.classed('ctrl', true);
        }

        if (!selected_node && !selected_link) {return; }
        switch (d3.event.keyCode) {
        case 8: // backspace
        case 46: // delete
            console.log("before delete: node number " + nodes.length);
            nodes = removeNodes(nodes, mouseVars.list());
            console.log("after delete: node number " + nodes.length);
            // debugger;
            // var keys = mouseVars.list(),
            //     i = 0;
            // for (i = 0; i < keys; ++i) {
            // }
            
            // remove all nodes
            // remove all links
            // if (selected_node) {
            //     nodes.splice(nodes.indexOf(selected_node), 1);
            //     spliceLinksForNode(selected_node);
            // } else if (selected_link) {
            //     links.splice(links.indexOf(selected_link), 1);
            // }
            // selected_link = null;
            // selected_node = null;
            restart();
            break;
        case 66: // B
            if (selected_link) {
                // set link direction to both left and right
                selected_link.left = true;
                selected_link.right = true;
            }
            restart();
            break;
        case 76: // L
            if (selected_link) {
                // set link direction to left only
                selected_link.left = true;
                selected_link.right = false;
            }
            restart();
            break;
        case 82: // R
            if (selected_node) {
                // toggle node reflexivity
                selected_node.reflexive = !selected_node.reflexive;
            } else if (selected_link) {
                // set link direction to right only
                selected_link.left = false;
                selected_link.right = true;
            }
            restart();
            break;
        }
    }

    function keyup() {
        lastKeyDown = -1;

        // ctrl
        if (d3.event.keyCode === 17) {
            circle
                .on('mousedown.drag', null)
                .on('touchstart.drag', null);
            svg.classed('ctrl', false);
        }
    }

    // app starts here
    // svg.on('mousedown', mousedown)
    // svg.on('mousemove', mousemove)
    //     .on('mouseup', mouseup);
    d3.select(window)
        .on('keydown', keydown)
        .on('keyup', keyup);
    restart();
};
