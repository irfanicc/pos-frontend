
// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import "./App.css";

// const App = () => {
//   const [dishes, setDishes] = useState([]);
//   const [order, setOrder] = useState(() => {
//     const savedOrders = localStorage.getItem("orders");
//     return savedOrders ? JSON.parse(savedOrders) : {};
//   }); // Load from localStorage
//   const [search, setSearch] = useState("");
//   const [filter, setFilter] = useState("");
//   const [tables, setTables] = useState([]);
//   const [employees, setEmployees] = useState([]);
//   const [selectedTable, setSelectedTable] = useState("");
//   const [selectedEmployee, setSelectedEmployee] = useState("");
//   const [activeTable, setActiveTable] = useState("");

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const params = {};
//         if (search) params.Dish_Name = search;
//         if (filter) params.Dish_Type = filter;
//         const [dishesResponse, tablesResponse, employeesResponse] = await Promise.all([
//           axios.get("http://127.0.0.1:8000/Home/Dishes-list/", { params }),
//           axios.get("http://127.0.0.1:8000/Home/Tables/"),
//           axios.get("http://127.0.0.1:8000/Home/Employe-list/"),
//         ]);
//         setDishes(dishesResponse.data);
//         setTables(tablesResponse.data);
//         setEmployees(employeesResponse.data);
//       } catch (error) {
//         console.error("Error fetching data:", error);
//       }
//     };
//     fetchData();
//   }, [search, filter]);

//   // Save order to localStorage whenever it changes
//   useEffect(() => {
//     localStorage.setItem("orders", JSON.stringify(order));
//   }, [order]);

//   const addToOrder = (dish) => {
//     if (!selectedTable) {
//       alert("Please select a table before adding items to the order.");
//       return;
//     }

//     setOrder((prevOrder) => {
//       const tableOrder = prevOrder[selectedTable] || [];
//       const existingDish = tableOrder.find((item) => item.id === dish.id);

//       let updatedTableOrder;
//       if (existingDish) {
//         updatedTableOrder = tableOrder.map((item) =>
//           item.id === dish.id ? { ...item, quantity: item.quantity + 1 } : item
//         );
//       } else {
//         updatedTableOrder = [...tableOrder, { ...dish, quantity: 1 }];
//       }

//       return { ...prevOrder, [selectedTable]: updatedTableOrder };
//     });

//     setActiveTable(selectedTable);
//   };

//   const removeFromOrder = (id) => {
//     if (!activeTable) return;

//     setOrder((prevOrder) => {
//       const tableOrder = prevOrder[activeTable] || [];
//       const updatedTableOrder = tableOrder.filter((item) => item.id !== id);

//       return { ...prevOrder, [activeTable]: updatedTableOrder };
//     });
//   };

//   const calculateTotal = () => {
//     const tableOrder = order[activeTable] || [];
//     return tableOrder.reduce((total, item) => total + item.Dish_Price * item.quantity, 0).toFixed(2);
//   };

//   const viewOrder = (tableId) => {
//     setActiveTable(tableId);
//     setSelectedTable(tableId);
//   };

//   const sendOrder = async () => {
//     if (!selectedEmployee) {
//       alert("Please select an employee before placing the order.");
//       return;
//     }

//     const formattedOrder = {
//       employee: selectedEmployee,
//       table: activeTable || null,
//       total_amount: calculateTotal(),
//       dishes: (order[activeTable] || []).map((item) => ({
//         dish: item.id,
//         quantity: item.quantity,
//       })),
//     };

//     try {
//       const response = await axios.post("http://127.0.0.1:8000/Home/Bill-list/", formattedOrder);
//       alert("Order placed successfully! Bill Number: " + response.data.bill_number);
//       setOrder({ ...order, [activeTable]: [] }); // Clear the order for the selected table
//       localStorage.setItem("orders", JSON.stringify({ ...order, [activeTable]: [] }));
//       setSelectedTable("");
//       setSelectedEmployee("");
//       setActiveTable("");
//     } catch (error) {
//       console.error("Error placing order:", error.response?.data || error.message);
//       alert("Failed to place order.");
//     }
//   };

//   const currentTableOrder = order[activeTable] || [];

//   return (
//     <div className="pos-container">
//       <div className="header">
//         <h1>Restaurant POS</h1>
//         {Object.keys(order).map(
//           (tableId) =>
//             order[tableId].length > 0 && (
//               <button key={tableId} className="table-button" onClick={() => viewOrder(tableId)}>
//                 Table {tableId} 🛒
//               </button>
//             )
//         )}
//       </div>

//       <div className="search-filter">
//         <input type="text" placeholder="Search Dishes..." value={search} onChange={(e) => setSearch(e.target.value)} />
//         <select value={filter} onChange={(e) => setFilter(e.target.value)}>
//           <option value="">All</option>
//           <option value="Starter">Starter</option>
//           <option value="Cold Drink">Cold Drink</option>
//           <option value="Main Course">Main Course</option>
//           <option value="Sweet">Sweet</option>
//           <option value="Roti">Roti</option>
//         </select>
//       </div>

//       <div className="dropdown-section">
//       <label>Select Table:</label>
//   <select value={selectedTable} onChange={(e) => setSelectedTable(e.target.value)}>
//     <option value="">Select Table</option>
//     {tables.map((table) => (
//       <option 
//         key={table.id} 
//         value={table.id}
//         disabled={order[table.id]?.length > 0}  // Disable if this table has an order
//       >
//         Table {table.Table_Number} {order[table.id]?.length > 0 && "(Occupied)"}
//       </option>
//     ))}
//   </select>


//         <label>Select Employee:</label>
//         <select value={selectedEmployee} onChange={(e) => setSelectedEmployee(e.target.value)}>
//           <option value="">Select Employee</option>
//           {employees.map((employee) => (
//             <option key={employee.id} value={employee.id}>
//               {employee.Employe_Name} ({employee.Employe_Position})
//             </option>
//           ))}
//         </select>
//       </div>

//       <div className="content">
//         <div className="menu-section">
//           <h1 className="title">Menu</h1>
//           <div className="dish-grid">
//             {dishes.map((dish) => (
//               <div key={dish.id} className="dish-card" onClick={() => addToOrder(dish)}>
//                 <img className="dish-image" src={dish.Dish_Image} alt={dish.Dish_Name} />
//                 <h2>{dish.Dish_Name}</h2>
//                 <p><strong>Price:</strong> ₹{dish.Dish_Price.toFixed(2)}</p>
//               </div>
//             ))}
//           </div>
//         </div>

//         <div className="order-summary">
//           <h2>Order Summary</h2>
//           <p><strong>Table:</strong> {activeTable ? `Table ${activeTable}` : "Not Selected"}</p>
//           <p><strong>Employee:</strong> {selectedEmployee || "Not Selected"}</p>
//           {currentTableOrder.length === 0 ? (
//             <p>No items in the order.</p>
//           ) : (
//             <ul>
//               {currentTableOrder.map((item) => (
//                 <li key={item.id} className="order-item">
//                   <span>{item.Dish_Name} (x{item.quantity}) - ₹{(item.Dish_Price * item.quantity).toFixed(2)}</span>
//                   <button onClick={() => removeFromOrder(item.id)}>Remove</button>
//                 </li>
//               ))}
//             </ul>
//           )}
//           <h3>Total: ₹{calculateTotal()}</h3>
//           <button className="send-order" onClick={sendOrder}>Send Order</button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default App;


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
      <OrderSummary activeTable={activeTable} selectedEmployee={selectedEmployee} currentTableOrder={order[activeTable] || []} calculateTotal={calculateTotal} removeFromOrder={removeFromOrder} sendOrder={sendOrder} />
    </div>
  );
};

export default App;
