const dotenv = require('dotenv');
const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

dotenv.config();

const safeBase = path.resolve(process.env.FILES_DIR || path.resolve(__dirname, 'uploads'));

// Allowed extensions and MIME types
const allowedExtensions = ['.gif', '.jpg', '.png'];
const allowedMimeTypes = ['image/gif', 'image/jpeg', 'image/png'];

// File filter
function fileFilter(req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!allowedExtensions.includes(ext) || !allowedMimeTypes.includes(file.mimetype)) {
        return cb(new Error('Invalid file type'));
    }
    cb(null, true);
}

function checkApiKey(req, res) {
    if (req.headers["x-api-key"] !== process.env.API_KEY) {
        res.status(403).json({ error: 'Forbidden' });
        return false;
    }
    return true;
}

const app = express();
const port = process.env.PORT || 3000;
app.enable('trust proxy');

app.get('/:folder/:file', (req, res) => {
    try {
        if (!checkApiKey(req, res)) return;
        
        const filePath = path.resolve(path.normalize(path.join(safeBase, req.params.folder, req.params.file)));

        if (!filePath.startsWith(safeBase)) {
            return res.status(400).json({ error: 'Invalid path' });
        }

        if (fs.existsSync(filePath)) {
            res.sendFile(filePath, { headers: { 'Cache-Control': 'public, max-age=31536000' } });
        } else {
            res.status(404).json({ error: 'File not found' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/:folder', (req, res) => {
    try {
        if (!checkApiKey(req, res)) return;
        
        const dirPath = path.resolve(path.normalize(path.join(safeBase, req.params.folder)));

        if (!dirPath.startsWith(safeBase)) {
            return res.status(400).json({ error: 'Invalid path' });
        }

        if (fs.existsSync(dirPath)) {
            const files = fs.readdirSync(dirPath);
            res.json({ files });
        } else {
            res.status(404).json({ error: 'Directory not found' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.head('/:folder/:file', (req, res) => {
    try {
        if (!checkApiKey(req, res)) return;

        const filePath = path.resolve(path.normalize(path.join(safeBase, req.params.folder, req.params.file)));

        if (!filePath.startsWith(safeBase)) {
            return res.status(400).json({ error: 'Invalid path' });
        }

        if (fs.existsSync(filePath)) {
            const stats = fs.statSync(filePath);
            
            res.set({
                'Content-Length': stats.size,
                'Last-Modified': stats.mtime.toUTCString(),
                'Created-At': stats.birthtime.toUTCString(),
                'Cache-Control': 'public, max-age=31536000'
            });

            res.status(200).end();
        } else {
            res.status(404).json({ error: 'File not found' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.head('/:folder', (req, res) => {
    try {
        if (!checkApiKey(req, res)) return;

        const dirPath = path.resolve(path.normalize(path.join(safeBase, req.params.folder)));

        if (!dirPath.startsWith(safeBase)) {
            return res.status(400).json({ error: 'Invalid path' });
        }

        if (fs.existsSync(dirPath)) {
            const files = fs.readdirSync(dirPath);

            let totalSize = 0;

            files.forEach(file => {
                const stats = fs.statSync(path.join(dirPath, file));
                totalSize += stats.size;
            });

            res.set({
                'Content-Length': totalSize
            });

            res.status(200).end();
        } else {
            res.status(404).json({ error: 'File not found' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.post('/:folder/:file', (req, res) => {
    try {
        if (!checkApiKey(req, res)) return;

        const storage = multer.diskStorage({
            destination: (req, file, cb) => {
                const targetDir = path.resolve(path.join(safeBase, req.params.folder));

                if (!targetDir.startsWith(safeBase)) {
                    return cb(new Error('Invalid folder path'));
                }

                fs.mkdirSync(targetDir, { recursive: true });
                cb(null, targetDir);
            },
            filename: (req, file, cb) => {
                const safeName = req.params.file.replace(/[^a-zA-Z0-9.\-_]/g, '_');
                cb(null, safeName);
            }
        });

        const upload = multer({
            storage,
            fileFilter,
            limits: { fileSize: 10 * 1024 * 1024 } // 10 MB
        });

        upload.single('file')(req, res, (err) => {
            if (err) {
                return res.status(400).json({ error: 'Upload failed', details: err.message });
            }
            res.json({ message: 'File uploaded successfully' });
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.delete('/:folder/:file', (req, res) => {
    try {
        if (!checkApiKey(req, res)) return;

        const filePath = path.resolve(path.normalize(path.join(safeBase, req.params.folder, req.params.file)));

        if (!filePath.startsWith(safeBase)) {
            return res.status(400).json({ error: 'Invalid path' });
        }

        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            res.json({ message: 'File deleted successfully' });
        } else {
            res.status(404).json({ error: 'File not found' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.delete('/:folder', (req, res) => {
    try {
        if (!checkApiKey(req, res)) return;
        
        const dirPath = path.resolve(path.normalize(path.join(safeBase, req.params.folder)));

        if (!dirPath.startsWith(safeBase)) {
            return res.status(400).json({ error: 'Invalid path' });
        }

        if (fs.existsSync(dirPath)) {
            fs.rmdirSync(dirPath, { recursive: true, force: true });
            res.json({ message: 'Directory deleted successfully' });
        } else {
            res.status(404).json({ error: 'Directory not found' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.listen(port, () => {
    console.log(`File server running on http://localhost:${port}`);
});
