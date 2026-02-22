import json

def analyze():
    with open('/Users/antonio/.local/share/opencode/tool-output/tool_c87420165001YodUFy5sJOhoa1', 'r') as f:
        schema = json.load(f)

    results = {}

    # 1. agent
    results['agent'] = schema.get('properties', {}).get('agent')

    # 2. mcp
    results['mcp'] = schema.get('properties', {}).get('mcp')

    # 3. anyOf, oneOf, allOf
    unions = []
    def find_unions(obj, path=''):
        if isinstance(obj, dict):
            for key in ['anyOf', 'oneOf', 'allOf']:
                if key in obj:
                    unions.append({'path': path, 'key': key, 'definition': obj})
                    break
            for k, v in obj.items():
                new_path = f"{path}.{k}" if path else k
                find_unions(v, new_path)
        elif isinstance(obj, list):
            for i, item in enumerate(obj):
                find_unions(item, f"{path}[{i}]")

    find_unions(schema)
    results['unions'] = unions

    # 4. Records (additionalProperties)
    records = []
    def find_records(obj, path=''):
        if isinstance(obj, dict):
            if 'additionalProperties' in obj and obj['additionalProperties'] not in [True, False]:
                records.append({'path': path, 'definition': obj})
            for k, v in obj.items():
                new_path = f"{path}.{k}" if path else k
                find_records(v, new_path)
        elif isinstance(obj, list):
            for i, item in enumerate(obj):
                find_records(item, f"{path}[{i}]")

    find_records(schema)
    results['records'] = records

    # 5. provider
    results['provider'] = schema.get('properties', {}).get('provider')

    # 6. tools
    results['tools'] = schema.get('properties', {}).get('tools')

    # 7. command
    results['command'] = schema.get('properties', {}).get('command')

    # 8. Array properties
    arrays = []
    def find_arrays(obj, path=''):
        if isinstance(obj, dict):
            if obj.get('type') == 'array':
                arrays.append({'path': path, 'items': obj.get('items')})
            for k, v in obj.items():
                new_path = f"{path}.{k}" if path else k
                find_arrays(v, new_path)
        elif isinstance(obj, list):
            for i, item in enumerate(obj):
                find_arrays(item, f"{path}[{i}]")

    find_arrays(schema)
    results['arrays'] = arrays

    print(json.dumps(results, indent=2))

if __name__ == "__main__":
    analyze()
