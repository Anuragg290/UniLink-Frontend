import { useContext, useEffect, useState } from "react";
import { fireApi } from "../utils/useFire";
import toast from "react-hot-toast";
import ProfileContext from "../context/profileContext";
import { ShieldCheck, X } from "lucide-react";

const Certification = ({ userData, isOwnProfile }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [certifications, setCertifications] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    institute: "",
    startDate: "",
    endDate: "",
    description: "",
    file: null
  });
  const [editingId, setEditingId] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const { GetUserProfile } = useContext(ProfileContext);

  useEffect(() => {
    if (userData?.certifications) {
      setCertifications(userData.certifications);
      // Show add form if no certifications exist
      if (userData.certifications.length === 0 && isOwnProfile) {
        setIsAdding(true);
      }
    }
  }, [userData, isOwnProfile]);

  const resetForm = () => {
    setFormData({
      title: "",
      institute: "",
      startDate: "",
      endDate: "",
      description: "",
      file: null
    });
    setPreviewUrl("");
    setEditingId(null);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, file });
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleAddCertification = async () => {
    if (!formData.title || !formData.institute || !formData.startDate) {
      toast.error("Please fill required fields");
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("title", formData.title);
      formDataToSend.append("institute", formData.institute);
      formDataToSend.append("startDate", formData.startDate);
      formDataToSend.append("endDate", formData.endDate);
      formDataToSend.append("description", formData.description);
      if (formData.file) {
        formDataToSend.append("file", formData.file);
      }

      const res = await fireApi("/add-certification", "POST", formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success(res?.message || "Certification added successfully");
      resetForm();
      setIsAdding(false);
      GetUserProfile();
      window.location.reload(); // Refresh the page to show the new certification
    } catch (error) {
      console.error("Error adding certification:", error);
      toast.error(error.message || "Failed to add certification");
    }
  };

  const handleUpdateCertification = async () => {
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("certId", editingId);
      formDataToSend.append("title", formData.title);
      formDataToSend.append("institute", formData.institute);
      formDataToSend.append("startDate", formData.startDate);
      formDataToSend.append("endDate", formData.endDate);
      formDataToSend.append("description", formData.description);
      if (formData.file) {
        formDataToSend.append("file", formData.file);
      }

      const res = await fireApi("/update-certification", "PUT", formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success(res?.message || "Certification updated successfully");
      resetForm();
      GetUserProfile();
    } catch (error) {
      console.error("Error updating certification:", error);
      toast.error(error.message || "Failed to update certification");
    }
  };

  const handleDeleteCertification = async (id) => {
    try {
      const res = await fireApi(`/delete-certification/${id}`, "DELETE");
      toast.success(res?.message || "Certification deleted successfully");
      GetUserProfile();
    } catch (error) {
      console.error("Error deleting certification:", error);
      toast.error(error.message || "Failed to delete certification");
    }
  };

  const handleEditCertification = (cert) => {
    console.log("Editing certification:", cert?._id);
    setEditingId(cert._id);
    setFormData({
      title: cert.title,
      institute: cert.institute,
      startDate: cert.startDate,
      endDate: cert.endDate || "",
      description: cert.description || "",
      file: null
    });
    if (cert.certificateImage) {
      setPreviewUrl(cert.certificateImage);
    }
    setIsAdding(true);
  };

  return (
    <div className="bg-white shadow rounded-lg p-6 mt-6">
      <h2 className="text-xl font-semibold mb-4">Certifications</h2>

      {certifications.length === 0 && !isAdding && isOwnProfile && (
        <div className="text-start py-4">
          <p className="text-gray-500 mb-4">No certifications added yet</p>
          <button
            onClick={() => setIsAdding(true)}
            className="bg-primary text-white py-2 px-4 rounded hover:bg-primary-dark transition duration-300"
          >
            Add Certification
          </button>
        </div>
      )}

      {certifications.map((cert) => (
        <div key={cert._id} className="mb-4 flex justify-between items-start">
          <div className="flex items-start">
            <ShieldCheck size={20} className="mr-2 mt-1" />
            <div>
              <h3 className="font-semibold">{cert.title}</h3>
              <p className="text-gray-600">{cert.institute}</p>
              <p className="text-gray-500 text-sm">
                {cert.startDate} - {cert.endDate || "Present"}
              </p>
              <p className="text-gray-700 mt-1">{cert.description}</p>
              {cert.certificateImage && (
                <img
                  src={cert.certificateImage}
                  alt="Certificate"
                  className="w-48 h-auto mt-2 rounded-lg border"
                />
              )}
            </div>
          </div>
          {isOwnProfile && !isAdding && (
            <div className="flex gap-2">
              <button
                onClick={() => handleEditCertification(cert)}
                className="text-primary hover:text-primary-dark"
              >
                Edit
              </button>
              <button
                onClick={() => handleDeleteCertification(cert._id)}
                className="text-red-500 hover:text-red-700"
              >
                <X size={20} />
              </button>
            </div>
          )}
        </div>
      ))}

      {isAdding && (
        <div className="mt-4 border-t pt-4">
          <h3 className="font-semibold mb-2">
            {editingId ? "Edit Certification" : "Add New Certification"}
          </h3>
          <input
            type="text"
            placeholder="Title*"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full p-2 border rounded mb-2"
            required
          />
          <input
            type="text"
            placeholder="Institute*"
            value={formData.institute}
            onChange={(e) =>
              setFormData({ ...formData, institute: e.target.value })
            }
            className="w-full p-2 border rounded mb-2"
            required
          />
          <input
            type="number"
            placeholder="Start Year*"
            value={formData.startDate}
            onChange={(e) =>
              setFormData({ ...formData, startDate: e.target.value })
            }
            className="w-full p-2 border rounded mb-2"
            required
          />
          <input
            type="number"
            placeholder="End Year (leave blank if current)"
            value={formData.endDate}
            onChange={(e) =>
              setFormData({ ...formData, endDate: e.target.value })
            }
            className="w-full p-2 border rounded mb-2"
          />
          <textarea
            placeholder="Description"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            className="w-full p-2 border rounded mb-2"
            rows={3}
          />
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Certificate Image
            </label>
            <input
              type="file"
              onChange={handleImageChange}
              accept="image/*"
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary-dark"
            />
            {previewUrl && (
              <img
                src={previewUrl}
                alt="Preview"
                className="w-48 h-auto mt-2 rounded-lg border"
              />
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={
                editingId ? handleUpdateCertification : handleAddCertification
              }
              className="bg-primary text-white py-2 px-4 rounded hover:bg-primary-dark transition duration-300"
            >
              {editingId ? "Update Certification" : "Add Certification"}
            </button>
            <button
              onClick={() => {
                setIsAdding(false);
                resetForm();
              }}
              className="bg-gray-200 text-gray-700 py-2 px-4 rounded hover:bg-gray-300 transition duration-300"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {isOwnProfile && certifications.length > 0 && !isAdding && (
        <button
          onClick={() => setIsAdding(true)}
          className="mt-4 bg-primary text-white py-2 px-4 rounded hover:bg-primary-dark transition duration-300"
        >
          Add New Certification
        </button>
      )}
    </div>
  );
};

export default Certification;