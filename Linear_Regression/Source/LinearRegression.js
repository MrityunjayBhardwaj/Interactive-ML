// TODO:
//    1 Make it Interactive;
//    2 Add the CSV functionality with dynamic dimensions;
//    3 fix the translate. canvas make it similar to carisian coordinates

var table;


function preload(){
    // table = loadTable("../DataSets/random-linear-regression/train.csv","csv","header");
    // table = loadTable("train.csv");
}

// init
var weights,biases,trainX,trainY;

var data = 0; // must be a numjs array

var genW = [5,0];
var genB = [-100];

var nlvl = .0;

var valfn = function(k){
    this.value = k;
}
var learning_rate = 0;

function setup(){

    var cvs = createCanvas(innerWidth,innerHeight);
    const gui = new dat.GUI();
var canvas_container = document.getElementById("canvas1");

    cvs.parent(canvas_container)

    background(0);
    console.log(table);
    // console.log("max: ",max(trainY.tolist()[0]));
   learning_rate = new valfn(.000001);


    // linear regression:
    

    // init:

    let SampleSize = 50;
    let nfeatures = 2;
    let data = initdata([nfeatures,SampleSize]).T;
    weights = initweights([1,nfeatures]);
    biases = initbiases([1,1]);

    // var learning_rate = .001;
    trainX = nj.array([data.tolist()[0],data.tolist()[1]]);
    trainY = nj.array(data.tolist()[2]).reshape(1,SampleSize);

    // frameRate(5);

    // GUI: 
    gui.add(learning_rate,"value",.00000001,.01);
}
function grid(divs){

    let bsize = [width/divs[0],height/divs[1] ]
    let gsize = 50;
    let fac = 2;
    // subgrid
    for(let i=0;i<divs[0]*fac;i++){
        for(let j=0;j<divs[1]*fac;j++){
            stroke(0,120,0,50);
            fill(180);
            rect(bsize[0]/fac*i,bsize[1]/fac*j,bsize[0]/fac,bsize[1]/fac);
        }
    }
}
function draw(){

    // noLoop();
    background(60);
    // plotting graph:
    // visualizing linear regression:
    // grid([30,20]);
    // draw number line:
    numline();

    // drawing points:
    
    drawpts(trainX.tolist()[0],trainY.tolist()[0]);
    // drawpts(trainX.tolist()[1],trainY.tolist()[0]);

    // drawing predicted pts


    // console.log("w: ",weights,"b: ",biases)

    // drawline(weights.tolist()[0][1],biases.tolist()[0][0] );
    // drawline(weights.tolist()[0][0],biases);

    let currepoch = lrc1(trainX,trainY,weights,biases,learning_rate.value);

    // draw the regression line
    drawline(weights.tolist()[0],biases.tolist()[0][0]);

    weights = currepoch[0];
    biases  = currepoch[1];

}


function drawline(m,c){
    // console.log("m: ",m,"c: ",c);
    // eqn of line: y = mx+c

    stroke(300,0,300);

    strokeWeight(2);
    let llen = width;
    // let p1 = { x: -llen , y: m[0]*(llen) +m[1]*(llen)  +c}
    // let p2 = { x: llen  , y: m[0]*(-llen)+m[1]*(-llen) +c}

    push();
    // make origin to the center of the canvas
    translate(width/2,height/2 -c );

    // m[1] =  0;
    // console.log("slope: ",m,"angle:",angle);
    let angle = Math.atan(-(m[0]));
    rotate(angle)
    // line(p1.x,p1.y,p2.x,p2.y);
    line(-llen,0,llen,0);

    stroke(300);
    strokeWeight(0);
    fill(255)

    let ts = 20;
    textSize(ts) 
    text("m:"+m[0]+"",-width/3,8*(ts/10));
    text("b:"+m[0]+"",width/3,8*(ts/10));
    pop();


    stroke(00);
    strokeWeight(1);
}

function drawpts(x,y,col=color(00,0,0)){
    // console.log(x);
    strokeWeight(5);
    push();
    stroke(col);
    translate(width/2,height/2); 
    // point(10,10);

    for(let i=0;i<x.length;i++) {
        // point()
        let cx = x[i];
        let cy = y[i]

        point(cx,-cy);

    }

    pop();

    strokeWeight(1);
}

function numline(){

    // x-axis: 
    stroke(0,300,0);
    push();
    translate(width/2,height/2);
    line(-width,0,width,0);
    pop();

    // y-axis: 
    stroke(300,0,0);
    push();
    translate(width/2,height/2);
    line(0,-height,0,height);
    pop();

    stroke(0);
} 


function initdata(dims){

    // data
    let a = [];
    for(let i=0;i<dims[1];i++){
        // [2,m] matrix;
        let x1 = i*(genW[0]) + random(70)*nlvl;
        let x2 = i*(genW[1]) + random(60)*nlvl;
        let c = genB[0];

        a.push([x1,x2,x1+ (x2) + c ]) 
    }

    return nj.array(a);
}


function initweights(dims){
    return nj.ones(dims);
}


function initbiases(dims){
    return nj.zeros(dims);
}

function lossfn(y_true,y_hat){
//    console.log("shape Check: ",y_true.shape,y_hat.shape,y_hat.tolist())
   let k=nj.subtract(y_true,y_hat);
   return nj.multiply(k,k);// (y-yhat)^2

};

function derloss(y_true,y_hat){
   return nj.subtract(y_true,y_hat);
}

function checkaccuracy(yt,y_hat){
    // calculating the loss
    
    let loss = lossfn(yt,y_hat);
    let RSS = nj.mean()/ nj.mean(nj.multiply(yt,yt)); // (mean((ytrue-yhat)^2))/(mean(ytrue^2))
    let dummy = [nj.mean(loss),nj.mean(nj.multiply(yt,yt))];
    return dummy[0]/dummy[1] 
}

function makevec(scaler,shape){

    // make it 2x50
    let a = nj.ones(shape);
    // console.log('a: ',a.shape);

    let b = nj.array(scaler).reshape(1,1);
    // console.log('v: ',b.shape);

    let fin = nj.dot(b,a);
    return fin;
    

}

function lrc1(trainX,trainY,cweights,cbiases,alpha){
    // console.log("currWeights: ",cweights.tolist(),"\ncurrBiases: ",cbiases);
    let cb = makevec(cbiases,[1,trainX.shape[1]]); // convert (1,f) into (n,f) where n=no.of samples and f = no.of features
    let y_hat = nj.add(nj.dot(cweights,trainX),cb); // m*x + c dims: weights = 1*m trainX = m*n;
    let currAccuracy = checkaccuracy(trainY,y_hat);


    // draw RSS line
    // console.log("trainX",y_hat.tolist()[0].length)


    push();
    translate(width/2,height/2)
    // rotate(-PI)
    for(let i=0;i<trainX.tolist()[0].length;i++){
        let cyhat = y_hat.tolist()[0][i];
        let cx = trainX.tolist()[0][i];
        let cy = trainY.tolist()[0][i];
        let p1 = {x: cx,y:-cy};
        let p2 = {x:cx,y:-cyhat};
        stroke(160)
        // console.log(p1,p2)
        line(p1.x,p1.y,p2.x,p2.y)

    }
    pop();
    stroke(0);

    // drawing predicted y
    drawpts(trainX.tolist()[0],y_hat.tolist()[0],color(300,0,0));

    // console.log("sample: ",y_hat.tolist()[0][10],trainY.tolist()[0][10]);
    // console.log(cweights.tolist()[0],cbiases.tolist()[0]);

    strokeWeight(0);
    fill(300)
    textSize(20)
    text("accuracy: "+(1-currAccuracy),10,20);
    text("learning_rate: "+alpha,10,40);
    strokeWeight(1);
    // now improve it using gradient descent;
    // dwdL and dbdL
    let derivatives = gradientdescent(trainX,trainY,y_hat);// give gradients of w and b
    // console.log("deriv !!",derivatives[0].tolist(),"\n",derivatives[1].tolist(),"\n",derivatives[0].shape,derivatives[1].shape,cweights.shape);


    let a = nj.dot(nj.array(alpha).reshape(1,1),derivatives[0]);
    let b = nj.dot(nj.array(alpha).reshape(1,1),derivatives[1]);

    // console.log("derivatives: ",a.tolist(),b.tolist())
    let newWeights = nj.add(cweights,a);
    let newbiases  = nj.array(nj.add(cbiases, b).tolist());
    // console.log("sjdlfk",a.shape,b.shape,cbiases.shape)

    return [newWeights,newbiases];
}

function linearRegression(trainX,trainY,weights,biases,epoach,alpha){
    let cweights = weights;
    let cbiases  = biases;

    for(let i=0;i<epoach;i++){
        let cregression = lrc1(trainX,trainY,cweights,cbiases,alpha);
        cweights = cregression[0];
        cbiases = cregression[1];
    }

    return [cweights,cbiases]
}

function gradientdescent(x,yt,yhat){
    let dLdyhat = derloss(yt,yhat);
    let dyhatdw = x; 
    let dLdw =  nj.dot(dLdyhat,dyhatdw.T); // dw/dl = dw/dyhat * dyhat/dl  // i.e, dw/dL =  (y-yhat)*x
    let dLdb = (dLdyhat); // db/dL = dL/dyhat * dyhat/db;

    // taking average
    dLdw = nj.divide(dLdw,yt.shape[1]);

    dLdb = nj.array(nj.mean(dLdb)).reshape(1,1);
    // console.log("sldjsadfjlkkfj",dLdyhat.shape);
    // console.log("dldb:",dLdb)
    return [dLdw,dLdb];

}

function main(epoch){
    let SampleSize = 50;
    let nfeatures = 2;
    let data = initdata([nfeatures,SampleSize]).T;
    let weights = initweights([1,nfeatures]);
    let biases = initbiases([1,1]);

    trainX = nj.array([data.tolist()[0],data.tolist()[1]]);
    trainY = nj.array(data.tolist()[2]).reshape(1,SampleSize);

    console.log("\ntrainX: ",trainX.shape,"\ntrainY: ",trainY.shape,"\nweights",weights.shape,"\nbiases: ",biases.shape,"\ndata: ",data.shape);
    linearRegression(trainX,trainY,weights,biases,epoch,learning_rate);
}

// main(100);


