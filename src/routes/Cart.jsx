import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";

function Cart() {
    const [cartItems, setCartItems] = useState([]); // Detailed cart items
    const [subtotal, setSubtotal] = useState(0); // Subtotal calculation
    const navigate = useNavigate();

    // Parse and group items from the cart cookie
    const getGroupedItems = () => {
        const cart = Cookies.get("cart");
        if (!cart) return {};

        // Convert the comma-separated cart string into a grouped object
        const cartArray = cart.split(",").map(Number);
        return cartArray.reduce((acc, id) => {
            acc[id] = (acc[id] || 0) + 1;
            return acc;
        }, {});
    };

    // Fetch product details and calculate totals
    useEffect(() => {
    const groupedItems = getGroupedItems();
    
    const fetchProductDetails = async () => {
        const productDetails = [];
        let total = 0;
        const api_host = 'http://localhost:3000/public/images/';
        
        for (const id of Object.keys(groupedItems)) {
            const validProductId = Number(id);
            
            // Check if the product ID is valid (not 0 or NaN)
            if (isNaN(validProductId) || validProductId <= 0) continue;
            
            try {
                const response = await fetch(`http://localhost:3000/products/${validProductId}`);
                if (response.ok) {
                    const data = await response.json();
                    const product = data.product;

                    if (product && product.cost) {
                        const price = parseFloat(product.cost);
                        const quantity = groupedItems[id];
                        const itemTotal = price * quantity;
                        
                        productDetails.push({
                            ...product,
                            price,
                            quantity,
                            total: itemTotal,
                            thumbnail: `${api_host}${product.image_filename}`,
                        });

                        total += itemTotal;
                    }
                }
            
            } catch (err) {
                console.error(`Error fetching product ID ${id}:`, err);
            }
        }
        
        setCartItems(productDetails);
        
        setSubtotal(total.toFixed(2));
    };
    
    if (Object.keys(groupedItems).length > 0) {
        fetchProductDetails();
    } else {
        setCartItems([]);
        setSubtotal(0);
    }
}, []);

    // Handle checkout and payload creation
    const handleCheckout = () => {
        const cartString = cartItems.map((item) => item.product_id).join(",");
        const invoiceTax = (Number(subtotal) * 0.15).toFixed(2);
        const invoiceTotal = (Number(subtotal) * 1.15).toFixed(2);
        const payload = {
            cartItems,
            invoice_amt: subtotal,
            invoice_tax: invoiceTax,
            invoice_total: invoiceTotal,
        };
        localStorage.setItem("cartPayload", JSON.stringify(payload)); // Use localStorage for consistency
        navigate("/checkout");
    };

    return (
        <div className="container mt-5">
            <h1 className="text-center mb-4">Your Cart</h1>
            {cartItems.length > 0 ? (
                <>
                    <table className="table table-bordered table-hover">
                        <thead className="thead-dark">
                            <tr>
                                <th>Thumbnail</th>
                                <th>Name</th>
                                <th>Price</th>
                                <th>Quantity</th>
                                <th>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {cartItems.map((item, index) => (
                                <tr key={item.product_id || `item-${index}`}>
                                    <td>
                                        <img
                                            src={item.thumbnail}
                                            alt={item.name || "Unknown"}
                                            className="img-fluid rounded"
                                            style={{ width: "50px" }}
                                        />
                                    </td>
                                    <td>{item.name || "Unknown"}</td>
                                    <td>${item.price ? item.price.toFixed(2) : "N/A"}</td>
                                    <td>{item.quantity || 0}</td>
                                    <td>${item.total ? item.total.toFixed(2) : "N/A"}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="row mt-4">
                        <div className="col-md-6">
                            <h4>Subtotal: ${subtotal}</h4>
                        </div>
                        <div className="col-md-6 text-right">
                            <button className="btn btn-primary mr-2" onClick={() => navigate("/")}>
                                Continue Shopping
                            </button>
                            <button className="btn btn-success" onClick={handleCheckout}>
                                Complete Purchase
                            </button>
                        </div>
                    </div>
                </>
            ) : (
                <div className="alert alert-info text-center">
                    <p>Your cart is empty.</p>
                </div>
            )}
        </div>
    );
}

export default Cart;
