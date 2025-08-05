# PaginDataJS

A lightweight and modern pagination library written in vanilla JavaScript with no external dependencies. Includes responsive breakpoints support and dynamic DOM element handling.

## 🚀 Features

- ✅ **No Dependencies** - Pure vanilla JavaScript
- ✅ **Responsive** - Automatic breakpoints based on screen size
- ✅ **Flexible** - Supports data arrays and DOM elements
- ✅ **Lightweight** - ~15KB minified
- ✅ **Modern** - ES5 compatible, works in all browsers
- ✅ **Customizable** - Multiple configuration options

## 📦 Installation

### CDN
```html
<script src="[https://cdn.jsdelivr.net/npm/pagindata-js@1.1.0/pagination.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/pagindata-js@1.1.0/pagination.min.js"></script>
```

## 🎯 Basic Usage

### 1. Basic HTML
```html
<!DOCTYPE html>
<html>
<head>
    <title>Pagination Demo</title>
</head>
<body>
    <!-- Data container -->
    <div id="data-container"></div>
    
    <!-- Pagination container -->
    <div id="pagination-container"></div>
    
    <script src="pagination-vanilla.js"></script>
    <script>
        // Sample data
        const data = [
            { id: 1, name: 'Item 1' },
            { id: 2, name: 'Item 2' },
            // ... more data
        ];
        
        // Initialize pagination
        Pagination.create('#pagination-container', {
            dataSource: data,
            pageSize: 10,
            callback: function(data, pagination) {
                // Render data
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

### 2. With DOM Elements
```html
<div id="cards-container">
    <div class="card">Card 1</div>
    <div class="card">Card 2</div>
    <div class="card">Card 3</div>
    <!-- ... more cards -->
</div>

<div id="pagination-container"></div>

<script>
    const cards = Array.from(document.querySelectorAll('.card'));
    
    Pagination.create('#pagination-container', {
        dataSource: cards,
        pageSize: 6,
        callback: function(data, pagination) {
            // Hide all cards
            cards.forEach(card => card.style.display = 'none');
            // Show only current page cards
            data.forEach(card => card.style.display = 'block');
        }
    });
</script>
```

## 📱 Responsive Breakpoints

### Automatic configuration based on screen size
```javascript
Pagination.create('#pagination-container', {
    dataSource: data,
    pageSize: 9, // Default configuration
    pageRange: 2,
    breakpoints: {
        0: {    // Mobile (< 768px)
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
        // Your rendering logic
    }
});
```

### Breakpoint behavior
| **Screen Size** | **pageSize** | **pageRange** |
|----------------|-------------|---------------|
| **< 768px** | 3 | 1 |
| **768px - 1023px** | 6 | 2 |
| **≥ 1024px** | 9 | 2 |

## ⚙️ Configuration Options

### Main properties
```javascript
{
    dataSource: [],           // Array of data or DOM elements
    pageSize: 10,            // Items per page
    pageNumber: 1,           // Initial page
    pageRange: 2,            // Visible page range
    totalNumber: 0,          // Total items (auto-detected)
    showPrevious: true,      // Show "Previous" button
    showNext: true,          // Show "Next" button
    showFirstOnEllipsisShow: true,  // Show "First" on ellipsis
    showLastOnEllipsisShow: true,   // Show "Last" on ellipsis
    showGoInput: false,      // Show go to page input
    showGoButton: false,     // Show "Go" button
    pageLink: '',            // Base link for pages
    prevText: 'Previous',    // Previous button text
    nextText: 'Next',        // Next button text
    ellipsisText: '...',     // Ellipsis text
    goButtonText: 'Go',      // Go button text
    formatGoButtonText: function(pageNumber) {
        return 'Go to ' + pageNumber;
    },
    formatPageNumber: function(pageNumber) {
        return pageNumber;
    },
    formatTotalNumber: function(totalNumber) {
        return totalNumber;
    },
    formatNavigator: function(pageNumber, totalNumber, pageSize, pageRange) {
        return 'Page ' + pageNumber + ' of ' + Math.ceil(totalNumber / pageSize);
    },
    callback: function(data, pagination) {
        // Function called when page changes
    },
    breakpoints: {}          // Responsive breakpoints configuration
}
```

## 🔧 API Methods

### Available methods
```javascript
const pagination = Pagination.create('#container', options);

// Navigation
pagination.go(5);           // Go to page 5
pagination.previous();      // Previous page
pagination.next();          // Next page
pagination.first();         // First page
pagination.last();          // Last page

// Control
pagination.show();          // Show pagination
pagination.hide();          // Hide pagination
pagination.refresh();       // Refresh pagination
pagination.destroy();       // Destroy instance

// Information
pagination.getPageNumber(); // Get current page
pagination.getPageSize();   // Get items per page
pagination.getTotalNumber(); // Get total items
```

## 🎨 CSS Customization

### Basic styles
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

### Responsive styles
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

## 📋 Complete Examples

### Example 1: Product List
```html
<!DOCTYPE html>
<html>
<head>
    <title>Products</title>
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
            { id: 1, name: 'Product 1', price: 100 },
            { id: 2, name: 'Product 2', price: 200 },
            // ... more products
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

### Example 2: Data Table
```html
<table id="data-table">
    <thead>
        <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
        </tr>
    </thead>
    <tbody id="table-body"></tbody>
</table>

<div id="pagination-container"></div>

<script>
    const users = [
        { id: 1, name: 'John', email: 'john@email.com' },
        { id: 2, name: 'Jane', email: 'jane@email.com' },
        // ... more users
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

## 🐛 Troubleshooting

### Problem: DOM elements not showing
**Solution:** Make sure the callback handles DOM elements correctly:
```javascript
callback: function(data, pagination) {
    // For DOM elements, use display none/block
    allElements.forEach(el => el.style.display = 'none');
    data.forEach(el => el.style.display = 'block');
}
```

### Problem: Breakpoints not working
**Solution:** Verify breakpoints are configured correctly:
```javascript
breakpoints: {
    0: { pageSize: 3 },      // Always include breakpoint 0
    768: { pageSize: 6 },
    1024: { pageSize: 9 }
}
```

### Problem: Pagination not updating
**Solution:** Call the `refresh()` method after changing data:
```javascript
// After updating dataSource
pagination.refresh();
```

## 📄 License

MIT License - Free for commercial and personal use.

## 🤝 Contributing

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 Support

- 📧 Email: nata.peralta@example.com
- 🐛 Issues: [GitHub Issues](https://github.com/NataPeralta/PaginDataJS/issues)
- 📖 Documentation: [Wiki](https://github.com/NataPeralta/PaginDataJS/wiki) 
