/**
 *  TODO:
 *      1. Adding Color Picker
 * 
 *  DONE:
 *      1. make the mouse line_ snaps to the nearest number
 */
let inp_pos = [];
let inpdata = [];

var gcol;
var sli_val;
var button;

var sketch1 = function(p){

    p.setup = function(){

        let canvas = p.createCanvas(800, 800);
        canvas.parent("#cvs");
        gcol = p.color(170, 100, 200, 080);
        console.log(gcol)

        button = p.createButton("BUTT", 0)
        button.mousePressed(makedecisionTree);
        
        p.createP("Choose the Y Value for the next datapoint");
        sli_val = p.createSlider(0, 255, 100, 1);

    }

    p.draw = function() {
        p.background(300);
        draw_mpos(p); 
        draw_numline(p,[-10, 11]);// with background grid;
        print_pts(p,inp_pos);

        p.fill(sli_val.value());
        p.rect(10,p.height*.95,15,15)

        p.fill(0);
        // console.log("slider Value: ",sli_val.value())
    }

    p.mouseClicked = function() {

        // if the mouse position is outside the canvas then dont do anything 
        if (p.mouseX < 0 || p.mouseY <0 || p.mouseX > p.width || p.mouseY > p.height)return null;
        inp_pos.push([p.mouseX, p.mouseY,sli_val.value()]);

    }

}


function makedecisionTree(){

    let arr = inpdata;
    console.log("yeye!! it works!!",arr);
    let inp_matrix = nj.array(arr);

    console.log("inpMAT: ",inp_matrix.tolist(),inp_matrix.shape);

    RootNode = new Tree_Node;
    Decision_Tree(inp_matrix.T);

}
function bgrid() {
    let th       = [10, 10];
    let gridsize = [width / th[0], height / th[1]];

    stroke(070, 160, 270, 080);

    strokeWeight(1);
    for (let i = 1; i < th[1] && i < th[0]; i++) {
        line(0, i * gridsize[1], width, i * gridsize[1]);

        // if (i < height/gridsize[1])
        line(i * gridsize[0], 0, i * gridsize[0], height);
    }
    stroke(0);
    strokeWeight(1);

    th = [20, 20];
    gridsize = [width / th[0], height / th[1]];

    stroke(070, 160, 270, 50);
    strokeWeight(1);
    for (let i = 1; i < th[1] && i < th[0]; i++) {
        line(0, i * gridsize[1], width, i * gridsize[1]);

        // if (i < height/gridsize[1])
        line(i * gridsize[0], 0, i * gridsize[0], height);
    }
    stroke(0);
    strokeWeight(1);
}

function draw_mpos(p) {
    let inclen = 34.285;
    let offset = 30;
    // X-line
    p.push();
    p.translate(0,p.mouseY);
    p.line(0, 0, p.width, 0);
    p.pop();

    // Y-line
    p.push();
    p.translate(p.mouseX, 0);
    p.line(0, 0, 0, p.height);
    p.pop();
}

function draw_numline(p,rangeX) {
    // range: [0] = starting_point , [1] = ending_point;
    let xlen     = Math.abs(rangeX[1] - rangeX[0]);

    let offset = 30;

    let line_len = 20;

    let numline_posOffset_0 = [80, 40];
    let numline_posOffset_1 = [30 + line_len / 2, 40];

    let inclen_0 = ((p.width - numline_posOffset_0[0]) / xlen); // length of an increment in px
    // let inclen_1 = ((height-numline_posOffset_1[1]*2)/ylen);// length of an increment in px

    let tsize = 12;

    p.push();
    p.translate(numline_posOffset_0[0], p.height - numline_posOffset_0[1])
    for (let i = 0; i < xlen; i++) {
        p.push();
        p.translate(inclen_0 * i, 0);

        // Background Lines:-
        p.stroke(gcol);
        if (rangeX[0] + i === 0) {
            p.stroke(270, 80, 190);
        }
        p.strokeWeight(2.0);
        p.line(0, 0, 0, -p.width);

        // sub-lines
        p.stroke(Math.ceil(255 * gcol._array[0]), Math.ceil(255 * gcol._array[1]), Math.ceil(255 * gcol._array[2]), 50);
        p.strokeWeight(1.0);
        p.line(inclen_0 / 2, 0, inclen_0 / 2, -p.width);

        p.stroke(0);
        p.strokeWeight(2);
        p.line(0, -line_len / 2, 0, line_len / 2);

        p.textSize(tsize);
        p.strokeWeight(0);
        p.text(rangeX[0] + i, -tsize / 2, line_len / 2 + tsize)
        p.pop();

        // line(0,height-numline_posOffset_0[1],width,height-numline_posOffset_0[1]);
        p.line(-numline_posOffset_0[1], 0, p.width - numline_posOffset_0[1], 0);
    }
    p.pop();

    p.push();

    p.translate(numline_posOffset_1[0], p.height - numline_posOffset_1[0] * 2);
    p.rotate(-p.PI / 2)
    for (let i = 0; i < xlen; i++) {
        p.push();
        p.translate(inclen_0 * i, 0);

        // Background Lines:-
        p.stroke(gcol);
        if (rangeX[0] + i === 0) {
            p.stroke(270, 80, 190);
        }
        p.strokeWeight(2.0);
        p.line(0, 0, 0, p.width);

        // sub-lines:
        p.stroke(Math.ceil(255 * gcol._array[0]), Math.ceil(255 * gcol._array[1]), Math.ceil(255 * gcol._array[2]), 50);
        p.strokeWeight(1.0);
        p.line(inclen_0 / 2, 0, inclen_0 / 2, p.width);

        // num-line
        p.stroke(0);
        p.strokeWeight(2);
        p.line(0, -line_len / 2, 0, line_len / 2);

        p.strokeWeight(0);
        p.text(rangeX[0] + i, -tsize / 2, line_len / 2 + tsize)
        p.pop();

        // line(0,height-numline_posOffset_0[1],p.width,height-numline_posOffset_0[1]);
        p.line(-numline_posOffset_1[1], 0, p.width - numline_posOffset_1[1] * 2, 0);
    }
    p.pop();
}

function print_pts(p,arr) {

    let offset = 40;
    let inclen = 34.285;
    let show_coords = 1;
    let ptsize = 10; 
    inpdata = [];
    // inpdata = new Array(arr.length);

    for (let i = 0; i < arr.length; i++) {
        let cpt = arr[i]; //current point
        coords = [Math.ceil((-offset + cpt[0]-p.width/2)/inclen),-Math.ceil((cpt[1]-p.height/2)/inclen)];
        inpdata.push([coords[0],coords[1],cpt[2]]);

        // let coords = [ starting_pt + 1*Math.floor(cpt[0]/inclen)*cpt[0], 0*starting_pt + Math.floor(offset -arr[i][1]/inclen)];
        p.push();
        // translate(cpt[0],cpt[1])
        p.translate(inclen*coords[0],-inclen*coords[1])
        p.translate(offset/2 + p.width/2,-offset/2 + p.height/2);

        p.translate(ptsize/4,-ptsize/4);
        p.strokeWeight(ptsize);

        p.stroke(cpt[2]);
        p.point(0, 0);


        p.noStroke();
        if (show_coords) {
            // displaying_value:
            p.text("[ " + coords[0] + " , " + coords[1] + " ]", 0, -10)

        }
        p.strokeWeight(1);
        p.pop();
    }
}

