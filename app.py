from pathlib import Path
import streamlit as st
import streamlit.components.v1 as components

st.set_page_config(page_title="The Turning", page_icon="◌", layout="wide", initial_sidebar_state="collapsed")
st.markdown("""<style>.stApp{background:#090b0f}[data-testid="stHeader"]{background:transparent}.block-container{padding:.75rem 1rem 1rem;max-width:1800px}iframe{border-radius:18px}</style>""", unsafe_allow_html=True)

root = Path(__file__).parent
template = (root / "world.html").read_text(encoding="utf-8")
module = (
    (root / "engine.js").read_text(encoding="utf-8")
    + "\n"
    + (root / "story_arcs.js").read_text(encoding="utf-8")
    + "\n"
    + (root / "scene.js").read_text(encoding="utf-8")
    + "\n"
    + (root / "detail.js").read_text(encoding="utf-8")
    + "\n"
    + (root / "tuning.js").read_text(encoding="utf-8")
    + "\n"
    + (root / "polish.js").read_text(encoding="utf-8")
    + "\n"
    + (root / "motion_fix.js").read_text(encoding="utf-8")
    + "\n"
    + (root / "premise.js").read_text(encoding="utf-8")
    + "\n"
    + (root / "refuge_visual.js").read_text(encoding="utf-8")
)
components.html(template.replace("__MODULE__", module), height=900, scrolling=False)
