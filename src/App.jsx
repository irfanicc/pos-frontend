import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaHome } from "react-icons/fa";
import Header from "./components/Header";
import SearchFilter from "./components/SearchFilter";
import DropdownSection from "./components/DropdownSection";
import Menu from "./components/Menu";
import OrderSummary from "./components/OrderSummary";
import AddDish from "./components/AddDish";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import "./App.css";

const App = () => {
  const [dishes, setDishes] = useState([]);
  const [order, setOrder] = useState(() => {
    const savedOrders = localStorage.getItem("orders");
    return savedOrders ? JSON.parse(savedOrders) : {};
  });
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("");
  const [tables, setTables] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedTable, setSelectedTable] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [activeTable, setActiveTable] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch data from the backend
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = {};
        if (search) params.Dish_Name = search;
        if (filter) params.Dish_Type = filter;
        const [dishesResponse, tablesResponse, employeesResponse] = await Promise.all([
          axios.get(`${process.env.REACT_APP_API_URL}/Home/Dishes-list/`, { params }),
          axios.get(`${process.env.REACT_APP_API_URL}/Home/Tables/`),
          axios.get(`${process.env.REACT_APP_API_URL}/Home/Employe-list/`),
        ]);
        setDishes(dishesResponse.data);
        setTables(tablesResponse.data);
        setEmployees(employeesResponse.data);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to fetch data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [search, filter]);

  // Save orders to localStorage
  useEffect(() => {
    localStorage.setItem("orders", JSON.stringify(order));
  }, [order]);

  // Add a dish to the order
  const addToOrder = (dish) => {
    if (!selectedTable) {
      alert("Please select a table before adding items to the order.");
      return;
    }
    setOrder((prevOrder) => {
      const tableOrder = prevOrder[selectedTable] || [];
      const existingDish = tableOrder.find((item) => item.id === dish.id);
      let updatedTableOrder;
      if (existingDish) {
        updatedTableOrder = tableOrder.map((item) =>
          item.id === dish.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        updatedTableOrder = [...tableOrder, { ...dish, quantity: 1 }];
      }
      return { ...prevOrder, [selectedTable]: updatedTableOrder };
    });
    setActiveTable(selectedTable);
  };

  // Remove a dish from the order
  const removeFromOrder = (id) => {
    if (!activeTable) return;
    setOrder((prevOrder) => {
      const tableOrder = prevOrder[activeTable] || [];
      const updatedTableOrder = tableOrder.filter((item) => item.id !== id);
      return { ...prevOrder, [activeTable]: updatedTableOrder };
    });
  };

  // Increase the quantity of a dish in the order
  const increaseQuantity = (id) => {
    if (!activeTable) return;
    setOrder((prevOrder) => {
      const tableOrder = prevOrder[activeTable] || [];
      const updatedTableOrder = tableOrder.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item
      );
      return { ...prevOrder, [activeTable]: updatedTableOrder };
    });
  };

  // Decrease the quantity of a dish in the order
  const decreaseQuantity = (id) => {
    if (!activeTable) return;
    setOrder((prevOrder) => {
      const tableOrder = prevOrder[activeTable] || [];
      const updatedTableOrder = tableOrder
        .map((item) =>
          item.id === id ? { ...item, quantity: Math.max(1, item.quantity - 1) } : item
        )
        .filter((item) => item.quantity > 0);
      return { ...prevOrder, [activeTable]: updatedTableOrder };
    });
  };

  // Calculate the total price of the order
  const calculateTotal = () => {
    const tableOrder = order[activeTable] || [];
    return tableOrder.reduce((total, item) => total + item.Dish_Price * item.quantity, 0).toFixed(2);
  };

  // View the order for a specific table
  const viewOrder = (tableId) => {
    setActiveTable(tableId);
    setSelectedTable(tableId);
  };

  // Send the order to the backend
  const sendOrder = async () => {
    if (!selectedEmployee) {
      alert("Please select an employee before placing the order.");
      return;
    }
    const formattedOrder = {
      employee: selectedEmployee,
      table: activeTable || null,
      total_amount: calculateTotal(),
      dishes: (order[activeTable] || []).map((item) => ({
        dish: item.id,
        quantity: item.quantity,
      })),
    };
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/Home/Bill-list/`, formattedOrder);
      alert("Order placed successfully! Bill Number: " + response.data.bill_number);
      setOrder({ ...order, [activeTable]: [] });
      localStorage.setItem("orders", JSON.stringify({ ...order, [activeTable]: [] }));
      setSelectedTable("");
      setSelectedEmployee("");
      setActiveTable("");
    } catch (error) {
      console.error("Error placing order:", error.response?.data || error.message);
      alert("Failed to place order.");
    }
  };

  return (
    <Router>
      <div className="pos-container">
        <nav>
          <Link to="/" className="home-link">
            <FaHome className="home-icon" /> Home
          </Link>
        </nav>
        {loading && <div className="loading">Loading...</div>}
        {error && <div className="error">{error}</div>}
        <Routes>
          <Route
            path="/"
            element={
              <>
                <Header order={order} viewOrder={viewOrder} />
                <SearchFilter search={search} setSearch={setSearch} filter={filter} setFilter={setFilter} />
                <DropdownSection
                  tables={tables}
                  selectedTable={selectedTable}
                  setSelectedTable={setSelectedTable}
                  employees={employees}
                  selectedEmployee={selectedEmployee}
                  setSelectedEmployee={setSelectedEmployee}
                  order={order}
                />
                <Menu dishes={dishes} addToOrder={addToOrder} />
                <OrderSummary
                  activeTable={activeTable}
                  selectedEmployee={selectedEmployee}
                  currentTableOrder={order[activeTable] || []}
                  calculateTotal={calculateTotal}
                  removeFromOrder={removeFromOrder}
                  sendOrder={sendOrder}
                  increaseQuantity={increaseQuantity}
                  decreaseQuantity={decreaseQuantity}
                />
              </>
            }
          />
          <Route path="/add-dish" element={<AddDish />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;