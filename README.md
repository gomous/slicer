# 🧊 3D Web Slicer

A modern, interactive web-based 3D slicing interface inspired by Bambu Studio — allowing users to upload `.stl` files, preview them in real-time 3D, customize slicing parameters, and generate G-code in the cloud.

![3D Slicer Preview](./preview.png)

---

## 🚀 Features

- 🎛️ **Interactive UI** for slicing parameters (infill, layer height, nozzle size, etc.)
- 🖼️ **Real-time 3D STL viewer** using Three.js and `@react-three/fiber`
- 🧠 **State management** via custom global store
- 🌀 **Smooth animations & lighting** for professional-grade previews
- 🔄 **Drag & drop STL upload**
- 📦 **Clean component-based architecture**
- 🧪 **Integrated slicing pipeline** (via backend API, Docker-ready)
- 🧾 **Auto-generated G-code preview + pricing estimator** (optional)

---

## 🧰 Tech Stack

| Layer       | Tools                                                                 |
|-------------|------------------------------------------------------------------------|
| **Frontend**| React + Vite + TypeScript + Tailwind CSS                              |
| **3D Viewer**| Three.js + `@react-three/fiber` + STLLoader                           |
| **UI Lib**  | shadcn/ui + lucide-react                                               |
| **State**   | Zustand or custom store                                                |
| **Backend** | Flask or Node.js (to run PrusaSlicer CLI and pricing logic)           |
| **Docker**  | Backend containerized for slicing (PrusaSlicer AppImage inside Docker) |

---

## 📂 Project Structure

```
.
├── components/
│   ├── FileUpload.tsx       # Drag & drop STL upload
│   ├── STLModel.tsx         # Parses & displays STL file
│   ├── ModelViewer.tsx      # 3D canvas wrapper
│   ├── ParameterForm.tsx    # Infill, nozzle, layer height inputs
│   ├── SliceButton.tsx      # Slicing trigger + feedback
│   └── Sidebar.tsx          # Navigation & layout
├── hooks/
│   └── useSlicerStore.ts    # Global state store
├── utils/
│   └── pricing.ts           # G-code parser & price estimator (optional)
├── public/
│   └── img/                 # Skybox images for environment lighting
├── App.tsx
├── main.tsx
└── README.md
```

---

## 📸 Screenshots

> ⚠️ Replace these with actual screenshots after building

| Upload STL | 3D Viewer | Customize |
|------------|-----------|-----------|
| ![](./screens/upload.png) | ![](./screens/viewer.png) | ![](./screens/form.png) |

---

## 🧪 Local Development

### 1. Clone the project

```bash
git clone https://github.com/your-username/3d-web-slicer.git
cd 3d-web-slicer
```

### 2. Install dependencies

```bash
npm install
```

### 3. Start the dev server

```bash
npm run dev
```

### 4. Upload an `.stl` file and explore ✨

---

## 🐳 Backend (Docker Slicer)

To set up the slicing backend using PrusaSlicer CLI and Flask:

```bash
cd backend/
docker build -t slicer-api .
docker run -p 5000:5000 slicer-api
```

API Endpoint: `POST /slice`  
Payload: `.stl` file + slicer parameters

---

## 📡 API Schema (example)

```http
POST /slice
Content-Type: multipart/form-data

Form Data:
- model: (File) STL
- layer_height: 0.2
- infill: 20
- nozzle: 0.4
```

---

## 📄 License

MIT © 2025 Your Name  
Based on open-source slicer and WebGL tools.

---

## 💡 Future Ideas

- ✂️ Preview sliced layers (G-code viewer)
- 📤 Export `.gcode` + estimated print time
- 🛠️ Multiple printer profiles
- 🔐 User login + history
- 💰 Price estimation based on filament/time
- 🌐 Deploy with full-stack on Render, Vercel, or EC2

---

## 💬 Feedback & Contributions

Pull requests welcome. For major changes, open an issue first.  
Have ideas or suggestions? Open a [Discussion](https://github.com/your-repo/discussions).

---

> “Code is like a 3D print – you only see flaws when you try to layer it.”