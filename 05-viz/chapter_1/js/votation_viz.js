







var linksperson = [];
var parties= [];
d3.json("../viz_data/linkspersons.json", function(list) {
    console.log(list)
    linksperson = list;

});
d3.json("../viz_data/GroupId.json", function(list) {
    console.log(list)
    parties = list;

});

var selected = null;

var svg = d3.select("svg"),
    width = +svg.attr("width"),
    height = +svg.attr("height");
r  = 1;
var radius = 5,
    padding = 1;
var color = d3.scaleOrdinal(d3.schemeCategory20);

var simulation = d3.forceSimulation()
    .force("link", d3.forceLink().id(function(d) {
        return d.id; }))
    .force("charge", d3.forceManyBody().strength(-12))
    .force("collision", d3.forceCollide().radius(radius+padding).iterations(5).strength(0.5))
    .force("center", d3.forceCenter(width / 2, height / 2));

var input = document.getElementById("countries");
var awesomplete = new Awesomplete(input, {
    minChars: 1,
    maxItems: 5,
    autoFirst: true
});

var persons = []
d3.json("../viz_data/data.json", function(error, graph) {
    if (error) throw error;
    console.log(graph)
    for (var i= 0 ; i<graph.nodes.length;++i){
        persons.push(graph.nodes[i].id)
    }
    awesomplete.list = persons;

    var link = svg.append("g")
        .attr("class", "links")
        .selectAll("line")
        .data(graph.links)
        .enter().append("line")
        .attr("stroke-width", function(d) {
            return 5*d.value; });

    var node = svg.append("g")
        .attr("class", "nodes")
        .selectAll("circle")
        .data(graph.nodes)
        .enter().append("circle")
        .attr("r", 5)
        .attr('id', function(d){
            return d.id; })
        .attr("fill", function(d) {

            return color(d.group); })
        .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended))
        .on("mouseover",function(d) {

             if (selected ==null){
                document.getElementById("pics").src="../pictures/"+linksperson[d.id] +".jpg";
                d3.selectAll(".nodes").style("r", radius);
                d3.select(this).style("r", 2 * radius)
                document.getElementById("councilorName").innerHTML = d.id ;
                document.getElementById("councilorParty").innerHTML = parties[d.group];
                link.style('stroke-width', function(l) {
                    if (l.source == selected || l.target == selected){
                        if (d== selected){ return 1}
                        else if ( d === l.target){
                            console.log("source is : "+ l.source.id + "and target is :" + d.id +"with distance : "+ l.value)
                            return 2;}
                        else if(d === l.source){
                            console.log("source is : "+ d.id  + " and target is :" + l.target.id+" with distance : "+ l.value)
                            return 2;}

                    }
                });}
        })
        .on("mouseout",dephasis)
        .on("click",clicking)
        .on("dblclick", function(d) {
            localStorage['parl'] = d.id;
            window.location.assign("../html/viz_person.html", '_blank');
            //window.location.assign("../html/viz-person.html", '_blank');
        });


    node.append("title")
        .style("opacity",'0.0')
        .text(function(d) { return d.id; });

    var legend = svg.selectAll(".legend")
        .data(color.domain())
        .enter().append("g")
        .attr("class", "legend")
        .style("font-size","12px")
        .attr("transform", function(d, i) {
            return "translate("+ -100 +"," + (i * 20+2) + ")"; });

    legend.append("rect")
        .attr("x", width - 18)
        .attr("width", 18)
        .attr("height", 18)
        .attr("rx", "3px")
        .attr("ry", "3px")
        .style("fill", color);

    legend.append("text")
        .attr("x", width - 24)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "end")
        .text(function(d) {
            return parties[d]; });


    simulation
        .nodes(graph.nodes)
        .on("tick", ticked);

    simulation.force("link")
        .links(graph.links);

    function ticked() {
        link
            .attr("x1", function(d) {
                return d.source.x; })
            .attr("y1", function(d) { return d.source.y; })
            .attr("x2", function(d) {
                return d.target.x; })
            .attr("y2", function(d) { return d.target.y; });

        node
        //.each(force())
            .attr("cx", function(d) { return d.x = Math.max(r, Math.min(width - r, d.x)); })
            .attr("cy", function(d) { return d.y= Math.max(r, Math.min(height - r, d.y)); });



    }



    function clicking(d) {
        console.log(d)
        var src = document.getElementById("links");


        if (selected == d){
            selected = null;
            src.style.height ="0px";}
        else{
            selected = d
            document.getElementById("pics").src="../pictures/"+linksperson[d.id] +".jpg";
            document.getElementById("councilorName").innerHTML = d.id ;
            document.getElementById("councilorParty").innerHTML = parties[d.group];
            src.style.height ="150px"
        }


        while (src.firstChild) {
            src.removeChild(src.firstChild);
        }
        link.style('stroke-width', function(l) {
            if (selected!=null & (d === l.source || d === l.target) ){

                var li = document.createElement("li");
                var div = document.createElement("div");
                var p1 = document.createElement("p");
                var p2 = document.createElement("p");
                var img = document.createElement("img");
                var div2= document.createElement("div");
                img.width=50
                if (d==l.source){
                    img.src = "../pictures/"+linksperson[l.target.id] +".jpg";
                    img.innerTEXT = l.target.id
                    p2.innerHTML = " "+l.target.id
                }

                else {
                    img.src = "../pictures/" + linksperson[l.source.id] + ".jpg"
                    img.innerTEXT = l.source.id
                    p2.innerHTML = " "+l.source.id
                }
                img.onclick = function() {
                    var input  =this.innerTEXT;
                   new_node = document.getElementById(input)
                    fakeClick(new_node)


                };
                p1.style.float = "left"
                div2.style.clear="left"
                p1.appendChild(img)
                div.appendChild(p1)
                div.appendChild(p2)
                li.appendChild(div)
                li.appendChild(div2)
                src.appendChild(li);
                console.log(src)
                return 2;}
            else
                return 1;
        });
        link.style('stroke-opacity', function(l) {
            if (selected!=null & (d === l.source || d === l.target) )
                return 10;
            else
                return 0.05;
        });
        link.style('stroke', function(l) {
            if (selected!=null & (d === l.source || d === l.target))
                return color(d.group);
            else
                return "black";
        });
    }

});

function dragstarted(d) {
    if (!d3.event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
}

function dragged(d) {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
}

function dragended(d) {
    if (!d3.event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
}
function emphasis(d) {
    d3.selectAll(".nodes").style("r", radius);
    d3.select(d).style("r", 2 * radius)
        .style("visibility", "visible")

    document.getElementById("councilorName").innerHTML = d.id ;
    document.getElementById("councilorParty").innerHTML = parties[d.group];
}
function dephasis(d) {
    d3.selectAll(".nodes").style("r", radius);
    d3.select(this).style("r",radius);

}

function handleKeyPress(e){
    var key=e.keyCode || e.which;
    if (key==13){
        findperson();
    }

}
function findperson() {
    var input  =document.getElementById("countries");
    console.log(input)
    new_node = document.getElementById(input.value)
    fakeClick(new_node)

}
var fakeClick = function(node) {

    var event = document.createEvent('MouseEvents');
    event.initMouseEvent('click');
    node.dispatchEvent(event);
};
