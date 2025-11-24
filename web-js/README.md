## Descriere

Serverul este realizat in Node.js utilizand doar `http`.

Backend-ul expune doua endpoint-uri HTTP de tip POST, folosite de interfata React.

---

## Structura proiectului backend

```
backend/
  src/
    rle/
      compress.js       - functia de compresie
      decompress.js     - functia de decompresie
      segment.js        - segmentarea corecta a textului (suport emoji/Unicode)
    utils/
      cors.js           - configurare antete CORS
      json.js           - utilitare pentru parsare si trimitere JSON
    server.js           - serverul HTTP si routarea cererilor
  package.json
```

---

## Pornirea serverului

In folderul `backend`:

```
pnpm install
pnpm dev
```

Serverul ruleaza pe:

```
http://localhost:8000
```

---

## Endpoint-uri HTTP

### POST `/api/compress`

Primeste text brut si intoarce varianta comprimata.

**Request JSON:**

```json
{
  "text": "aaabbc"
}
```

**Response JSON:**

```json
{
  "result": "a3b2c1",
  "inputLength": 6,
  "outputLength": 6,
  "ratio": 1,
  "timeMs": 0.25,
  "status": "ok"
}
```

**Erori:**

```json
{ "error": "Invalid JSON", "status": "error" }
```

---

### POST `/api/decompress`

Primeste text in format RLE si intoarce textul decomprimat.

**Request JSON:**

```json
{
  "text": "a3b2c1"
}
```

**Response JSON:**

```json
{
  "result": "aaabbc",
  "inputLength": 6,
  "outputLength": 6,
  "ratio": 1,
  "timeMs": 0.17,
  "status": "ok"
}
```

**Erori:**

```json
{ "error": "Format invalid: missing count", "status": "error" }
```

---

## Implementare RLE

### Segmentarea textului

Pentru suport complet Unicode, se foloseste:

```
Intl.Segmenter("en", { granularity: "grapheme" })
```

---

## Compresie (RLE cu paranteze pentru count ≥ 10)

Compresia parcurge textul si grupeaza caracterele identice consecutive (run-uri). Pentru fiecare run:

* daca lungimea este **1–9**, formatul este:

  ```
  <caracter><cifra>
  ```

  Exemple:

  * `aaaa` → `a4`
  * `bb` → `b2`

* daca lungimea este **10 sau mai mare**, se folosesc paranteze pentru a elimina ambiguitatea intre count si urmatorul simbol:

  ```
  <caracter>(<numar>)
  ```

  Exemple:

  * `aaaaaaaaaa` (10) → `a(10)`
  * `bbbbbbbbbbbbbbb` (15) → `b(15)`

Exemplu complet:

```
aaaaaabbbbbbbbbbb → a6b(11)
```

---

## Decompresie

Decompresorul parcurge textul comprimat si reconstruieste secventele originale astfel:

1. Citeste un **caracter** (simbolul run-ului).
2. Dupa simbol pot urma doua cazuri:

   * **o cifra 1–9** → count de o singura cifra
   * **`(`** → citeste cifrele pana la `)` → count cu 2+ cifre
3. Repeta simbolul de count ori.

Exemple:

```
a4b2 → aaaabb
f(14)g3 → ffffffffffffg g g
```

---

## CORS

Frontend-ul ruleaza pe portul 5173, iar backend-ul pe portul 8000.

Pentru a permite comunicatia, in `utils/cors.js` sunt setate manual antetele CORS:

```
Access-Control-Allow-Origin
Access-Control-Allow-Methods
Access-Control-Allow-Headers
```

---

## Formatul RLE utiliza

Compresia foloseste formatul:

```
<simbol><count>
```

cu reguli suplimentare pentru cazuri speciale.

### 1. Separatorul dintre simbol si count

* Daca `count < 10` (o singura cifra), formatul este:

  ```
  a7
  f3
  z1
  ```
* Daca `count >= 10` (doua sau mai multe cifre), se folosesc paranteze pentru a elimina ambiguitatea:

  ```
  b(15)
  F(24)
  a(134)
  ```

Aceasta regula permite decompresorului sa stie exact unde se termina numarul si unde incepe urmatorul simbol.

### 2. Exemple complete

Input:

```
aaaaaaa
```

Output:

```
a7
```

Input:

```
bbbbbbbbbbbbbbb
```

Output:

```
b(15)
```


Input amestecat:

```
fff333aaabbbbbbbbbbb
```

Output:

```
f3\34a3b(11)
```

---
