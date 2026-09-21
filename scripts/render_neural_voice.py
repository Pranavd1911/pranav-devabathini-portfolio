"""Generate approved portfolio narration. Requires edge-tts and macOS afconvert.

Run with an environment containing edge-tts==7.2.8. Narration text is sent to
Microsoft's speech service; the published website plays local MP3 assets only.
"""
import array
import argparse
import asyncio
import json
import math
from pathlib import Path
import subprocess
import tempfile
import wave

import edge_tts

ROOT = Path(__file__).resolve().parent.parent
SCRIPTS = json.loads((ROOT / 'assets/audio/scripts.json').read_text())
VOICES = {
    'young': ('Young male · Brian', 'en-US-BrianNeural'),
    'india': ('Indian English · Prabhat', 'en-IN-PrabhatNeural'),
    'us': ('US English · Guy', 'en-US-GuyNeural'),
}


async def render(name, clip, key, voice, semaphore):
    async with semaphore:
        output = ROOT / 'assets/audio/neural' / key / f'{name}.mp3'
        output.parent.mkdir(parents=True, exist_ok=True)
        sentences = []
        # A slightly brighter delivery for the young-male profile, without
        # changing playback speed or shifting the pitch in the browser.
        speech = edge_tts.Communicate(clip['text'], voice,
            rate='+3%' if key == 'young' else '-3%',
            pitch='+3Hz' if key == 'young' else '+0Hz', boundary='SentenceBoundary')
        with output.open('wb') as audio:
            async for part in speech.stream():
                if part['type'] == 'audio':
                    audio.write(part['data'])
                elif part['type'] == 'SentenceBoundary':
                    sentences.append({'start': round(part['offset'] / 10_000_000, 3),
                                      'end': round((part['offset'] + part['duration']) / 10_000_000, 3),
                                      'text': part['text']})
        if output.stat().st_size < 1000:
            raise RuntimeError(f'Empty audio: {output}')
        with tempfile.TemporaryDirectory(prefix='portfolio-mouth-') as working:
            pcm = Path(working) / 'speech.wav'
            subprocess.run(['afconvert', '-f', 'WAVE', '-d', 'LEI16', str(output), str(pcm)], check=True)
            with wave.open(str(pcm), 'rb') as wav:
                sample_rate = wav.getframerate() * wav.getnchannels()
                samples = array.array('h', wav.readframes(wav.getnframes()))
            step = max(1, sample_rate // 12)
            levels = [math.sqrt(sum(v*v for v in samples[i:i+step]) / len(samples[i:i+step]))
                      for i in range(0, len(samples), step)]
            peak = sorted(levels)[int(len(levels)*.95)] or 1
            result = dict(clip, src=output.relative_to(ROOT).as_posix(),
                          duration=round(len(samples)/sample_rate, 3), mouthHz=12,
                          mouth=''.join('0' if v < peak*.12 else '1' if v < peak*.60 else '2' for v in levels),
                          sentences=sentences)
        print(key, name, result['duration'], 'seconds', len(sentences), 'caption cues', flush=True)
        return name, result


async def main(selected=None):
    voices = {}
    metadata = ROOT / 'voice-data.js'
    if selected and metadata.exists():
        voices, _ = json.JSONDecoder().raw_decode(metadata.read_text().split('Object.freeze(', 1)[1])
    semaphore = asyncio.Semaphore(2)
    for key, (label, voice) in VOICES.items():
        if selected and key != selected:
            continue
        clips = await asyncio.gather(*(asyncio.wait_for(render(name, clip, key, voice, semaphore), 150)
                                      for name, clip in SCRIPTS.items()))
        voices[key] = {'label': label, 'engine': voice, 'clips': dict(clips)}
    voices = {key: voices[key] for key in VOICES if key in voices}
    default = 'young' if 'young' in voices else 'india'
    metadata.write_text('window.PORTFOLIO_DEFAULT_VOICE = ' + json.dumps(default) + ';\n' +
        'window.PORTFOLIO_VOICES = Object.freeze(' +
        json.dumps(voices, ensure_ascii=False, indent=2) + ');\n' +
        'window.PORTFOLIO_VOICE_CLIPS = window.PORTFOLIO_VOICES[window.PORTFOLIO_DEFAULT_VOICE].clips;\n')


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--voice', choices=VOICES, help='Regenerate one voice, preserving the others.')
    asyncio.run(main(parser.parse_args().voice))
