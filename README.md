# 🎙️ AppDeVoz - Inventario Inteligente por Voz

AppDeVoz es una aplicación móvil desarrollada con **React Native (Expo)** diseñada para simplificar la gestión de inventarios y puntos de venta (POS) mediante el uso de inteligencia artificial para el reconocimiento de voz.

## 🚀 Características Principales

- **Dashboard Unificado**: Gestiona tu inventario, realiza ventas/compras y revisa tu historial diario desde una sola pantalla inteligente y responsiva.
- **Comandos de Voz**: Registra transacciones de forma manos libres (ej: *"Vender 5 remeras"*, *"Comprar 10 pantalones"*).
- **Base de Datos Local (SQLite)**: Tus datos se guardan de forma segura y rápida directamente en tu dispositivo, sin necesidad de internet constante.
- **Layout Adaptable**: Optimizado para dispositivos móviles y visualización en tabletas o navegadores web.
- **Diseño Moderno**: Interfaz limpia, minimalista y con diseño tipo FAB (Floating Action Button).

## 🛠️ Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

- [Node.js](https://nodejs.org/) (LTS recomendado >= 20.x)
- [npm](https://www.npmjs.com/) o [yarn](https://yarnpkg.com/)
- [Expo Go](https://expo.dev/expo-go) (en tu celular) o un emulador de iOS/Android.

## 📥 Instalación

1. **Clona el repositorio:**
   ```bash
   git clone https://github.com/umantramCol/AppDeVoz.git
   cd AppDeVoz
   ```

2. **Instala las dependencias:**
   ```bash
   npm install
   ```

## 🏃 Ejecución

Para iniciar el servidor de desarrollo de Expo:

```bash
npx expo start --clear
```

### Opciones de Visualización:
- **Móvil:** Escanea el código QR que aparece en la terminal con la app **Expo Go**.
- **Web:** Presiona la tecla `w` en la terminal para abrir la versión de navegador.
- **Android/iOS:** Presiona `a` para Android o `i` para iOS (requiere simuladores instalados).

## 🗣️ Ejemplos de Comandos de Voz

Para usar el botón de voz, tócalo una vez y di claramente:
- *"Vender dos camisas"*
- *"Comprar 5 pantalones"*
- *"Vendí 1 coca cola"*

El sistema procesará la cantidad y buscará el producto en tu inventario para actualizar el stock automáticamente.

## 📦 Tecnologías Usadas

- **Frontend**: React Native, Expo.
- **Navegación**: Expo Router.
- **Base de Datos**: expo-sqlite.
- **Reconocimiento de Voz**: expo-speech-recognition.
- **Iconos**: Lucide React Native.

---
Desarrollado con ❤️ para agilizar tu negocio.
