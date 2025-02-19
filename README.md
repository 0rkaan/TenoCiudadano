# Portal Ciudadano - Municipalidad de Teno

## Configuración Local (Windows)

### Prerrequisitos

1. **Instalar PostgreSQL**
   - Descargar PostgreSQL desde [postgresql.org](https://www.postgresql.org/download/windows/)
   - Durante la instalación:
     - Anotar la contraseña del usuario 'postgres'
     - Mantener el puerto por defecto (5432)
     - Instalar pgAdmin 4 (incluido en el instalador)

2. **Crear la Base de Datos**
   - Abrir pgAdmin 4
   - Conectar al servidor local (localhost)
   - Click derecho en "Databases" -> "Create" -> "Database"
   - Nombre: `portal_ciudadano`

3. **Configurar Variables de Entorno**
   - Crear un archivo `.env` en la raíz del proyecto:
   ```env
   DATABASE_URL=postgresql://postgres:tu_contraseña@localhost:5432/portal_ciudadano
   SESSION_SECRET=un_secreto_muy_seguro
   ```
   - Reemplazar `tu_contraseña` con la contraseña configurada durante la instalación

### Instalación

1. **Instalar Dependencias**
   ```bash
   npm install
   ```

2. **Ejecutar Migraciones**
   ```bash
   npm run db:push
   ```

3. **Iniciar la Aplicación**
   ```bash
   npm run dev
   ```

La aplicación estará disponible en `http://localhost:5000`

## Estructura del Proyecto

- `/client`: Frontend en React + TypeScript
- `/server`: Backend en Node.js + Express
- `/shared`: Esquemas y tipos compartidos
