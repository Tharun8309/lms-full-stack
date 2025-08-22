import React, { useContext, useState } from 'react';
import { AppContext } from '../../context/AppContext';

const Register = () => {
  const { register } = useContext(AppContext);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student' });
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState([]);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file && file.size > 5 * 1024 * 1024) { // 5MB limit
      setErrors(['Image size should be less than 5MB']);
      return;
    }
    setImage(file || null);
  };

  const validateForm = () => {
    const validationErrors = [];
    if (!form.name.trim()) validationErrors.push('Name is required');
    if (!form.email.trim()) validationErrors.push('Email is required');
    else if (!/\S+@\S+\.\S+/.test(form.email)) validationErrors.push('Email is invalid');
    if (!form.password) validationErrors.push('Password is required');
    else if (form.password.length < 6) validationErrors.push('Password must be at least 6 characters');
    return validationErrors;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setErrors([]);
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('name', form.name);
      fd.append('email', form.email);
      fd.append('password', form.password);
      fd.append('role', form.role);
      if (image) fd.append('image', image);

      await register(fd, true);

      // reset form
      setForm({ name: '', email: '', password: '', role: 'student' });
      setImage(null);
    } catch (err) {
      setErrors([err.message || 'Something went wrong']);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white border rounded-lg p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-gray-800 mb-6">Create account</h1>

        {/* Display errors dynamically */}
        {errors.length > 0 && (
          <div className="mb-4 p-3 border border-red-400 bg-red-100 rounded text-red-700">
            <ul className="list-disc list-inside">
              {errors.map((err, idx) => <li key={idx}>{err}</li>)}
            </ul>
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-700 mb-1">Name</label>
            <input type="text" name="name" value={form.name} onChange={onChange} className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">Email</label>
            <input type="email" name="email" value={form.email} onChange={onChange} className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">Password</label>
            <input type="password" name="password" value={form.password} onChange={onChange} className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">Role</label>
            <select name="role" value={form.role} onChange={onChange} className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="student">Student</option>
              <option value="educator">Educator</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">Profile Image (optional)</label>
            <input type="file" accept="image/*" onChange={handleImageChange} className="w-full" />
            {image && <img src={URL.createObjectURL(image)} alt="preview" className="mt-2 h-20 w-20 object-cover rounded" />}
          </div>

          <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50">
            {loading ? 'Creating...' : 'Create account'}
          </button>
        </form>

        <p className="mt-4 text-sm text-gray-600">Already have an account? <a href="/login" className="text-blue-600">Login</a></p>
      </div>
    </div>
  );
};

export default Register;
