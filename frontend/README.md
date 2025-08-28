# Paso a paso para levantar el proyecto desde cero:

## 1. Crear proyecto
npx create-vite@latest shift-booking-app -- --template react
cd barber-booking-app

## 2. Instalar dependencias
npm install
npm install -D tailwindcss postcss autoprefixer
npm install lucide-react
npx tailwindcss init -p

## 3. Configurar Tailwind 

tailwind.config.js:
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}

Editar src/index.css (reemplazar todo el contenido):
@tailwind base;
@tailwind components;
@tailwind utilities;

## 4. Copiar código de la SPA en src/App.jsx

## 5. Levantar proyecto
npm run dev


