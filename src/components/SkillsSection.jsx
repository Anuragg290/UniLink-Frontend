import { useState, useEffect, useContext } from "react";
import { fireApi } from "../utils/useFire";
import toast from "react-hot-toast";
import { X } from "lucide-react";
import {
  Chip,
  TextField,
  Button,
  Box,
  IconButton,
  InputAdornment,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useParams } from "react-router-dom";
import ProfileContext from "../context/profileContext";

const SkillsSection = ({ userData, GetUserProfile }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState("");
  const [editingSkill, setEditingSkill] = useState(null);
  const params = useParams();
  const { username } = params;

  const { user } = useContext(ProfileContext);
  const isOwnProfile = user?.username === userData?.username;

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
      GetUserProfile(username);
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
        newSkill: newSkill,
      });
      toast.success(res?.message || "Skill updated successfully");
      setEditingSkill(null);
      setNewSkill("");
      GetUserProfile(username);
    } catch (error) {
      console.error("Error updating skill:", error);
      toast.error(error.message || "Failed to update skill");
    }
  };

  const handleDeleteSkill = async (skill) => {
    try {
      const res = await fireApi("/skills", "DELETE", { skill });
      toast.success(res?.message || "Skill deleted successfully");
      GetUserProfile(username);
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

      {/* <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
        {userData?.isVerified ? (
          skills.length > 0 ? (
            skills.map((skill, index) => (
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
                    backgroundColor: isEditing ? "action.hover" : "transparent",
                  },
                }}
              />
            ))
          ) : (
            <p className="text-gray-500">No skills available</p>
          )
        ) : (
          <p className="text-yellow-500">
            Skills are visible only after verification please verify your
            certificate first.
          </p>
        )}
      </Box> */}

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
              ),
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
