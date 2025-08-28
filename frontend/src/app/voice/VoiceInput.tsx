'use client'
import { useState, useRef } from 'react'


export default function VoiceInput(){
const [recording, setRecording] = useState(false)
const [transcript, setTranscript] = useState('')
const mediaRecorderRef = useRef<MediaRecorder | null>(null)
const chunksRef = useRef<BlobPart[]>([])


const start = async ()=>{
try{
const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
const mr = new MediaRecorder(stream)
mediaRecorderRef.current = mr
chunksRef.current = []
mr.ondataavailable = (e)=> chunksRef.current.push(e.data)
mr.onstop = async ()=>{
const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
const fd = new FormData()
fd.append('file', blob, 'voice.webm')
const base = process.env.NEXT_PUBLIC_API_BASE || ''
const res = await fetch(`${base}/api/speech`, { method: 'POST', body: fd })
const j = await res.json()
setTranscript(j.text || '(no text)')
}
mr.start()
setRecording(true)
}catch(err){
alert('Microphone access denied or not available')
}
}


const stop = ()=>{
mediaRecorderRef.current?.stop()
mediaRecorderRef.current = null
setRecording(false)
}


return (
<div className="p-4 border rounded">
<button onClick={recording?stop:start} className="px-4 py-2 rounded bg-blue-600 text-white">
{recording? 'Stop' : 'Speak'}
</button>
<p className="mt-3">Transcript: <span className="font-medium">{transcript}</span></p>
</div>
)
}