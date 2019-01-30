// simple util file which generates data-sets.
function generate_data(sampleSize,nfeatures,gwrange=[1,10],gbias=-10){
// return data. and the generated weights used in creating them
    return initdata([sampleSize,nfeatures],gwrange,gbias);
}

// Initialization:=
function initdata(dims,gwr,gb,nlvl=.2,X_range=[1,100]){
    
    console.log(dims)
    let genW = [];
    // creating generated weights
    for(let i=0;i<dims[1];i++){
        let cgen_weight = gwr[0]+Math.floor(Math.random()*gwr[1]);// generated weight
        genW.push(cgen_weight);
    }
    console.log(genW)
    // data
    let a = [];
    for(let i=0;i<dims[0];i++){
        // [2,m] matrix;

        let csample_entries = []; // current sample entry including Xes and Ys
        let y = 0;
        for(let j=0;j<dims[1];j++){
            let randX = X_range[0] + Math.floor(Math.random()*X_range[1]);
            let cox   = Math.floor(1 + Math.random()*dims[0]);// current original X
            let calc  = Math.floor(cox*(genW[j]) + Math.random()*70*nlvl);
            csample_entries.push(calc);
            y+= calc ;

        }
        csample_entries.push(y);

        a.push(csample_entries);
    }
    // console.log(a)
    return [nj.array(a),[genW,gb]];
}
