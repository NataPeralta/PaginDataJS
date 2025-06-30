# Pagination JS

**Pagination JS** es una librería ligera y flexible para paginación en JavaScript y TypeScript.
Ideal para proyectos web modernos que requieren paginación personalizable y fácil de integrar.

---

## 🚀 Instalación

### Usando npm (desde GitHub)

```bash
npm install git+https://github.com/NataPeralta/pagination-js.git
```

### O descarga directa

Descarga el archivo `index.js` desde [Releases](https://github.com/NataPeralta/pagination-js/releases) o desde el repo.

---

## 📦 Uso Básico

### 1. Importar en tu proyecto

**ES Modules:**

```js
import {PaginationCore} from 'pagination-js';
```

**CommonJS:**

```js
const {PaginationCore} = require('pagination-js');
```

**Directo en HTML:**

```html
<script src="https://raw.githubusercontent.com/NataPeralta/pagination-js/main/index.js"></script>
```

### 2. Ejemplo de uso

```js
const pagination = new PaginationCore('#pagination-container', {
  totalNumber: 100,
  pageSize: 10,
  showPrevious: true,
  showNext: true,
  showPageNumbers: true,
  // ...otras opciones
});

pagination.init();
```

---

## ⚙️ Opciones principales

| Opción          | Tipo    | Descripción                              |
| --------------- | ------- | ---------------------------------------- |
| totalNumber     | number  | Total de elementos                       |
| pageSize        | number  | Elementos por página                     |
| showPrevious    | boolean | Mostrar botón anterior                   |
| showNext        | boolean | Mostrar botón siguiente                  |
| showPageNumbers | boolean | Mostrar números de página                |
| pageRange       | number  | Rango de páginas a mostrar               |
| ellipsisText    | string  | Texto para elipsis (por defecto: ...)    |
| classPrefix     | string  | Prefijo de clases CSS                    |
| ...             | ...     | ¡Y muchas más! Consulta la documentación |

---

## 🧩 Personalización

- **Estilos:** Puedes personalizar las clases CSS usando la opción `classPrefix` o sobreescribiendo los estilos por defecto.
- **Callbacks:** Usa la opción `callback` para ejecutar código cada vez que cambie la página.
- **Plantillas:** Personaliza los textos y la estructura con las opciones avanzadas.

---

## 📝 Ejemplo avanzado

```js
const pagination = new PaginationCore('#pagination', {
  totalNumber: 250,
  pageSize: 25,
  pageRange: 2,
  ellipsisText: '...',
  classPrefix: 'my-pagination',
  callback: (data, model) => {
    // Actualiza tu vista aquí
    console.log('Página actual:', model.pageNumber);
  },
});
pagination.init();
```

---

## 📚 Documentación

- [Wiki de opciones y métodos](https://github.com/NataPeralta/pagination-js/wiki)
- [Ejemplos de uso](https://github.com/NataPeralta/pagination-js-source/tree/main/examples)

---

## 🛠️ Desarrollo

El código fuente está en:  
https://github.com/NataPeralta/pagination-js-source

---

## 📝 Licencia

MIT

---

## ✨ Autor

- [NataPeralta](https://github.com/NataPeralta)
