
import React, {useEffect,useState} from 'react'
const Editor = ({value,onChange}) => <textarea value={value} onChange={e=>onChange(e.target.value)} style={{width:'100%',height:300,fontFamily:'monospace'}}/>
export default function App(){
  const [problems,setProblems]=useState([]); const [sel,setSel]=useState(null); const [lang,setLang]=useState('python'); const [code,setCode]=useState(''); const [res,setRes]=useState(null);
  useEffect(()=>{ fetch('/api/problems').then(r=>r.json()).then(setProblems) },[])
  useEffect(()=>{ if(!sel) return; fetch('/api/problem/'+sel.id).then(r=>r.json()).then(p=>{ setLang(p.languages[0]||'python'); setCode((p.stub&&p.stub[p.languages[0]])||'') }) },[sel?.id])
  const run=async()=>{ const files={}; if(lang==='python') files['Main.py']=code; else if(lang==='cpp') files['Main.cpp']=code; else files['code.txt']=code;
    const r=await fetch('/api/submit',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({problemId:sel.id,language:lang,files})}); setRes(await r.json()) }
  return <div style={{display:'grid',gridTemplateColumns:'260px 1fr',height:'100vh'}}>
    <aside style={{borderRight:'1px solid #ddd',padding:12,overflow:'auto'}}><h3>Problems</h3><ul>{problems.map(p=><li key={p.id}><button onClick={()=>setSel(p)}>{p.title}</button></li>)}</ul></aside>
    <main style={{padding:16}}>{sel? <><h2>{sel.title}</h2><pre style={{whiteSpace:'pre-wrap',background:'#f9f9f9',padding:8}}>{sel.statement}</pre>
      <div><select value={lang} onChange={e=>setLang(e.target.value)}>{sel.languages.map(l=><option key={l}>{l}</option>)}</select></div>
      <Editor value={code} onChange={setCode}/><button onClick={run} style={{marginTop:12}}>Run</button>
      {res && <div><h3>Verdict: {res.verdict}</h3><table border="1" cellPadding="6"><thead><tr><th>Test</th><th>Status</th><th>ms</th><th>Msg</th></tr></thead>
      <tbody>{(res.tests||[]).map((t,i)=><tr key={i}><td>{t.name}</td><td>{t.status}</td><td>{t.time_ms}</td><td>{t.message}</td></tr>)}</tbody></table></div>}</> : 'Select a problem'}</main>
  </div>
}
