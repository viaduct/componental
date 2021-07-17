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
        title={"안녕"}
        description={"로봇들!"}
        anyValue={anyValue}
        onAnyValueChange={setAnyValue}
        dap={dap}
        onDapChange={setDap}
        onSelect={()=>alert("선택되었습니다!")}
      />

      <GC.Topic
        title={"마왕 김희원"}
        description={"오늘도 마왕의 책을 본다"}
        lastActionTakenAt={new Date()}
        tags={['123', 'asf', 'abc']}
        onSelect={()=>alert("선택")}
        onMultiSelect={()=>alert("멀티 선택")}
        onEdit={()=>alert("수정")}
        onDelete={()=>alert("삭제")}
        onMerge={()=>alert("합치기")}
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
