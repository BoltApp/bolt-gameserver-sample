# -*- mode: Python -*-

# Install dependencies and run backend server
local_resource(
    "server",
    serve_cmd="""
        cd server && 
        npm install && 
        if [ ! -f gamestore.db ]; then npm run seed; fi && 
        npm run dev
    """,
    serve_env={
        "HOST": "localhost"
    },
    deps=["./server/src/", "./server/package.json"],
    ignore=["./server/node_modules/", "./server/gamestore.db"],
    links=["http://localhost:3111"]
)

# Install dependencies and run frontend client
local_resource(
    "client",
    serve_cmd="""
        cd client && 
        npm install && 
        npm run dev
    """,
    deps=["./client/src/", "./client/package.json"],
    ignore=["./client/node_modules/", "./client/dist/"],
    links=["http://localhost:4264"]
)

# Setup ngrok tunnel for external access
ngrok_hostname = os.environ.get('NGROK_HOSTNAME')
if not ngrok_hostname:
    if 'BL_DOMAIN' in os.environ:
        ngrok_hostname = "gaming." + os.environ['BL_DOMAIN'] + ".dev.bolt.me"
    else:
        ngrok_hostname = ""  # Empty means use ngrok's free random hostname

# Build ngrok command - use hostname flag only if hostname is specified
if ngrok_hostname:
    ngrok_cmd = "ngrok http 4264 --hostname " + ngrok_hostname + " --log stdout"
else:
    ngrok_cmd = "ngrok http 4264 --log stdout"

local_resource(
    "ngrok",
    serve_cmd=ngrok_cmd,
    serve_env={'NGROK_AUTHTOKEN': os.environ['BL_NGROK']},
    links=["http://localhost:4040"]
)