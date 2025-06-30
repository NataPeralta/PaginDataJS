# Configuración de Repositorios Duales

Este proyecto está configurado para usar dos repositorios:

1. **Repo principal**: `pagination-js-source` (código fuente completo)
2. **Repo de distribución**: `pagination-js` (solo archivos compilados (`dist/`))

## Configuración Requerida

### 1. Repositorios Configurados

- **Código fuente**: https://github.com/NataPeralta/pagination-js-source
- **Distribución**: https://github.com/NataPeralta/pagination-js

### 2. Configurar Secrets en el Repo Principal

Ve a **Settings > Secrets and variables > Actions** en tu repo principal (`pagination-js-source`) y agrega:

#### Opción A: Usando Personal Access Token (Recomendado)

- `REPO_TOKEN`: Token de acceso personal con permisos de repo


#### Opción B: Usando GitHub Token

- `DIST_REPO`: `NataPeralta/pagination-js` (ya configurado en el workflow)

### 3. Generar Personal Access Token (si usas Opción A)

1. Ve a **Settings > Developer settings > Personal access tokens > Tokens (classic)**
2. Click **Generate new token**
3. Selecciona permisos:
   - `repo` (acceso completo a repositorios)
4. Copia el token y guárdalo como `REPO_TOKEN`

### 4. Configurar Permisos del Workflow

En tu repo principal, ve a **Settings > Actions > General** y asegúrate de que:

- **Workflow permissions** esté en "Read and write permissions"
- **Allow GitHub Actions to create and approve pull requests** esté habilitado

## Workflows Disponibles

### Workflow Simple (Recomendado)

- Archivo: `.github/workflows/deploy-dist-simple.yml`
- Usa git push directo
- Requiere `REPO_TOKEN`

### Workflow con gh-pages Action

- Archivo: `.github/workflows/deploy-dist.yml`
- Usa la acción peaceiris/actions-gh-pages

## Cómo Funciona

1. **Push al repo principal** → Se dispara el workflow
2. **Build del proyecto** → Se compila TypeScript
3. **Deploy automático** → Se suben archivos `dist/` al repo de distribución

## Uso del Repo de Distribución

Los usuarios pueden instalar directamente desde el repo de distribución:

```bash
npm install git+https://github.com/tu-usuario/pagination-js-dist.git
```

O usar como CDN:

```html
<script src="https://raw.githubusercontent.com/tu-usuario/pagination-js-dist/main/index.js"></script>
```

## Troubleshooting

### Error: "Repository not found"

- Verifica que `DIST_REPO` tenga el formato correcto: `usuario/nombre-repo`
- Asegúrate de que el token tenga permisos para el repo de distribución

### Error: "Permission denied"

- Verifica que el Personal Access Token tenga permisos de `repo`
- Asegúrate de que el workflow tenga permisos de escritura

### Error: "Branch not found"

- Verifica que el repo de distribución tenga una rama `main`
- Si usa `master`, cambia `main` por `master` en el workflow
