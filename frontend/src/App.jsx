import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { motion } from 'framer-motion'
import { Line } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

const API_URL = 'http://localhost:8000'

export default function App() {
  const [user, setUser] = useState(null)
  const [metrics, setMetrics] = useState([])
  const [countryOperators, setCountryOperators] = useState([])
  const [loginForm, setLoginForm] = useState({ username: '', email:'', password: '' })
  const [signupForm, setSignupForm] = useState({ username: '', email: '', password: '' })
  const [newCountryOperator, setNewCountryOperator] = useState({ country: '', operator: '', is_high_priority: false })
  const [activeTab, setActiveTab] = useState('login')
  const [editingCountryOperator, setEditingCountryOperator] = useState(null)

  useEffect(() => {
    checkAuth()
  }, [])

  useEffect(()=>{
    if (user) {
      fetchMetrics()
      fetchCountryOperators()
    }
  },[user])

  const checkAuth = async () => {
    try {
      const response = await axios.get(`${API_URL}/users/me`, { withCredentials: true })
      setUser(response.data)
    } catch (error) {
      console.error('Not authenticated', error)
    }
  }

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // Create a URLSearchParams object to convert loginForm to x-www-form-urlencoded format
      const params = new URLSearchParams();
      for (const [key, value] of Object.entries(loginForm)) {
        params.append(key, value);
      }
      const response = await axios.post(`${API_URL}/token`, params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded', // Set the Content-Type
        },
        withCredentials: true,
      });
      setUser(response.data);
    } catch (error) {
      console.error('Login failed', error);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault()
    try {
      await axios.post(`${API_URL}/signup`, signupForm)
      // After successful signup, log the user in
      await handleLogin(e)
    } catch (error) {
      console.error('Signup failed', error)
    }
  }

  const handleLogout = async () => {
    try {
      await axios.post(`${API_URL}/logout`, {}, { withCredentials: true })
      setUser(null)
    } catch (error) {
      console.error('Logout failed', error)
    }
  }

  const fetchMetrics = async () => {
    try {
      const response = await axios.get(`${API_URL}/metrics/all`, { withCredentials: true })
      setMetrics(response.data)
    } catch (error) {
      console.error('Failed to fetch metrics', error)
    }
  }

  const fetchCountryOperators = async () => {
    try {
      const response = await axios.get(`${API_URL}/country_operators`, { withCredentials: true })
      setCountryOperators(response.data)
    } catch (error) {
      console.error('Failed to fetch country operators', error)
    }
  }

  const handleAddCountryOperator = async (e) => {
    e.preventDefault()
    try {
      await axios.post(`${API_URL}/country_operator`, newCountryOperator, { withCredentials: true })
      fetchCountryOperators()
      setNewCountryOperator({ country: '', operator: '', is_high_priority: false })
    } catch (error) {
      console.error('Failed to add country operator', error)
    }
  }

  const handleUpdateCountryOperator = async (e) => {
    e.preventDefault()
    try {
      await axios.put(`${API_URL}/country_operator/${editingCountryOperator.id}`, editingCountryOperator, { withCredentials: true })
      fetchCountryOperators()
      setEditingCountryOperator(null)
    } catch (error) {
      console.error('Failed to update country operator', error) 
    }
  }

  const handleDeleteCountryOperator = async (id) => {
    try {
      await axios.delete(`${API_URL}/country_operator/${id}`, { withCredentials: true })
      fetchCountryOperators()
    } catch (error) {
      console.error('Failed to delete country operator', error)
    }
  }

  const handleStartSession = async (country, operator) => {
    try {
      await axios.post(`${API_URL}/start_session/${country}/${operator}`, {}, { withCredentials: true })
      fetchMetrics()
    } catch (error) {
      console.error('Failed to start session', error)
    }
  }

  const handleStopSession = async (country, operator) => {
    try {
      await axios.post(`${API_URL}/stop_session/${country}/${operator}`, {}, { withCredentials: true })
      fetchMetrics()
    } catch (error) {
      console.error('Failed to stop session', error)
    }
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md w-96">
          <h2 className="text-2xl font-bold mb-6 text-center">Welcome to SMS Dashboard</h2>
          <div className="mb-4">
            <div className="flex border-b border-gray-200">
              <button
                className={`flex-1 py-2 px-4 text-center ${activeTab === 'login' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'}`}
                onClick={() => setActiveTab('login')}
              >
                Login
              </button>
              <button
                className={`flex-1 py-2 px-4 text-center ${activeTab === 'signup' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'}`}
                onClick={() => setActiveTab('signup')}
              >
                Sign Up
              </button>
            </div>
          </div>
          {activeTab === 'login' ? (
            <form onSubmit={handleLogin}>
              <div className="mb-4">
                <label htmlFor="login-username" className="block text-sm font-medium text-gray-700">Username</label>
                <input
                  id="login-username"
                  type="text"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  value={loginForm.username}
                  onChange={e => setLoginForm({...loginForm, username: e.target.value})}
                />
              </div>
              
              <div>
              <label htmlFor="login-username" className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  id="login-username"
                  type="text"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  value={loginForm.email}
                  onChange={e => setLoginForm({...loginForm, email: e.target.value})}
                />
              </div>

              <div className="mb-4">
                <label htmlFor="login-password" className="block text-sm font-medium text-gray-700">Password</label>
                <input
                  id="login-password"
                  type="password"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  value={loginForm.password}
                  onChange={e => setLoginForm({...loginForm, password: e.target.value})}
                />
              </div>
              <button type="submit" className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50">
                Login
              </button>
            </form>
          ) : (
            <form onSubmit={handleSignup}>
              <div className="mb-4">
                <label htmlFor="signup-username" className="block text-sm font-medium text-gray-700">Username</label>
                <input
                  id="signup-username"
                  type="text"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  value={signupForm.username}
                  onChange={e => setSignupForm({...signupForm, username: e.target.value})}
                />
              </div>
              <div className="mb-4">
                <label htmlFor="signup-email" className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  id="signup-email"
                  type="email"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  value={signupForm.email}
                  onChange={e => setSignupForm({...signupForm, email: e.target.value})}
                />
              </div>
              <div className="mb-4">
                <label htmlFor="signup-password" className="block text-sm font-medium text-gray-700">Password</label>
                <input
                  id="signup-password"
                  type="password"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  value={signupForm.password}
                  onChange={e => setSignupForm({...signupForm, password: e.target.value})}
                />
              </div>
              <button type="submit" className="w-full bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50">
                Sign Up
              </button>
            </form>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white p-6 rounded-lg shadow-md mb-8"
      >
        <h2 className="text-2xl font-bold mb-2">Welcome, {user.username}!</h2>
        <p className="text-gray-600 mb-4">SMS Dashboard</p>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
        >
          Logout
        </button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-white p-6 rounded-lg shadow-md mb-8"
      >
        <h3 className="text-xl font-bold mb-4">SMS Metrics</h3>
        <div className="h-64">
          <Line
            data={{
              labels: metrics.map(m => `${m.country} - ${m.operator}`),
              datasets: [
                {
                  label: 'Sent',
                  data: metrics.map(m => m.sent),
                  borderColor: 'rgb(75, 192, 192)',
                  tension: 0.1
                },
                {
                  label: 'Success',
                  data: metrics.map(m => m.success),
                  borderColor: 'rgb(54, 162, 235)',
                  tension: 0.1
                },
                {
                  label: 'Failure',
                  data: metrics.map(m => m.failure),
                  borderColor: 'rgb(255, 99, 132)',
                  tension: 0.1
                }
              ]
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
            }}
          />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="bg-white p-6 rounded-lg shadow-md mb-8"
      >
        <h3 className="text-xl font-bold mb-4">Country-Operator Management</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-2 px-4 border-b text-left">Country</th>
                <th className="py-2 px-4 border-b text-left">Operator</th>
                <th className="py-2 px-4 border-b text-left">Priority</th>
                <th className="py-2 px-4 border-b text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {countryOperators.map((co, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                  <td className="py-2 px-4 border-b">{co.country}</td>
                  <td className="py-2 px-4 border-b">{co.operator}</td>
                  <td className="py-2 px-4 border-b">
                    {co.is_high_priority ? (
                      <span className="text-green-500">High</span>
                    ) : (
                      <span className="text-yellow-500">Normal</span>
                    )}
                  </td>
                  <td className="py-2 px-4 border-b">
                    <button
                      onClick={() => handleStartSession(co.country, co.operator)}
                      className="bg-blue-500 text-white py-1 px-2 rounded mr-2 hover:bg-blue-600"
                    >
                      Start
                    </button>
                    <button
                      onClick={() => handleStopSession(co.country, co.operator)}
                      className="bg-red-500 text-white py-1 px-2 rounded mr-2 hover:bg-red-600"
                    >
                      Stop
                    </button>
                    <button
                      onClick={() => setEditingCountryOperator(co)}
                      className="bg-yellow-500 text-white py-1 px-2 rounded mr-2 hover:bg-yellow-600"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteCountryOperator(co.id)}
                      className="bg-gray-500 text-white py-1 px-2 rounded hover:bg-gray-600"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {editingCountryOperator ? (
          <form  onSubmit={handleUpdateCountryOperator} className="mt-6">
            <h4 className="text-lg font-semibold mb-2">Edit Country-Operator</h4>
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="Country"
                className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                value={editingCountryOperator.country}
                onChange={e => setEditingCountryOperator({...editingCountryOperator, country: e.target.value})}
              />
              <input
                type="text"
                placeholder="Operator"
                className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                value={editingCountryOperator.operator}
                onChange={e => setEditingCountryOperator({...editingCountryOperator, operator: e.target.value})}
              />
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="edit_is_high_priority"
                  checked={editingCountryOperator.is_high_priority}
                  onChange={e => setEditingCountryOperator({...editingCountryOperator, is_high_priority: e.target.checked})}
                  className="mr-2"
                />
                <label htmlFor="edit_is_high_priority" className="text-sm text-gray-700">High Priority</label>
              </div>
              <button
                type="submit"
                className="bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
              >
                Update
              </button>
              <button
                type="button"
                onClick={() => setEditingCountryOperator(null)}
                className="bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleAddCountryOperator} className="mt-6">
            <h4 className="text-lg font-semibold mb-2">Add New Country-Operator</h4>
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="Country"
                className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                value={newCountryOperator.country}
                onChange={e => setNewCountryOperator({...newCountryOperator, country: e.target.value})}
              />
              <input
                type="text"
                placeholder="Operator"
                className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                value={newCountryOperator.operator}
                onChange={e => setNewCountryOperator({...newCountryOperator, operator: e.target.value})}
              />
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_high_priority"
                  checked={newCountryOperator.is_high_priority}
                  onChange={e => setNewCountryOperator({...newCountryOperator, is_high_priority: e.target.checked})}
                  className="mr-2"
                />
                <label htmlFor="is_high_priority" className="text-sm text-gray-700">High Priority</label>
              </div>
              <button
                type="submit"
                className="bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
              >
                Add
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  )
}