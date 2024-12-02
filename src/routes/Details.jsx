import React from 'react'; 
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom"; 
import Cookies from "js-cookie"; 

function Details() {
    const { id } = useParams(); // Get the product ID from the URL
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null); // For error handling

    useEffect(() => {
        // Fetch the product details by ID
        fetch(`http://localhost:3000/products/${id}`)
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Product not found!');
                }
                return response.json();
            })
            .then((data) => {
                setProduct(data.product); // Set the fetched product data
                setLoading(false);
            })
            .catch((error) => {
                console.error("Error fetching product details:", error);
                setLoading(false);
                setError(error.message); // Set the error message
            });
    }, [id]);

    const addToCart = () => {
        const cart = Cookies.get("cart");
        const cartArray = cart ? cart.split(",").map(Number) : [];
        if (!cartArray.includes(id)) {
            cartArray.push(id);
            Cookies.set("cart", cartArray.join(","), { expires: 7 });
        }
    };

    if (loading) {
        return <p>Loading product details...</p>;
    }

    if (error) {
        return <p>{error}</p>; // Display error message if there's an issue
    }

    if (!product) {
        return <p>Product not found!</p>;
    }

    return (
        <div className="container my-5">
            <div className="row">
                {/* Product Image Section */}
                <div className="col-md-6 text-center">
                    <img
                        src={`http://localhost:3000/public/images/${product.image_filename}`}
                        alt={product.name}
                        className="img-fluid rounded"
                        style={{ maxHeight: '400px', objectFit: 'contain' }}
                    />
                </div>
    
                {/* Product Details Section */}
                <div className="col-md-6">
                    <h1 className="mb-4">{product.name}</h1>
                    <p className="text-muted fs-5">${product.cost}</p> 
                    <p className="text-dark">{product.description}</p> 
                    <p className="text-success">Stock: {product.stock}</p> 
    
                    {/* Actions */}
                    <div className="mt-4">
                        <button 
                            onClick={addToCart} 
                            className="btn btn-primary me-3"
                        >
                            Add to Cart
                        </button>
                        <Link to="/" className="btn btn-secondary">
                            Go Back
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
export default Details;
