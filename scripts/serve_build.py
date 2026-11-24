#!/usr/bin/env python3
"""
Simple HTTP server to serve the static build folder for testing.
Usage: python serve_build.py [port]
Default port: 8080
"""

import sys
import os
from http.server import HTTPServer, SimpleHTTPRequestHandler

# Get the build directory path (parent of this script's directory)
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
BUILD_DIR = os.path.join(os.path.dirname(SCRIPT_DIR), "build")


class BuildHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=BUILD_DIR, **kwargs)

    def end_headers(self):
        # Add CORS headers for local testing
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        super().end_headers()

    def log_message(self, format, *args):
        # Cleaner logging
        print(f"[{self.address_string()}] {format % args}")


if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8080

    if not os.path.exists(BUILD_DIR):
        print(f"Error: Build directory not found at {BUILD_DIR}")
        print("Run 'npm run build' first to generate the build folder.")
        sys.exit(1)

    os.chdir(BUILD_DIR)
    server = HTTPServer(("", port), BuildHandler)
    print(f"Serving {BUILD_DIR} at http://localhost:{port}")
    print("Press Ctrl+C to stop")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down...")
        server.shutdown()

