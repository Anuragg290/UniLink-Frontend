import toast from "react-hot-toast";
import { Loader } from "lucide-react";
import { fireApi } from "../../utils/useFire";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const LoginForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
	
    const formData = new FormData(e.target);
    try {
      const data = Object.fromEntries(formData.entries());
      const response = await fireApi("/login", "POST", data);
      setIsLoading(false);

      console.log(response, "login response");

      const token = await response?.data?.token;
      localStorage.setItem("user-visited-dashboard", token);

      const userRole = await response?.data?.user?.role;
      localStorage.setItem("user-role", userRole);

      toast.success("Login successful");
      e.target.reset();
      navigate("/");

    } catch (error) {
      console.log(error);	
      toast.error(error.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-md">
      <input
        type="text"
        placeholder="Email"
        name="email"
        className="input input-bordered w-full"
        required
      />
      <input
        type="password"
        placeholder="Password"
        name="password"
        className="input input-bordered w-full"
        required
      />

      <button type="submit" className="btn btn-primary w-full">
        {isLoading ? <Loader className="size-5 animate-spin" /> : "Login"}
      </button>
    </form>
  );
};
export default LoginForm;
