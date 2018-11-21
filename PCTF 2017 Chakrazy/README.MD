*(args) IDX, *(args+8) ptr로 concat 인자로 들어간 array 다 저장하고있다 ~
ArraySpeciesCreate()로 pDestArray 설정을 함
안에서 constructor를 가져오고 object라면 constructor[Symbol.species]를 가져와서 호출을 해주고 반환값을 pDestArray로 쓴다.
concatintargs에서 symbol.IsConcatSpreadable을 가져오는데 이것도 위에있는것처럼 가져와서 호출을해주고 반환값을 가져옴
둘다 대충 GetPropertyName으로 위에 가져오는거 이름에 해당하는 ProportyIDX로 [ThreadContext::어찌구하는 주소에+0x98]+0x98에   
0xfffffff5 + ProportyIDX를 해주고 shl 4를 해줘서 Name을 가져온다.
GetPropertyFromDescriptorlast 로 함수를 불러오고 함수를 콜하고 반환값 얻어온다. (흠 분석 이상하게해서 틀렸을수도 ㅎㅎ;)

ConcatIntArgs로 들어가서 (args)aItem이 NativeIntArray일때  CopyNativeIntArrayElements(pDestArray, idxDest, pItemArray)를 호출한다.
while문으로 DirectSetItem함수를 써서 *(ptr+0x30)+(N*4)+0x18)를 pDestArray에 넣어준다. *(ptr+0x44) 인덱스랑 비교하면서 진행함 Direct(pDestArray,targetIDX,targetValue)
*(arg0+0x30)+(arg1*4)+0x18 = arg2 (*(aItem+0x30)+(N*4)+0x18)

(args)aItem이 NativeArray일때 ConvertToVarArray(JavascriptNativeIntArray *pIntArray)로 pDestArray를 인자로 호출한다.
익스 시나리오대로 쭈우우욱 실행을하다보면 저 함수를 실행할때 JavascriptArray 타입인 pDestArray가 인자로 들어갈것이다. 
pDestArray[0]에 변수를 넣은상태다 ! 
pDestArray[0] = 0x7f.... 
pDestArray[1] = 1 
위와 같은 상태가 될것이다. NativeIntArray로 생각을 하고 함수를 실행하기 때문에 typeConfusion이 터진다 ~~
ConverToVarArray 함수에서 세그먼트(arg+0x30) NativeArray type 8byte형을 저장할 주소를 새로 만들고 NativeIntArray로 생각을 하기때문에 4byte단위로 복사를 한다. 
그렇게 4byte로 실행이되서 pDestArray[1] = 0x10000007fab pDestArray[0] = 0x100000cdefghab
주소가 이렇게 짤려서 Object로 인식을 하지 않기때문에 주소가 릭이 된다.

공격은 4byte씩 주소를 넣게되면 pDestArray[0] = 0x1234 [1] = 5678abcd 이렇게 되어있는 데이터가 type confusion으로 [0] = 0x12345678abcd가
되어서 Object로 인식을 시킬수있다. 
FakeDataview 만들어서 익스하면된다.








