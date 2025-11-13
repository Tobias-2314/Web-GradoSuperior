// --- 1. MOCK DATA (Datos Ficticios de Productos) ---
const MOCK_PRODUCTS = [
    { id: 1, name: "Viaje Estelar", designer: "Artista XYZ", price: 29.99, image: "https://placehold.co/400x500/1f2937/a5b4fc?text=Diseño+Espacial", category: "graphics", color: "black" },
    { id: 2, name: "Forma Abstracta", designer: "Estudio Minimal", price: 34.50, image: "https://placehold.co/400x500/ffffff/d9f99d?text=Diseño+Abstracto", category: "minimal", color: "white" },
    { id: 3, name: "Onda Retro", designer: "VJ Designer", price: 25.00, image: "https://placehold.co/400x500/ef4444/fef08a?text=Onda+Retro", category: "vintage", color: "red" },
    { id: 4, name: "Ciber Punk", designer: "Neo Future", price: 39.00, image: "https://placehold.co/400x500/22c55e/ecfdf5?text=Ciber+Punk", category: "graphics", color: "green" },
    { id: 5, name: "Líneas Puras", designer: "Estudio Minimal", price: 22.99, image: "https://placehold.co/400x500/000000/f3f4f6?text=Líneas+Puras", category: "minimal", color: "black" },
    { id: 6, name: "Sunset City", designer: "Vibras Studio", price: 28.00, image: "https://placehold.co/400x500/f97316/fee2e2?text=Sunset+City", category: "vintage", color: "orange" },
];

let customizerState = { // Estado para el diseñador
    tshirtColor: '#ffffff', // Blanco por defecto
    tshirtView: 'frontal', 
    designText: 'Mi Diseño Único',
    designTextColor: '#1f2937', 
    designImage: null,
    // Propiedades para manipulación en el lienzo (usadas ahora para el mapeo UV)
    designX: 50, // Posición central en %
    designY: 50, // Posición central en %
    designScale: 1.0, // Escala inicial (1.0 = normal)
    isDragging: false,
    dragStartX: 0,
    dragStartY: 0,
};

// --- VARIABLES GLOBALES DE THREE.JS ---
let scene, camera, renderer, tShirtMesh, designTexture;
let controls; 
const container = document.getElementById('customizer-canvas-container');

// --- FUNCIONES COMPARTIDAS Y DE UTILIDAD (Omitidas para brevedad, asumiendo que están correctas) ---

function handleSubscribe(event) {
    event.preventDefault();
    alert('¡Gracias por suscribirte a TeeVerse! Revisa tu correo.');
}

function updateCartCount() {
    const countEl = document.getElementById('cart-count');
    if (countEl) countEl.textContent = '2'; // Mock count
}

function renderProductGrid(products) {
    // Lógica de renderizado de productos (sin cambios)
    const grid = document.getElementById('product-grid');
    if (!grid) return;
    
    grid.innerHTML = products.map(product => `
        <article class="product-card bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition duration-300 transform hover:-translate-y-1 cursor-pointer" onclick="alert('Navegando a la PDP de ${product.name}')">
            <figure class="product-image aspect-h-1 aspect-w-1 overflow-hidden relative">
                <img src="${product.image}" alt="${product.name}" 
                    class="w-full h-full object-cover transition duration-500 ease-in-out hover:scale-105" 
                    onerror="this.onerror=null; this.src='https://placehold.co/400x500/000000/ffffff?text=Imagen+No+Disp.'"
                >
                <button class="absolute bottom-2 right-2 bg-white text-gray-900 p-2 rounded-full shadow-md hover:bg-gray-200 transition">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14"/><path d="M5 12h14"/></svg>
                </button>
            </figure>
            <div class="product-info p-4 text-center">
                <h3 class="product-name font-semibold text-lg hover:text-indigo-600 transition">${product.name}</h3>
                <p class="product-designer text-sm text-gray-500 mb-1">por ${product.designer}</p>
                <p class="product-price font-bold text-xl text-gray-900">$${product.price.toFixed(2)}</p>
            </div>
        </article>
    `).join('');

    fillFilters();
    const applyFiltersBtn = document.getElementById('apply-filters-btn');
    if (applyFiltersBtn) applyFiltersBtn.onclick = filterProducts;
}

function fillFilters() {
    // Lógica de llenado de filtros (sin cambios)
    const categories = [...new Set(MOCK_PRODUCTS.map(p => p.category))];
    const categoryFiltersEl = document.getElementById('category-filters');
    if (categoryFiltersEl) {
        categoryFiltersEl.innerHTML = categories.map(cat => `<label class="flex items-center text-sm"><input type="checkbox" name="filter-category" value="${cat}" class="rounded text-indigo-600 focus:ring-indigo-500 mr-2">${cat.charAt(0).toUpperCase() + cat.slice(1)}</label>`).join('');
    }
    const colors = [...new Set(MOCK_PRODUCTS.map(p => p.color))];
    const colorFiltersEl = document.getElementById('color-filters');
    if (colorFiltersEl) {
        colorFiltersEl.innerHTML = colors.map(color => `<button class="w-8 h-8 rounded-full border-2 border-gray-300 hover:border-indigo-600 transition" data-color="${color}" style="background-color: ${color};" onclick="toggleColorFilter(this)" aria-label="Filtrar por color ${color}"></button>`).join('');
    }
}

function filterProducts() {
    // Lógica de filtrado (sin cambios)
    const selectedCategories = Array.from(document.querySelectorAll('input[name="filter-category"]:checked')).map(el => el.value);
    const selectedColors = Array.from(document.querySelectorAll('.color-swatches-active')).map(el => el.dataset.color);

    let filtered = MOCK_PRODUCTS.filter(product => {
        const catMatch = selectedCategories.length === 0 || selectedCategories.includes(product.category);
        const colorMatch = selectedColors.length === 0 || selectedColors.includes(product.color);
        return catMatch && colorMatch;
    });

    const productCountEl = document.getElementById('product-count');
    if (productCountEl) productCountEl.textContent = filtered.length;
    renderProductGrid(filtered);
}

function toggleColorFilter(button) {
    button.classList.toggle('color-swatches-active');
    button.classList.toggle('border-indigo-600');
    button.classList.toggle('border-2');
}

// --- LÓGICA ESPECÍFICA DEL DISEÑADOR (customizer.html) ---

/** Inicializa la escena 3D con Three.js */
function initThreeDScene() {
    const container = document.getElementById('customizer-canvas-container');
    if (!container) {
        console.error("Contenedor 3D no encontrado.");
        return;
    }
    
    // 1. Escena
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf3f4f6); 
    
    // 2. Cámara
    const aspect = container.clientWidth / container.clientHeight;
    camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
    camera.position.z = 2.5;
    
    // 3. Renderizador
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);
    
    // 4. Luces
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(5, 5, 5).normalize();
    scene.add(directionalLight);

    // 5. Controles (OrbitControls)
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; 
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.minDistance = 2;
    controls.maxDistance = 5;
    controls.target.set(0, 0, 0); 

    // 6. Modelo (Cilindro simple como Mockup de T-Shirt)
    const geometry = new THREE.CylinderGeometry(1, 1, 2, 64); 
    const material = new THREE.MeshPhongMaterial({ 
        color: customizerState.tshirtColor,
        side: THREE.FrontSide 
    });
    tShirtMesh = new THREE.Mesh(geometry, material);
    scene.add(tShirtMesh);
    tShirtMesh.rotation.x = Math.PI / 2; // Rota para simular una camiseta de pie
    tShirtMesh.rotation.y = Math.PI / 2;
    
    // 7. Render Loop
    function animate() {
        requestAnimationFrame(animate);
        controls.update(); 
        renderer.render(scene, camera);
    }
    animate();
    
    // Añadir listener para redimensionar
    window.addEventListener('resize', onWindowResize, false);
}

function onWindowResize() {
    const container = document.getElementById('customizer-canvas-container');
    if (!container) return;
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
}

/** Proyecta el diseño (Texto/Imagen) sobre la camiseta 3D */
function applyDesignToMesh() {
    if (!tShirtMesh) return;
    
    // 1. Limpieza y reinicio de recursos
    if (designTexture) {
        designTexture.dispose();
    }
    
    // Reinicia el material a un estado sin textura de diseño
    tShirtMesh.material.map = null;
    tShirtMesh.material.transparent = false; 
    tShirtMesh.material.depthWrite = true; // Permite que el color base escriba en el buffer
    tShirtMesh.material.needsUpdate = true;
    
    let isDesignApplied = false;

    // A. Diseño de Imagen
    if (customizerState.designImage) {
        designTexture = new THREE.TextureLoader().load(customizerState.designImage, (texture) => {
            // Callback después de cargar la imagen
            tShirtMesh.material.map = texture;
            tShirtMesh.material.transparent = true; 
            tShirtMesh.material.depthWrite = false; // <-- CORRECCIÓN CLAVE: Desactiva la escritura de profundidad para áreas transparentes
            tShirtMesh.material.needsUpdate = true;
        });
        designTexture.center.set(0.5, 0.5);
        isDesignApplied = true;

    } 
    // B. Diseño de Texto (CanvasTexture)
    else if (customizerState.designText && customizerState.designText !== 'Mi Diseño Único') {
        const canvas = document.createElement('canvas');
        canvas.width = 1024;
        canvas.height = 1024;
        const ctx = canvas.getContext('2d');
        
        ctx.fillStyle = "rgba(0, 0, 0, 0)"; 
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.font = 'Bold 150px Inter'; 
        ctx.fillStyle = customizerState.designTextColor;
        ctx.textAlign = 'center';
        
        ctx.fillText(customizerState.designText, canvas.width / 2, canvas.height / 2 + 50);
        
        designTexture = new THREE.CanvasTexture(canvas);
        designTexture.center.set(0.5, 0.5);
        
        tShirtMesh.material.map = designTexture;
        tShirtMesh.material.transparent = true; 
        tShirtMesh.material.depthWrite = false; // <-- CORRECCIÓN CLAVE: Desactiva la escritura de profundidad para áreas transparentes
        tShirtMesh.material.needsUpdate = true;

        isDesignApplied = true;
    }
    
    // Aplicar Transformaciones de Estado (Posición y Escala)
    if (isDesignApplied && designTexture) {
        const offsetX = (customizerState.designX - 50) / 100; 
        const offsetY = (customizerState.designY - 50) / -100; 
        
        designTexture.offset.set(offsetX, offsetY);
        designTexture.repeat.set(
            1 / customizerState.designScale, 
            1 / customizerState.designScale
        );
        designTexture.needsUpdate = true;
    }
}


function initDragEvents() {
    const canvasElement = document.getElementById('customizer-canvas-container').querySelector('canvas');
    // Nos aseguramos de que el canvas de Three.js exista antes de adjuntar eventos
    if (canvasElement) { 
        canvasElement.onmousedown = startDragging;
        canvasElement.ontouchstart = (e) => startDragging(e.touches[0]);
        
        document.onmousemove = dragDesign;
        document.onmouseup = stopDragging;
        document.ontouchmove = (e) => dragDesign(e.touches[0]);
        document.ontouchend = stopDragging;
        
        canvasElement.style.cursor = 'grab';
    }
}

/** Comienza el evento de arrastre */
function startDragging(e) {
    if (e.target.tagName === 'CANVAS' || e.type === 'touchstart') {
        e.preventDefault();
        customizerState.isDragging = true;
        customizerState.dragStartX = e.clientX || e.pageX;
        customizerState.dragStartY = e.clientY || e.pageY;
        
        const canvasElement = document.getElementById('customizer-canvas-container').querySelector('canvas');
        if (canvasElement) canvasElement.style.cursor = 'grabbing';
    }
}

/** Mueve el elemento de diseño */
function dragDesign(e) {
    if (!customizerState.isDragging) return;
    
    const canvas = document.getElementById('customizer-canvas-container');
    if (!canvas) return;

    const canvasRect = canvas.getBoundingClientRect();
    
    const deltaX = (e.clientX || e.pageX) - customizerState.dragStartX;
    const deltaY = (e.clientY || e.pageY) - customizerState.dragStartY;
    
    const percentX = (deltaX / canvasRect.width) * 100;
    const percentY = (deltaY / canvasRect.height) * 100;
    
    customizerState.designX = customizerState.designX + percentX;
    customizerState.designY = customizerState.designY + percentY;

    customizerState.designX = Math.max(10, Math.min(90, customizerState.designX));
    customizerState.designY = Math.max(10, Math.min(90, customizerState.designY));

    customizerState.dragStartX = e.clientX || e.pageX;
    customizerState.dragStartY = e.clientY || e.pageY;
    
    updateCustomizerPreview();
}

/** Termina el evento de arrastre */
function stopDragging() {
    if (customizerState.isDragging) {
        customizerState.isDragging = false;
        const canvasElement = document.getElementById('customizer-canvas-container').querySelector('canvas');
        if (canvasElement) canvasElement.style.cursor = 'grab';
    }
}

/** Escala el elemento de diseño (control por botón) */
function scaleDesign(factor) {
    customizerState.designScale = Math.max(0.5, Math.min(2.0, customizerState.designScale * factor));
    updateCustomizerPreview();
}

/** Actualiza la previsualización de la camiseta 3D */
function updateCustomizerPreview() {
    // 1. Lógica de vista (simula rotación 3D manipulando la malla)
    if (tShirtMesh) {
        let rotationY = Math.PI / 2; // Default frontal
        
        if (customizerState.tshirtView === 'trasera') {
            rotationY = Math.PI / 2 + Math.PI; // 180 grados 
        } else if (customizerState.tshirtView === 'lateral') {
             rotationY = Math.PI; // 90 grados 
        }
        
        if (!customizerState.isDragging) {
             tShirtMesh.rotation.y = rotationY;
        }
    }

    // 2. Proyecta el diseño en la malla 3D (Posición/Escala/Texto/Imagen)
    applyDesignToMesh();
    
    // 3. Actualiza el estado visual de los botones de vista
    const currentViewElement = document.getElementById('current-view');
    if (currentViewElement) {
        currentViewElement.textContent = customizerState.tshirtView.toUpperCase();
    }
    document.querySelectorAll('#view-controls .view-btn').forEach(btn => {
        if (btn.dataset.view === customizerState.tshirtView) {
            btn.classList.add('bg-gray-200');
        } else {
            btn.classList.remove('bg-gray-200');
        }
    });
}

function updateTshirtColor(colorHex, clickedElement) {
    customizerState.tshirtColor = colorHex;
    
    if (tShirtMesh) {
        tShirtMesh.material.color.set(colorHex);
    }
    
    updateCustomizerPreview(); 
    document.querySelectorAll('#tshirt-color-selectors .color-selector-swatch').forEach(swatch => {
        swatch.classList.remove('active');
    });
    clickedElement.classList.add('active');
}

function updateTshirtView(view) {
    customizerState.tshirtView = view;
    if (controls) {
        let targetAngle = Math.PI / 2; 
        if (view === 'trasera') {
            targetAngle = Math.PI / 2 + Math.PI;
        } else if (view === 'lateral') {
            targetAngle = Math.PI; 
        }
        tShirtMesh.rotation.y = targetAngle;
    }
    updateCustomizerPreview();
}

function updateDesignText(text) {
    customizerState.designText = text.trim() === '' ? 'Mi Diseño Único' : text;
    customizerState.designImage = null; // Prioriza el texto
    const designImageInput = document.getElementById('design-image-input');
    if (designImageInput) designImageInput.value = ''; 
    updateCustomizerPreview();
}

function updateDesignTextColor(colorHex) {
    customizerState.designTextColor = colorHex;
    updateCustomizerPreview();
}

function handleImageUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            customizerState.designImage = e.target.result;
            customizerState.designText = ''; 
            const designTextInput = document.getElementById('design-text-input');
            if (designTextInput) designTextInput.value = ''; 
            updateCustomizerPreview();
        };
        reader.readAsDataURL(file);
    }
}

/** Restablece el estado del diseño a sus valores por defecto */
function resetDesign() {
    customizerState = {
        tshirtColor: '#ffffff', 
        tshirtView: 'frontal', 
        designText: 'Mi Diseño Único',
        designTextColor: '#1f2937', 
        designImage: null,
        designX: 50,
        designY: 50,
        designScale: 1.0,
        isDragging: false,
        dragStartX: 0,
        dragStartY: 0,
    };
    
    // Limpiar inputs
    const designTextInput = document.getElementById('design-text-input');
    if (designTextInput) designTextInput.value = '';
    const designImageInput = document.getElementById('design-image-input');
    if (designImageInput) designImageInput.value = ''; 
    const designTextColorInput = document.getElementById('design-text-color');
    if (designTextColorInput) designTextColorInput.value = '#1f2937';

    // Restablecer color de base visual
    document.querySelectorAll('#tshirt-color-selectors .color-selector-swatch').forEach(swatch => {
        swatch.classList.remove('active');
    });
    const defaultColorSwatch = document.querySelector('#tshirt-color-selectors [data-color="#ffffff"]');
    if (defaultColorSwatch) defaultColorSwatch.classList.add('active');

    // Restablecer el estado 3D
    if (tShirtMesh) {
        tShirtMesh.rotation.y = Math.PI / 2;
        if (controls) controls.reset();
    }

    updateCustomizerPreview();
    alert('El diseño ha sido restablecido.');
}

// Mock de la función de zoom para Three.js OrbitControls
window.zoomCamera = (factor) => {
    if (camera) {
        const newFOV = camera.fov / factor;
        camera.fov = Math.max(20, Math.min(120, newFOV)); // Limita el zoom
        camera.updateProjectionMatrix();
    }
};