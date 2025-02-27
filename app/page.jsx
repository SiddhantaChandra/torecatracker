'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Toaster, toast } from 'react-hot-toast';
import Image from 'next/image';
import tsukiLogo from './assets/images/tsuki_logo_new.png';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [newUrl, setNewUrl] = useState('');

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
    const { error } = await supabase.from('tracker').delete().eq('url', url);
    if (error) {
      toast.error('Error removing product');
    } else {
      toast.success('Product removed');
      fetchProducts();
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <Toaster />
      <div className="flex justify-center items-center gap-6 mb-6">
        <Image src={tsukiLogo} alt="Logo of Tsuki" className="h-24 w-24" />
        <h1 className="text-3xl font-bold text-center">Toreca Tracker</h1>
      </div>

      <div className="mb-8 flex gap-4">
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

      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-700">
          <thead>
            <tr className="bg-gray-800">
              <th className="p-3 border border-gray-700">Image</th>
              <th className="p-3 border border-gray-700">Stock Status</th>
              <th className="p-3 border border-gray-700">Visit Page</th>
              <th className="p-3 border border-gray-700">Remove</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan="4" className="p-3 text-center">
                  No products tracked yet.
                </td>
              </tr>
            ) : (
              products.map((item) => (
                <tr key={item.url} className="border border-gray-700">
                  <td className="p-3 text-center">
                    <img
                      src={`${item.image}`}
                      alt="Product"
                      className="w-16 object-cover rounded sm:w-40"
                    />
                  </td>
                  <td className="p-3 text-center">
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
                    <button
                      onClick={() => removeProduct(item.url)}
                      className="bg-red-500 hover:bg-red-600 p-2 rounded text-white"
                    >
                      ❌ Remove
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
