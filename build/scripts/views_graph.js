/*jslint browser: true, vars:true, plusplus:true*/
/*global TH, d3, $, chrome*/
"use strict";
var Views = TH.Views;
var Models = TH.Models;
var Util = TH.Util;


Views.TagGraphView = Backbone.View.extend({
    // template: '',
    initialize: function (options) {
        this.tagRelationship = options.tagRelationship; 
    },
    render: function () {
        console.log('run here line 13'); 
        this.collection.fetch().then(
            (function () { // success call back
                $("#view_network").on("click", this.renderTagGraph.bind(this));
            }).bind(this),
            (function () { // fail call back
                console.log('fetch fail');
            }).bind(this)
        );
    },
    itemGraph: function (tag_name) {
        // TODO need a way to calculate the link between nodes
        var items = this.tagRelationship.getSites(tag_name);
        var length = items.length, i = 0;
        var nodes = [];
        for (i = 0; i < length; ++i) {
            nodes.push({id: items[i].id, reflexive: false, type:"item", item: items[i]})
        }
        return {nodes: nodes, links: []};
    },
    tagGraph: function () {
        var tagList = this.collection.toTemplate().tagList;
        // set up initial nodes and links
        //  - nodes are known by 'id', not by index in array.
        //  - reflexive edges are indicated on the node (as a bold black circle).
        //  - links are always source < target; edge directions are set by 'left' and 'right'.
        var length = tagList.length, i = 0;
        var nodes = [];
        for (i = 0; i < length; ++i) {
            nodes.push({id: tagList[i].tag_name,
                reflexive: false, 
            type: "tag"});
        }
        var links = [
            // {source: nodes[0], target: nodes[1], left: false, right: true },
            // {source: nodes[1], target: nodes[2], left: false, right: true }
        ];

        return {
            nodes: nodes,
            links: links
        };
    },
    renderTagGraph: function () {
        var contiainer = "network_dialog";
        TH.Para.tagGraph.width = $(window).width() * 0.7;
        TH.Para.tagGraph.height = $(window).height() * 0.7;
        $("#" + contiainer).dialog({
            width: TH.Para.tagGraph.width * 1.2,
            height: TH.Para.tagGraph.height * 1.2
        });

        // Views.D3Graph.sel_elements = {};
        Views.D3MouseVars.reset();
        // debugger;
        Views.D3Graph($.extend({type: 'tag', 'this': this}, TH.Para.tagGraph));
    }

});

// Manage cache of selected elementes. (nodes, links. etc);
Views.D3MouseVars = {
    hash: function (obj0){
        var obj = $.extend({}, obj0);
        obj.x = 0;
        obj.y = 0;
        obj.px = 0;
        obj.py = 0;
        return JSON.stringify(obj);
    },
    toggle: function (d) {
        console.log("a node is toggled");
        var cache = this.sel_elements;
        var key = this.hash(d);
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
    },
    selected: function (d) {
        return (this.sel_elements[this.hash(d)] === "yes");
    }
};

Views.D3Util = {};

Views.D3Util.removeNodes = function (nodes, keys) {
    function hash(d) {
        return d.id;
    }
    function exists(keys, nd) {
        var h = hash(nd);
        var i = 0, N = keys.length;
        for (i = 0; i < N; ++i) {
            if (hash(keys[i]) === h) {
                return true;
            }
        }
        return false;
    }

    var new_nodes = [];
    var kset = [];
    $.each(keys, function (i, d) {
        kset.push(JSON.parse(d));
    });

    $.each(nodes, function (i, d) {
        if (!exists(kset, d)) {
            new_nodes.push(d);
        }
    });
    return new_nodes;
}

Views.D3Util.prettifyURL = function (url) {
    var url = url.replace(/.*?:\/\/(www.)?/g, "");
    var maxLen = 20;
    if (url.length > maxLen - 3) {
        url = url.slice(0, maxLen - 3) + '...';
    }
    return url;
}


Views.D3Util.graphInit_item = function (para) {
        $("#network_dialog_nav").html("<button class='action'>back</button>");
        $("#network_dialog_nav").on("click", function () {
            console.log("dialog_nav is clicked!");
            var newPara = $.extend({}, para);
            newPara.type = "tag";
            Views.D3Graph(newPara);
        });

        var default_tran = 'translate(-75, -10)';
        var shapes = para.g.append('svg:rect')
                        .attr('width', 150)
                        .attr('height', 20)
                        .attr('rx', 5)
                        .attr('ry', 5)
                        .attr('transform', default_tran);

        shapes.on('mouseover', function (d) {
            d3.select(this).attr('transform', 'scale(1, 3) ' + default_tran); // enlarge target node
        })
        .on('mouseout', function (d) {
            d3.select(this).attr('transform', default_tran); // unenlarge target node
        });

        return {
            shapes: shapes
        };
}

Views.D3Util.graphInit_tag = function (para) {
        var shapes = para.g.append('svg:circle')
                        .attr('r', 12);
        shapes.on('mouseover', function (d) {
            d3.select(this).attr('transform', 'scale(3)'); // enlarge target node
        })
        .on('mouseout', function (d) {
            d3.select(this).attr('transform', ''); // unenlarge target node
        });
       return {
            shapes: shapes
        };

}

// set up SVG for D3
Views.D3Graph = function (para) {
    var mouseVars = Views.D3MouseVars;
    var removeNodes = Views.D3Util.removeNodes;
    (function cleanView() {
        $("#network_dialog_nav").html("");
        d3.select('svg').remove();
    }());

    var colors = d3.scale.category10();
    var gg;
    if (para.type === "tag") {
        gg = para.this.tagGraph();
    } else {
        gg = para.this.itemGraph(para.tag);
    }
    var links = gg.links;
    var nodes = gg.nodes;

    var svg = d3.select('#' + para.contiainer)
            .append('svg')
            .attr('width', para.width)
            .attr('height', para.height);

    // init D3 force layout
    var force = d3.layout.force()
        .nodes(nodes)
        .links(links)
        .size([para.width, para.height])
        .linkDistance(150)
        .charge(-500)
        .on('tick', tick);

    // handles to link and node element groups
    var path = svg.append('svg:g').selectAll('path'),
        circle = svg.append('svg:g').selectAll('g');

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
        path.classed('selected', function (d) { return mouseVars.selected(d); });

        // add new links
        path.enter().append('svg:path')
            .attr('class', 'link')
            .classed('selected', function (d) { return mouseVars.selected(d); })
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
            .style('fill', function (d) { return mouseVars.selected(d) ? d3.rgb(colors(d.id)).brighter().toString() : colors(d.id); })
            .classed('reflexive', function (d) { return d.reflexive; });

      // add new nodes
        var g = circle.enter().append('svg:g');
        para.g = g;

        var ret = Views.D3Util['graphInit_' + para.type](para);
        ret.shapes
            .attr('class', 'node')
            .style('fill', function (d) { return mouseVars.selected(d) ? d3.rgb(colors(d.id)).brighter().toString() : colors(d.id); })
            .style('stroke', function (d) { return d3.rgb(colors(d.id)).darker().toString(); })
            .classed('reflexive', function (d) { return d.reflexive; })
            .on('mousedown', function (d) {
                if (d3.event.ctrlKey) {
                    // select node
                    // mousedown_node = d;
                    mouseVars.toggle(d);
                    console.log("node selected");
                    // reposition drag line
                    // drag_line
                    //     .style('marker-end', 'url(#end-arrow)')
                    //     .classed('hidden', false)
                    //     .attr('d', 'M' + mousedown_node.x + ',' + mousedown_node.y + 'L' + mousedown_node.x + ',' + mousedown_node.y);
                    restart();
                    console.log("run here");
                    return;
                }

                if (para.type === "tag") {
                    var new_para = $.extend({}, para);
                    new_para.tag = d.id;
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
                    return Views.D3Util.prettifyURL(d.item);
                } else {
                    return d.id;
                }
            });

        // $('#id').tipsy();


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

        switch (d3.event.keyCode) {
        case 8: // backspace
        case 46: // delete
            console.log("before delete: node number " + nodes.length);
            nodes = removeNodes(nodes, mouseVars.list());
            console.log("after delete: node number " + nodes.length);
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
