import React from 'react'; 
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

function Home() {
    const [products, setProducts] = useState([]); // For storing products
    const [loading, setLoading] = useState(true); // For loading state
    const [error, setError] = useState(null);  // For error handling

    useEffect(() => {
        fetch('http://localhost:3000/products/all', {
            method: 'GET',
            credentials: 'include', // Include cookies for CORS
        })
        .then(async (response) => {
            console.log('Response status:', response.status);
            console.log('Content-Type header:', response.headers.get('Content-Type'));
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setProducts(data.products); // Set the products data
            setLoading(false); // Stop loading when data is fetched
        })
        .catch((error) => {
            console.error('Error fetching products:', error);
            setError(error.message); // Set the error
            setLoading(false); // Stop loading even if there's an error
        });
    }, []);

    if (loading) {
        return <p>Loading products...</p>;
    }

    if (error) {
        return <p>Error: {error}</p>; // Display error if one exists
    }

    return (
        <div>
            <h1 className="text-center mb-4">Our Products</h1>
            <div className="container">
                <div className="row">
                    {products.length === 0 ? (
                        <p>No products available at the moment.</p> // Handle empty data
                    ) : (
                        products.map((product) => (
                            <div key={product.product_id} className="col-md-4 mb-4">
                                <div className="product-card border p-3 text-center">
                                    <img
                                        src={`http://localhost:3000/public/images/${product.image_filename}`}
                                        alt={product.name}
                                        className="img-fluid mb-2"
                                        style={{ maxWidth: "200px", maxHeight: "200px" }}
                                    />
                                    <h2 className="product-name h5">{product.name}</h2>
                                    <p className="product-price text-muted">${product.cost}</p>
                                    <Link to={`/details/${product.product_id}`} className="btn btn-primary mt-2">
                                        View Details
                                    </Link>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}    

console.log("VITE_APP_HOST:", 'http://localhost:3000');

export default Home;
