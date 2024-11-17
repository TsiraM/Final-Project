import express from 'express';
import { PrismaClient } from '@prisma/client';

const productsRouter = express.Router();
const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
});

// Get all products
productsRouter.get('/all', async (req, res) => {
    try {
        const products = await prisma.product.findMany(); // Fetch all products
        return res.status(200).json({ message: 'All products retrieved successfully!', products });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error retrieving products', error: error.message });
    }
});

// Get product by ID
productsRouter.get('/:product_id', async (req, res) => {
    const { product_id } = req.params;
    try {
        const product = await prisma.product.findUnique({
            where: { product_id: Number(product_id) }, // Use product_id as the unique identifier
        });
        if (!product) {
            return res.status(404).json({ message: `Product with ID ${product_id} not found!` });
        }
        return res.status(200).json({ message: `Product with ID ${product_id} retrieved successfully!`, product });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error retrieving product', error: error.message });
    }
});

// Purchase product
productsRouter.post('/purchase', async (req, res) => {
    const { product_id, quantity } = req.body;

    // Basic validation
    if (!product_id || !quantity || quantity <= 0) {
        return res.status(400).json({ message: 'Invalid product ID or quantity' });
    }

    try {
        // Convert quantity to a number 
        const quantityInt = parseInt(quantity, 10);

        // Fetch the product by ID to check if it exists
        const product = await prisma.product.findUnique({
            where: { product_id: Number(product_id) },
        });

        // Check if product exists
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Check if there's enough stock
        if (product.stock < quantityInt) {
            return res.status(400).json({ message: 'Insufficient stock available' });
        }

        // Decrease stock after purchase
        const updatedProduct = await prisma.product.update({
            where: { product_id: Number(product_id) },
            data: { stock: { decrement: quantityInt } },  // quantity is an integer
        });

        return res.status(200).json({ message: 'Product purchased successfully!', product: updatedProduct });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error processing purchase', error: error.message });
    }
});

export default productsRouter;
