let id = 1;

const form = document.getElementById("productoForm");
const tabla = document
  .getElementById("tablaProductos")
  .getElementsByTagName("tbody")[0];

form.addEventListener("submit", async function (e) {
  e.preventDefault();

  const nombre = document.getElementById("nombre").value.trim();
  const descripcion = document.getElementById("descripcion").value.trim();
  const precio = document.getElementById("precio").value; // si lo tienes en el form
  const archivoImagen = document.getElementById("imagen").files[0];

  if (!nombre || !descripcion) {
    alert("Por favor completa todos los campos.");
    return;
  }

  if (!archivoImagen) {
    alert("Por favor selecciona una imagen.");
    return;
  }

  // Crear URL temporal de la imagen para mostrarla en la tabla
  const urlImagen = URL.createObjectURL(archivoImagen);

  // Crear objeto de datos para enviar al backend
  const formData = new FormData();
  formData.append("nombre", nombre);
  formData.append("descripcion", descripcion);
  formData.append("precio", precio || 0);
  formData.append("imagen", archivoImagen);

  try {
    // Llamada al backend (ajusta la URL según tu configuración)
    const response = await fetch("http://localhost:8080/api/productos", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Error al guardar el producto");
    }

    const productoGuardado = await response.json();

    // Mostrar producto en la tabla sin recargar
    const fila = tabla.insertRow();
    fila.innerHTML = `
      <td>${productoGuardado.id || id++}</td>
      <td>${productoGuardado.nombre}</td>
      <td><img src="${urlImagen}" alt="${productoGuardado.nombre}" class="producto-img"></td>
      <td>${productoGuardado.descripcion}</td>
      <td>${productoGuardado.precio || "N/A"}</td>
    `;

    alert("✅ Producto guardado exitosamente");
    form.reset();

  } catch (error) {
    console.error("Error al guardar:", error);
    alert("❌ No se pudo guardar el producto.");
  }
});