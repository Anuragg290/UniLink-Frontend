import { useState } from "react";
import { toast } from "react-hot-toast";
import { Loader } from "lucide-react";
import { fireApi } from "../../utils/useFire";
import { useNavigate } from "react-router-dom"; // Changed from Navigate to useNavigate

const SignUpForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate(); // Initialize the navigate function

  const handleSignUp = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.target);
    try {
      const data = Object.fromEntries(formData.entries());

      const response = await fireApi("/register", "POST", data);

      toast.success(response.message);
      console.log(response);
      e.target.reset();
      navigate("/login"); // Changed from Navigate to navigate
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSignUp} className="flex flex-col gap-4">
      <input
        type="text"
        name="name"
        placeholder="Full name"
        className="input input-bordered w-full"
        required
      />
      <input
        type="text"
        name="username"
        placeholder="Username"
        className="input input-bordered w-full"
        required
      />
      <input
        type="email"
        placeholder="Email"
        name="email"
        className="input input-bordered w-full"
        required
      />
      <input
        type="password"
        placeholder="Password (6+ characters)"
        name="password"
        className="input input-bordered w-full"
        required
      />

      <button
        type="submit"
        disabled={isLoading}
        className="btn btn-primary w-full text-white"
      >
        {isLoading ? (
          <Loader className="size-5 animate-spin" />
        ) : (
          "Agree & Join"
        )}
      </button>
    </form>
  );
};

export default SignUpForm;