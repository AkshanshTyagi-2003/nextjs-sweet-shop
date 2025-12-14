"use client";

import { useState, useEffect } from "react";

export default function AdminSweetForm({ onSubmit, editData }: any) {
  const [form, setForm] = useState({
    name: "",
    category: "",
    price: "",
    quantity: "",
  });

  // If editing, preload values
  useEffect(() => {
    if (editData) {
      setForm({
        name: editData.name,
        category: editData.category,
        price: editData.price,
        quantity: editData.quantity,
      });
    }
  }, [editData]);

  function handleChange(e: any) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSubmit(e: any) {
    e.preventDefault();
    onSubmit({
      ...form,
      price: Number(form.price),
      quantity: Number(form.quantity),
    });

    if (!editData) {
      setForm({ name: "", category: "", price: "", quantity: "" });
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md">
      <h2 className="text-xl font-semibold mb-4">
        {editData ? "Edit Sweet" : "Add Sweet"}
      </h2>

      <input
        name="name"
        placeholder="Name"
        value={form.name}
        onChange={handleChange}
        className="w-full p-2 border rounded mb-3"
      />

      <input
        name="category"
        placeholder="Category"
        value={form.category}
        onChange={handleChange}
        className="w-full p-2 border rounded mb-3"
      />

      <input
        name="price"
        type="number"
        placeholder="Price"
        value={form.price}
        onChange={handleChange}
        className="w-full p-2 border rounded mb-3"
      />

      <input
        name="quantity"
        type="number"
        placeholder="Quantity"
        value={form.quantity}
        onChange={handleChange}
        className="w-full p-2 border rounded mb-3"
      />

      <button
        type="submit"
        className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
      >
        {editData ? "Update Sweet" : "Add Sweet"}
      </button>
    </form>
  );
}
