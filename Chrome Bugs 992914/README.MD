https://chromium-review.googlesource.com/c/v8/v8/+/1760976


name store storeic_miss
idx store keyedstoreic_miss
MigrateInstance  keyedstoreic_miss migration_target setting ~~
keyedstoreic_miss(elements store) -> map is deprecated -> map migration_target set
*분석이 잘못된 부분이 있을수도 있습니다 ㅠㅠ
*정리하기 귀찮기도 해서 안 할라다가 갑자기 삘 받아서 적게 된거라 많이 더럽습니다 ㅠ 


1. 기본 사이즈, prototype가 ROOT 맵이랑 다를때
2. extensible이 루트와 다를때, ROOT 기준에서(all) transitions seald, frozen symbols를 검색했을때 old_map이 나오지 않았을때 
3. ELEMENTS KIND가 다르고 && 넣는 KIND가 SLOW KIND가 아니고 && (받는 OBJECT KIND가 FAST KIND인 상태에서 TYPE를 바꿔야할때) -> 타입을 바꿔야하는지 체크(안바꿔도된다면 그냥 END ~)
4. ROOT Deatils에 속해있는 데이터를 바꿀라할때 -> ROOT MAP에서 KIND던 LOCATION이던 바뀐거면 맵 안바꿈 (ROOT가 BASE가 되기때문에) 

-> 맵을 가져와서 덮어쓰거나 재활용? 을 해야 한다면 그 맵을 가지고와서 UPDATE 시키고, 없다면 ConstructNewMap으로 넘어가서 맵을 새로만든다


target map
1. 찾은 MAP을 기준으로 transitions로 검색을 함 (새로 추가되어서 맵이 바뀐 것을 토대로 쭊쭊 찾아감) -> transition에서 안보인다
2. 1번에서 찾았던 멈췄던 그 MAP의 NOF를 기준으로 한번더 검색한다 (앞에 부분은 다 맞고 중간에 몇개가 일치하지않고 그 뒤에 부분은 일치할때 검색용?)
3. 1번 transition 기본적인 MAP부분이 정확히 일치한 맵을 찾았다면 SEALED, FROZEN, NOEXTENSIBLE부분에서 있는지 없는지 검사함 없으면 새로 만들어야되니까 CONSTRUCT MAP으로 넘어가게된다


target_nof = 3;
old_nof = 4;

foo1 foo2 foo4
foo1 foo2 foo3 foo4

ㄴ construct new map -> split map을 하면서 쓰게됨

POC로 따지면 조건에 맞는 부분들(Representation같은 것들이 맞지 않아서 맵을 새로 만들어서 ROOT MAP에 덮어쓴다)

중간에 몇개만 맞거나 그런거는 그 이후에 (FOO를 찾았으면 FOO를 가지고있는 상태의 MAP) transitions에 해당하는 그게 있는게 아니기때문에 deprecated map이 되지않는다

poc처럼 못찾았다면?

TRANSITIONS MAP -> ROOT
SPLIT_NOF SEARCH TARGET -> FOO

ROOT에는 FOO를 가지고있는게 있음 REPRESIONS같은것이 다를뿐
그 다른 MAP을 찾고 그 MAP에 해당하는 transitions들을 싺다 deprecated map으로 지정하게 된다.

이 맵을 따로 쳐 쓰지않고, 걍 새로 만드는 작업을하면서 그 FOO MAP을 덮어 버려서 안쓴다고 지정한다 (이때 이 맵 자체를 ROOT MAP에서 REMOVE 하기때문에 transitions array에 들어가있는 MAP도 deprecated map으로 지정된다)

1. MAP을 덮어버리면 ROOT -> {FOO:Object} 맵을 가지고있는걸로 바뀌게 된다
2. 그 상태에서 sealed symbols가 dictionary 형태인 객체의 MAP이 바뀐다면? root의 foo transition를 바뀌게 된다
3, sealeds kind를 가진 객체의 elements를 바꿀라하니까 findtargetMap으로 sealed symbols와 맞는 MAP을 찾게됨으로 
   sealed symbols이지만 dictonary elements kind를 가지고있는 객체를 재활용하게됨으로 type confusion이 일어난다
