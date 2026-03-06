# Backendify Commands Reference

## 🚀 1. generate
Backend generate karta hai with interactive setup

```bash
backendify generate
backendify generate [path]
backendify generate --quick
backendify generate --no-auto-connect
```

**Options:**
- `--quick` - Default config use karo (no questions)
- `--no-auto-connect` - Auto-connect skip karo

---

## 🔗 2. connect
Frontend ko backend se auto-connect karta hai (URLs, fields fix karta hai)

```bash
backendify connect
backendify connect [path]
```

---

## 🔄 3. sync
Frontend changes detect karke backend update karta hai

```bash
backendify sync
backendify sync [path]
```

---

## ⚡ 4. benchmark
Backend ka scalability & performance test karta hai

```bash
backendify benchmark
backendify benchmark --levels 10,100,1000
backendify benchmark --duration 20
backendify benchmark --startup-mode
```

**Options:**
- `--levels <levels>` - Load levels (default: 10,100,1000,10000)
- `--duration <seconds>` - Test duration (default: 10)
- `--startup-mode` - Startup growth simulate karo

---

## 🚀 5. deploy
Frontend + Backend deploy karta hai aur auto-connect karta hai

```bash
backendify deploy
backendify deploy --full
backendify deploy --frontend vercel --backend railway
backendify deploy --frontend netlify --backend skip
```

**Options:**
- `--full` - Default stack (Vercel + Railway)
- `--frontend <provider>` - vercel | netlify | cloudflare
- `--backend <provider>` - railway | render | flyio | skip

**Auto-Features:**
- ✅ CLI auto-install
- ✅ Login auto-detect
- ✅ URL auto-capture
- ✅ Environment files auto-create

---

## 🎯 6. generate-api
Frontend state se smart API generate karta hai

```bash
backendify generate-api
backendify generate-api [path]
backendify generate-api --no-inject
```

**Options:**
- `--no-inject` - Frontend code injection skip karo

---

## 🏥 7. doctor
System readiness check karta hai

```bash
backendify doctor
```

---

## 📝 Quick Examples

### Full Stack Setup
```bash
backendify generate --quick
```

### Deploy Stack
```bash
backendify deploy --full
```

### Custom Deploy
```bash
backendify deploy --frontend vercel --backend railway
```

### Performance Test
```bash
backendify benchmark --levels 100,1000,10000 --duration 30
```

### Sync Frontend Changes
```bash
backendify sync
```
