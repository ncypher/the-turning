"""Assemble one portable document. No CDN or JavaScript build step at runtime."""
import base64
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent
MODULES = [
    'engine.js', 'story_arcs.js', 'premise.js', 'continuity.js',
    'scene.js', 'detail.js', 'tuning.js', 'polish.js',
    'motion_fix.js', 'refuge_visual.js', 'art.js', 'controls.js',
]


def module_url(filename):
    return 'data:text/javascript;base64,' + base64.b64encode((ROOT / filename).read_bytes()).decode('ascii')


def render_html():
    template = (ROOT / 'world.html').read_text(encoding='utf-8')
    imports = {'imports': {
        'three': module_url('vendor/three.module.js'),
        'three/addons/controls/OrbitControls.js': module_url('vendor/OrbitControls.js'),
    }}
    return (template.replace('__STYLE__', (ROOT / 'style.css').read_text(encoding='utf-8'))
            .replace('__IMPORTS__', json.dumps(imports))
            .replace('__MODULE__', '\n'.join((ROOT / name).read_text(encoding='utf-8') for name in MODULES)))
