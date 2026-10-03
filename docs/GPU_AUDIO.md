# Optional user-run free-GPU audio notebook

This is a **reproducible fallback recipe, not an executed GPU benchmark**. CPU
results and any clips exceeding approximately 90 synthesis seconds are recorded
in AUDIO_BUILD.md. A GPU may reduce runtime; it does not establish pronunciation,
licensing or correctness. The same gates remain mandatory.

No notebook, account, hosted job, token upload or paid runtime was created by
the agent. If an existing Google Colab account offers a **free** GPU runtime,
select it under Runtime → Change runtime type → GPU. Availability, time limits,
RAM and quotas are not guaranteed. Do not purchase a tier to follow this recipe.

## 1. Upload only public build inputs

Locally create a source archive, without model weights, reports, private notes,
raw datasets, credentials, participant data or your home directory:

```sh
tar -czf /tmp/audio-source.tar.gz \
  scripts/__init__.py scripts/build_narration.py scripts/audio_quality.py \
  scripts/providers scripts/config src/content/en src/content/hi
```

Upload `audio-source.tar.gz` through the notebook Files panel. Then:

```python
from pathlib import Path
import tarfile
root = Path('/content/audio-source')
root.mkdir(exist_ok=True)
with tarfile.open('/content/audio-source.tar.gz') as bundle:
    # Python 3.12+: reject traversal and non-data archive entries.
    bundle.extractall(root, filter='data')
```

## 2. Keep the notebook's working CUDA Torch/torchaudio pair

Do **not** install the local CPU torch freeze in the GPU notebook. First record
its installed compatible GPU versions in a constraints file, then install
pinned TTS packages without allowing Torch/torchaudio replacement:

```python
import importlib.metadata as metadata
import subprocess, sys
import torch, torchaudio
assert torch.cuda.is_available(), 'No free GPU available; stop rather than assume one.'
constraints = Path('/content/gpu-constraints.txt')
constraints.write_text('\n'.join(f'{p}=={metadata.version(p)}' for p in ('torch','torchaudio'))+'\n')
subprocess.run([sys.executable, '-m', 'pip', 'install', '-c', str(constraints),
    'transformers==4.46.1', 'huggingface-hub==0.36.2',
    'soundfile==0.14.0', 'sentencepiece==0.2.2', 'psutil==7.2.2', 'scipy',
    'git+https://github.com/huggingface/parler-tts.git@d108732cd57788ec86bc857d99a6cabd66663d68',
    'git+https://github.com/descriptinc/audiotools@348ebf2034ce24e2a91a553e3171cb00c0c71678'], check=True)
subprocess.run([sys.executable, '-m', 'pip', 'check'], check=True)
subprocess.run(['ffmpeg', '-version'], check=True)
```

Restart the notebook kernel after package installation, then reimport/check
CUDA and the packages. Dependency failure is a blocker, not permission to
force an incompatible install. The GPU/software tuple differs from the tested
CPU environment and is recorded in generated provenance; no byte-equality
promise across environments. If FFmpeg is missing, use the notebook's standard
apt package install explicitly (`!apt-get -qq update && apt-get -qq install ffmpeg`)
and record `ffmpeg -version`.

## 3. Authenticate interactively and cache exact revisions

Use the account that has **already accepted** the Indic Parler conditions. Do
not accept a new agreement on somebody else's behalf. If required, invoke
`huggingface_hub.notebook_login()` interactively or use the notebook Secrets
panel; never put a token literal in a cell, save it with notebook output, print
it or upload local Hugging Face token files. A hosted notebook necessarily
contacts its provider and Hugging Face during preparation; this is not offline
or the app's runtime behavior.

```python
from huggingface_hub import snapshot_download
# from huggingface_hub import notebook_login
# notebook_login()  # interactive only, if this runtime is not authenticated
model = snapshot_download('ai4bharat/indic-parler-tts',
    revision='7b527af5ee8ed1f9a28d80b19703ed9bb8ba10ca',
    allow_patterns=['*.json','*.model','*.safetensors','README.md'])
snapshot_download('google/flan-t5-large',
    revision='0613663d0d48ea86ba8cb3d7a44f0f65dc596a2a',
    allow_patterns=['config.json','tokenizer.json','tokenizer_config.json',
      'special_tokens_map.json','spiece.model'])
snapshot_download('openai/whisper-small',
    revision='973afd24965f72e36ca33b3055d56a652f456b4d',
    allow_patterns=['config.json','generation_config.json','preprocessor_config.json',
      'tokenizer.json','tokenizer_config.json','special_tokens_map.json','added_tokens.json',
      'normalizer.json','vocab.json','merges.txt','model.safetensors','README.md'])
```

## 4. Generate offline with the same gates

```python
import os, subprocess, sys
from pathlib import Path
root = Path('/content/audio-source')
env = {**os.environ, 'HF_HUB_OFFLINE':'1', 'HF_HUB_DISABLE_TELEMETRY':'1',
       'OMP_NUM_THREADS':'4', 'MKL_NUM_THREADS':'4'}
subprocess.run([sys.executable, '-u', str(root/'scripts/build_narration.py'),
    '--model-dir', model, '--device', 'cuda:0'], cwd=root, env=env, check=True)
```

Whisper remains CPU in this implementation; TTS uses GPU. Keep signal, EOS,
quantity/CER and duplicate gates. Do not weaken gates for quota failures or
regenerate indefinitely. A failed full set remains explicitly incomplete.

## 5. Export only inspected speech artifacts

Create/download an archive of `public/audio/` plus the public build report and
audition report, **not** the model/cache/venv/notebook credentials. On the local
checkout inspect paths, copy only passed Opus/manifest, then run:

```sh
node scripts/check-audio.mjs
npm run check:content
npm run build
npm run test:browser
npm run release
```

Listen/native review and unresolved publication decisions remain separate.
Stop/delete the hosted runtime when finished. Never transfer participant data
or a private Hugging Face cache to the notebook.
