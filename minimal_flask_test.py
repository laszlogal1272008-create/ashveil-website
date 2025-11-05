#!/usr/bin/env python3
"""
Minimal Bot API Test
"""

from flask import Flask, jsonify
import logging

logging.basicConfig(level=logging.DEBUG)

app = Flask(__name__)

@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'Bot API Running',
        'message': 'Test successful'
    })

@app.route('/', methods=['GET'])
def root():
    return jsonify({
        'message': 'Bot API Server',
        'endpoints': ['/health', '/api/player/slay']
    })

if __name__ == '__main__':
    print("Starting minimal Flask test...")
    app.run(host='127.0.0.1', port=5000, debug=True)