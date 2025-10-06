import { useState } from 'react';
import { AiOutlineClose, AiOutlineCamera } from 'react-icons/ai';
import { doctorAPI } from '../utils/api';

const AddDoctorModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    specialization: '',
    department: '',
    designation: '',
    dob: '',
    yearOfExperience: '',
    medicalLicense: '',
    languagesSpoken: ['English'],
    bloodGroup: '',
    gender: '',
    bio: '',
    address1: '',
    address2: '',
    country: '',
    city: '',
    state: '',
    pincode: '',
    imageUrl: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [newLanguage, setNewLanguage] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB');
      return;
    }

    try {
      setUploadingImage(true);
      setError('');

      // Convert to base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result;
        setImagePreview(base64String);

        // Upload to backend
        const response = await doctorAPI.uploadImage({ image: base64String });
        setFormData({ ...formData, imageUrl: response.imageUrl });
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setError('Failed to upload image');
      console.error('Image upload error:', err);
    } finally {
      setUploadingImage(false);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    setFormData({ ...formData, imageUrl: '' });
  };

  const addLanguage = () => {
    if (newLanguage && !formData.languagesSpoken.includes(newLanguage)) {
      setFormData({
        ...formData,
        languagesSpoken: [...formData.languagesSpoken, newLanguage]
      });
      setNewLanguage('');
    }
  };

  const removeLanguage = (lang) => {
    setFormData({
      ...formData,
      languagesSpoken: formData.languagesSpoken.filter(l => l !== lang)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const doctorData = {
        ...formData,
        yearOfExperience: formData.yearOfExperience ? parseInt(formData.yearOfExperience) : null,
        languagesSpoken: JSON.stringify(formData.languagesSpoken),
        dob: formData.dob || null
      };

      await doctorAPI.create(doctorData);
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        specialization: '',
        department: '',
        designation: '',
        dob: '',
        yearOfExperience: '',
        medicalLicense: '',
        languagesSpoken: ['English'],
        bloodGroup: '',
        gender: '',
        bio: '',
        address1: '',
        address2: '',
        country: '',
        city: '',
        state: '',
        pincode: '',
        imageUrl: ''
      });
      setImagePreview(null);

      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to create doctor');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        width: '100%',
        maxWidth: '700px',
        maxHeight: '90vh',
        overflow: 'auto',
        position: 'relative'
      }}>
        <div style={{
          padding: '24px',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'sticky',
          top: 0,
          backgroundColor: 'white',
          zIndex: 10
        }}>
          <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 600 }}>New Doctor</h2>
          <button onClick={onClose} style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '4px'
          }}>
            <AiOutlineClose size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ padding: '24px' }}>
            {error && (
              <div style={{
                padding: '12px',
                backgroundColor: '#fee',
                border: '1px solid #fcc',
                borderRadius: '6px',
                color: '#c00',
                marginBottom: '16px'
              }}>
                {error}
              </div>
            )}

            {/* Profile Image Upload */}
            <div style={{ marginBottom: '24px', textAlign: 'center' }}>
              <label style={{ display: 'block', marginBottom: '12px', fontWeight: 600, fontSize: '0.875rem' }}>
                Profile Image
              </label>
              <div style={{
                display: 'inline-block',
                position: 'relative'
              }}>
                <div style={{
                  width: '120px',
                  height: '120px',
                  borderRadius: '50%',
                  border: '2px dashed #d1d5db',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  backgroundColor: '#f9fafb',
                  cursor: 'pointer',
                  position: 'relative'
                }}>
                  {imagePreview ? (
                    <>
                      <img 
                        src={imagePreview} 
                        alt="Preview"
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        style={{
                          position: 'absolute',
                          top: '5px',
                          right: '5px',
                          backgroundColor: '#ef4444',
                          color: 'white',
                          border: 'none',
                          borderRadius: '50%',
                          width: '24px',
                          height: '24px',
                          cursor: 'pointer',
                          fontSize: '16px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        ×
                      </button>
                    </>
                  ) : (
                    <label htmlFor="doctor-image" style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      cursor: 'pointer',
                      width: '100%',
                      height: '100%',
                      justifyContent: 'center'
                    }}>
                      <AiOutlineCamera size={32} color="#9ca3af" />
                      <span style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '8px' }}>
                        {uploadingImage ? 'Uploading...' : 'Upload Photo'}
                      </span>
                    </label>
                  )}
                  <input
                    id="doctor-image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    disabled={uploadingImage}
                    style={{ display: 'none' }}
                  />
                </div>
              </div>
              <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '8px' }}>
                Max size: 5MB. Formats: JPG, PNG, GIF
              </p>
            </div>

            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '20px' }}>Contact Information</h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, fontSize: '0.875rem' }}>
                  Name <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    fontSize: '0.875rem'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, fontSize: '0.875rem' }}>
                  Email <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    fontSize: '0.875rem'
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, fontSize: '0.875rem' }}>
                  Phone Number <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    fontSize: '0.875rem'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, fontSize: '0.875rem' }}>
                  Specialization <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  value={formData.specialization}
                  onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                  required
                  placeholder="e.g., Cardiologist"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    fontSize: '0.875rem'
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, fontSize: '0.875rem' }}>
                  Department
                </label>
                <select
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    fontSize: '0.875rem',
                    backgroundColor: 'white'
                  }}
                >
                  <option value="">Select</option>
                  <option value="Cardiology">Cardiology</option>
                  <option value="Neurology">Neurology</option>
                  <option value="Pediatrics">Pediatrics</option>
                  <option value="Orthopedics">Orthopedics</option>
                  <option value="Gynecology">Gynecology</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, fontSize: '0.875rem' }}>
                  Designation
                </label>
                <input
                  type="text"
                  value={formData.designation}
                  onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                  placeholder="e.g., Senior Consultant"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    fontSize: '0.875rem'
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, fontSize: '0.875rem' }}>
                  DOB
                </label>
                <input
                  type="date"
                  value={formData.dob}
                  onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    fontSize: '0.875rem'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, fontSize: '0.875rem' }}>
                  Year Of Experience
                </label>
                <input
                  type="number"
                  value={formData.yearOfExperience}
                  onChange={(e) => setFormData({ ...formData, yearOfExperience: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    fontSize: '0.875rem'
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, fontSize: '0.875rem' }}>
                  Medical License Number
                </label>
                <input
                  type="text"
                  value={formData.medicalLicense}
                  onChange={(e) => setFormData({ ...formData, medicalLicense: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    fontSize: '0.875rem'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, fontSize: '0.875rem' }}>
                  Gender
                </label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    fontSize: '0.875rem',
                    backgroundColor: 'white'
                  }}
                >
                  <option value="">Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, fontSize: '0.875rem' }}>
                Languages Spoken
              </label>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                <input
                  type="text"
                  value={newLanguage}
                  onChange={(e) => setNewLanguage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addLanguage())}
                  placeholder="Add language"
                  style={{
                    flex: 1,
                    padding: '10px 12px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    fontSize: '0.875rem'
                  }}
                />
                <button
                  type="button"
                  onClick={addLanguage}
                  style={{
                    padding: '10px 16px',
                    backgroundColor: '#4F46E5',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  Add
                </button>
              </div>
              <div style={{
                display: 'flex',
                gap: '8px',
                flexWrap: 'wrap'
              }}>
                {formData.languagesSpoken.map(lang => (
                  <span key={lang} style={{
                    backgroundColor: '#f3f4f6',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '0.875rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    {lang}
                    <button
                      type="button"
                      onClick={() => removeLanguage(lang)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: 0,
                        marginLeft: '4px',
                        fontSize: '18px'
                      }}
                    >×</button>
                  </span>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, fontSize: '0.875rem' }}>
                Bio
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="About Doctor"
                rows={3}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  fontSize: '0.875rem',
                  resize: 'vertical'
                }}
              />
            </div>

            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginTop: '24px', marginBottom: '20px' }}>Address Information</h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, fontSize: '0.875rem' }}>
                  Address 1
                </label>
                <input
                  type="text"
                  value={formData.address1}
                  onChange={(e) => setFormData({ ...formData, address1: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    fontSize: '0.875rem'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, fontSize: '0.875rem' }}>
                  Address 2
                </label>
                <input
                  type="text"
                  value={formData.address2}
                  onChange={(e) => setFormData({ ...formData, address2: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    fontSize: '0.875rem'
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, fontSize: '0.875rem' }}>
                  Country
                </label>
                <select
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    fontSize: '0.875rem',
                    backgroundColor: 'white'
                  }}
                >
                  <option value="">Select</option>
                  <option value="Sri Lanka">Sri Lanka</option>
                  <option value="India">India</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, fontSize: '0.875rem' }}>
                  City
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    fontSize: '0.875rem'
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, fontSize: '0.875rem' }}>
                  State
                </label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    fontSize: '0.875rem'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, fontSize: '0.875rem' }}>
                  Pincode
                </label>
                <input
                  type="text"
                  value={formData.pincode}
                  onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    fontSize: '0.875rem'
                  }}
                />
              </div>
            </div>
          </div>

          <div style={{
            padding: '16px 24px',
            borderTop: '1px solid #e5e7eb',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px',
            position: 'sticky',
            bottom: 0,
            backgroundColor: 'white'
          }}>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              style={{
                padding: '10px 24px',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                backgroundColor: 'white',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontWeight: 500
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || uploadingImage}
              style={{
                padding: '10px 24px',
                border: 'none',
                borderRadius: '6px',
                backgroundColor: (loading || uploadingImage) ? '#9CA3AF' : '#4F46E5',
                color: 'white',
                cursor: (loading || uploadingImage) ? 'not-allowed' : 'pointer',
                fontWeight: 500
              }}
            >
              {loading ? 'Adding...' : 'Add Doctor'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddDoctorModal;