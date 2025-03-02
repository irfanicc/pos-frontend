import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { FaHome } from "react-icons/fa";

import Header from "./components/Header";
import SearchFilter from "./components/SearchFilter";
import DropdownSection from "./components/DropdownSection";
import Menu from "./components/Menu";
import OrderSummary from "./components/OrderSummary";
import AddDish from "./components/AddDish";

import "./App.css";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const params = {};
        if (search) params.Dish_Name = search;
        if (filter) params.Dish_Type = filter;

        const [dishesResponse, tablesResponse, employeesResponse] = await Promise.all([
          axios.get(`${backendUrl}/Home/Dishes-list/`, { params }),
          axios.get(`${backendUrl}/Home/Tables/`),
          axios.get(`${backendUrl}/Home/Employe-list/`)
        ]);

        setDishes(dishesResponse.data);
        setTables(tablesResponse.data);
        setEmployees(employeesResponse.data);
      } catch (error) {
        console.error("❌ Error fetching data:", error.message || error);
      }
    };

    fetchData();
  }, [search, filter]);

  useEffect(() => {
    localStorage.setItem("orders", JSON.stringify(order));
  }, [order]);

  useEffect(() => {
    if (selectedTable && (!order[selectedTable] || order[selectedTable].length === 0)) {
      setSelectedTable("");
      setSelectedEmployee("");
      setActiveTable("");
    }
  }, [order, activeTable]);

  const sendOrder = async () => {
    if (!selectedEmployee) {
      alert("Please select an employee before placing the order.");
      return;
    }

    const formattedOrder = {
      employee: selectedEmployee,
      table: activeTable || null,
      total_amount: calculateTotal(),
      ordered_dishes: (order[activeTable] || []).map((item) => ({
        dish_id: item.id,
        name: item.Dish_Name,
        quantity: item.quantity,
        price: item.Dish_Price
      }))
    };

    try {
      const response = await axios.post(`${backendUrl}/Home/Bill-list/`, formattedOrder);
      alert("✅ Order placed successfully! Bill Number: " + response.data.bill_number);

      setOrder({ ...order, [activeTable]: [] });
      localStorage.setItem("orders", JSON.stringify({ ...order, [activeTable]: [] }));
      setSelectedTable("");
      setActiveTable("");
      setSelectedEmployee("");
    } catch (error) {
      console.error("❌ Error placing order:", error.response?.data || error.message);
      alert("❌ Failed to place order.");
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
        <Routes>
          <Route
            path="/"
            element={
              <>
                <Header order={order} viewOrder={setActiveTable} />
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
                <Menu dishes={dishes} addToOrder={setOrder} />
                <OrderSummary
                  selectedTable={activeTable || selectedTable}
                  selectedEmployee={selectedEmployee}
                  currentTableOrder={order[activeTable || selectedTable] || []}
                  calculateTotal={() => order[selectedTable]?.reduce((total, item) => total + item.Dish_Price * item.quantity, 0) || 0}
                  removeFromOrder={setOrder}
                  sendOrder={sendOrder}
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
