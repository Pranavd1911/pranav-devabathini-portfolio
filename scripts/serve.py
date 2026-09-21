"""Local preview with HTTP byte ranges for seekable narration and PDFs."""
import argparse
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parent.parent


class PortfolioHandler(SimpleHTTPRequestHandler):
    def send_head(self):
        self.byte_range = None
        requested = self.headers.get('Range')
        path = Path(self.translate_path(self.path))
        # Unknown range units, multiple ranges, and If-Range fall back to a
        # complete representation, as permitted by HTTP range semantics.
        match = re.fullmatch(r'bytes=(\d*)-(\d*)', requested or '')
        if not match or self.headers.get('If-Range') or not path.is_file():
            return super().send_head()
        file = path.open('rb')
        size = path.stat().st_size
        left, right = match.groups()
        if left:
            start = int(left)
            end = min(int(right), size - 1) if right else size - 1
        else:
            suffix = int(right or 0)
            start, end = max(0, size - suffix), size - 1
        if start >= size or start > end or (not left and not int(right or 0)):
            file.close()
            self.send_response(416)
            self.send_header('Content-Range', f'bytes */{size}')
            self.send_header('Content-Length', '0')
            self.end_headers()
            return None
        self.send_response(206)
        self.send_header('Content-Type', self.guess_type(str(path)))
        self.send_header('Content-Length', str(end - start + 1))
        self.send_header('Content-Range', f'bytes {start}-{end}/{size}')
        self.send_header('Last-Modified', self.date_time_string(path.stat().st_mtime))
        self.end_headers()
        file.seek(start)
        self.byte_range = (start, end)
        return file

    def end_headers(self):
        self.send_header('Accept-Ranges', 'bytes')
        super().end_headers()

    def copyfile(self, source, output):
        if self.byte_range is None:
            return super().copyfile(source, output)
        remaining = self.byte_range[1] - self.byte_range[0] + 1
        while remaining:
            chunk = source.read(min(64 * 1024, remaining))
            if not chunk:
                break
            output.write(chunk)
            remaining -= len(chunk)


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--port', type=int, default=8000)
    args = parser.parse_args()
    server = ThreadingHTTPServer(('127.0.0.1', args.port), partial(PortfolioHandler, directory=str(ROOT)))
    print(f'Portfolio: http://localhost:{args.port}', flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        server.server_close()
