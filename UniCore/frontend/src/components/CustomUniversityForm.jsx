import { useState } from 'react';
import { FiUpload, FiX, FiImage } from 'react-icons/fi';
import api from '../utils/api';

export default function CustomUniversityForm({ isOpen, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    shortName: '',
    location: '',
    type: 'College',
    logo: '🏫'
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);

  const handleImageChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const data = new FormData();
    Object.keys(formData).forEach(key => data.append(key, formData[key]));
    if (file) data.append('image', file);

    try {
      await api.post('/universities', data);
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Create university failed:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-b from-slate-900 to-slate-800 rounded-2xl border border-slate-200 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 sticky top-0 bg-slate-900/80 backdrop-blur-sm border-b border-slate-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-900">Add University</h2>
            <button onClick={onClose} className="p-1 hover:bg-slate-200 rounded-lg">
              <FiX className="w-5 h-5 text-slate-600" />
            </button>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">University Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full p-3 bg-slate-800/50 border border-white/20 rounded-xl text-slate-900 placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="e.g. My University College"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Short Name *</label>
            <input
              type="text"
              value={formData.shortName}
              onChange={(e) => setFormData({...formData, shortName: e.target.value})}
              className="w-full p-3 bg-slate-800/50 border border-white/20 rounded-xl text-slate-900 placeholder-slate-500 focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. MUC"
              required
              maxLength={10}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Location *</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
                className="w-full p-3 bg-slate-800/50 border border-white/20 rounded-xl text-slate-900 placeholder-slate-500 focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. Accra"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value})}
                className="w-full p-3 bg-slate-800/50 border border-white/20 rounded-xl text-slate-900 focus:ring-2 focus:ring-blue-500"
              >
                <option value="College">College</option>
                <option value="Public">Public</option>
                <option value="Private">Private</option>
                <option value="Technical">Technical</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
              University Logo Image (optional)
              <FiImage className="w-4 h-4" />
            </label>
            <label className="w-full h-32 border-2 border-dashed border-white/20 rounded-xl flex flex-col items-center justify-center text-slate-600 hover:border-white/40 transition-all bg-slate-800/30 cursor-pointer group hover:bg-slate-700/50">
              <FiUpload className="w-8 h-8 group-hover:scale-110 transition-transform mb-2" />
              <p className="text-sm text-center">Click to upload image<br /><span className="text-xs">Max 5MB (PNG/JPG)</span></p>
              <input type="file" onChange={handleImageChange} className="hidden" accept="image/*" />
            </label>
            {imagePreview && (
              <div className="mt-3">
                <img src={imagePreview} alt="Preview" className="w-full h-24 object-cover rounded-lg border border-white/20" />
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 p-3 border border-white/20 text-slate-700 rounded-xl hover:bg-slate-200 transition-all font-medium"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 p-3 bg-gradient-to-r from-blue-600 to-purple-600 text-slate-900 rounded-xl hover:from-blue-700 hover:to-purple-700 font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              disabled={loading || !formData.name || !formData.shortName || !formData.location}
            >
              {loading ? 'Creating...' : 'Create University'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

