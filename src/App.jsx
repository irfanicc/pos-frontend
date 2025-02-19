


import React, { useEffect, useState } from "react";
import axios from "axios";
import Header from "./components/Header";
import SearchFilter from "./components/SearchFilter";
import DropdownSection from "./components/DropdownSection";
import Menu from "./components/Menu";
import OrderSummary from "./components/OrderSummary";
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const params = {};
        if (search) params.Dish_Name = search;
        if (filter) params.Dish_Type = filter;
        const [dishesResponse, tablesResponse, employeesResponse] = await Promise.all([
          axios.get("http://127.0.0.1:8000/Home/Dishes-list/", { params }),
          axios.get("http://127.0.0.1:8000/Home/Tables/"),
          axios.get("http://127.0.0.1:8000/Home/Employe-list/"),
        ]);
        setDishes(dishesResponse.data);
        setTables(tablesResponse.data);
        setEmployees(employeesResponse.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, [search, filter]);

  useEffect(() => {
    localStorage.setItem("orders", JSON.stringify(order));
  }, [order]);

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

  const removeFromOrder = (id) => {
    if (!activeTable) return;
    setOrder((prevOrder) => {
      const tableOrder = prevOrder[activeTable] || [];
      const updatedTableOrder = tableOrder.filter((item) => item.id !== id);
      return { ...prevOrder, [activeTable]: updatedTableOrder };
    });
  };
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
  

  const calculateTotal = () => {
    const tableOrder = order[activeTable] || [];
    return tableOrder.reduce((total, item) => total + item.Dish_Price * item.quantity, 0).toFixed(2);
  };

  const viewOrder = (tableId) => {
    setActiveTable(tableId);
    setSelectedTable(tableId);
  };

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
      const response = await axios.post("http://127.0.0.1:8000/Home/Bill-list/", formattedOrder);
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
    <div className="pos-container">
      <Header order={order} viewOrder={viewOrder} />
      <SearchFilter search={search} setSearch={setSearch} filter={filter} setFilter={setFilter} />
      <DropdownSection tables={tables} selectedTable={selectedTable} setSelectedTable={setSelectedTable} employees={employees} selectedEmployee={selectedEmployee} setSelectedEmployee={setSelectedEmployee} order={order} />
      <Menu dishes={dishes} addToOrder={addToOrder} />
      <OrderSummary activeTable={activeTable} selectedEmployee={selectedEmployee} currentTableOrder={order[activeTable] || []} calculateTotal={calculateTotal} removeFromOrder={removeFromOrder}
                  sendOrder={sendOrder}
                  increaseQuantity={increaseQuantity}
                  decreaseQuantity={decreaseQuantity}
                                                     />

    </div>
    
  );
 

};





export default App;



