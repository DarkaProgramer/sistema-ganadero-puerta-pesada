# 🐂 Rancho Puerta Pesada — Sistema Integral de Gestión Ganadera

Sistema web full-stack desarrollado para la administración, control y trazabilidad operativa de ranchos ganaderos de pequeña y mediana escala. Diseñado bajo una arquitectura modular y escalable para optimizar las actividades diarias de personal, inventario de ganado, corrales y finanzas.

---

## 🚀 Tecnologías Utilizadas

### **Backend**
* **Node.js** & **Express**: Servidor API REST de alto rendimiento.
* **Prisma ORM**: Mapeo objeto-relacional para gestión limpia de base de datos.
* **PostgreSQL**: Base de datos relacional robusta (alojada en **Railway**).

### **Frontend**
* **React**: Librería principal de interfaces de usuario.
* **Tailwind CSS**: Framework de estilos para un diseño moderno, limpio y responsivo.
* **Lucide React**: Sistema de iconografía corporativa.

---

## 📋 Características Principales del Sistema

1. **Autenticación y Roles de Usuario**:
   * Control de acceso seguro por credenciales validadas contra la base de datos.
   * Restricción de permisos basada en roles: **Administrador** y **Empleado**.
2. **Gestión de Personal (Empleados)**:
   * CRUD completo (Crear, Listar, Editar y Eliminar) de trabajadores y administradores.
   * Asignación de puestos específicos en el rancho (Capataz, Veterinario, Vaquero, etc.).
3. **Inventario y Control de Ganado**:
   * Registro detallado por arete bandera y arete botón.
   * Generador inteligente de nombres aleatorios (más de 100 opciones para machos y hembras) con opción de escritura manual.
   * Clasificación por tipo de animal, raza, género, origen, fechas de nacimiento/ingreso y estado (*Vivo*, *Vendido*, *Muerto*).
4. **Personalización del Rancho (Exclusivo Administradores)**:
   * Configuración de la identidad visual (Nombre del rancho, logo local, moneda oficial y unidad de peso).
   * Gestión dinámica (CRUD) de corrales y su capacidad máxima.
   * Administración de tipos de ganado disponibles.
5. **Módulos Operativos Complementarios**:
   * Control de inventario de insumos, salud/vacunación, ventas, clientes y calendario de actividades.

---

## 🛠️ Guía de Instalación y Ejecución Local

Sigue estos pasos para levantar el proyecto en tu entorno de desarrollo:

### 1. Clonar el repositorio
```bash
git clone <url-de-tu-repositorio>
cd Proyecto-Integradora
