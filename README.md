# Pagination Vanilla JS

Una librería de paginación ligera y moderna escrita en JavaScript vanilla, sin dependencias externas. Incluye soporte para breakpoints responsivos y manejo de elementos DOM dinámicos.

## 🚀 Características

- ✅ **Sin dependencias** - JavaScript vanilla puro
- ✅ **Responsive** - Breakpoints automáticos según el tamaño de pantalla
- ✅ **Flexible** - Soporta arrays de datos y elementos DOM
- ✅ **Ligera** - ~15KB minificado
- ✅ **Moderno** - ES5 compatible, funciona en todos los navegadores
- ✅ **Customizable** - Múltiples opciones de configuración

## 📦 Instalación

### CDN (Recomendado)
```html
<script src="https://cdn.jsdelivr.net/gh/tu-usuario/pagination-vanilla.js/pagination-vanilla.js"></script>
```

## 🎯 Uso básico

### 1. HTML básico
```html
<!DOCTYPE html>
<html>
<head>
    <title>Pagination Demo</title>
</head>
<body>
    <!-- Contenedor para los datos -->
    <div id="data-container"></div>
    
    <!-- Contenedor para la paginación -->
    <div id="pagination-container"></div>
    
    <script src="pagination-vanilla.js"></script>
    <script>
        // Datos de ejemplo
        const data = [
            { id: 1, name: 'Item 1' },
            { id: 2, name: 'Item 2' },
            // ... más datos
        ];
        
        // Inicializar paginación
        Pagination.create('#pagination-container', {
            dataSource: data,
            pageSize: 10,
            callback: function(data, pagination) {
                // Renderizar datos
                const container = document.getElementById('data-container');
                container.innerHTML = data.map(item => 
                    `<div>${item.name}</div>`
                ).join('');
            }
        });
    </script>
</body>
</html>
```

### 2. Con elementos DOM
```html
<div id="cards-container">
    <div class="card">Card 1</div>
    <div class="card">Card 2</div>
    <div class="card">Card 3</div>
    <!-- ... más cards -->
</div>

<div id="pagination-container"></div>

<script>
    const cards = Array.from(document.querySelectorAll('.card'));
    
    Pagination.create('#pagination-container', {
        dataSource: cards,
        pageSize: 6,
        callback: function(data, pagination) {
            // Ocultar todas las cards
            cards.forEach(card => card.style.display = 'none');
            // Mostrar solo las cards de la página actual
            data.forEach(card => card.style.display = 'block');
        }
    });
</script>
```

## 📱 Breakpoints Responsivos

### Configuración automática según el tamaño de pantalla
```javascript
Pagination.create('#pagination-container', {
    dataSource: data,
    pageSize: 9, // Configuración por defecto
    pageRange: 2,
    breakpoints: {
        0: {    // Móvil (< 768px)
            pageSize: 3,
            pageRange: 1
        },
        768: {  // Tablet (768px - 1023px)
            pageSize: 6,
            pageRange: 2
        },
        1024: { // Desktop (≥ 1024px)
            pageSize: 9,
            pageRange: 2
        }
    },
    callback: function(data, pagination) {
        // Tu lógica de renderizado
    }
});
```

### Comportamiento de breakpoints
| **Tamaño de pantalla** | **pageSize** | **pageRange** |
|----------------------|-------------|---------------|
| **< 768px** | 3 | 1 |
| **768px - 1023px** | 6 | 2 |
| **≥ 1024px** | 9 | 2 |

## ⚙️ Opciones de configuración

### Propiedades principales
```javascript
{
    dataSource: [],           // Array de datos o elementos DOM
    pageSize: 10,            // Elementos por página
    pageNumber: 1,           // Página inicial
    pageRange: 2,            // Rango de páginas visibles
    totalNumber: 0,          // Total de elementos (auto-detectado)
    showPrevious: true,      // Mostrar botón "Anterior"
    showNext: true,          // Mostrar botón "Siguiente"
    showFirstOnEllipsisShow: true,  // Mostrar "Primera" en elipsis
    showLastOnEllipsisShow: true,   // Mostrar "Última" en elipsis
    showGoInput: false,      // Mostrar input para ir a página
    showGoButton: false,     // Mostrar botón "Ir"
    pageLink: '',            // Enlace base para páginas
    prevText: 'Anterior',    // Texto del botón anterior
    nextText: 'Siguiente',   // Texto del botón siguiente
    ellipsisText: '...',     // Texto de elipsis
    goButtonText: 'Ir',      // Texto del botón ir
    formatGoButtonText: function(pageNumber) {
        return 'Ir a ' + pageNumber;
    },
    formatPageNumber: function(pageNumber) {
        return pageNumber;
    },
    formatTotalNumber: function(totalNumber) {
        return totalNumber;
    },
    formatNavigator: function(pageNumber, totalNumber, pageSize, pageRange) {
        return 'Página ' + pageNumber + ' de ' + Math.ceil(totalNumber / pageSize);
    },
    callback: function(data, pagination) {
        // Función llamada cuando cambia la página
    },
    breakpoints: {}          // Configuración de breakpoints responsivos
}
```

## 🔧 API de métodos

### Métodos disponibles
```javascript
const pagination = Pagination.create('#container', options);

// Navegación
pagination.go(5);           // Ir a la página 5
pagination.previous();      // Página anterior
pagination.next();          // Página siguiente
pagination.first();         // Primera página
pagination.last();          // Última página

// Control
pagination.show();          // Mostrar paginación
pagination.hide();          // Ocultar paginación
pagination.refresh();       // Refrescar paginación
pagination.destroy();       // Destruir instancia

// Información
pagination.getPageNumber(); // Obtener página actual
pagination.getPageSize();   // Obtener elementos por página
pagination.getTotalNumber(); // Obtener total de elementos
```

## 🎨 Personalización CSS

### Estilos básicos
```css
.pagination-container {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 8px;
    margin: 20px 0;
}

.pagination-container a,
.pagination-container span {
    padding: 8px 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    text-decoration: none;
    color: #333;
    transition: all 0.3s ease;
}

.pagination-container a:hover {
    background-color: #f5f5f5;
    border-color: #999;
}

.pagination-container .active {
    background-color: #007bff;
    color: white;
    border-color: #007bff;
}

.pagination-container .disabled {
    opacity: 0.5;
    pointer-events: none;
}
```

### Estilos responsivos
```css
@media (max-width: 768px) {
    .pagination-container {
        gap: 4px;
    }
    
    .pagination-container a,
    .pagination-container span {
        padding: 6px 8px;
        font-size: 14px;
    }
}
```

## 📋 Ejemplos completos

### Ejemplo 1: Lista de productos
```html
<!DOCTYPE html>
<html>
<head>
    <title>Productos</title>
    <style>
        .product-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin: 20px 0;
        }
        .product-card {
            border: 1px solid #ddd;
            padding: 15px;
            border-radius: 8px;
        }
    </style>
</head>
<body>
    <div id="products-container" class="product-grid"></div>
    <div id="pagination-container"></div>
    
    <script src="pagination-vanilla.js"></script>
    <script>
        const products = [
            { id: 1, name: 'Producto 1', price: 100 },
            { id: 2, name: 'Producto 2', price: 200 },
            // ... más productos
        ];
        
        Pagination.create('#pagination-container', {
            dataSource: products,
            pageSize: 12,
            breakpoints: {
                0: { pageSize: 4 },
                768: { pageSize: 8 },
                1024: { pageSize: 12 }
            },
            callback: function(data, pagination) {
                const container = document.getElementById('products-container');
                container.innerHTML = data.map(product => `
                    <div class="product-card">
                        <h3>${product.name}</h3>
                        <p>$${product.price}</p>
                    </div>
                `).join('');
            }
        });
    </script>
</body>
</html>
```

### Ejemplo 2: Tabla de datos
```html
<table id="data-table">
    <thead>
        <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Email</th>
        </tr>
    </thead>
    <tbody id="table-body"></tbody>
</table>

<div id="pagination-container"></div>

<script>
    const users = [
        { id: 1, name: 'Juan', email: 'juan@email.com' },
        { id: 2, name: 'María', email: 'maria@email.com' },
        // ... más usuarios
    ];
    
    Pagination.create('#pagination-container', {
        dataSource: users,
        pageSize: 10,
        callback: function(data, pagination) {
            const tbody = document.getElementById('table-body');
            tbody.innerHTML = data.map(user => `
                <tr>
                    <td>${user.id}</td>
                    <td>${user.name}</td>
                    <td>${user.email}</td>
                </tr>
            `).join('');
        }
    });
</script>
```

## 🐛 Solución de problemas

### Problema: Los elementos DOM no se muestran
**Solución:** Asegúrate de que el callback maneje correctamente los elementos DOM:
```javascript
callback: function(data, pagination) {
    // Para elementos DOM, usar display none/block
    allElements.forEach(el => el.style.display = 'none');
    data.forEach(el => el.style.display = 'block');
}
```

### Problema: Los breakpoints no funcionan
**Solución:** Verifica que los breakpoints estén configurados correctamente:
```javascript
breakpoints: {
    0: { pageSize: 3 },      // Siempre incluir breakpoint 0
    768: { pageSize: 6 },
    1024: { pageSize: 9 }
}
```

### Problema: La paginación no se actualiza
**Solución:** Llama al método `refresh()` después de cambiar los datos:
```javascript
// Después de actualizar dataSource
pagination.refresh();
```

## 📄 Licencia

MIT License - Libre para uso comercial y personal.

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📞 Soporte

- 📧 Email: tu-email@ejemplo.com
- 🐛 Issues: [GitHub Issues](https://github.com/tu-usuario/pagination-vanilla.js/issues)
- 📖 Documentación: [Wiki](https://github.com/tu-usuario/pagination-vanilla.js/wiki) 
