from pathlib import Path
import subprocess, json, wave, math, array
root=Path(__file__).resolve().parent.parent
clips=json.loads((root/'assets/audio/scripts.json').read_text())
working=Path('/private/tmp/portfolio-voice'); working.mkdir(exist_ok=True)
for name, clip in clips.items():
    textfile=working/(name+'.txt'); textfile.write_text(clip['text'])
    intermediate=working/(name+'.aiff')
    output=root/'assets/audio'/(name+'.wav')
    subprocess.run(['say','-v','Rishi','-r','168','-f',str(textfile),'-o',str(intermediate)],check=True)
    subprocess.run(['afconvert','-f','WAVE','-d','LEI16',str(intermediate),str(output)],check=True)
    with wave.open(str(output),'rb') as wav:
        rate=wav.getframerate(); channels=wav.getnchannels()
        samples=array.array('h',wav.readframes(wav.getnframes()))
        step=max(1,int(rate*channels/10))
        loudness=[math.sqrt(sum(v*v for v in samples[i:i+step])/max(1,len(samples[i:i+step]))) for i in range(0,len(samples),step)]
        if not loudness:
            raise RuntimeError('No speech audio was generated. Run this script with access to the macOS speech service.')
        peak=max(loudness) or 1
        clip['mouth']= ''.join('0' if x<peak*.06 else '1' if x<peak*.32 else '2' for x in loudness)
        clip['duration']=round(len(samples)/(rate*channels),2)
        clip['src']='assets/audio/'+name+'.wav'
        print(name,clip['duration'],'seconds',flush=True)
(root/'voice-data.js').write_text('window.PORTFOLIO_VOICE_CLIPS = Object.freeze('+json.dumps(clips,ensure_ascii=False,indent=2)+');\n')
