import express from 'express';
import { PrismaClient } from '@prisma/client';

const productsRouter = express.Router();
const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
});

// Get all products
productsRouter.get('/all', async (req, res) => {
    try {
       
        res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173'); 
        res.setHeader('Access-Control-Allow-Credentials', 'true'); 

        // Fetch products
        const products = await prisma.product.findMany();
        res.setHeader('Content-Type', 'application/json'); 
        res.status(200).json({ message: "All products retrieved successfully!", products });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error retrieving products', error: error.message });
    }
});
// Get product by ID
productsRouter.get('/:id', async (req, res) => {
    const { id } = req.params; 
    try {
        const product = await prisma.product.findUnique({
            where: { product_id: Number(id) }, 
        });

        if (!product) {
            return res.status(404).json({ message: `Product with ID ${id} not found!` });
        }

        // Image URL
        return res.status(200).json({
            message: `Product with ID ${id} retrieved successfully!`,
            product: {
                ...product,
                thumbnail: `/images/${product.image_filename}`, 
            },
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error retrieving product', error: error.message });
    }
});

productsRouter.post('/purchase', async (req, res) => {
    try {
        // Define cookie options for cartPayload with SameSite and secure flag
        const cookieOptions = {
            sameSite: 'None',  // Allow cross-site requests
            secure: process.env.NODE_ENV === 'production',  // Enable secure cookies in production (HTTPS only)
            httpOnly: true,    // Ensures the cookie is not accessible via JavaScript
        };

        // Set session or cart payload cookie
        res.cookie('cartPayload', req.body.cart, cookieOptions);

        console.log('Session Data:', req.session);  

        // Check if user is authenticated
        if (!req.session || !req.session.user_id) {
            return res.status(401).json({ message: 'Unauthorized: Please log in' });
        }

        const customer_id = req.session.user_id;
        console.log('Customer ID:', customer_id); 
        
        // Destructure the required fields from the request body
        const { street, city, province, country, postal_code, credit_card, credit_expire, credit_cvv, cart, invoice_amt, invoice_tax, invoice_total } = req.body;

        // Add basic validation for required fields
        if (!street || !city || !province || !country || !postal_code || !credit_card || !credit_expire || !credit_cvv || !cart || !invoice_amt || !invoice_tax || !invoice_total) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const cartItems = cart.split(',').map(item => {
            const parsedItem = parseInt(item);
            return isNaN(parsedItem) ? null : parsedItem; // Replace invalid values with null
        }).filter(item => item !== null);  // Remove invalid values from the cart
        console.log('Parsed cart items:', cartItems);  // Log cart items to ensure proper parsing

        if (cartItems.length === 0) {
            return res.status(400).json({ message: 'No valid products in the cart' });
        }

        // Group the cart items by product_id and calculate the quantity for each
        const cartGrouped = cartItems.reduce((acc, product_id) => {
            acc[product_id] = (acc[product_id] || 0) + 1;
            return acc;
        }, {});

        // Start transaction to ensure actions are atomic
        const purchase = await prisma.$transaction(async (prisma) => {
            const purchaseRecord = await prisma.purchase.create({
                data: {
                    customer_id,  // Using customer_id from session
                    street,
                    city,
                    province,
                    country,
                    postal_code,
                    credit_card,
                    credit_expire,
                    credit_cvv,
                    invoice_amt,
                    invoice_tax,
                    invoice_total,
                },
            });

            const purchaseItems = [];
            for (let product_id in cartGrouped) {
                const productIdNum = Number(product_id); // Ensure product_id is a number
                console.log(`Querying for product_id: ${productIdNum}`);  // Log to check the product_id

                if (isNaN(productIdNum)) {
                    throw new Error(`Invalid product_id: ${product_id}`);
                }

                // Query product by product_id
                const product = await prisma.product.findUnique({
                    where: { product_id: productIdNum }, 
                });

                if (!product) {
                    throw new Error(`Product with ID ${productIdNum} not found`);
                }

                if (product.stock < cartGrouped[product_id]) {
                    throw new Error(`Insufficient stock for product ${productIdNum}`);
                }

                // Update product stock
                await prisma.product.update({
                    where: { product_id: productIdNum },
                    data: { stock: { decrement: cartGrouped[product_id] } },
                });

                // Check if the purchase item already exists
                const existingPurchaseItem = await prisma.purchaseItem.findFirst({
                    where: {
                        purchase_id: purchaseRecord.purchase_id,
                        product_id: productIdNum,
                    },
                });

                if (existingPurchaseItem) {
                    // If the item exists, update its quantity
                    await prisma.purchaseItem.update({
                        where: { purchase_item_id: existingPurchaseItem.purchase_item_id },
                        data: { quantity: existingPurchaseItem.quantity + cartGrouped[product_id] },
                    });
                } else {
                    // If the item does not exist, insert a new purchase item
                    purchaseItems.push({
                        purchase_id: purchaseRecord.purchase_id,
                        product_id: productIdNum,
                        quantity: cartGrouped[product_id],
                    });
                }
            }

            // Create new purchase items if they don't exist
            if (purchaseItems.length > 0) {
                await prisma.purchaseItem.createMany({
                    data: purchaseItems,
                });
            }

            return purchaseRecord;
        });

        return res.status(200).json({
            message: 'Purchase completed successfully!',
            purchaseId: purchase.purchase_id,
        });
    } catch (error) {
        console.error('Error processing purchase:', error);
        return res.status(500).json({ message: 'Error processing purchase', error: error.message });
    }
});

export default productsRouter;
