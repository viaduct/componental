import React, {useState} from 'react';
import logo from './logo.svg';
import './App.css';
import GC from './componental';
import "./components/topic";

function App() {
  const [anyValue, setAnyValue] = useState<number>(0);
  const [dap, setDap] = useState<string>("답을 알려줘 쎄이 썸띵");

  return (
    <div className="App">
      <GC.A
        style={{width: 140}}
        title={"안녕"}
        description={"로봇들!"}
        anyValue={anyValue}
        onAnyValueChange={setAnyValue}
        dap={dap}
        onDapChange={setDap}
        onSelect={()=>alert("선택되었습니다!")}
        tak={[
          {
            id: "123",
            items: [
            {id: "asf", name: "김희원", desc: "변태"},
            {id: "asfd", name: "한상준", desc: "똑똑똑이"},
          ]},
          {
            id: "234",
            name: "뻑",
            desc: "뻑이가요",
          }
        ]}
      />

      <GC.Topic
        style={{width: 200}}
        title={"마왕 김희원"}
        description={"오늘도 마왕의 책을 본다"}
        lastActionTakenAt={new Date()}
        tags={[{label: '123'}, {label: 'asf'}, {label: 'abc'}]}
        onSelect={()=>alert("선택")}
        onMultiSelect={()=>alert("멀티 선택")}
        onEdit={()=>alert("수정")}
        onDelete={()=>alert("삭제")}
        onMerge={()=>alert("합치기")}
        assignedUsers={[
          {
            id: "1",
            name: "김딱수",
            job: "백수",
            age: "24",
            comment: "하지만 복권을 긁어서일획천금의 꿈을 꾸고 있습니다",
            children: [
              {
                id: "2",
                name: "김철수",
                job: "학생",
                age: "13",
                comment: "저희 아버지처럼 안 되려고 교과서 모델로 일하고있어요",
                children: [
                  {
                    id: "3",
                    name: "김영희",
                    job: "아기",
                    age: "2",
                    comment: "아니 왜 13살 꼬맹이가 애가 있는데",
                    children: [
                      {
                        id: "4",
                        name: "김미래",
                        job: "정자도아님",
                        age: "??",
                        comment: "미래의 응애!"
                      }
                    ]
                  }
                ]
              }
            ]
          },
          {
            id: "5",
            name: "빵집CEO",
            job: "빵집 종업원",
            age: "32",
            comment: "하루하루 근근히 벌어먹고있지만 저 사장놈의 뒤통수를 쳐서 내가 CEO가 될 생각입니다",
          },
          {
            id: "6",
            name: "(고)스티브잡스",
            job: "(구)애플 CEO",
            age: "??",
            comment: "아니 이 엠생들아;;",
          },
        ]}
      />
      {/*<header className="App-header">*/}
      {/*  <img src={logo} className="App-logo" alt="logo" />*/}
      {/*  <p>*/}
      {/*    Edit <code>src/App.tsx</code> and save to reload.*/}
      {/*  </p>*/}
      {/*  <a*/}
      {/*    className="App-link"*/}
      {/*    href="https://reactjs.org"*/}
      {/*    target="_blank"*/}
      {/*    rel="noopener noreferrer"*/}
      {/*  >*/}
      {/*    Learn React*/}
      {/*  </a>*/}
      {/*</header>*/}
    </div>
  );
}

export default App;
