import time
import streamlit as st
from groq import RateLimitError

from agent.graph import agent
from agent.tools import init_project_root, list_files, read_file

# --------------------------------------------------
# Page config
# --------------------------------------------------
st.set_page_config(
    page_title="AI Code Builder",
    layout="wide"
)

st.title("🤖 AI Code Builder")
st.write(
    "Describe the application you want to build. "
    "The AI planner, architect, and coder agents will generate real code files."
)

# --------------------------------------------------
# Ensure project directory exists
# --------------------------------------------------
init_project_root()

# --------------------------------------------------
# Session State (VERY IMPORTANT)
# --------------------------------------------------
if "generated" not in st.session_state:
    st.session_state.generated = False

if "last_prompt" not in st.session_state:
    st.session_state.last_prompt = ""

# --------------------------------------------------
# Prompt input (use form to avoid reruns)
# --------------------------------------------------
with st.form("code_builder_form"):
    prompt = st.text_area(
        "Enter your prompt",
        placeholder="Create a simple calculator web application using HTML, CSS and JavaScript",
        height=160
    )

    submitted = st.form_submit_button("🚀 Generate Code")

# --------------------------------------------------
# Run agent (guarded)
# --------------------------------------------------
if submitted and prompt.strip():

    # Reset state if new prompt
    if prompt != st.session_state.last_prompt:
        st.session_state.generated = False
        st.session_state.last_prompt = prompt

    if not st.session_state.generated:
        with st.spinner("🧠 Planning → 🏗 Architecting → 👨‍💻 Coding..."):
            try:
                agent.invoke(
                    {"user_prompt": prompt},
                    {"recursion_limit": 100}
                )
                st.session_state.generated = True
                st.success("✅ Code generation completed!")

            except RateLimitError:
                st.warning("⏳ Rate limit hit. Retrying in 2 seconds...")
                time.sleep(2)

                agent.invoke(
                    {"user_prompt": prompt},
                    {"recursion_limit": 100}
                )
                st.session_state.generated = True
                st.success("✅ Code generation completed!")

# --------------------------------------------------
# Show generated files
# --------------------------------------------------
st.divider()
st.subheader("📁 Generated Project Files")

files = list_files.run(".")

if files and files != "No files found.":

    file_list = files.split("\n")

    for file_path in file_list:
        with st.expander(file_path):
            content = read_file.run(file_path)

            # Syntax highlighting
            if file_path.endswith(".html"):
                lang = "html"
            elif file_path.endswith(".css"):
                lang = "css"
            elif file_path.endswith(".js"):
                lang = "javascript"
            elif file_path.endswith(".py"):
                lang = "python"
            else:
                lang = "text"

            st.code(content, language=lang)

else:
    st.info("No files generated yet. Enter a prompt and click **Generate Code**.")
