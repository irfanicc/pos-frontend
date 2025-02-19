import React from "react";
import "../style.css/Menu.css";


const Menu = ({ dishes, addToOrder }) => {
  return (
    <div className="menu-section">
      <h1 className="title">Menu</h1>
      <div className="dish-grid">
        {dishes.map((dish) => (
          <div key={dish.id} className="dish-card" onClick={() => addToOrder(dish)}>
            <img className="dish-image" src={dish.Dish_Image} alt={dish.Dish_Name} />
            <h2>{dish.Dish_Name}</h2>
            <p><strong>Price:</strong> ₹{dish.Dish_Price.toFixed(2)}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Menu;