import prisma from '../config/db.js';

// Función auxiliar para generar contraseña temporal automática (ej: "Juan Pérez" en 2026 -> "JP-2026")
function generarPasswordTemporal(nombreCompleto) {
  const palabras = nombreCompleto.trim().split(' ');
  const iniciales = palabras.map(p => p[0] ? p[0].toUpperCase() : '').join('');
  const anioActual = new Date().getFullYear();
  return `${iniciales || 'EMP'}-${anioActual}`;
}

// Registrar un nuevo empleado con contraseña automática y puesto relacional
export const registrarEmpleado = async (req, res) => {
  try {
    const { nombreCompleto, correo, contrasenaHash, idPuesto, rol, telefono } = req.body;
    
    const existe = await prisma.empleado.findUnique({ where: { correo } });
    if (existe) {
      return res.status(400).json({ error: 'El correo ya está registrado' });
    }

    // Si no mandan contraseña desde el frontend, se genera de forma automática y temporal
    const passwordAUsar = (contrasenaHash && contrasenaHash.trim() !== '') 
      ? contrasenaHash 
      : generarPasswordTemporal(nombreCompleto);

    const nuevoEmpleado = await prisma.empleado.create({
      data: { 
        nombreCompleto, 
        correo, 
        contrasenaHash: passwordAUsar, // Nota: puedes aplicar bcrypt aquí si lo usas en tu app
        idPuesto: idPuesto ? Number(idPuesto) : null,
        rol: rol || 'Empleado', 
        telefono 
      },
      include: { puestoRelacion: true }
    });

    res.status(201).json({ 
      message: 'Empleado registrado con éxito', 
      empleado: nuevoEmpleado,
      passwordTemporal: !contrasenaHash ? passwordAUsar : undefined // Útil para mostrársela al administrador por única vez
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al registrar empleado', details: error.message });
  }
};

// Obtener todos los empleados con su respectivo puesto relacionado
export const obtenerEmpleados = async (req, res) => {
  try {
    const empleados = await prisma.empleado.findMany({
      include: { puestoRelacion: true },
      orderBy: { idEmpleado: 'desc' }
    });
    res.json(empleados);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener empleados', details: error.message });
  }
};

// Login de Empleado / Administrador
export const loginEmpleado = async (req, res) => {
  try {
    const { correo, contrasenaHash } = req.body;

    const empleado = await prisma.empleado.findUnique({ 
      where: { correo },
      include: { puestoRelacion: true }
    });

    if (!empleado) {
      return res.status(404).json({ error: 'Correo o contraseña incorrectos' });
    }

    if (empleado.contrasenaHash !== contrasenaHash) {
      return res.status(401).json({ error: 'Correo o contraseña incorrectos' });
    }

    res.json({ 
      message: 'Inicio de sesión exitoso', 
      empleado: {
        idEmpleado: empleado.idEmpleado,
        nombreCompleto: empleado.nombreCompleto,
        correo: empleado.correo,
        rol: empleado.rol,
        puesto: empleado.puestoRelacion?.nombre || 'Sin puesto'
      } 
    });
  } catch (error) {
    res.status(500).json({ error: 'Error en el servidor al iniciar sesión', details: error.message });
  }
};

// Actualizar empleado (incluyendo puesto y contraseña opcional)
export const actualizarEmpleado = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombreCompleto, correo, rol, idPuesto, telefono, contrasenaHash } = req.body;

    const datosActualizacion = {
      nombreCompleto,
      correo,
      rol,
      idPuesto: idPuesto ? Number(idPuesto) : null,
      telefono
    };

    if (contrasenaHash && contrasenaHash.trim() !== '') {
      datosActualizacion.contrasenaHash = contrasenaHash;
    }

    const empleadoActualizado = await prisma.empleado.update({
      where: { idEmpleado: Number(id) },
      data: datosActualizacion,
      include: { puestoRelacion: true }
    });

    res.json({ message: 'Empleado actualizado con éxito', empleado: empleadoActualizado });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar empleado', details: error.message });
  }
};

// Eliminar empleado
export const eliminarEmpleado = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.empleado.delete({
      where: { idEmpleado: Number(id) }
    });
    res.json({ message: 'Empleado eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar empleado', details: error.message });
  }
};
