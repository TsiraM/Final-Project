import React from 'react';

const Confirmation = () => {
  return (
    <div>
      <h1>Thank You for Your Purchase!</h1>
      <p>Your order has been processed successfully. We appreciate your business!</p>
      <button onClick={() => window.location.href = '/'}>Continue Shopping</button>
    </div>
  );
};

export default Confirmation;
