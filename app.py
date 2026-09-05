import streamlit as st
import streamlit.components.v1 as components

from render import render_html

st.set_page_config(page_title="The Turning · What survives a life", page_icon="◌", layout="wide", initial_sidebar_state="collapsed")
st.markdown("""<style>
.stApp { background: #171923; }
.block-container { padding: 0 !important; max-width: 1900px; }
[data-testid="stHeader"] { background: transparent; height: 0; }
iframe { display: block; border: 0; }
</style>""", unsafe_allow_html=True)
components.html(render_html(), height=1170, scrolling=True)
