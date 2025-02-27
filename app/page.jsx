'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Toaster, toast } from 'react-hot-toast';
import Image from 'next/image';
import tsukiLogo from './assets/images/tsuki_logo_new.png';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [newUrl, setNewUrl] = useState('');
  const [sortBy, setSortBy] = useState(null); // 'price' or 'stock'
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' or 'desc'
  const [showInStockItems, setShowInStockItems] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    const { data, error } = await supabase.from('tracker').select('*');
    if (error) {
      toast.error('Failed to load products');
    } else {
      setProducts(data || []);
    }
  }

  async function addProduct() {
    if (!newUrl) return;

    // Check if the URL already exists
    const { data: existingProduct, error: fetchError } = await supabase
      .from('tracker')
      .select('url')
      .eq('url', newUrl)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      toast.error('Error checking URL');
      return;
    }

    if (existingProduct) {
      toast.error('This product is already being tracked!');
      return;
    }

    // Insert new URL
    const { error } = await supabase
      .from('tracker')
      .insert([{ url: newUrl, in_stock: false }]);

    if (error) {
      toast.error('Error adding product');
    } else {
      toast.success('Product added!');
      setNewUrl('');
      fetchProducts();
    }
  }

  async function removeProduct(url) {
    const confirmDelete = window.confirm(
      'Are you sure you want to remove this product?',
    );
    if (!confirmDelete) return;

    const { error } = await supabase.from('tracker').delete().eq('url', url);
    if (error) {
      toast.error('Error removing product');
    } else {
      toast.success('Product removed');
      fetchProducts();
    }
  }

  // Sorting Logic
  function handleSort(column) {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  }

  function sortedProducts() {
    let sorted = [...products];

    // Always show in-stock products first
    sorted.sort((a, b) => b.in_stock - a.in_stock);

    if (sortBy === 'price') {
      sorted.sort((a, b) => {
        const priceA = parseInt(a.price_yen.replace(/,/g, ''), 10) || 0;
        const priceB = parseInt(b.price_yen.replace(/,/g, ''), 10) || 0;

        return sortOrder === 'asc' ? priceA - priceB : priceB - priceA;
      });
    }

    return sorted;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <Toaster />
      <div className="flex justify-center items-center gap-6 mb-6">
        <Image src={tsukiLogo} alt="Logo of Tsuki" className="h-24 w-24" />
        <h1 className="text-3xl font-bold text-center">Toreca Tracker</h1>
      </div>

      <div className="mb-4 flex gap-4">
        <input
          type="text"
          className="p-3 bg-gray-800 border border-gray-700 rounded-lg text-white w-full"
          placeholder="Enter product URL"
          value={newUrl}
          onChange={(e) => setNewUrl(e.target.value)}
        />
        <button
          onClick={addProduct}
          className="bg-green-600 hover:bg-green-800 p-3 rounded-lg text-white w-36 font-bold"
        >
          ➕ Add
        </button>
      </div>
      <div className="flex">
        <button
          className="bg-slate-600 hover:bg-slate-800 p-3 rounded-lg text-white w-36 font-bold mb-6"
          onClick={(e) => setShowInStockItems((prevState) => !prevState)}
        >
          {showInStockItems === true ? 'Show all' : 'In stock'}
        </button>
      </div>

      {/* PC View */}
      <div className="overflow-x-auto hidden sm:block">
        <table className="w-full border-collapse border border-gray-700">
          <thead>
            <tr className="bg-gray-800">
              <th className="p-3 border border-gray-700">Image</th>
              <th className="p-3 border border-gray-700 cursor-pointer">
                Stock Status
              </th>
              <th className="p-3 border border-gray-700">Visit Page</th>
              <th
                className="p-3 border border-gray-700 cursor-pointer"
                onClick={() => handleSort('price')}
              >
                Price{' '}
                {sortBy === 'price' ? (sortOrder === 'asc' ? '⬆️' : '⬇️') : ''}
              </th>
              <th className="p-3 border border-gray-700">Remove</th>
            </tr>
          </thead>
          <tbody>
            {sortedProducts().length === 0 ? (
              <tr>
                <td colSpan="5" className="p-3 text-center">
                  No products tracked yet.
                </td>
              </tr>
            ) : (
              sortedProducts().map((item) => (
                <tr key={item.url} className="border border-gray-700">
                  <td className="p-3 text-center flex items-center justify-center">
                    <img
                      src={`${item.image}`}
                      alt="Product"
                      className="w-32 object-cover rounded"
                    />
                  </td>
                  <td
                    className={
                      item.in_stock
                        ? 'bg-green-400/10 p-3 text-center border border-gray-700'
                        : 'bg-red-400/10 p-3 text-center border border-gray-700'
                    }
                  >
                    <span
                      className={
                        item.in_stock ? 'text-green-400' : 'text-red-400'
                      }
                    >
                      {item.in_stock ? '✅ In Stock' : '❌ Out of Stock'}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 underline"
                    >
                      🔗 Visit Page
                    </a>
                  </td>
                  <td className="p-3 text-center">
                    <p className="text-white/50 text-[12px]">
                      ¥ {item.price_yen}
                    </p>
                  </td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => removeProduct(item.url)}
                      className="bg-red-500 hover:bg-red-600 p-2 rounded text-white"
                    >
                      🗑️ <span className="hidden sm:block">Remove</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Phone View (No sorting applied here) */}
      <div className="overflow-x-auto sm:hidden">
        <table className="w-full border-collapse border border-gray-700">
          <thead>
            <tr className="bg-gray-800">
              <th className="p-3 border border-gray-700">Description</th>
              <th className="p-3 border border-gray-700">Price</th>
              <th className="p-3 border border-gray-700">Remove</th>
            </tr>
          </thead>
          <tbody>
            {products.map((item) => (
              <tr key={item.url} className="border border-gray-700">
                <td
                  className={
                    item.in_stock
                      ? 'bg-green-400/10 p-3 text-center border border-gray-700'
                      : 'bg-red-400/10 p-3 text-center border border-gray-700'
                  }
                >
                  {/* "p-3 text-center border border-gray-700 " */}
                  <img
                    src={item.image}
                    alt="Product"
                    className="w-full object-cover rounded sm:w-40"
                  />
                  <div className="mt-6 font-bold">
                    <span
                      className={
                        item.in_stock ? 'text-green-400' : 'text-red-400'
                      }
                    >
                      {item.in_stock ? '✅ In Stock' : '❌ Out of Stock'}
                    </span>
                  </div>
                </td>
                <td className="p-3 text-center border border-gray-700">
                  ¥ {item.price_yen}
                </td>
                <td className="p-3 text-center">
                  <button
                    onClick={() => removeProduct(item.url)}
                    className="bg-red-500 hover:bg-red-600 py-4 px-4 rounded text-white"
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
