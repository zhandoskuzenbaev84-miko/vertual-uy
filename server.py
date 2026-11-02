"""
Toshkent City 360° Virtual Tour - Local HTTP Server
Double click start_tour.bat or run `python server.py` to start.
"""
import http.server
import socketserver
import webbrowser
import os
import sys

PORT = 8080

os.chdir(os.path.dirname(os.path.abspath(__file__)))

class CustomHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Enable CORS and caching headers
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Cache-Control', 'no-cache, must-revalidate')
        super().end_headers()

def run_server():
    try:
        with socketserver.TCPServer(("", PORT), CustomHTTPRequestHandler) as httpd:
            url = f"http://localhost:{PORT}"
            print("=" * 60)
            print(f"🏠 Virtual Uy Sayohati serveri ishga tushdi!")
            print(f"🌐 Brauzerda ochish manzili: {url}")
            print(f"🛑 To'xtatish uchun: Ctrl + C bosing")
            print("=" * 60)
            
            # Open browser automatically
            try:
                webbrowser.open(url)
            except Exception as e:
                print(f"Brauzerni avtomatik ochishda xato: {e}")

            httpd.serve_forever()
    except OSError as e:
        if e.errno == 98 or e.errno == 10048:
            alt_port = 8081
            print(f"Port {PORT} band, {alt_port}-portda ishga tushirilmoqda...")
            with socketserver.TCPServer(("", alt_port), CustomHTTPRequestHandler) as httpd:
                url = f"http://localhost:{alt_port}"
                webbrowser.open(url)
                httpd.serve_forever()
        else:
            raise

if __name__ == '__main__':
    run_server()
