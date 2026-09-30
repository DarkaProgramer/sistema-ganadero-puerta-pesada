import prisma from '../config/db.js';

// Registrar un nuevo empleado
export const registrarEmpleado = async (req, res) => {
  try {
    const { nombreCompleto, correo, contrasenaHash, rol, puesto, telefono } = req.body;
    
    const existe = await prisma.empleado.findUnique({ where: { correo } });
    if (existe) {
      return res.status(400).json({ error: 'El correo ya está registrado' });
    }

    const nuevoEmpleado = await prisma.empleado.create({
      data: { nombreCompleto, correo, contrasenaHash, rol, puesto, telefono }
    });

    res.status(201).json({ message: 'Empleado registrado con éxito', empleado: nuevoEmpleado });
  } catch (error) {
    res.status(500).json({ error: 'Error al registrar empleado', details: error.message });
  }
};

// Obtener todos los empleados
export const obtenerEmpleados = async (req, res) => {
  try {
    const empleados = await prisma.empleado.findMany();
    res.json(empleados);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener empleados', details: error.message });
  }
};

// Login de Empleado / Administrador
export const loginEmpleado = async (req, res) => {
  try {
    const { correo, contrasenaHash } = req.body;

    const empleado = await prisma.empleado.findUnique({ where: { correo } });
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
        puesto: empleado.puesto
      } 
    });
  } catch (error) {
    res.status(500).json({ error: 'Error en el servidor al iniciar sesión', details: error.message });
  }
};

// Actualizar empleado
export const actualizarEmpleado = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombreCompleto, correo, rol, puesto, telefono, contrasenaHash } = req.body;

    const datosActualizacion = {
      nombreCompleto,
      correo,
      rol,
      puesto,
      telefono
    };

    if (contrasenaHash && contrasenaHash.trim() !== '') {
      datosActualizacion.contrasenaHash = contrasenaHash;
    }

    const empleadoActualizado = await prisma.empleado.update({
      where: { idEmpleado: Number(id) },
      data: datosActualizacion
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