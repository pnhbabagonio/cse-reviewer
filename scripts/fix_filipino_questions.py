import json
from pathlib import Path

path = Path(r'd:\cse-reviewer-app\src\data\filipino.json')
with path.open(encoding='utf-8') as f:
    data = json.load(f)

for item in data.get('questions', []):
    q = item.get('question', '')
    sub = item.get('subcategory', '')

    if not isinstance(q, str):
        continue

    q = q.strip()

    if sub == 'kasingkahulugan':
        if not q.startswith('Piliin ang kasingkahulugan ng salitang may salungguhit'):
            q = 'Piliin ang kasingkahulugan ng salitang may salungguhit.\n\n' + q
        q = q.replace('Mahirap pakinggan and', 'Mahirap pakinggan ang')
        q = q.replace('Ang pag-iibigan nina Florante at Laura ay', 'Ang pag-ibig nina Florante at Laura ay')

    elif sub == 'kasalungat':
        if not q.startswith('Piliin ang kasalungat ng salitang may salungguhit'):
            q = 'Piliin ang kasalungat ng salitang may salungguhit.\n\n' + q
        q = q.replace('Mahirap pakinggan and', 'Mahirap pakinggan ang')

    elif sub == 'kasabihan':
        if not q.startswith('Alin sa sumusunod ang kahulugan ng pahayag na'):
            q = 'Alin sa sumusunod ang kahulugan ng pahayag na: ' + q
        if not q.endswith('?'):
            q = q.rstrip('.') + '?'

    elif sub == 'gramatika':
        if not q.startswith('Piliin ang angkop na salita'):
            q = 'Piliin ang angkop na salita upang mabuo ang pangungusap.\n\n' + q
        if not q.endswith('?'):
            q = q.rstrip('.') + '?'

    elif sub == 'pagkilala_ng_mali':
        if not q.startswith('Alin sa bahagi ng pangungusap ang may mali'):
            q = 'Alin sa bahagi ng pangungusap ang may mali?\n\n' + q
        if not q.endswith('?'):
            q = q.rstrip('.') + '?'

    item['question'] = q

with path.open('w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)
    f.write('\n')
