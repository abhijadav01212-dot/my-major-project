import { all, get, run } from '../database/sqlite.js';

function mapProduct(row) {
  const photos = all('SELECT url FROM product_photos WHERE product_id = ? ORDER BY id', [row.id]).map((photo) => photo.url);
  return {
    _id: row.id,
    id: row.id,
    name: row.name,
    category: row.category,
    description: row.description,
    price: row.price,
    stock: row.stock,
    status: row.status,
    imageUrl: photos[0] || '',
    photos,
    createdAt: row.created_at
  };
}

export async function listInventory(_req, res) {
  const rows = all('SELECT * FROM products WHERE status != ? ORDER BY created_at DESC', ['removed']);
  res.json(rows.map(mapProduct));
}

export async function addInventory(req, res) {
  const body = req.body || {};
  const name = String(body.name || '').trim();
  const category = String(body.category || body.oilType || 'Engine Oil').trim();
  const price = Number(body.price || 0);
  const stock = Number(body.stock || 0);
  if (!name || price < 0) return res.status(400).json({ message: 'Product name and valid price are required' });

  const result = run(
    `INSERT INTO products (name, category, description, price, stock, created_by)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [name, category, body.description || body.compatibility || '', price, stock, req.user.id]
  );
  const productId = Number(result.lastInsertRowid);
  const uploaded = (req.files || []).map((file) => `/uploads/${file.filename}`);
  const directPhotos = [body.imageUrl, ...(Array.isArray(body.photos) ? body.photos : [])].filter(Boolean);
  for (const url of [...uploaded, ...directPhotos]) {
    run('INSERT INTO product_photos (product_id, url) VALUES (?, ?)', [productId, url]);
  }
  res.status(201).json({ message: 'New product uploaded', product: mapProduct(get('SELECT * FROM products WHERE id = ?', [productId])) });
}

export async function updateInventory(req, res) {
  const product = get('SELECT * FROM products WHERE id = ?', [req.params.id]);
  if (!product) return res.status(404).json({ message: 'Product not found' });
  const next = { ...product, ...req.body };
  run(
    `UPDATE products SET name = ?, category = ?, description = ?, price = ?, stock = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
    [next.name, next.category, next.description || '', Number(next.price || 0), Number(next.stock || 0), next.status || 'active', req.params.id]
  );
  const uploaded = (req.files || []).map((file) => `/uploads/${file.filename}`);
  for (const url of uploaded) run('INSERT INTO product_photos (product_id, url) VALUES (?, ?)', [req.params.id, url]);
  res.json({ message: 'Product updated', product: mapProduct(get('SELECT * FROM products WHERE id = ?', [req.params.id])) });
}

export async function removeInventory(req, res) {
  run('UPDATE products SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', ['removed', req.params.id]);
  res.json({ message: 'Product removed' });
}
