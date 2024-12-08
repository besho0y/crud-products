import { useEffect, useState } from 'react';
import './App.css';
import axios from "axios";


function App() {
  const [data, setData] = useState([]);
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [taxes, setTaxes] = useState('');
  const [ads, setAds] = useState('');
  const [discount, setDiscount] = useState('');
  const [count, setCount] = useState('');
  const [category, setCategory] = useState('');
  const [total, setTotal] = useState('');
  const [mode, setMode] = useState('create');
  const [tmp, setTmp] = useState(null);

  // Fetch initial data from API
  useEffect(() => {
    axios.get('http://localhost:8082/product')
      .then((res) => {
        setData(res.data); // Directly access `res.data`
      })
      .catch((err) => {
        console.error('Error fetching data:', err); // Add error handling
      });
  }, []);
  

  // Function to calculate the total price
  const calculateTotal = (price, taxes, ads, discount) => {
    const priceNum = parseFloat(price) || 0;
    const taxesNum = parseFloat(taxes) || 0;
    const adsNum = parseFloat(ads) || 0;
    const discountNum = parseFloat(discount) || 0;
    return priceNum + taxesNum + adsNum - discountNum;
  };

  // Update total price dynamically when any of the fields change
  useEffect(() => {
    setTotal(calculateTotal(price, taxes, ads, discount));
  }, [price, taxes, ads, discount]); // Runs every time these fields change

  // Handle create/update product
  const handleCreate = async () => {
    const newProduct = {
      title: title.toLowerCase(),
      price: price,
      taxes: taxes,
      ads: ads,
      discount: discount,
      total: total,
      count: count,
      category: category.toLowerCase(),
    };
  
    if (
      title !== "" &&
      price !== "" &&
      category !== "" &&
      !isNaN(count) &&
      count < 100
    ) {
      try {
        if (mode === "create") {
          // Send new product to the database
          await axios.post("http://localhost:8082/product", newProduct);
          alert("Product created successfully!");
  
          // Refresh data from the database
          const response = await axios.get("http://localhost:8082/product");
          setData(response.data);
        } else {
          // Update product in the database
          await axios.put(`http://localhost:8082/product/${tmp}`, newProduct); // Assuming you have an ID or tmp refers to the record's identifier
          alert("Product updated successfully!");
  
          // Refresh data from the database
          const response = await axios.get("http://localhost:8082/product");
          setData(response.data);
          setMode("create");
          setTmp(null);
        }
  
        // Clear the form fields
        clearFields();
      } catch (error) {
        console.error("Error creating/updating product:", error);
        alert("Failed to save the product. Please try again.");
      }
    }
  };
  

  // Clear all input fields
  const clearFields = () => {
    setTitle('');
    setPrice('');
    setTaxes('');
    setAds('');
    setDiscount('');
    setCount('');
    setCategory('');
    setTotal('');
  };

  // Delete a product
  const deleteItem = (index) => {
    const updatedData = data.filter((item, i) => i !== index);
    setData(updatedData);
    localStorage.setItem("product", JSON.stringify(updatedData));
  };

  // Update a product
  const updateData = (index) => {
    const product = data[index];
    setTitle(product.title);
    setPrice(product.price);
    setTaxes(product.taxes);
    setAds(product.ads);
    setDiscount(product.discount);
    setCategory(product.category);
    setTotal(product.total);
    setCount(product.count);
    setMode('update');
    setTmp(index);
  };

  // Delete all products
  const deleteAll = () => {
    setData([]);
    localStorage.removeItem("product");
  };

  return (
    <>
      <div className="crud">
        <div className="head">
          <h2>CRUD</h2>
          <p>Product Management System</p>
        </div>
        <div className="inputs">
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <div className="price">
            <input
              type="number"
              placeholder="Price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
            <input
              type="number"
              placeholder="Taxes"
              value={taxes}
              onChange={(e) => setTaxes(e.target.value)}
            />
            <input
              type="number"
              placeholder="Ads"
              value={ads}
              onChange={(e) => setAds(e.target.value)}
            />
            <input
              type="number"
              placeholder="Discount"
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
            />
            <small id="total">Total: {total}</small> {/* Display total */}
          </div>
          <input
            type="number"
            placeholder="Count"
            value={count}
            onChange={(e) => setCount(e.target.value)}
          />
          <input
            type="text"
            placeholder="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />
          <button onClick={handleCreate}>
            {mode === 'create' ? 'Create' : 'Update'}
          </button>
        </div>
        <div className="output">
          <button onClick={deleteAll}>Delete All</button>
        </div>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Price</th>
              <th>Taxes</th>
              <th>Ads</th>
              <th>Discount</th>
              <th>Total</th>
              <th>Category</th>
              <th>Update</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr key={index}>
                <td>{index+1 }</td>
                <td>{item.title}</td>
                <td>{item.price}</td>
                <td>{item.taxes||"-"}</td>
                <td>{item.ads||"-"}</td>
                <td>{item.discount||"-"}</td>
                <td>{item.total}</td>
                <td>{item.category}</td>
                <td>
                  <button onClick={() => updateData(index)}>Update</button>
                </td>
                <td>
                  <button onClick={() => deleteItem(index)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default App;
