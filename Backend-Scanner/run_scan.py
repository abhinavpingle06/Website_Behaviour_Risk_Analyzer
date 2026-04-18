import sys
import asyncio
import json
from core.context import scan_url

url = sys.argv[1]

result = asyncio.run(scan_url(url))

print(json.dumps(result))