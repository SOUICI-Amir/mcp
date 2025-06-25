import gradio as gr
import requests
import json

def generate_flow_interface(goal, context, equipment_json):
    try:
        equipment = json.loads(equipment_json)
    except json.JSONDecodeError:
        return "❌ Erreur : Le champ 'Équipements' n'est pas un JSON valide."

    payload = {
        "goal": goal,
        "context": context,
        "equipment": equipment
    }

    try:
        response = requests.post("http://localhost:3000/generate_flow", json=payload)
        if response.status_code == 200:
            return json.dumps(response.json(), indent=2)
        else:
            return f"❌ Erreur serveur : {response.status_code} – {response.text}"
    except Exception as e:
        return f"❌ Exception : {str(e)}"


demo = gr.Interface(
    fn=generate_flow_interface,
    inputs=[
        gr.Textbox(label="🎯 Objectif", placeholder="Ex : Scanner et déplacer une batterie..."),
        gr.Textbox(label="🌍 Contexte", placeholder="Ex : Ligne de démantèlement robotique"),
        gr.Textbox(label="🛠️ Équipements (JSON)", lines=10, placeholder='[{"name": "Scanner3D", "actions": ["scan"], "events": ["onScanComplete"], "properties": ["status"]}]')
    ],
    outputs=gr.Code(label="📦 Flow Node-RED (JSON)"),
    title="🧠 Générateur de Flow Node-RED via LLM",
    description="Cette application utilise un LLM (DeepSeek) pour planifier et générer un flow Node-RED à partir d’un objectif, d’un contexte, et des équipements Web of Things (WoT)."
)

if __name__ == "__main__":
    demo.launch()
