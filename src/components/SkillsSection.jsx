import { useState, useEffect } from "react";
import { fireApi } from "../utils/useFire";
import toast from "react-hot-toast";
import { X } from "lucide-react";
import {
  Chip,
  TextField,
  Button,
  Box,
  IconButton,
  InputAdornment
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

const SkillsSection = ({ userData, isOwnProfile }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState("");
  const [editingSkill, setEditingSkill] = useState(null);

  useEffect(() => {
    if (userData?.skills) {
      setSkills(userData.skills);
    }
  }, [userData]);

  const handleAddSkill = async () => {
    if (!newSkill.trim()) return;

    try {
      const res = await fireApi("/skills", "POST", { skill: newSkill });
      toast.success(res?.message || "Skill added successfully");
      setNewSkill("");
    //   GetUserProfile();
	window.location.reload(); // Refresh the page to show the new skill
    } catch (error) {
      console.error("Error adding skill:", error);
      toast.error(error.message || "Failed to add skill");
    }
  };

  const handleUpdateSkill = async (oldSkill) => {
    if (!newSkill.trim()) return;

    try {
      const res = await fireApi("/skills", "PUT", {
        oldSkill,
        newSkill: newSkill
      });
      toast.success(res?.message || "Skill updated successfully");
      setEditingSkill(null);
      setNewSkill("");
    //   GetUserProfile();
	window.location.reload(); // Refresh the page to show the updated skill
    } catch (error) {
      console.error("Error updating skill:", error);
      toast.error(error.message || "Failed to update skill");
    }
  };

  const handleDeleteSkill = async (skill) => {
    try {
      const res = await fireApi("/skills", "DELETE", { skill });
      toast.success(res?.message || "Skill deleted successfully");
    //   GetUserProfile();
	window.location.reload(); // Refresh the page to show the deleted skill
    } catch (error) {
      console.error("Error deleting skill:", error);
      toast.error(error.message || "Failed to delete skill");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (editingSkill) {
        handleUpdateSkill(editingSkill);
      } else {
        handleAddSkill();
      }
    }
  };

  const startEditing = (skill) => {
    setEditingSkill(skill);
    setNewSkill(skill);
  };

  const cancelEditing = () => {
    setEditingSkill(null);
    setNewSkill("");
  };

  return (
    <div className="bg-white shadow rounded-lg p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4">Skills</h2>

      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
        {skills.map((skill, index) => (
          <Chip
            key={index}
            label={skill}
            onDelete={isEditing ? () => handleDeleteSkill(skill) : null}
            deleteIcon={<X size={16} />}
            variant="outlined"
            onClick={isEditing ? () => startEditing(skill) : null}
            sx={{
              cursor: isEditing ? "pointer" : "default",
              "&:hover": {
                backgroundColor: isEditing ? "action.hover" : "transparent"
              }
            }}
          />
        ))}
      </Box>

      {isEditing && (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 2 }}>
          <TextField
            fullWidth
            variant="outlined"
            size="small"
            placeholder={editingSkill ? "Edit skill" : "Add new skill"}
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            onKeyPress={handleKeyPress}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={
                      editingSkill
                        ? () => handleUpdateSkill(editingSkill)
                        : handleAddSkill
                    }
                    disabled={!newSkill.trim()}
                    edge="end"
                  >
                    <AddIcon />
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
          {editingSkill && (
            <Button variant="outlined" onClick={cancelEditing}>
              Cancel
            </Button>
          )}
        </Box>
      )}

      {isOwnProfile && (
        <Box sx={{ mt: 2 }}>
          {isEditing ? (
            <Button
              variant="contained"
              onClick={() => {
                setIsEditing(false);
                cancelEditing();
              }}
            >
              Done Editing
            </Button>
          ) : (
            <Button
              variant="outlined"
              onClick={() => setIsEditing(true)}
              startIcon={<AddIcon />}
            >
              Edit Skills
            </Button>
          )}
        </Box>
      )}
    </div>
  );
};

export default SkillsSection;