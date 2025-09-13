<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1lOvrndqOsC_LoHkcLGm__HQPlFAiShqK

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`
# 🚀 Impostor 2

![Estado del Proyecto](https://img.shields.io/badge/estado-en%20desarrollo-yellow.svg)
![Licencia](https://img.shields.io/badge/licencia-MIT-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Phaser](https://img.shields.io/badge/Phaser-882D9E?style=for-the-badge&logo=phaser&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)

Un juego multijugador 2D de deducción social inspirado en "Among Us", construido con tecnologías web modernas. Encuentra al impostor antes de que sea demasiado tarde.

---

## 🎬 Demo del Juego

*¡Un GIF o video corto aquí es la mejor manera de mostrar tu proyecto! Es lo primero que la gente querrá ver.*

![Demo de Impostor 2](https://user-images.githubusercontent.com/10299207/118395543-9f846a00-b616-11eb-8185-412f587a8c43.gif)
*(Este es un GIF de ejemplo, ¡reemplázalo con uno de tu juego!)*

---

## 📖 Tabla de Contenidos

1.  [Sobre el Juego](#-sobre-el-juego)
2.  [Características Principales](#-características-principales)
3.  [Stack Tecnológico](#-stack-tecnológico)
4.  [Cómo Empezar](#-cómo-empezar)
5.  [Estructura del Proyecto](#-estructura-del-proyecto)
6.  [Hoja de Ruta Futura](#-hoja-de-ruta-futura)
7.  [Licencia](#-licencia)
8.  [Autor](#-autor)

---

## 🎮 Sobre el Juego

**Impostor 2** es un prototipo funcional de un juego de deducción social. Los jugadores son asignados a uno de dos roles: **Tripulante** o **Impostor**.

* **Objetivo del Tripulante:** Completar todas las tareas asignadas en el mapa o descubrir y expulsar a todos los impostores.
* **Objetivo del Impostor:** Eliminar a los tripulantes y sabotear la nave sin ser descubierto.

Este proyecto sirve como un campo de pruebas para la integración de un motor de renderizado de juegos (Phaser) con un framework de UI declarativo (React).

---

## ✨ Características Principales

* **Movimiento de Jugador:** Control del personaje en un mapa basado en tiles.
* **Sincronización Multijugador Básica:** Los jugadores pueden verse moverse en tiempo real (requiere un backend como Socket.io).
* **Interfaz de Usuario con React:** Menús, botones y otros elementos de la UI renderizados con React sobre el canvas del juego.
* **Escrito en TypeScript:** Código robusto, tipado y más fácil de mantener.

---

## 🛠️ Stack Tecnológico

La combinación de estas tecnologías permite un desarrollo rápido y una clara separación de responsabilidades:

* **[Phaser 3](https://phaser.io/):** Motor de juego 2D para renderizar el canvas, manejar físicas, sprites y la lógica principal del juego.
* **[React](https://reactjs.org/):** Librería para construir la interfaz de usuario (UI) de forma declarativa y eficiente.
* **[TypeScript](https://www.typescriptlang.org/):** Superset de JavaScript que añade tipado estático para prevenir errores y mejorar la experiencia de desarrollo.
* **[Vite](https://vitejs.dev/):** Herramienta de construcción y servidor de desarrollo extremadamente rápido que ofrece una experiencia fluida.

---

## 🚀 Cómo Empezar

Sigue estos pasos para levantar el proyecto en tu máquina local.

### Prerrequisitos

* [Node.js](https://nodejs.org/) (versión 16 o superior)
* [npm](https://www.npmjs.com/) o [yarn](https://yarnpkg.com/)

### Instalación

1.  **Clona el repositorio:**
    ```bash
    git clone [https://github.com/diegomolloai/Impostor2-Copia.git](https://github.com/diegomolloai/Impostor2-Copia.git)
    ```
2.  **Navega a la carpeta del proyecto:**
    ```bash
    cd Impostor2-Copia
    ```
3.  **Instala las dependencias:**
    ```bash
    npm install
    ```
4.  **Inicia el servidor de desarrollo:**
    ```bash
    npm run dev
    ```
5.  Abre tu navegador y visita `http://localhost:5173` (o la URL que Vite indique en la consola).

---

## 📂 Estructura del Proyecto

El proyecto está organizado para separar claramente la lógica del juego de la interfaz de usuario.
