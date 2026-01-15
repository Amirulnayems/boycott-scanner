document.addEventListener('DOMContentLoaded', () => {

    // --- EXISTING CODE (Navigation & Pledge Form) ---
    // (Keep your previous pledge form logic here)

    // --- NEW: DATABASE MOCKUP ---
    // 1. Initial Database of Barcodes (Add real barcodes here to test)
    const defaultDB = {
        "123456789": { name: "Bad Soda Co.", status: "boycott", reason: "Uses exploited labor." },
        "987654321": { name: "Good Water Inc.", status: "safe", reason: "Ethically sourced." },
        "5000112638": { name: "Example Candy", status: "boycott", reason: "Parent company supports [Issue]." }
    };

    // Load DB from LocalStorage (or use default if empty)
    let productDB = JSON.parse(localStorage.getItem('boycottDB')) || defaultDB;

    // --- NEW: SCANNER LOGIC ---
    const html5QrcodeScanner = new Html5QrcodeScanner(
        "reader", 
        { fps: 10, qrbox: { width: 250, height: 250 } },
        /* verbose= */ false
    );

    function onScanSuccess(decodedText, decodedResult) {
        // Stop scanning once we find a code
        html5QrcodeScanner.clear();

        const resultDiv = document.getElementById('scan-result');
        const addForm = document.getElementById('add-product-form');
        
        // CHECK DATABASE
        if (productDB[decodedText]) {
            // Product Found
            const product = productDB[decodedText];
            showResult(product);
            addForm.classList.add('hidden');
        } else {
            // Product Not Found -> Show Add Form
            resultDiv.classList.add('hidden');
            addForm.classList.remove('hidden');
            
            // Pre-fill the barcode so user doesn't have to type it
            document.getElementById('new-barcode').value = decodedText;
        }
    }

    function onScanFailure(error) {
        // handle scan failure, usually better to ignore and keep scanning.
        // console.warn(`Code scan error = ${error}`);
    }

    // Render the Scanner
    html5QrcodeScanner.render(onScanSuccess, onScanFailure);

    // --- HELPER FUNCTIONS ---

    function showResult(product) {
        const resultDiv = document.getElementById('scan-result');
        const nameEl = document.getElementById('product-name');
        const badgeEl = document.getElementById('status-badge');
        const descEl = document.getElementById('status-desc');

        resultDiv.classList.remove('hidden');
        nameEl.innerText = product.name;
        descEl.innerText = product.reason;

        // Apply Styling based on status
        resultDiv.className = ''; // Reset classes
        if (product.status === 'boycott') {
            resultDiv.classList.add('status-boycott');
            badgeEl.innerText = "BOYCOTT";
            badgeEl.className = "badge-boycott";
        } else {
            resultDiv.classList.add('status-safe');
            badgeEl.innerText = "SAFE";
            badgeEl.className = "badge-safe";
        }
    }

    // Handle "Scan Again" Button
    document.getElementById('scan-again-btn').addEventListener('click', () => {
        location.reload(); // Simple reload to restart scanner
    });

    // Handle "Add New Product" Submission
    document.getElementById('newProductForm').addEventListener('submit', (e) => {
        e.preventDefault();
        
        const barcode = document.getElementById('new-barcode').value;
        const name = document.getElementById('new-name').value;
        const status = document.getElementById('new-status').value;
        const reason = document.getElementById('new-reason').value;

        // 1. Update the JS Object
        productDB[barcode] = { name, status, reason };

        // 2. Save to Browser Storage (Persistence)
        localStorage.setItem('boycottDB', JSON.stringify(productDB));

        alert("Product added! Reloading scanner...");
        location.reload();
    });
});

// --- SCANNER LOGIC ---
    // We use a custom configuration to hide the default UI
    const html5QrcodeScanner = new Html5QrcodeScanner(
        "reader", 
        { 
            fps: 10, 
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0,
            showTorchButtonIfSupported: true
        },
        /* verbose= */ false
    );

    function onScanSuccess(decodedText, decodedResult) {
        // 1. Stop scanning visually (optional: you can keep it running if you prefer)
        html5QrcodeScanner.clear();

        // 2. Hide placeholder, Show results
        document.querySelector('.placeholder-text').style.display = 'none';
        const resultDiv = document.getElementById('scan-result');
        const addForm = document.getElementById('add-product-form');
        
        // 3. Check Logic
        if (productDB[decodedText]) {
            const product = productDB[decodedText];
            
            // Populate Data
            document.getElementById('product-name').innerText = product.name;
            document.getElementById('status-desc').innerText = product.reason;
            
            const badge = document.getElementById('status-badge');
            if (product.status === 'boycott') {
                badge.innerText = "⚠️ BOYCOTT";
                badge.className = "badge-boycott";
                badge.style.background = "#e63946";
            } else {
                badge.innerText = "✅ SAFE";
                badge.className = "badge-safe";
                badge.style.background = "#2e7d32";
            }

            // Show Result Area, Hide Add Form
            resultDiv.classList.remove('hidden');
            addForm.classList.add('hidden');

        } else {
            // Product Not Found
            resultDiv.classList.add('hidden');
            addForm.classList.remove('hidden');
            document.getElementById('new-barcode').value = decodedText;
        }
    }

    html5QrcodeScanner.render(onScanSuccess, (error) => {
        // console.warn(error); // Ignore scan errors to keep console clean
    });

    // Handle "Scan Another"
    document.getElementById('scan-again-btn').addEventListener('click', () => {
        location.reload(); 
    });