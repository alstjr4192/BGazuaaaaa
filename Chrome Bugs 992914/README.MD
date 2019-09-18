https://chromium-review.googlesource.com/c/v8/v8/+/1760976

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
    
    o[0] = 0x4242; //keyed
}

for(let i = 0 ; i < 5000;i++)
	console.log(i);

console.log(f());
</code>

name store storeic_miss
idx store keyedstoreic_miss

MigrateInstance  keyedstoreic_miss migration_target setting ~~

keyedstoreic_miss(elements store) -> map is deprecated -> map migration_target set


1. 기본 사이즈, prototype가 ROOT 맵이랑 다를때
2. extensible이 루트와 다를때, ROOT 기준에서(all) transitions seald, frozen symbols를 검색했을때 old_map이 나오지 않았을때 
3. ELEMENTS KIND가 다르고 && 넣는 KIND가 SLOW KIND가 아니고 && (받는 OBJECT KIND가 FAST KIND인 상태에서 TYPE를 바꿔야할때) -> 타입을 바꿔야하는지 체크(안바꿔도된다면 그냥 END ~)
4. *ROOT Deatils에 속해있는 데이터를 바꿀라할때 -> ROOT MAP에서 KIND던 LOCATION이던 바뀐거면 맵 안바꿈 (ROOT가 '주' BASE가 되기때문에 ㅇㅇ) *만약 KIND나 LOCATION이 같다면 미리 details 설정을 바꿔줌

(정리하면 걍 details 타입이나 elements 타입이나 바꿔야하는지 체크도 한다생각하면될듯), MAP이 완전히 달라서 BASE로 납두고 만드는 상황이 아니라 걍 새로 만들어야할때도 걍 넘어감


target map
1. 찾은 MAP을 기준으로 transitions로 검색을 함 (새로 추가되어서 맵이 바뀐 것을 토대로 쭊쭊 찾아감) -> transition에서 안보인다
2. 1번에서 찾았던 멈췄던 그 MAP의 NOF를 기준으로 한번더 검색함 (앞에 부분은 다 맞고 중간에 몇개가 일치하지않고 그 뒤에 부분은 일치할때 검색용?)
3. 1번 transition 기본적인 MAP부분이 정확히 일치한 맵을 찾았다면 SEALED, FROZEN, NOEXTENSIBLE부분에서 있는지 없는지 검사함 없으면 새로 만들어야되니까 CONSTRUCT MAP으로 넘어가게됨


target_nof = 3;
old_nof = 4;

foo1 foo2 foo4
foo1 foo2 foo3 foo4

ㄴ construct new map -> split map을 하면서 쓰게됨

poc로 보자면 차피 target_map은 루트임 ㅅㄱ represation이나 뭐나 다 안맞음 ㅇㅇ

중간에 몇개만 맞거나 그런거는 그 이후에 (FOO를 찾았으면 FOO를 가지고있는 상태의 MAP) transitions에 해당하는 그게 있는게 아니기때문에 deprecated map이 되지않음

poc처럼 못찾았다면?

TRANSITIONS MAP -> ROOT
SPLIT_NOF SEARCH TARGET -> FOO

ROOT에는 FOO를 가지고있는게 있음 REPRESIONS같은것이 다를뿐
그 다른 MAP을 찾고 그 MAP에 해당하는 transitions들을 싺다 deprecated map으로 지정함

이 맵을 따로 쳐 쓰지않고, 걍 새로 만드는 작업을하면서 그 FOO MAP을 덮어 버려서 안쓴다고 지정함 (이때 이 맵 자체를 ROOT MAP에서 REMOVE 하기때문에 transitions array에 들어가있는 MAP도 deprecated map으로 지정됨)

그렇게 되서 덮어버리면 ROOT -> {FOO:Object} 맵을 가지고있는걸로 바뀜
그 상태에서 이제 sealed symbols가 dictionary 형태인 객체의 MAP이 바뀐다면? root의 foo transition를 바꾸게되고 그 이후에 sealeds kind를 가진 객체의 elements를 바꿀라하니까
findtargetMap으로 sealed symbols와 맞는 MAP을 찾게됨으로 sealed symbols이지만 dictonary elements kind를 가지고있는 객체를 재활용하게됨으로 OOB가 일어남 ㅈㅈ ~~
