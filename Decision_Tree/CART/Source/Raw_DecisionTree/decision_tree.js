// TODO: Make a path variable for all the datapoints so that we can correctly visuzlize in the Tree Viewer.
// TODO: Using splitting instead of making it "zero".

// init
var weights,biases,trainX,trainY;
var data = 0; // must be a numjs array

// contains generated weights and biases
var genB = -10;
var SampleSize = 50;
var nfeatures = 2;

var gweights_range = [1,10]; // what is the range of the values generated weight can use.
var Dmax = 1;

nlvl = .0;

const Tree_Node = function(){
    // DataStructure

    this.left_child = null; 
    this.right_chi4d = null;
    this.parent = null;
    this.value = -1; // contain values like = [k,n]  where n is the threshold value and k is 0(less then) or 1(greater then)

}

var RootNode = new Tree_Node;

function main(){
    let data    = generate_data(SampleSize,nfeatures,gweights_range,genB)[0].T;
    let weights = initweights([1,nfeatures]);
    let biases  = initbiases([1,1]);

    // console.log(
    //             "\nweights",weights.shape,
    //             "\nbiases: ",biases.shape,
    //             "\ndata: ",data.shape    );

    Decision_Tree(data);
}
main();

function Decision_Tree(data){
/* Prerequisites:-
    Shape of the data must be = [sampleSize,nfeature+trueY]
*/
    console.log("NEW DATA: ",data.shape,data.tolist());

    trainX  = data.slice([-1],0);
    trainY  = data.slice(nfeatures,0);
    weights = makevec(1/trainY.shape[1]);

    console.log("\ntrainX: ",trainX.shape,
                "\ntrainY: ",trainY.shape);

    // console.log("Testing Splitting...",trainX.tolist(),
    //                                    trainX.slice(null,25).tolist(),
    //                                    trainX.slice(null,[-25]).tolist())

    // reset rootnode:
    RootNode = new Tree_Node;
    DFS(trainX,trainY,RootNode,1);

    console.log("ROOT: ",RootNode);
    // Test(trainX,trainY,RootNode);
}

// main();
function data_split(trainX,trainY,Weights,split_info,invert=0){
    // console.log("DATA_SPLIT TRAINX: ",trainX.tolist());

    let fno   = split_info[0]; // feature number;
    let split = split_info[1]; // split point

    let x     = trainX.slice([fno,fno+1],0); // current data of this feature[i]

    // return all the x'es that satisfy the given condition;
    let v_vec   = makevec(split,[1,x.shape[1]]);
    let two_vec = makevec(2,[1,x.shape[1]]);

    // Calculation: ((((x-v)/abs(x-v)) + 1)/2);
    let s1 = nj.subtract(x,v_vec);// x-v
    let s2 = nj.divide(s1,nj.abs(s1))// (x-v)/abs(x-v) normalizing 
        s2 = convNANtoZero(s2); // because 0/0 = NaN
    let s3 = nj.add(s2,makevec(1,[1,x.shape[1]])) //    ((x-v)/abs(x-v) + 1)
    let s4 = nj.divide(s3,two_vec) //((((x-v)/abs(x-v)) + 1)/2)


    // now this calculation will gives us 0 on all x < split and 1 for all x >= split
    // but if we want the other way around then just set the invert to 1
    let  s4_inv = nj.subtract(nj.ones(s4.shape),s4);

    // console.log("s1",s1.tolist(),"s2: ",s2.tolist(),"s3: ",s3.tolist(),"invert: ",invert,"s4: ",s4.tolist(),"s4_inv: ",s4_inv.tolist());
    let curr_tx   = trainX.slice([0,0+1],0); // current data of this feature[0]
    let curr_tx_b = trainX.slice([0,0+1],0); // current data of this feature[0]

    let fintx_a = [];
    let fintx_b = [];
    
    let curr_txtmp   = nj.multiply(curr_tx,s4) 
    curr_tx_b = nj.multiply(curr_tx_b,s4_inv) 
    curr_tx = curr_txtmp;

        // console.log("CURR_TX_B: ",trainX.slice([0,0+1],0).tolist(),curr_tx_b.tolist(),s4_inv.tolist(),curr_tx_b.tolist());

    // console.log("ctx and ctxb fno: ",fno,curr_tx.tolist(),curr_tx_b.tolist())
    fintx_a = curr_tx;
    fintx_b = curr_tx_b;

    for(let i=1;i<trainX.shape[0];i++){
        curr_tx   = trainX.slice([i,i+1],0);
        curr_tx_b = (curr_tx);

        // if(i === fno){ // if this current feature contain the split point, then modify the data points according to our equation above :D
            let curr_txtmp = nj.multiply(curr_tx,s4);
            curr_tx_b   = nj.multiply(curr_tx_b,s4_inv);
            curr_tx     = curr_txtmp;
            // console.log("CURR_TX_B: ",trainX.slice([i,i+1],0).tolist(),curr_tx_b.tolist(),s4_inv.tolist(),curr_tx_b.tolist());
        // }
        // console.log("DIMS: ",fintx_a.shape,curr_tx.shape,fintx_b.shape,curr_tx_b.shape)
        fintx_a = nj.concatenate(fintx_a.T,curr_tx.T).T;
        fintx_b = nj.concatenate(fintx_b.T,curr_tx_b.T).T;
    }

    // filter Y
    finty_a = nj.multiply(trainY,s4);
    finty_b = nj.multiply(trainY,s4_inv);

    // filter X
    fintx_a = removeZeros(fintx_a);
    fintx_b = removeZeros(fintx_b);

    finty_a = removeZeros(finty_a);
    finty_b = removeZeros(finty_b);

    // filter Weights:-
    fintw_a = nj.multiply(Weights,s4);
    fintw_b = nj.multiply(Weights,s4_inv);

    fintw_a = removeZeros(fintw_a);
    fintw_b = removeZeros(fintw_b);

    console.log("FINTX: ",trainX.tolist(),fintx_a.tolist(),fintx_b.tolist());
    return [fintx_b,fintx_a,finty_b,finty_a,fintw_a,fintw_b];
}

function isterminalnode(node){
    if(node.left_child == null)return true;
    else return false;
}


var pre_split_pt = 0;// split point for t-1.

function CalcNewWeights(weights,tx,alpha=1){

    let nweights = new Array(weights.length);

    // now change the weights according to the alpha.
    for(let i=0;i<weights.length;i++){
        let curr_tx      = tx.T.slice([i,i+1],0);
        let cresult  = test_value(curr_tx); 
        nweights[i] = weights[i]*Math.exp(alpha*cresult);
    }

    return nj.array(nweights);
}

function DFS(tx,ty,weights,cnode,cdepth,pspt,alpha=[]){
    let ntx_l,ntx_r,nty_l,nty_r,nw_l,nw_r = []; 

    if (cdepth > Dmax || tx === [] || cnode.value === undefined)return null;

    if (isterminalnode(cnode) ){
        // if its a terminal/leaf node then create Tree and attach to this Tree_Node.
        console.log("CNode: ",cnode,"\ncdepth",cdepth,"\ntx:",tx.tolist(),"\nty: ",ty.tolist());

        let out = Create_Tree(tx,ty,weights);
        ntx_l   = out[0][0];
        ntx_r   = out[0][1];

        nty_l   = out[1][0];
        nty_r   = out[1][1];

        nw_l    = out[4][0];
        nw_r    = out[4][1];
        
        console.log("CreateTree_output: ",out);

        let l_node   = out[2][0];
        let r_node   = out[2][1];
        let split_pt = out[3];

        let ctloss = out[5];// current tree loss
        let ctree_alpha = Math.log((1-ctloss)/ctloss);
        alpha.push(ctree_alpha);

        // Calculate New Weights
        nw_l = CalcNewWeights(nw_l,tx,ctree_alpha);
        nw_r = CalcNewWeights(nw_r,tx,ctree_alpha);

        if(split_pt === undefined){
            console.log("this is undefined $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$");
        }

        if(pspt != undefined){

            if (split_pt[1] === pspt[1]){
                // console.log("skldjflksdjflkdsjlfkjsdl kfjsdlkfj lksdjf lksdj flkj");
                // return null;
            }

        }

        pre_split_pt      = split_pt;

        cnode.left_child  = l_node;
        cnode.right_child = r_node;
        cnode.value       = split_pt; // split point

    }
    
    DFS(ntx_l,nty_l,nw_l,cnode.left_child ,cdepth+1,cnode.value,alpha);
    DFS(ntx_r,nty_r,nw_r,cnode.right_child,cdepth+1,cnode.value,alpha);
}


function test_value(testx,node,path,d=0){
    if(isterminalnode(node) == false){
        // checking: 
        let split_pt = node.value[1];
        if(testx[node.value[0]] < split_pt){
            path[d] = 1;
            return test_value(testx,node.left_child,path,d+1)
        }
        else{
            path[d] = 0;
            return test_value(testx,node.right_child,path,d+1);
        }
    }
    else{
        return [node.value,path];
    }
    
}

function Test_tree(testX,testY,node){
    let total_y = 0;
    let total_pred_y = 0;
    for(let i=0;i<testX.shape[1];i++){
        let rndindx = Math.floor(Math.random()*testX.shape[1]);
        let rnd_x   = testX.T.slice([rndindx,rndindx+1],0);

        let pred_y = test_value(rnd_x,node)[0];
        let true_y = testY.T.slice([rndindx,rndindx+1],0);

        total_y      += true_y.tolist()[0][0];
        total_pred_y += pred_y;
    }

    // console.log("accuracy: ",((total_y - total_pred_y)**2)/(testY.shape[1]))
    return (total_y - total_pred_y)**2
}

// Creating Regression Tree
function Create_Tree(tx,ty,weights,alpha=1){

    console.log("skdjfl")
    let curr_tx = tx; 
    let curr_ty = ty;
    let bsplit_pt = find_best_split(curr_tx,curr_ty,weights,curr_ty,alpha);// [0]{[0] = feature number ; [1] = value/ split point;} [1]{ mean value of both the splitted parts }

    // take all the samples that satisfy all the decision uptill now 
    // console.log("bsplit_pt: ",bsplit_pt)

    let ctree_loss = bsplit_pt[5];

    // New Tree:-

    // Left-Node
    let l_node = new Tree_Node;
    l_node.left_child  = null;
    l_node.right_child = null;
    l_node.value = bsplit_pt[1][0];

    // Right-Node
    let r_node = new Tree_Node;
    r_node.left_child  = null;
    r_node.right_child = null;
    r_node.value = bsplit_pt[1][1];

    // Parent-Node
    let p_node = new Tree_Node;
    p_node.left_child  = l_node;
    p_node.right_child = r_node;
    p_node.value = bsplit_pt[0]; // split point

    l_node.parent = p_node;
    r_node.parent = p_node;

    let sample_pts_weights = bsplit_pt[1];

    // now for the next step cut the tx and ty according to our current Decision Tree;
    let filtered_trainX_l = bsplit_pt[2][0]; // for x < split_pt
    let filtered_trainX_r = filtered_tx[2][1]; // for x >= split_pt

    let filtered_trainY_l = filtered_tx[3][0]; // for x < split_pt
    let filtered_trainY_r = filtered_tx[3][1]; // for x >= split_pt

    let filtered_weights_l = bsplit_pt[4][0];
    let filtered_weights_r = bsplit_pt[4][1];

    // TODO: Create a zero removal cream/function.

    // console.log("FINALLL\n\n",filtered_trainX_l.tolist())
    // console.log("FINALLL\n\n",filtered_trainX_r.tolist())

    // filtered_trainX_l = removeZeros(filtered_trainX_l);
    // filtered_trainX_r = removeZeros(filtered_trainX_r);

    // console.log("FINALLL\n\n",filtered_trainX_l.tolist())
    // console.log("FINALLL\n\n",filtered_trainX_r.tolist())

    return [[filtered_trainX_l,filtered_trainX_r],
            [filtered_trainY_l,filtered_trainY_r],
            [l_node,r_node],
            bsplit_pt[0],
            [filtered_weights_l,filtered_weights_r],
            ctree_loss];

}

function findtpairs(cnode,terminal_pairs){

    if(isterminalnode(cnode.left_child) && (isterminalnode(cnode.right_child))){
        // then put it inside the pairs array
        terminal_pairs.push(cnode);
        return null;
    }

    findtpairs(cnode.left_child,terminal_pairs);
    findtpairs(cnode.right_child,terminal_pairs);

    return terminal_pairs
}
// 

function ntermnode(cnode,ntnodes=0){
// calculate the number of terminal nodes in a tree

    if(isterminalnode(cnode)){
        ntnodes+=1;
    };
    ntermnode(tree.left_child,ntnodes);
    ntermnode(tree.right_child,ntnodes);
}

function merge_regions(tree,node){
    node.value = node.left_child.value + node.right_child.value;
    node.left_child  = null;
    node.right_child = null;

}

function pruning(tree){
    // cost-complextiy pruning
    /*
        Algorithm:
            for all the regions calculate the squared difference b/w true_y and prid_y. of that region + number of terminal nodes*alpha
            select the one which has the smallest increase in the cost, and repeat the process using that same tree..
    */    
    // make a pair of all the terminal node which we can merge
    let  tpairs = findtpairs(tree,[]);

    let alpha = .5;
    let o_cost = Test_tree(testX,testY,tree) + alpha*ntermnode(tree);

    // NOw, merge them according to the cost function.

    let ctree = tree;
    tpairs = findtpairs(ctree,[]);

    let cost_diff;

    let smallest_cost = [Infinity,null];
    for(let i=0;i<tpairs.length;i++){

        rmv_intnode(ctree,tpairs[i]);
        let c_cost = Test_tree(testX,testY,ctree) + ntermnode(ctree)
        
        cost_diff = c_cost - o_cost;


        // find the pruned tree which has minor increase 
        if(cost_diff < smallest_cost[0]){smallest_cost = [cost_diff,ctree]} /// ?? 

        ctree = tree;// reinitializing in order to check for other pairs
    }

        console.log("sm Cost: ",smallest_cost);
        if ((smallest_cost - o_cost) < 0 ){
            // if cost difference starts to increase then stop pruning
            return tree;

        }

    // repeat the process untill the cost_difference starts to increase. 
    return pruning(smallest_cost[1]);

}

function removeZeros(vec){

    // console.log(vec.shape[1])
    let newarr = [];
    for(let f=0;f<vec.shape[0];f++){
        let currfdata = []; // data of current feature
        for(let i=0;i<vec.shape[1];i++){
            let currVal = vec.tolist()[f][i];

            if(currVal != 0)
            currfdata.push(currVal);
        }
        newarr.push(currfdata);
    }
    // console.log(newarr);
    // converting the array back to nj matrix
    return nj.array(newarr);
}


function find_best_split(tx,ty,weights,mode=0,alpha=0){ // Objective : min (ytrue - y_prid);
    // mode = 0 == regression 1 == classification
    // output = best split
    let best_split_so_far = [0,0,0];// {[0] = feature number ; [1] = value/ split point; [2] = index}
    let best_cost_so_far  = Infinity;
    let by1,by2;
    let curr_cost;

    let bsplit_dataX;
    let bsplit_dataY;
    let bsplit_weights;

    let tx_impurity = gini_impurity(tx.tolist());
    
    let y_mean = nj.mean(ty);

    // for boosting

    // start splitting
    for(let i=0;i<tx.shape[0];i++){
        // split for every feature
        for(let j=0;j<tx.shape[1];j++){
            // look @ ever data points
            let currtx = tx.slice([i,i+1],0); // current X-data in this feature[i]
            let curr_s = tx.get(i,j); // current split point

            let split_data = data_split(tx,ty,weights,[i,curr_s,j]); // split the data according to our split point
            let dataX_a = split_data[0].tolist(); // dataX which is smaller then curr_s
            let dataX_b = split_data[1].tolist(); // dataX which is larger then curr_s

            let dataY_a = split_data[2].tolist(); // dataY which is smaller then curr_s
            let dataY_b = split_data[3].tolist(); // dataY which is larger then curr_s

            let weights_a = split_data[4].tolist();
            let weights_b = split_data[5].tolist();

            // FOR REGRESSION TREE
            if(mode === 0){
                // taking the average of the region and calculate the error and put it inside an array
                let y1_avg = nj.multiply(dataX_a,weights_a)// weighted average of all x <  v;
                let y2_avg = nj.multiply(dataX_b,weights_b)// weighted average of all x >=  v;

                curr_cost = (y_mean - y1_avg)**2 + (y_mean - y2_avg)**2;

            }

            //FOR CLASSIFICATION TREE
            if(mode === 1){
                let avg_impurity = gini_impurity(dataY_a,weights_a) + gini_impurity(dataY_b,weights_b);
                curr_cost = tx_impurity - avg_impurity; // "information gain" == original_impurity - new_impurity
            }

            if (best_cost_so_far > curr_cost){
                // then this is split gives the smallest cost so far
                best_split_so_far = [i,curr_s,j];
                best_cost_so_far  = curr_cost;

                // TODO change this for classification 
                by1 = y1_mean;
                by2 = y2_mean;

                bsplit_dataX   = [dataX_a,dataX_b];
                bsplit_dataY   = [dataY_a,dataY_b];
                bsplit_weights = [weights_a,weights_b];

            }
        }
    }

    console.log("best_split so far",best_cost_so_far,best_split_so_far,by1,by2);
    
    return [best_split_so_far,[by1,by2],bsplit_dataX,bsplit_dataY,bsplit_weights,best_cost_so_far];
}

function search(val,arr){
    for(let i=0;i<arr.length;i++){
        if(arr[i] === val)return i;
    }

    return false;
}

function class_counts(arr){

    let classes    = [];
    let cfrequency =  [];// class frequency

    for(let i=0;i<arr.length;i++){
        let c_class = arr[i];
        let cc_index = search(c_class);
        if(cc_index){
            // if it is already inside our classes array then increment the frequency
            cfrequency[cc_index]++;
        }
        else{
            // create new
            classes.push(c_class)
            cfrequency.push(1);
        }
    }
    return [cfrequency,classes];
}




// Classification Measure:-
function cclassif(vec,w_vec,cclass){
// this function calculate I(y == k) and take the weighted average

    let arr = vec.tolist();
    let weights = w_vec.tolist();

    let correct_classification = 0;

    for(let i=0;i<arr.length;i++){
        correct_classification  =  (arr[i] === cclass)? 1:0;
        correct_classification  += correct_classification*weights[i]; // taking the weighted average.
    }

    return correct_classification;

}

function gini_impurity(vec,w_vec){
    // vec == the classes column .a.k.a. trainY
    // w_vec == weight vector
    let arr = vec.tolist();
    let weights = w_vec.tolist();

    let gini_index = 0;
    let ccounts  = class_counts(arr);// frequency of all the classes

    for(let i=0;i<ccounts[0].length;i++){
        let curr_class = ccounts[1][i];
        let corr_clasif = cclassif(vec,w_vec,curr_class); // proportion of correct classification of this class

        gini_index += corr_classif*(1-corr_clasif);
    };

    return gini_index;
}

function cross_entropy(vec){
    // vec == the classes column .a.k.a. trainY
    let arr = vec.tolist();

    let entropy = 0;
    let ccounts  = class_counts(arr);// frequency of all the classes

    for(let i=0;i<ccounts[0].length;i++){
        let curr_class = ccounts[1][i];
        let corr_clasif = cclassif(vec,w_vec,curr_class); // proportion of correct classification of this class

        entropy += corr_clasif*Math.log(corr_clasif)
    };


    return -entropy;
}

// UTILs:
function makevec(scaler,shape){

    // make it 2x50
    let a = nj.ones(shape);
    // console.log('a: ',a.shape);

    let b = nj.array(scaler).reshape(1,1);
    // console.log('v: ',b.shape);

    let fin = nj.dot(b,a);
    return fin;

}
    
function testing_rules(tree,cnode){
    // traversing the tree using the Tree_Node values as the direction

    if(cnode.value.length == 1)return cnode.value;


    if(cnode.value[0] == 0){
        // go left child
        testing_rules(trees,cnode.left_child);
    }
    else{
        testing_rules(tree,cnode,right_child)
    }
}

function costfn(x1,r1,x2,r2){
    return  nj.sub(x1.mean(),r1.mean()) + nj.sub(x2.mean(),m2.mean());
}

function convNANtoZero(a){
    let vec = a.tolist()[0];
    let newvec = [];
    for(let i=0;i<vec.length;i++){
        let cval  = (isNaN(vec[i]))? 1: vec[i];

        newvec.push(cval);
    }
    return nj.array(newvec).reshape(a.shape);
}

function trimVec(a){
    let vec = a.tolist()[0];
    let filtered_vec = [];
    for(let i=0;i<vec.length;i++){
        if(vec[i] != 0)filtered_vec.push(vec[i]);
    }
    return nj.array(filtered_vec).reshape([1,filtered_vec.length]);
}

function filtered_avg(x,y,v){ 

    // NOTE: this function doesnt support negetive X'es or Y'es 

    //inputs:
        // x = vector
        // v = threshold
        // norp = calc avgs for (x < v) or (x >= v)

    // output:
        // gives the desired mean of the observations
       
        // this formula gives all the y that belongs to our critaria
    // formula = f(x) = ((((x-v)/abs(x-v)) + 1)/2)*y 
    // v = 18;

    let v_vec  = makevec(v,[1,x.shape[1]]);
    let two_vec = makevec(2,[1,x.shape[1]]);


    // Calculation
    let s1 = nj.subtract(x,v_vec);// x-v
    let s2 = nj.divide(s1,nj.abs(s1))// (x-v)/abs(x-v) normalizing 
        s2 = convNANtoZero(s2); // because 0/0 = NaN
    let s3 = nj.add(s2,makevec(1,[1,x.shape[1]])) //    ((x-v)/abs(x-v) + 1)
    let s4 = nj.divide(s3,two_vec) //((((x-v)/abs(x-v)) + 1)/2)
    let filtered_y = fx_out = nj.multiply(y,s4);//((((x-v)/abs(x-v)) + 1)/2)*y  final output of our function


    let fy_mean = nj.mean(filtered_y);

    // console.log(y_mean,fy_mean) 
    return fy_mean;
};


function initweights(dims){
    return nj.ones(dims);
}


function initbiases(dims){
    return nj.zeros(dims);
}