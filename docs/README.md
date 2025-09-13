# File Server API Documentation

Base URL: `http://localhost:3000`
All endpoints require the header:

```
x-api-key: YOUR_API_KEY
```

---

## **POST** `/:folder/:file`

- Uploads a file to a specific folder with the provided filename.
- Max file size: 10 MB
- Allowed file types: `.gif`, `.jpg`, `.png`

**Headers**:
```
x-api-key: YOUR_API_KEY
Content-Type: multipart/form-data
```

**Parameters**:  
- `:folder` → target folder name  
- `:file` → filename to save as

**Curl Example**:
```bash
curl -X POST http://localhost:3000/images/logo.png \
  -H "x-api-key: YOUR_API_KEY" \
  -F "file=@/absolute/path/to/myphoto.png"
```

**Success Response**:
```json
{
  "message": "File uploaded successfully"
}
```

**Error Responses**:
```json
{ "error": "Forbidden" }
{ "error": "Upload failed", "details": "Invalid file type" }
{ "error": "Internal Server Error" }
```

---

## **POST** `/:folder`

- Creates a folder with the provided folder name.

**Headers**:
```
x-api-key: YOUR_API_KEY
Content-Type: multipart/form-data
```

**Parameters**:  
- `:folder` → target folder name

**Curl Example**:
```bash
curl -X POST http://localhost:3000/images \
  -H "x-api-key: YOUR_API_KEY"
```

**Success Response**:
```json
{ "message": "Directory created successfully" }
{ "message": "Directory already exists" }
```

**Error Responses**:
```json
{ "error": "Forbidden" }
{ "error": "Internal Server Error" }
```

---

## **GET** `/:folder/:file`

- Returns the requested file if it exists.

**Curl Example**:
```bash
curl -X GET http://localhost:3000/images/logo.png \
  -H "x-api-key: YOUR_API_KEY" --output logo.png
```

**Error Responses**:
```json
{ "error": "Forbidden" }
{ "error": "Invalid path" }
{ "error": "File not found" }
{ "error": "Internal Server Error" }
```

---

## **GET** `/:folder`

- Returns the requested files from a directory if it exists.

**Curl Example**:
```bash
curl -X GET http://localhost:3000/images \
  -H "x-api-key: YOUR_API_KEY"
```

**Success Response**:
```json
{ "files": [ "test.png", "demo.jpg" ] }
```

**Error Responses**:
```json
{ "error": "Forbidden" }
{ "error": "Invalid path" }
{ "error": "File not found" }
{ "error": "Internal Server Error" }
```

---

## **HEAD** `/:folder/:file`

- Returns file information in headers without the file body.
- Headers returned:
  - `Content-Length` → file size in bytes  
  - `Last-Modified` → last modification date  
  - `Created-At` → creation date  
  - `Cache-Control` → caching info

**Curl Example**:
```bash
curl -I http://localhost:3000/images/logo.png \
  -H "x-api-key: YOUR_API_KEY"
```

**Error Responses**:
```json
{ "error": "Forbidden" }
{ "error": "Invalid path" }
{ "error": "File not found" }
{ "error": "Internal Server Error" }
```

---

## **HEAD** `/:folder`

- Returns `Content-Length` header with total size of all files in the folder.

**Curl Example**:
```bash
curl -I http://localhost:3000/images \
  -H "x-api-key: YOUR_API_KEY"
```

**Error Responses**:
```json
{ "error": "Forbidden" }
{ "error": "Invalid path" }
{ "error": "File not found" }
{ "error": "Internal Server Error" }
```

---

## **DELETE** `/:folder/:file`

- Deletes the requested file.

**Curl Example**:
```bash
curl -X DELETE http://localhost:3000/images/logo.png \
  -H "x-api-key: YOUR_API_KEY"
```

**Success Response**:
```json
{ "message": "File deleted successfully" }
```

**Error Responses**:
```json
{ "error": "Forbidden" }
{ "error": "Invalid path" }
{ "error": "File not found" }
{ "error": "Internal Server Error" }
```

---

## **DELETE** `/:folder`

- Deletes the requested directory.

**Curl Example**:
```bash
curl -X DELETE http://localhost:3000/images \
  -H "x-api-key: YOUR_API_KEY"
```

**Success Response**:
```json
{ "message": "Directory deleted successfully" }
```

**Error Responses**:
```json
{ "error": "Forbidden" }
{ "error": "Invalid path" }
{ "error": "Directory not found" }
{ "error": "Internal Server Error" }
```

---

### Notes
- All paths are resolved inside the `FILES_DIR` to prevent path traversal.  
- Only allowed file types (`.gif`, `.jpg`, `.png`) can be uploaded.  
- Maximum upload size is 10 MB per file.  
- All error responses are returned in **JSON format**.

