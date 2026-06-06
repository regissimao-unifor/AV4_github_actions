const productList = document.querySelector('#products'); 
const addProductForm = document.querySelector('#add-product-form');
const updateProductForm = document.querySelector('#update-product-form');
const updateProductId = document.querySelector('#update-id');
const updateProductDescription = document.querySelector('#update-description');
const updateProductPrice = document.querySelector('#update-price');
const updateModal = document.querySelector('#update-modal');
const updateCancel = document.querySelector('#update-cancel');

// Holds the product currently being edited so we can fall back to its
// existing values (and keep its name) when a field is left untouched.
let currentProduct = null;

// Function to fetch all products from the server
async function fetchProducts() {
  const response = await fetch('http://54.233.46.177:3000/products');
  const products = await response.json();

  // Clear product list
  productList.innerHTML = '';

  // Add each product to the list
  products.forEach(product => {
    const li = document.createElement('li');
    li.innerHTML = `${product.name} - $${product.price}`;

    // Add delete button for each product
    const deleteButton = document.createElement('button');
    deleteButton.innerHTML = 'Delete';
    deleteButton.addEventListener('click', async () => {
      await deleteProduct(product.id);
      await fetchProducts();
    });
    li.appendChild(deleteButton);

    // Add update button for each product
    const updateButton = document.createElement('button');
    updateButton.innerHTML = 'Update';
    updateButton.addEventListener('click', () => {
      currentProduct = product;
      updateProductId.value = product.id;
      updateProductDescription.value = '';
      updateProductDescription.placeholder = product.description;
      updateProductPrice.value = '';
      updateProductPrice.placeholder = product.price;
      updateModal.classList.add('open');
    });
    li.appendChild(updateButton);

    productList.appendChild(li);
  });
}


// Event listener for Add Product form submit button
addProductForm.addEventListener('submit', async event => {
  event.preventDefault();
  const name = addProductForm.elements['name'].value;
  const price = addProductForm.elements['price'].value;
  const description = addProductForm.elements['description'].value;
  await addProduct(name, price, description);
  addProductForm.reset();
  await fetchProducts();
});

// Function to add a new product
async function addProduct(name, price, description) {
  const response = await fetch('http://54.233.46.177:3000/products', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ name, price, description })
  });
  return response.text();
}

// Event listener for Update Product (modal) Save button
updateProductForm.addEventListener('submit', async event => {
  event.preventDefault();
  const id = updateProductId.value;
  // Empty field means "keep current value" (shown as placeholder).
  const description = updateProductDescription.value || currentProduct.description;
  const price = updateProductPrice.value || currentProduct.price;
  await updateProduct(id, currentProduct.name, description, price);
  updateModal.classList.remove('open');
  await fetchProducts();
});

// Close the modal without saving
updateCancel.addEventListener('click', () => {
  updateModal.classList.remove('open');
});

// Function to update an existing product
async function updateProduct(id, name, description, price) {
  const response = await fetch('http://54.233.46.177:3000/products/' + id, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ name, description, price })
  });
  return response.text();
}

// Function to delete a new product
async function deleteProduct(id) {
  const response = await fetch('http://54.233.46.177:3000/products/' + id, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json'
    },
    //body: JSON.stringify({id})
  });
  return response.text();
}

// Fetch all products on page load
fetchProducts();
