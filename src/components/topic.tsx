import GC from "../componental";
import moment from "moment";

GC.Topic = (p: any)=>{
  return (
    <div style={{border: "1px solid black", display: "inline-block"}}>
      <h4>{p.title}</h4>
      <h6>{p.description}</h6>
      <p>{moment(p.lastActionTakenAt).calendar()}</p>
      <button onClick={p.onSelect}>선택</button>
      <button onClick={p.onMultiSelect}>다중선택</button>
      <button onClick={p.onEdit}>수정</button>
      <button onClick={p.onDelete}>삭제</button>
      <button onClick={p.onMerge}>합치기</button>
    </div>
  );
};
