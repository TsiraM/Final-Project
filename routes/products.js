import express from 'express';
import { PrismaClient } from '@prisma/client'; 
const productsRouter = express.Router();
// Prisma setup
const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
});
 
// Get all products
productsRouter.get('/all', async (req, res) => {
    try {
        const products = await prisma.product.findMany(); // Fetch all products from the database
        return res.status(200).json({ message: 'All products retrieved successfully!', products });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error retrieving products', error: error.message });
    }
});
 
// Get product by ID
productsRouter.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const product = await prisma.product.findUnique({ where: { id: Number(id) } }); // Fetch product by ID
        if (!product) {
            return res.status(404).json({ message: `Product with ID ${id} not found!` });
        }
        return res.status(200).json({ message: `Product with ID ${id} retrieved successfully!`, product });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error retrieving product', error: error.message });
    }
});
 
// Purchase product
productsRouter.post('/purchase', async (req, res) => {
    const { productId, quantity } = req.body;
 
    // Basic validation
    if (!productId || !quantity || quantity <= 0) {
        return res.status(400).json({ message: 'Invalid product ID or quantity' });
    }
 
    try {
        // Logic to handle product purchase 
        await prisma.product.update({
            where: { id: Number(productId) },
            data: { stock: { decrement: quantity } }, // Assuming there's a stock field
        });
 
        return res.status(200).json({ message: 'Product purchased successfully!' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error processing purchase', error: error.message });
    }
});
 
export default productsRouter;