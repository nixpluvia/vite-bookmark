import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import tailwindcss from '@tailwindcss/vite'
import fs from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const rootDir = dirname(fileURLToPath(import.meta.url));

// https://vite.dev/config/
export default defineConfig({
  server: {
    watch: {
      // 저장 API가 이 파일을 갱신해도 개발 서버 리로드가 발생하지 않도록 제외
      ignored: ['**/public/data/bookmarks.json'],
    },
  },
  plugins: [
    tailwindcss(),
    react(),
    babel({ presets: [reactCompilerPreset()] }),
    {
      name: 'save-json-api',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          // /api/save-bookmarks 경로로 온 POST 요청을 처리
          if (req.url === '/api/read-bookmarks' && req.method === 'POST') {
            const filePath = resolve(rootDir, 'public/data/bookmarks.json');
            fs.readFile(filePath, 'utf-8', (err, data) => {
              if (err) {
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: 'Failed to read bookmarks' }));
                return;
              }
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.end(data);
            });
          } else if (req.url === '/api/save-bookmarks' && req.method === 'POST') {
            let body = '';
            req.on('data', chunk => { body += chunk; });
            req.on('end', () => {
              const data = JSON.parse(body);
              const filePath = resolve(rootDir, 'public/data/bookmarks.json');
              
              // 파일 저장 실행
              fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
              
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true }));
            });
          }
          else if (req.url === '/api/upload-image' && req.method === 'POST') {
            const fileName = `img_${Date.now()}.webp`;
            const imagesDir = resolve(rootDir, 'public/images');
            const filePath = resolve(imagesDir, fileName);

            if (!fs.existsSync(imagesDir)) {
              fs.mkdirSync(imagesDir, { recursive: true });
            }

            const fileStream = fs.createWriteStream(filePath);
            req.pipe(fileStream);

            fileStream.on('finish', () => {
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ fileName }));
            });

            fileStream.on('error', (err) => {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: err.message }));
            });
          }
          else if (req.url === '/api/delete-image' && req.method === 'POST') {
            let body = '';
            req.on('data', chunk => { body += chunk; });
            req.on('end', () => {
              const { fileName } = JSON.parse(body);
              const filePath = resolve(rootDir, 'public/images', fileName);
              if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
              }
              res.end(JSON.stringify({ success: true }));
            });
          }
          else {
            next();
          }
        });
      }
    }
  ],
})
