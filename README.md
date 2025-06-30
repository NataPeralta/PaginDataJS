# Pagination.js - Librería de Paginación TypeScript

Una librería ligera y moderna de paginación escrita en TypeScript, con soporte completo para elementos DOM, datos AJAX y funcionalidades avanzadas.

## 🚀 Características

- ✅ **TypeScript nativo** con tipos estrictos
- ✅ **Soporte para elementos DOM** - Pagina elementos HTML directamente
- ✅ **Datos AJAX** - Carga datos desde APIs
- ✅ **Paginación inteligente** - Elipsis dinámicos y navegación contextual
- ✅ **Altamente configurable** - Más de 30 opciones de personalización
- ✅ **Eventos y callbacks** - Control total sobre el comportamiento
- ✅ **Build optimizado** - Múltiples formatos de salida (ES, UMD, minificado)

## 📦 Instalación

```bash
npm install pagination-js
```

## 🎯 Uso Básico

```javascript
import {Pagination} from 'pagination-js';

const pagination = new Pagination('#container', {
  dataSource: '.data-item',
  pageSize: 10,
  callback: (data, model) => {
    console.log('Página actual:', model.pageNumber);
  },
});

await pagination.init();
```

## ⚙️ Opciones de Configuración

### 📊 Configuración Básica

| Opción        | Tipo     | Default | Descripción                                            |
| ------------- | -------- | ------- | ------------------------------------------------------ |
| `totalNumber` | `number` | `0`     | Número total de elementos a paginar                    |
| `pageNumber`  | `number` | `1`     | Página inicial (1-indexed)                             |
| `pageSize`    | `number` | `10`    | Número de elementos por página                         |
| `pageRange`   | `number` | `2`     | Número de páginas a mostrar antes/después de la actual |

### 🎨 Configuración Visual

| Opción            | Tipo      | Default | Descripción                               |
| ----------------- | --------- | ------- | ----------------------------------------- |
| `showPrevious`    | `boolean` | `true`  | Mostrar botón "anterior"                  |
| `showNext`        | `boolean` | `true`  | Mostrar botón "siguiente"                 |
| `showPageNumbers` | `boolean` | `true`  | Mostrar números de página                 |
| `showNavigator`   | `boolean` | `false` | Mostrar información de navegación         |
| `showGoInput`     | `boolean` | `false` | Mostrar input para ir a página específica |
| `showGoButton`    | `boolean` | `false` | Mostrar botón "ir" junto al input         |
| `showSizeChanger` | `boolean` | `false` | Mostrar selector de tamaño de página      |

### 🎭 Configuración de Elipsis

| Opción                     | Tipo      | Default            | Descripción                                            |
| -------------------------- | --------- | ------------------ | ------------------------------------------------------ |
| `ellipsisClickable`        | `boolean` | `false`            | Hacer el elipsis clickeable con input para ir a página |
| `ellipsisInputPlaceholder` | `string`  | `'Ir a página...'` | Placeholder del input del elipsis                      |
| `ellipsisInputButtonText`  | `string`  | `'Ir'`             | Texto del botón del elipsis                            |
| `ellipsisInputClass`       | `string`  | `''`               | Clase CSS adicional para el contenedor del elipsis     |
| `hideFirstOnEllipsisShow`  | `boolean` | `false`            | Ocultar primera página cuando se muestra elipsis       |
| `hideLastOnEllipsisShow`   | `boolean` | `false`            | Ocultar última página cuando se muestra elipsis        |
| `hideOnlyOnePage`          | `boolean` | `false`            | Ocultar paginador si solo hay una página               |

### 🏷️ Textos y Etiquetas

| Opción         | Tipo     | Default      | Descripción                   |
| -------------- | -------- | ------------ | ----------------------------- |
| `prevText`     | `string` | `'&lsaquo;'` | Texto del botón anterior (‹)  |
| `nextText`     | `string` | `'&rsaquo;'` | Texto del botón siguiente (›) |
| `ellipsisText` | `string` | `'...'`      | Texto para los elipsis        |
| `goButtonText` | `string` | `'Go'`       | Texto del botón "ir"          |

### 🎨 Clases CSS

| Opción             | Tipo     | Default          | Descripción                            |
| ------------------ | -------- | ---------------- | -------------------------------------- |
| `classPrefix`      | `string` | `'paginationjs'` | Prefijo para todas las clases CSS      |
| `activeClassName`  | `string` | `'active'`       | Clase para la página activa            |
| `disableClassName` | `string` | `'disabled'`     | Clase para elementos deshabilitados    |
| `className`        | `string` | -                | Clase adicional para el contenedor     |
| `ulClassName`      | `string` | -                | Clase adicional para la lista `<ul>`   |
| `prevClassName`    | `string` | -                | Clase adicional para botón anterior    |
| `nextClassName`    | `string` | -                | Clase adicional para botón siguiente   |
| `pageClassName`    | `string` | -                | Clase adicional para números de página |

### 📝 Formateo de Textos

| Opción              | Tipo               | Default                            | Descripción                    |
| ------------------- | ------------------ | ---------------------------------- | ------------------------------ |
| `formatNavigator`   | `string\|function` | `'Total <%= totalNumber %> items'` | Formato del navegador          |
| `formatGoInput`     | `string\|function` | `'<%= input %>'`                   | Formato del input "ir"         |
| `formatGoButton`    | `string\|function` | `'<%= button %>'`                  | Formato del botón "ir"         |
| `formatSizeChanger` | `string\|function` | -                                  | Formato del selector de tamaño |

### 📍 Posicionamiento

| Opción     | Tipo               | Default    | Descripción                      |
| ---------- | ------------------ | ---------- | -------------------------------- |
| `position` | `'top'\|'bottom'`  | `'bottom'` | Posición del paginador           |
| `header`   | `string\|function` | -          | HTML/function para el encabezado |
| `footer`   | `string\|function` | -          | HTML/function para el pie        |

### 🎯 Inicialización

| Opción                  | Tipo      | Default | Descripción                        |
| ----------------------- | --------- | ------- | ---------------------------------- |
| `triggerPagingOnInit`   | `boolean` | `true`  | Ejecutar paginación al inicializar |
| `resetPageNumberOnInit` | `boolean` | `true`  | Resetear a página 1 al inicializar |

### 📊 Datos y Fuentes

| Opción               | Tipo                      | Default | Descripción                                     |
| -------------------- | ------------------------- | ------- | ----------------------------------------------- |
| `dataSource`         | `string\|array\|function` | -       | Fuente de datos (selector, array, función)      |
| `locator`            | `string\|function`        | -       | Localizador para extraer datos                  |
| `totalNumberLocator` | `function`                | -       | Función para obtener total desde respuesta AJAX |
| `ajax`               | `object\|function`        | -       | Configuración AJAX                              |
| `alias`              | `object`                  | -       | Alias para parámetros de página                 |

### 🎛️ Opciones de Tamaño

| Opción               | Tipo       | Default             | Descripción                     |
| -------------------- | ---------- | ------------------- | ------------------------------- |
| `sizeChangerOptions` | `number[]` | `[10, 20, 50, 100]` | Opciones del selector de tamaño |

### 🔗 Enlaces

| Opción     | Tipo     | Default | Descripción                  |
| ---------- | -------- | ------- | ---------------------------- |
| `pageLink` | `string` | `''`    | Enlace base para las páginas |

### 🎪 Agrupación

| Opción       | Tipo      | Default              | Descripción                    |
| ------------ | --------- | -------------------- | ------------------------------ |
| `groupItems` | `boolean` | `false`              | Agrupar elementos en páginas   |
| `groupClass` | `string`  | `'pagination-group'` | Clase para grupos de elementos |

### 🎛️ Estado

| Opción     | Tipo      | Default | Descripción               |
| ---------- | --------- | ------- | ------------------------- |
| `disabled` | `boolean` | `false` | Deshabilitar el paginador |

## 🔧 Callbacks y Eventos

### 📞 Callbacks Principales

| Callback   | Parámetros      | Descripción                        |
| ---------- | --------------- | ---------------------------------- |
| `callback` | `(data, model)` | Se ejecuta cuando cambia la página |
| `onError`  | `(error, type)` | Se ejecuta cuando hay un error     |

### 🎣 Hooks de Inicialización

| Hook         | Parámetros | Descripción            |
| ------------ | ---------- | ---------------------- |
| `beforeInit` | `()`       | Antes de inicializar   |
| `afterInit`  | `(el)`     | Después de inicializar |

### 🎨 Hooks de Renderizado

| Hook           | Parámetros   | Descripción           |
| -------------- | ------------ | --------------------- |
| `beforeRender` | `(isForced)` | Antes de renderizar   |
| `afterRender`  | `(isForced)` | Después de renderizar |

### 🎯 Hooks de Navegación

| Hook                    | Parámetros            | Descripción                    |
| ----------------------- | --------------------- | ------------------------------ |
| `beforeGoButtonOnClick` | `(event, pageNumber)` | Antes de clic en botón "ir"    |
| `afterGoButtonOnClick`  | `(event, pageNumber)` | Después de clic en botón "ir"  |
| `beforeGoInputOnEnter`  | `(event, pageNumber)` | Antes de Enter en input "ir"   |
| `afterGoInputOnEnter`   | `(event, pageNumber)` | Después de Enter en input "ir" |

### 📏 Hooks de Tamaño

| Hook                       | Parámetros      | Descripción               |
| -------------------------- | --------------- | ------------------------- |
| `beforeSizeSelectorChange` | `(event, size)` | Antes de cambiar tamaño   |
| `afterSizeSelectorChange`  | `(event, size)` | Después de cambiar tamaño |

### 🎛️ Hooks de Estado

| Hook            | Parámetros | Descripción             |
| --------------- | ---------- | ----------------------- |
| `beforeDisable` | `(type)`   | Antes de deshabilitar   |
| `afterDisable`  | `(type)`   | Después de deshabilitar |
| `beforeEnable`  | `(type)`   | Antes de habilitar      |
| `afterEnable`   | `(type)`   | Después de habilitar    |

### 🗑️ Hooks de Destrucción

| Hook            | Parámetros | Descripción         |
| --------------- | ---------- | ------------------- |
| `beforeDestroy` | `()`       | Antes de destruir   |
| `afterDestroy`  | `()`       | Después de destruir |

## 🎯 Ejemplos de Uso

### 📄 Elipsis Informativo (por defecto)

```javascript
const pagination = new Pagination('#container', {
  totalNumber: 200,
  pageSize: 10,
  showPageNumbers: true,
  callback: (data, model) => {
    console.log('Página actual:', model.pageNumber);
  },
});
```

### 🎯 Elipsis Clickeable con Input

```javascript
const pagination = new Pagination('#container', {
  totalNumber: 200,
  pageSize: 10,
  showPageNumbers: true,
  ellipsisClickable: true,
  ellipsisInputPlaceholder: 'Ir a página...',
  ellipsisInputButtonText: 'Saltar',
  ellipsisInputClass: 'custom-ellipsis',
  callback: (data, model) => {
    console.log('Página actual:', model.pageNumber);
  },
});
```

### 🎨 Personalización Avanzada del Elipsis

```javascript
const pagination = new Pagination('#container', {
  totalNumber: 500,
  pageSize: 10,
  showPageNumbers: true,
  ellipsisClickable: true,
  ellipsisInputPlaceholder: 'Número de página',
  ellipsisInputButtonText: 'Ir',
  hideFirstOnEllipsisShow: true,
  hideLastOnEllipsisShow: true,
  callback: (data, model) => {
    console.log('Página actual:', model.pageNumber);
  },
});
```

## 🎭 Reglas de Visualización del Elipsis

La librería implementa las siguientes reglas de visualización recomendadas:

### 📊 Cantidad Fija de Botones Visibles

- **7 elementos visibles**: Balance entre funcionalidad y diseño limpio
- **Navegación intuitiva**: El usuario nunca siente que se pierde páginas importantes

### 🔍 Comportamiento del Elipsis

- **Elipsis informativo**: Por defecto, solo indica páginas ocultas (no clickeable)
- **Elipsis clickeable**: Opcional, incluye input para ir a página específica
- **Mostrar solo cuando es necesario**: Se muestra solo cuando hay más de 1 página oculta entre saltos

### 🎯 Navegación Contextual

- **Cerca del inicio**: Muestra 1, 2, 3, 4, 5, ..., totalPage
- **Cerca del final**: Muestra 1, ..., totalPage-4, totalPage-3, totalPage-2, totalPage-1, totalPage
- **En el medio**: Muestra 1, ..., currentPage-1, currentPage, currentPage+1, ..., totalPage

### 🧹 Limpieza Automática

- **Eliminar elipsis innecesarios**: Al acercarse al inicio o final, se eliminan los elipsis redundantes
- **Actualización dinámica**: Los elementos se muestran/ocultan según el contexto actual

## 🚀 Scripts Disponibles

```bash
# Desarrollo en vivo
npm run dev

# Build normal (sin minificar)
npm run build

# Build optimizado (minificado)
npm run build:deep
```

## 📁 Estructura del Proyecto

```
src/
├── index.ts              # Punto de entrada principal
├── pagination-core.ts    # Lógica principal del paginador
├── types/
│   └── index.ts         # Definiciones de tipos TypeScript
├── utils/
│   ├── constants.ts     # Opciones por defecto
│   └── utils.ts         # Funciones utilitarias
├── handlers/
│   ├── data-handler.ts  # Manejo de datos
│   └── event-handler.ts # Manejo de eventos
└── generator/
    └── html-generator.ts # Generación de HTML
```

## 📄 Licencia

MIT License
