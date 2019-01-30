// printing trees : =

var col;
let radius = 30;
let Node_pos = [radius*2,radius*1.95];
var cvs2,container;


// mouse Control variables
let lastmpos = [0,0];
let mdrage_start = 0;
let dragdist = [0,0];

let cpos = [0,0];
let zlvl = 1; // zoom level;

var sketch2 = function(p){
    p.setup = function(){

        cvs2 = p.createCanvas(800,800);
        
        col = p.color(200,100,200);
        cvs2.parent("#cvs2");

        cvs2.background(300);
        console.log("ROOTNODE: ",RootNode)


        p.push();
        p.translate(cpos[0], cpos[1]);
        draw_Tree(p,RootNode,[0,0],[0,0,1],Dmax);
        p.pop();

        console.log("YEY!!");

        
    }

    p.draw = function(){

        p.background(300);
        bgrid(p);


        p.push();
        p.translate(cpos[0],cpos[1]);
        p.scale(zlvl,zlvl)
        draw_Tree(p,RootNode,[0,0],[0,0,1],Dmax);
        p.pop();

    }

    p.mouseDragged = function(){
        mdrage_start = 1;

        if (inside_cvs(p)){
            // console.log("Dragging",dragdist,cpos);
            let newmpos = [p.mouseX,p.mouseY];// new mouse pos
            if(lastmpos[0]){
                dragdist[0] += 1.5*Math.floor(lastmpos[0] - newmpos[0]);
                dragdist[1] +=  1.5*Math.floor(lastmpos[1] - newmpos[1])

            }
            lastmpos = newmpos;
            cpos[0]  = p.width/2*0  - dragdist[0];
            cpos[1]  = p.height/2*0 - dragdist[1];

            p.cursor("grab");
        }
    }
    p.mouseReleased = function(){
        if(inside_cvs(p) && mdrage_start){
            console.log("OUT");
            mdrage_start = 0;

            // dragdist = [0,0];
            lastmpos = [0,0];
            // lastmpos[cpos[0],cpos[1]];
        p.cursor("default")
        }
    }
    
    p.mouseWheel = function(event){
        if(inside_cvs(p))
        zlvl += -.2*event.deltaY;

        if(zlvl < 1)zlvl = 1;
    }
}

function inside_cvs(p){
    if (p.mouseX < 0 || p.mouseY <0 || p.mouseX > p.width || p.mouseY > p.height)
    return false;

    return true;
}

function bgrid(p){
    let th = [10,10];
    let gridsize = [p.width/th[0],p.height/th[1]];

    // stroke(070,070,180);
    p.stroke(070,160,070,080);
    p.strokeWeight(1);
    for(let i=1;i<th[1] && i<th[0];i++){
        p.line(0,i*gridsize[1],p.width,i*gridsize[1]);
        // if (i < height/gridsize[1])
        p.line(i*gridsize[0],0,i*gridsize[0],p.height);
    }

    p.stroke(0);
    p.strokeWeight(1);

    th = [20,20];
    gridsize = [p.width/th[0],p.height/th[1]];

    p.stroke(070,160,070,50);
    p.strokeWeight(1);
    for(let i=1;i<th[1] && i<th[0];i++){
        p.line(0,i*gridsize[1],p.width,i*gridsize[1]);

        // if (i < height/gridsize[1])
        p.line(i*gridsize[0],0,i*gridsize[0],p.height);
    }
    p.stroke(0);
    p.strokeWeight(1);
}

function draw_Tree(p,node,pos,path,mdepth,d=0){

    let fac = 0.8*(1-((d)/mdepth));
    p.stroke(0);

    if(node === null )return null;
    // console.log("drawTree: ",pos,node.value,mdepth);

    p.push();
    p.translate(pos[1],pos[0]);

    // p.scale(.7,1)
    if (typeof(node.value) != "number"){

        // Right-child edge

        p.stroke(0);
        if(path[d] == 0){
            p.stroke(200,0,150);
        }
        p.line(0,0,-Node_pos[1]*fac,Node_pos[0])
        p.stroke(0);

        // Left -child edge
        if(path[d] == 1){
            p.stroke(200,0,150);
        }
            p.line(0,0,Node_pos[1]*fac,Node_pos[0])

        p.noStroke();
        p.rect(-radius,-radius/4,radius*2,radius/2)
    }
    else{
        p.noStroke();
        p.ellipse(0,0,radius,radius);
    }
        p.noStroke();
    if (typeof(node.value) === "number"){

        if (pos[1] > 0)
            p.text(""+Math.round(node.value),-(20+25*(1-fac)),10*(1-fac));
        else{
            p.text(""+Math.round(node.value),20,10);
        }
    }

    else{
        if (node.value)
    p.text("x"+(node.value[0])+" < "+node.value[1],-(radius/2+ 10*(1-fac)),05);

    }
    let ratio = 1; 
    // line(0,0,pos[0],pos[1]);
    draw_Tree(p,node.left_child  , [Node_pos[0],-Node_pos[1] + 0*(1- fac)], path,mdepth, d+1 );
    draw_Tree(p,node.right_child , [Node_pos[0], Node_pos[1] - 0*(1- fac)], path,mdepth, d+1 );

    p.pop();

}


